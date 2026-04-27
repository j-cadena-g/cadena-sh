"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const POP_ENDPOINT = "/api/pop";

type PopPayload = {
  region: string;
  city: string | null;
  country: string | null;
};

type PopState =
  | { status: "loading" }
  | {
      status: "ready";
      data: PopPayload;
      latencyMs: number;
      protocol: string | null;
    }
  | { status: "error" };

/**
 * Looks up the PerformanceResourceTiming entry for the most recent
 * `/api/pop` fetch and returns its negotiated protocol (`h2`, `h3`,
 * `http/1.1`). Returns `null` if the entry isn't available — some
 * environments strip `nextHopProtocol` from cross-origin responses,
 * but `/api/pop` is same-origin so it should always be present.
 */
function readNegotiatedProtocol(): string | null {
  if (typeof performance === "undefined") {
    return null;
  }

  try {
    const entries = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];

    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.name.endsWith(POP_ENDPOINT) && entry.nextHopProtocol) {
        return entry.nextHopProtocol;
      }
    }
  } catch {
    // PerformanceObserver-style APIs throw on some hardened browsers.
  }

  return null;
}

function formatProtocol(protocol: string | null): string | null {
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

export function PopChip({ className }: { className?: string }) {
  const [state, setState] = useState<PopState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    fetch(POP_ENDPOINT, { cache: "no-store" })
      .then(async (response) => {
        const end =
          typeof performance !== "undefined" ? performance.now() : Date.now();

        if (!response.ok) {
          throw new Error(`Unexpected status ${response.status}`);
        }

        const payload = (await response.json()) as PopPayload;

        if (cancelled) return;

        setState({
          status: "ready",
          data: payload,
          latencyMs: Math.max(0, Math.round(end - start)),
          protocol: readNegotiatedProtocol(),
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Reserve roughly the same horizontal footprint across states so the
  // footer doesn't reflow once the lookup resolves.
  const baseClasses = cn(
    "inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/[0.02] px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.18em] uppercase text-muted-foreground",
    className,
  );

  if (state.status === "error") {
    return null;
  }

  if (state.status === "loading") {
    return (
      <span
        className={baseClasses}
        aria-label="Locating edge POP"
        role="status"
      >
        <span
          className="size-1.5 rounded-full bg-muted-foreground/40"
          aria-hidden="true"
        />
        <span>locating</span>
      </span>
    );
  }

  const { data, latencyMs, protocol } = state;
  const regionLabel = formatRegion(data.region);
  const protocolLabel = formatProtocol(protocol);

  const tooltipParts = [
    data.city ? `City: ${data.city}` : null,
    data.country ? `Country: ${data.country}` : null,
    `Edge POP: ${data.region}`,
    `Round-trip: ${latencyMs}ms`,
    protocolLabel ? `Protocol: ${protocolLabel}` : null,
  ].filter(Boolean) as string[];

  const ariaLabel = `Served from ${regionLabel}${
    protocolLabel ? ` over ${protocolLabel}` : ""
  } in ${latencyMs} milliseconds`;

  return (
    <span
      className={baseClasses}
      title={tooltipParts.join("\n")}
      aria-label={ariaLabel}
    >
      <span
        className="size-1.5 rounded-full bg-primary/70 shadow-[0_0_6px_var(--brand-shadow)]"
        aria-hidden="true"
      />
      <span>{regionLabel}</span>
      {protocolLabel ? (
        <>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <span>{protocolLabel}</span>
        </>
      ) : null}
      <span aria-hidden="true" className="text-border">
        ·
      </span>
      <span className="tabular-nums">{latencyMs}ms</span>
    </span>
  );
}
