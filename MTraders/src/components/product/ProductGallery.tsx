"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/PlaceholderImage";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-200">
        <PlaceholderImage
          src={null}
          alt={name}
          label={name.charAt(0)}
          className="h-full w-full"
        />
      </div>
    );
  }

  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <PlaceholderImage
          src={current}
          alt={`${name} image ${active + 1}`}
          className="h-full w-full"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "aspect-square overflow-hidden rounded-lg border-2 transition-all",
                active === i
                  ? "border-accent-dark"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
              aria-label={`View ${name} image ${i + 1}`}
            >
              <PlaceholderImage
                src={img}
                alt={`${name} thumbnail ${i + 1}`}
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}