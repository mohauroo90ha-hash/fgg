"use client";

import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  src?: string | null;
  alt: string;
  label?: string;
  className?: string;
  imgClassName?: string;
}

const gradientVariants = [
  "linear-gradient(135deg,#f0e6d6,#e3d3bd)",
  "linear-gradient(135deg,#dfe6ec,#c8d4de)",
  "linear-gradient(135deg,#e9dfe6,#d8c7d4)",
  "linear-gradient(135deg,#e4ead9,#cdd7bd)",
  "linear-gradient(135deg,#ece0cf,#dccbb2)",
];

function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function PlaceholderImage({
  src,
  alt,
  label,
  className,
  imgClassName,
}: PlaceholderImageProps) {
  const gradient = gradientVariants[hashString(alt) % gradientVariants.length];

  if (src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden",
        className
      )}
      style={{ background: gradient }}
      role="img"
      aria-label={alt}
    >
      <span className="select-none text-4xl font-bold text-zinc-600/40 sm:text-5xl">
        {label || alt.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
