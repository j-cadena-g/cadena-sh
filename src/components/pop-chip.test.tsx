import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatProtocol,
  PopChip,
  readPopResourceTiming,
} from "./pop-chip";

const fetchMock = vi.fn<typeof fetch>();

function stubResourceTiming(
  entry: Partial<PerformanceResourceTiming> & { name: string },
) {
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([
    entry as PerformanceResourceTiming,
  ]);
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        region: "iad1",
        city: "Ashburn",
        country: "US",
      }),
      { status: 200 },
    ),
  );
});

afterEach(() => {
  fetchMock.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("formatProtocol", () => {
  it("normalizes common nextHopProtocol values", () => {
    expect(formatProtocol("h3")).toBe("h3");
    expect(formatProtocol("H2")).toBe("h2");
    expect(formatProtocol("http/1.1")).toBe("h1.1");
    expect(formatProtocol(null)).toBeNull();
  });
});

describe("readPopResourceTiming", () => {
  it("prefers responseEnd - requestStart for latency", () => {
    stubResourceTiming({
      name: "https://james.cadena.sh/api/pop",
      requestStart: 10,
      responseEnd: 52.4,
      duration: 99,
      nextHopProtocol: "h3",
    });

    expect(readPopResourceTiming("/api/pop")).toEqual({
      latencyMs: 42,
      protocol: "h3",
    });
  });

  it("falls back to duration when request timing is unavailable", () => {
    stubResourceTiming({
      name: "http://localhost:3000/api/pop",
      requestStart: 0,
      responseEnd: 0,
      duration: 37.2,
      nextHopProtocol: "h2",
    });

    expect(readPopResourceTiming("/api/pop")).toEqual({
      latencyMs: 37,
      protocol: "h2",
    });
  });

  it("returns nulls when no matching entry exists", () => {
    stubResourceTiming({
      name: "https://james.cadena.sh/api/contact",
      requestStart: 1,
      responseEnd: 20,
      duration: 19,
      nextHopProtocol: "h2",
    });

    expect(readPopResourceTiming("/api/pop")).toEqual({
      latencyMs: null,
      protocol: null,
    });
  });
});

describe("PopChip", () => {
  it("shows locating then a compact ready summary", async () => {
    stubResourceTiming({
      name: "http://localhost/api/pop",
      requestStart: 5,
      responseEnd: 48,
      duration: 43,
      nextHopProtocol: "h3",
    });

    render(<PopChip />);

    expect(screen.getByLabelText(/locating edge pop/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /served from iad1 over h3 in 43 milliseconds/i,
        }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("iad1")).toBeInTheDocument();
    expect(screen.getByText("h3")).toBeInTheDocument();
    expect(screen.getByText("43ms")).toBeInTheDocument();
  });

  it("falls back to wall-clock latency when resource timing is missing", async () => {
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([]);

    let resolveFetch: ((value: Response) => void) | undefined;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const nowSpy = vi.spyOn(performance, "now").mockReturnValue(100);

    render(<PopChip />);
    expect(screen.getByLabelText(/locating edge pop/i)).toBeInTheDocument();

    nowSpy.mockReturnValue(175);
    expect(resolveFetch).toBeDefined();
    resolveFetch!(
      new Response(
        JSON.stringify({ region: "iad1", city: null, country: null }),
        { status: 200 },
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("75ms")).toBeInTheDocument();
    });
  });

  it("expands telemetry details on click and closes on Escape", async () => {
    stubResourceTiming({
      name: "http://localhost/api/pop",
      requestStart: 1,
      responseEnd: 20,
      duration: 19,
      nextHopProtocol: "h2",
    });

    render(<PopChip />);

    const trigger = await screen.findByRole("button", {
      name: /served from iad1/i,
    });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Ashburn")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const panel = screen.getByRole("group", { name: /edge pop telemetry/i });
    expect(panel).toHaveTextContent("Ashburn");
    expect(panel).toHaveTextContent("US");
    expect(panel).toHaveTextContent("iad1");
    expect(panel).toHaveTextContent("19ms");

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
    expect(screen.queryByText("Ashburn")).not.toBeInTheDocument();
  });

  it("closes the panel on an outside pointerdown", async () => {
    stubResourceTiming({
      name: "http://localhost/api/pop",
      requestStart: 1,
      responseEnd: 20,
      duration: 19,
      nextHopProtocol: "h2",
    });

    render(<PopChip />);

    const trigger = await screen.findByRole("button", {
      name: /served from iad1/i,
    });

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(document.body);

    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
    expect(screen.queryByText("Ashburn")).not.toBeInTheDocument();
  });

  it("renders unavailable when the lookup fails", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    render(<PopChip />);

    await waitFor(() => {
      expect(
        screen.getByLabelText(/failed to locate edge pop/i),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("unavailable")).toBeInTheDocument();
  });
});
