"use client";

import { useEffect, useState } from "react";

import { ChainMark } from "@/components/chain-mark";
import { cn } from "@/lib/utils";

type RailItem = {
  id: string;
  label: string;
};

// Literal class names so Tailwind can see them; staggers the items sliding in.
const ITEM_DELAYS = [
  "delay-0",
  "delay-[40ms]",
  "delay-[80ms]",
  "delay-[120ms]",
  "delay-[160ms]",
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

/**
 * Takes over from the header nav once it scrolls out of view: the header on
 * md+ is static, so this rail docks the same links on the right edge and
 * tracks which section is being read.
 */
function SectionRail({
  headerId,
  items,
}: {
  headerId: string;
  items: RailItem[];
}) {
  const [docked, setDocked] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const header = document.getElementById(headerId);
    if (!header || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setDocked(!entry.isIntersecting);
    });
    observer.observe(header);

    return () => observer.disconnect();
  }, [headerId]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);
    const visible = new Set<string>();

    // A thin band just above the middle of the viewport: whichever section
    // crosses it is the one being read.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }

        const current = items.findLast((item) => visible.has(item.id));
        setActiveId(current?.id ?? null);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [items]);

  const linkClasses = cn(
    "flex items-center justify-end rounded-xl px-2.5 py-2 motion-safe:transition-[color,background-color,gap] motion-safe:duration-300 motion-safe:ease-out",
    focusRing,
  );

  // Each item slides in a beat after the one above it. Kept on the <li> so
  // the stagger delay doesn't also slow the links' hover transitions.
  function itemMotion(index: number) {
    return cn(
      "motion-safe:transition-[opacity,translate] motion-safe:duration-300 motion-safe:ease-out",
      ITEM_DELAYS[index],
      docked ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0",
    );
  }

  return (
    <nav
      aria-label="Sections"
      inert={!docked}
      className={cn(
        "fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 md:block lg:right-6",
        "motion-safe:transition-[opacity,translate] motion-safe:duration-300 motion-safe:ease-out",
        docked
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-6 opacity-0",
      )}
    >
      <ol className="group/rail flex flex-col gap-0.5 rounded-2xl border border-border/70 bg-background/85 p-1.5 shadow-[0_18px_40px_-24px_oklch(0.2_0.02_40/0.45)] backdrop-blur-md">
        <li className={itemMotion(0)}>
          <a
            href="#top"
            aria-label="Back to top"
            className={cn(
              linkClasses,
              "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <ChainMark className="size-4" />
          </a>
        </li>
        {items.map((item, index) => {
          const isActive = item.id === activeId;

          return (
            <li key={item.id} className={itemMotion(index + 1)}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  linkClasses,
                  "gap-0 font-mono text-[0.68rem] group-hover/rail:gap-2.5 group-focus-within/rail:gap-2.5",
                  isActive
                    ? "bg-muted/80 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {/* Collapsed to the numbers until the rail is hovered or
                    focused, so it stays clear of the content beside it. */}
                <span className="max-w-0 overflow-hidden text-xs font-sans whitespace-nowrap opacity-0 motion-safe:transition-[max-width,opacity] motion-safe:duration-300 motion-safe:ease-out group-hover/rail:max-w-24 group-hover/rail:opacity-100 group-focus-within/rail:max-w-24 group-focus-within/rail:opacity-100">
                  {item.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "tabular-nums motion-safe:transition-colors",
                    isActive && "text-primary",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { SectionRail };
