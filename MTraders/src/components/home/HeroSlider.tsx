"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSlideMeta } from "@/types";

export function HeroSlider({ slides }: { slides: HeroSlideMeta[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5500, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (slides.length === 0) return null;

  return (
    <section className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => {
            const darkText = slide.text !== "light";
            return (
              <div
                key={slide.id}
                className="relative min-w-0 flex-[0_0_100%]"
                style={{
                  background: slide.image
                    ? undefined
                    : slide.gradient ||
                      "linear-gradient(120deg,#f5e6d3 0%,#e8c9a0 100%)",
                }}
              >
                {slide.image && (
                  <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "container-x relative flex min-h-[420px] flex-col justify-center py-16 sm:min-h-[480px] lg:min-h-[560px]",
                    slide.image && "bg-black/35"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {selected === i && (
                      <motion.div
                        key={`slide-${slide.id}`}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="max-w-xl"
                      >
                        <span
                          className={cn(
                            "inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest",
                            darkText
                              ? "bg-brand/10 text-brand"
                              : "bg-white/20 text-white"
                          )}
                        >
                          {slide.tag}
                        </span>
                        <h1
                          className={cn(
                            "mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl",
                            darkText ? "text-brand" : "text-white"
                          )}
                        >
                          {slide.title}
                        </h1>
                        {slide.subtitle && (
                          <p
                            className={cn(
                              "mt-4 text-lg font-medium",
                              darkText ? "text-brand/70" : "text-white/80"
                            )}
                          >
                            {slide.subtitle}
                          </p>
                        )}
                        {slide.cta && (
                          <Link href={slide.href || "/"}>
                            <span className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:gap-3 hover:bg-black">
                              {slide.cta} <ArrowRight className="h-4 w-4" />
                            </span>
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/70 p-2 text-brand backdrop-blur transition-colors hover:bg-white sm:block"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/70 p-2 text-brand backdrop-blur transition-colors hover:bg-white sm:block"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  selected === i
                    ? "w-8 bg-brand"
                    : "w-2 bg-brand/30 hover:bg-brand/50"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}