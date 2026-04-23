"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  size?: number;
  className?: string;
}

export function StarRating({ score, size = 16, className }: Props) {
  const stars = Math.max(0, Math.min(5, score / 20));
  const [fills, setFills] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    setFills([0, 0, 0, 0, 0]);
    const timers = Array.from({ length: 5 }, (_, index) =>
      window.setTimeout(() => {
        setFills((current) => {
          const next = [...current];
          next[index] = Math.max(0, Math.min(1, stars - index));
          return next as number[];
        });
      }, index * 80)
    );

    return () => timers.forEach(window.clearTimeout);
  }, [stars]);

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`Rating ${stars.toFixed(1)} out of 5`}
    >
      {fills.map((fill, index) => (
        <AnimatedStar key={index} fill={fill} size={size} />
      ))}
    </div>
  );
}

function AnimatedStar({ fill, size }: { fill: number; size: number }) {
  const id = useId();
  const offset = Math.round(fill * 100);

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="transition-transform duration-300">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${offset}%`} stopColor="#F59E0B" />
          <stop offset={`${offset}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.75l2.76 5.59 6.17.9-4.46 4.35 1.05 6.15L12 16.82 6.48 19.74l1.06-6.15-4.47-4.35 6.18-.9L12 2.75z"
        fill={`url(#${id})`}
        stroke={fill > 0 ? "#F59E0B" : "var(--border)"}
        strokeWidth="1.3"
      />
    </svg>
  );
}
