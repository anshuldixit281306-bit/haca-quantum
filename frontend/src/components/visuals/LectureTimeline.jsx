/**
 * <LectureTimeline /> — horizontal clickable timeline strip.
 *
 * Props:
 *   segments     — timeline segments [{ title, start, end, concept }]
 *   currentTime  — player position in seconds
 *   duration     — total duration (falls back to last segment end)
 *   onSeek       — (seconds) => jump the video
 *
 * Shows per-segment progress fills; the active segment glows.
 */

import { formatTime } from "./useYouTubePlayer";
import "./visualStyles.css";

export default function LectureTimeline({
  segments = [],
  currentTime = 0,
  duration = 0,
  onSeek,
}) {
  if (!segments.length) return null;

  const total =
    duration ||
    segments[segments.length - 1]?.end ||
    segments[segments.length - 1]?.start ||
    1;

  const activeIndex = segments.findIndex(
    (segment) =>
      currentTime >= segment.start &&
      currentTime < (segment.end || segment.start + 1)
  );

  return (
    <div className="ql-timeline" role="list" aria-label="Lecture concept timeline">
      {segments.map((segment, index) => {
        const start = segment.start || 0;
        const end = segment.end || start + 1;
        const span = Math.max(1, end - start);

        const progress = currentTime <= start
          ? 0
          : currentTime >= end
            ? 1
            : (currentTime - start) / span;

        return (
          <button
            type="button"
            role="listitem"
            key={`${segment.concept}-${index}`}
            className={`ql-tl-seg${index === activeIndex ? " active" : ""}`}
            onClick={() => onSeek?.(start + 0.4)}
            title={`${segment.title} (${formatTime(start)})`}
          >
            <span className="ql-tl-fill" style={{ width: `${progress * 100}%` }} />
            <span className="ql-tl-label">{segment.title}</span>
          </button>
        );
      })}
      <span className="ql-tl-total ql-muted">{formatTime(total)}</span>
    </div>
  );
}
