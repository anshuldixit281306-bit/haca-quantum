import { useEffect, useRef, useState } from "react";

export function useCountUp(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    if (!start) return undefined;
    const startedAt = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [duration, start, target]);

  return value;
}