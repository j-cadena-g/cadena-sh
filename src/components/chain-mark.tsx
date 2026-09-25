import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Two interlocking links — "cadena" is Spanish for chain. Each link is masked
 * where the other passes over it, so the pair reads as woven rather than
 * stacked: the amber link crosses on top, the other link crosses underneath.
 */
function ChainMark({ className, ...props }: React.ComponentProps<"svg">) {
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const underMaskId = `${id}-under`;
  const overMaskId = `${id}-over`;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <mask
          id={underMaskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <rect width="24" height="24" fill="white" />
          <circle cx="12" cy="15.7" r="2.4" fill="black" />
        </mask>
        <mask
          id={overMaskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <rect width="24" height="24" fill="white" />
          <circle cx="12" cy="8.3" r="2.4" fill="black" />
        </mask>
      </defs>
      <g transform="rotate(-45 12 12)">
        <rect
          x="1.5"
          y="8"
          width="13"
          height="8"
          rx="4"
          className="stroke-primary"
          mask={`url(#${underMaskId})`}
        />
        <rect
          x="9.5"
          y="8"
          width="13"
          height="8"
          rx="4"
          className="stroke-current"
          mask={`url(#${overMaskId})`}
        />
      </g>
    </svg>
  );
}

export { ChainMark };
