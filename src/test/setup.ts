import "@testing-library/jest-dom/vitest";

import { beforeEach, vi } from "vitest";

const localStorageStore = new Map<string, string>();

const localStorageStub: Storage = {
  getItem: (key) => localStorageStore.get(key) ?? null,
  setItem: (key, value) => {
    localStorageStore.set(key, String(value));
  },
  removeItem: (key) => {
    localStorageStore.delete(key);
  },
  clear: () => {
    localStorageStore.clear();
  },
  key: (index) => [...localStorageStore.keys()][index] ?? null,
  get length() {
    return localStorageStore.size;
  },
};

beforeEach(() => {
  localStorageStore.clear();
  vi.stubGlobal("localStorage", localStorageStub);
  // Components that fire fetch() in a useEffect (e.g. <PopChip />) would
  // otherwise hit jsdom's stub, fail synchronously, and produce noisy
  // "update was not wrapped in act(...)" warnings. Tests that need to
  // exercise fetch can override this per-suite with vi.stubGlobal("fetch", …).
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ region: "test-region", city: null, country: null }),
          { status: 200 },
        ),
      ),
    ),
  );
});
