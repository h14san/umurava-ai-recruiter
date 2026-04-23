"use client";

import { useEffect, useState } from "react";
import { scoreHex } from "@/lib/utils";

export function ScoreBar({ score }: { score: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(Math.max(0, Math.min(100, score))));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div
      className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score}
    >
      <div
        className="h-full rounded-full transition-[width] duration-[600ms] ease-out"
        style={{ width: `${width}%`, backgroundColor: scoreHex(score) }}
      />
    </div>
  );
}
