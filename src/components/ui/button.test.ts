import { describe, expect, it } from "vitest";

import { buttonVariants } from "./button";

describe("buttonVariants", () => {
  it("uses a valid hover class for the default variant", () => {
    const classes = buttonVariants({ variant: "default" });

    expect(classes).toContain("hover:bg-primary/80");
    expect(classes).not.toContain("[a]:hover:bg-primary/80");
  });
});
