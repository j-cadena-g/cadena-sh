"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const POP_ENDPOINT = "/api/pop";

/** Abort the edge POP lookup if it hangs longer than this. */
const POP_FETCH_TIMEOUT_MS = 10_000;

type PopPayload = {
  region: string;
  city: string | null;
  country: string | null;
};

export type PopResourceTiming = {
  latencyMs: number | null;
  protocol: string | null;
};

function isPopPayload(value: unknown): value is PopPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.region === "string" &&
    (payload.city === null || typeof payload.city === "string") &&
    (payload.country === null || typeof payload.country === "string")
  );
}

type PopState =
  | { status: "loading" }
  | {
      status: "ready";
      data: PopPayload;
      latencyMs: number;
      protocol: string | null;
    }
  | { status: "error" };

function findLatestPopEntry(
  endpoint: string,
): PerformanceResourceTiming | null {
  if (typeof performance === "undefined") {
    return null;
  }

  try {
    const entries = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];

    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.name.endsWith(endpoint)) {
        return entry;
      }
    }
  } catch {
    // Performance APIs throw on some hardened browsers.
  }

  return null;
}

/**
 * Reads transfer timing + negotiated protocol from the most recent
 * `/api/pop` PerformanceResourceTiming entry.
 *
 * Prefers `responseEnd - requestStart` (network RTT-ish) over wall-clock
 * `performance.now()` spans, which also include JSON parse and React work.
 */
export function readPopResourceTiming(endpoint: string): PopResourceTiming {
  const entry = findLatestPopEntry(endpoint);

  if (!entry) {
    return { latencyMs: null, protocol: null };
  }

  let latencyMs: number | null = null;

  if (entry.requestStart > 0 && entry.responseEnd >= entry.requestStart) {
    latencyMs = Math.max(0, Math.round(entry.responseEnd - entry.requestStart));
  } else if (entry.duration > 0) {
    latencyMs = Math.max(0, Math.round(entry.duration));
  }

  return {
    latencyMs,
    protocol: entry.nextHopProtocol || null,
  };
}

export function formatProtocol(protocol: string | null): string | null {
  if (!protocol) {
    return null;
  }

  const normalized = protocol.toLowerCase();

  if (normalized === "h3" || normalized === "h2") {
    return normalized;
  }

  if (normalized.startsWith("http/")) {
    return `h${normalized.slice(5)}`;
  }

  return normalized;
}

function formatRegion(region: string): string {
  if (!region || region === "local") {
    return "local";
  }
  return region;
}

type DetailRow = {
  label: string;
  value: string;
};

function buildDetailRows({
  data,
  latencyMs,
  protocolLabel,
  regionLabel,
}: {
  data: PopPayload;
  latencyMs: number;
  protocolLabel: string | null;
  regionLabel: string;
}): DetailRow[] {
  const rows: DetailRow[] = [{ label: "POP", value: regionLabel }];

  if (data.city) {
    rows.push({ label: "City", value: data.city });
  }

  if (data.country) {
    rows.push({ label: "Country", value: data.country });
  }

  if (protocolLabel) {
    rows.push({ label: "Proto", value: protocolLabel });
  }

  rows.push({ label: "RTT", value: `${latencyMs}ms` });

  return rows;
}

