import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

// Components that fire fetch() in a useEffect (e.g. <PopChip />) would
// otherwise hit jsdom's stub, fail synchronously, and produce noisy
// "update was not wrapped in act(...)" warnings. Tests that need to
// exercise fetch can override this per-suite with vi.stubGlobal("fetch", …).
vi.stubGlobal(
  "fetch",
  vi.fn(() => new Promise(() => {})),
);
