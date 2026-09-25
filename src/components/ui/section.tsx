import * as React from "react";

import { cn } from "@/lib/utils";

function SectionLabel({
  className,
  index,
  indexClassName,
  children,
  ...props
}: React.ComponentProps<"p"> & { index?: string; indexClassName?: string }) {
  return (
    <p
      data-slot="section-label"
      className={cn(
        "flex items-center gap-2 font-mono text-[0.7rem] font-medium tracking-[0.12em] uppercase text-muted-foreground",
        className,
      )}
      {...props}
    >
      {index ? (
        <>
          <span
            aria-hidden="true"
            className={cn("text-primary tabular-nums", indexClassName)}
          >
            {index}
          </span>
          <span
            aria-hidden="true"
            className={cn("text-muted-foreground/50", indexClassName)}
          >
            /
          </span>
        </>
      ) : null}
      <span>{children}</span>
    </p>
  );
}

/** A numbered section label whose rule runs to the container edge. */
function SectionMarker({
  className,
  index,
  children,
  ...props
}: React.ComponentProps<"div"> & { index?: string }) {
  return (
    <div
      data-slot="section-marker"
      className={cn("flex items-center gap-4", className)}
      {...props}
    >
      <SectionLabel index={index} className="shrink-0">
        {children}
      </SectionLabel>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}

export { SectionLabel, SectionMarker };