export function PopChip({ className }: { className?: string }) {
  const [state, setState] = useState<PopState>({ status: "loading" });
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, POP_FETCH_TIMEOUT_MS);

    fetch(POP_ENDPOINT, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Unexpected status ${response.status}`);
        }

        const payload: unknown = await response.json();
        const end =
          typeof performance !== "undefined" ? performance.now() : Date.now();

        if (!isPopPayload(payload)) {
          throw new Error("Unexpected /api/pop payload shape");
        }

        clearTimeout(timeoutId);

        if (disposed) {
          return;
        }

        const timing = readPopResourceTiming(POP_ENDPOINT);
        const wallClockMs = Math.max(0, Math.round(end - start));

        setState({
          status: "ready",
          data: payload,
          latencyMs: timing.latencyMs ?? wallClockMs,
          protocol: timing.protocol,
        });
      })
      .catch(() => {
        clearTimeout(timeoutId);

        if (disposed) {
          return;
        }

        setState({ status: "error" });
      });

    return () => {
      disposed = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    function closeIfOutside(event: Event) {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node)) {
        return;
      }

      if (!root.contains(event.target)) {
        setExpanded(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    }

    document.addEventListener("pointerdown", closeIfOutside);
    document.addEventListener("focusin", closeIfOutside);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", closeIfOutside);
      document.removeEventListener("focusin", closeIfOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const baseClasses = cn(
    "inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.18em] uppercase text-muted-foreground",
    className,
  );

  if (state.status === "error") {
    return (
      <span
        className={baseClasses}
        aria-label="Failed to locate edge POP"
        role="status"
      >
        <span
          className="size-1.5 rounded-full bg-destructive/70"
          aria-hidden="true"
        />
        <span>unavailable</span>
      </span>
    );
  }

  if (state.status === "loading") {
    return (
      <span
        className={baseClasses}
        aria-label="Locating edge POP"
        role="status"
      >
        <span
          className="size-1.5 rounded-full bg-muted-foreground/40 motion-safe:animate-pulse"
          aria-hidden="true"
        />
        <span className="motion-safe:animate-pulse">locating</span>
      </span>
    );
  }

  const { data, latencyMs, protocol } = state;
  const regionLabel = formatRegion(data.region);
  const protocolLabel = formatProtocol(protocol);
  const detailRows = buildDetailRows({
    data,
    latencyMs,
    protocolLabel,
    regionLabel,
  });

  const ariaLabel = `Served from ${regionLabel}${
    protocolLabel ? ` over ${protocolLabel}` : ""
  } in ${latencyMs} milliseconds`;

  function toggleExpanded() {
    setExpanded((current) => !current);
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        className={cn(
          baseClasses,
          "cursor-pointer motion-safe:transition-[border-color,color,background-color] motion-safe:duration-200 hover:border-foreground/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          expanded && "border-foreground/25 text-foreground",
        )}
        aria-expanded={expanded}
        aria-controls={expanded ? panelId : undefined}
        aria-label={ariaLabel}
        onClick={toggleExpanded}
      >
        <span
          className="size-1.5 rounded-full bg-primary/70 shadow-[0_0_6px_var(--brand-shadow)] motion-safe:animate-[pop-chip-ready_420ms_ease-out]"
          aria-hidden="true"
        />
        <span className="motion-safe:animate-[pop-chip-ready_420ms_ease-out]">
          {regionLabel}
        </span>
        {protocolLabel ? (
          <>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <span className="motion-safe:animate-[pop-chip-ready_420ms_ease-out]">
              {protocolLabel}
            </span>
          </>
        ) : null}
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <span className="tabular-nums motion-safe:animate-[pop-chip-ready_420ms_ease-out]">
          {latencyMs}ms
        </span>
        <ChevronUp
          className={cn(
            "size-3 text-current motion-safe:transition-transform motion-safe:duration-200",
            expanded ? "rotate-0" : "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <div
          id={panelId}
          role="group"
          aria-label="Edge POP telemetry"
          className="absolute bottom-[calc(100%+0.5rem)] left-0 z-50 w-max min-w-[12.5rem] origin-bottom rounded-xl border border-border/70 bg-popover/95 p-3 shadow-lg backdrop-blur-md motion-safe:animate-[pop-chip-panel_180ms_ease-out] sm:left-auto sm:right-0"
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-[0.62rem] tracking-[0.14em] uppercase">
            {detailRows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-muted-foreground/80">{row.label}</dt>
                <dd className="text-right text-foreground/90 tabular-nums normal-case tracking-normal">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
