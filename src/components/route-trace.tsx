"use client";

import { ArrowUpRight } from "lucide-react";
import { useId } from "react";

import {
  formatProtocol,
  formatRegion,
  type PopPayload,
  type PopState,
  usePopTelemetry,
} from "@/components/pop-telemetry";
import { cn } from "@/lib/utils";

const SOURCE_URL = "https://github.com/j-cadena-g/cadena-sh";

// Literal class names so Tailwind can see them; staggers the hops lighting up.
const HOP_DELAYS = [
  "[animation-delay:0ms]",
  "[animation-delay:160ms]",
  "[animation-delay:320ms]",
];

type Hop = {
  id: "client" | "edge" | "origin";
  kind: string;
  /** `null` while the trace is still resolving. */
  value: string | null;
  detail: string | null;
};

function formatLocation(data: PopPayload): string | null {
  const parts = [data.city, data.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function buildHops(state: PopState): Hop[] {
  if (state.status !== "ready") {
    const pending = state.status === "loading" ? null : "—";

    return [
      { id: "client", kind: "Client", value: pending, detail: null },
      { id: "edge", kind: "Edge POP", value: pending, detail: null },
      { id: "origin", kind: "Origin", value: pending, detail: null },
    ];
  }

  return [
    {
      id: "client",
      kind: "Client",
      value: "You",
      detail: formatLocation(state.data),
    },
    {
      id: "edge",
      kind: "Edge POP",
      value: formatRegion(state.data.region),
      detail:
        [formatProtocol(state.protocol), state.data.ipFamily]
          .filter(Boolean)
          .join(" · ") || null,
    },
    {
      id: "origin",
      kind: "Origin",
      // Only reached on the client: the server snapshot is always "loading".
      value: window.location.host,
      detail: `${state.latencyMs} ms`,
    },
  ];
}

const STATUS_LABEL: Record<PopState["status"], string> = {
  loading: "tracing",
  ready: "live",
  error: "unavailable",
};

// What assistive technology hears when the status changes; the terse visual
// label means little read out on its own.
const STATUS_ANNOUNCEMENT: Record<PopState["status"], string> = {
  loading: "Tracing your connection",
  ready: "Connection traced",
  error: "Connection trace unavailable",
};

function RouteTrace({ className }: { className?: string }) {
  const state = usePopTelemetry();
  const titleId = useId();
  const hops = buildHops(state);
  const isReady = state.status === "ready";

  return (
    <figure
      aria-labelledby={titleId}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card/75 shadow-[0_28px_56px_-32px_oklch(0.2_0.02_40/0.35)] backdrop-blur-sm",
        "before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-primary/60 before:to-transparent",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 font-mono text-[0.66rem] tracking-[0.12em] uppercase text-muted-foreground">
        <span id={titleId}>
          Trace <span className="text-muted-foreground/50">·</span> your
          connection
        </span>
        <span role="status" className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              state.status === "loading" &&
                "bg-muted-foreground/60 motion-safe:animate-pulse",
              isReady && "bg-primary shadow-[0_0_8px_var(--glow-strong)]",
              state.status === "error" && "bg-destructive/70",
            )}
          />
          <span aria-hidden="true">{STATUS_LABEL[state.status]}</span>
          <span className="sr-only">{STATUS_ANNOUNCEMENT[state.status]}</span>
        </span>
      </figcaption>

      <div className="px-5 py-2">
        <ol className="relative">
          {/* The chain runs from the first node's centre to the last's; each
              hop row is the same height, so a sixth of the list is half a row. */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-[calc(100%/6)] bottom-[calc(100%/6)] left-2.5 w-px -translate-x-1/2",
              isReady ? "bg-primary/35" : "bg-border",
            )}
          >
            {isReady ? (
              <span className="absolute left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_10px_2px_var(--glow-strong)] motion-safe:animate-trace-packet motion-reduce:hidden" />
            ) : null}
          </span>

          {hops.map((hop, index) => {
            const isOrigin = hop.id === "origin";

            return (
              <li
                key={hop.id}
                className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-4 py-3"
              >
                <span
                  aria-hidden="true"
                  className="relative flex justify-center"
                >
                  <span
                    className={cn(
                      "block rounded-full border-[1.5px] bg-card",
                      isOrigin ? "size-3" : "size-2.5",
                      state.status === "loading" &&
                        "border-muted-foreground/40 motion-safe:animate-pulse",
                      state.status === "error" && "border-border",
                      isReady && "border-primary",
                      isReady &&
                        isOrigin &&
                        "bg-primary shadow-[0_0_0_4px_var(--glow)]",
                      isReady &&
                        cn("motion-safe:animate-node-on", HOP_DELAYS[index]),
                    )}
                  />
                </span>

                <div className="min-w-0">
                  <p className="font-mono text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/55"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>{" "}
                    {hop.kind}
                  </p>
                  {hop.value === null ? (
                    // Same line box as the resolved value, so the panel
                    // doesn't grow (and shift the hero) when data arrives.
                    <span aria-hidden="true" className="flex h-6 items-center">
                      <span
                        className={cn(
                          "block h-3 rounded-sm bg-muted motion-safe:animate-pulse",
                          ["w-12", "w-16", "w-28"][index],
                        )}
                      />
                    </span>
                  ) : (
                    <p
                      className={cn(
                        // Size and leading as one token each: tailwind-merge
                        // drops a separate leading-* once a later text-* wins.
                        "truncate text-[0.95rem]/6 font-medium text-foreground",
                        isOrigin && isReady && "font-mono text-[0.85rem]/6",
                        isReady &&
                          cn("motion-safe:animate-fade-in", HOP_DELAYS[index]),
                      )}
                    >
                      {hop.value}
                    </p>
                  )}
                </div>

                <span
                  className={cn(
                    "max-w-[9rem] truncate text-right font-mono text-xs text-muted-foreground tabular-nums",
                    isOrigin && isReady && "text-primary",
                  )}
                >
                  {hop.detail}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3 text-xs">
        <code className="font-mono text-[0.68rem] text-muted-foreground">
          GET /api/pop
        </code>
        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          How this site is built
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </figure>
  );
}

export { RouteTrace };
