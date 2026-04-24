import * as React from "react";

import { cn } from "@/lib/utils";

function SectionLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="section-label"
      className={cn(
        "text-[0.68rem] font-medium tracking-[0.24em] uppercase text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SectionRule({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="section-rule"
      className={cn("h-px bg-border/70", className)}
      {...props}
    />
  );
}

export { SectionLabel, SectionRule };
