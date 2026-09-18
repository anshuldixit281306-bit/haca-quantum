/**
 * Safe YouTube IFrame Player API hook for the Interactive Visual Lecture.
 *
 * - Loads https://www.youtube.com/iframe_api exactly once.
 * - Mounts the player into a plain DOM host (React never owns the node the
 *   API replaces, which avoids unmount crashes).
 * - Polls getCurrentTime() every 250 ms so the visualization panel can
 *   synchronize with the video timestamp.
 * - Every player call is wrapped in try/catch; if the API cannot load
 *   (offline, blocked, slow), `failed` flips true and the page falls back
 *   to a plain <iframe> embed while everything else keeps working.
 */

import { useCallback, useEffect, useRef, useState } from "react";

let apiPromise = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("No window"));
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") {
        try {
          previous();
        } catch {
          // Ignore third-party handler errors
        }
      }
      resolve(window.YT);
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.onerror = () => reject(new Error("YouTube API failed to load"));
    document.head.appendChild(tag);

    setTimeout(() => {
      if (!window.YT || !window.YT.Player) {
        reject(new Error("YouTube API timed out"));
      }
    }, 12000);
  });

  return apiPromise;
}

export function extractYoutubeId(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.substring(1);
    }

    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }

    ///embed/<id>, /shorts/<id>, /live/<id>
    const match = parsed.pathname.match(
      /\/(embed|shorts|live)\/([^/?#]+)/
    );
    return match ? match[2] : "";
  } catch {
    return "";
  }
}

export function formatTime(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function useYouTubePlayer({ videoId, onStateChange }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const stateCbRef = useRef(onStateChange);
  stateCbRef.current = onStateChange;

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let poll = null;

    setReady(false);
    setFailed(!videoId);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (!videoId || !hostRef.current) return undefined;

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;

        const mount = document.createElement("div");
        hostRef.current.appendChild(mount);

        try {
          playerRef.current = new YT.Player(mount, {
            videoId,
            playerVars: {
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event) => {
                if (cancelled) return;
                setReady(true);
                try {
                  setDuration(event.target.getDuration() || 0);
                } catch {
                  // Duration is optional
                }
              },
              onStateChange: (event) => {
                if (cancelled) return;
                setPlaying(event.data === YT.PlayerState.PLAYING);
                if (stateCbRef.current) {
                  try {
                    stateCbRef.current(event.data);
                  } catch {
                    // Listener errors must never break the player
                  }
                }
              },
              onError: () => {
                if (!cancelled) setFailed(true);
              },
            },
          });
        } catch {
          if (!cancelled) setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    poll = setInterval(() => {
      const player = playerRef.current;

      if (!player || typeof player.getCurrentTime !== "function") return;

      try {
        setCurrentTime(player.getCurrentTime() || 0);
      } catch {
        // Player may be mid-destroy during unmount
      }
    }, 250);

    return () => {
      cancelled = true;

      if (poll) clearInterval(poll);

      try {
        playerRef.current?.destroy?.();
      } catch {
        // Player may already be gone
      }

      playerRef.current = null;

      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }
    };
  }, [videoId]);

  const play = useCallback(() => {
    try {
      playerRef.current?.playVideo?.();
    } catch {
      // Ignore
    }
  }, []);

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo?.();
    } catch {
      // Ignore
    }
  }, []);

  const seekTo = useCallback((seconds) => {
    try {
      playerRef.current?.seekTo?.(Math.max(0, seconds), true);
      setCurrentTime(Math.max(0, seconds));
    } catch {
      // Ignore
    }
  }, []);

  return {
    hostRef,
    ready,
    failed,
    playing,
    currentTime,
    duration,
    play,
    pause,
    seekTo,
  };
}
