import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PopChip } from "./pop-chip";
import { RouteTrace } from "./route-trace";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({ region: "yyz1", city: "Toronto", country: "CA" }),
      { status: 200 },
    ),
  );
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([
    {
      name: "http://localhost/api/pop",
      requestStart: 10,
      responseEnd: 33,
      duration: 23,
      nextHopProtocol: "h3",
    } as PerformanceResourceTiming,
  ]);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("RouteTrace", () => {
  it("traces client, edge POP, and origin once the lookup resolves", async () => {
    render(<RouteTrace />);

    const trace = screen.getByRole("figure", { name: /your connection/i });
    expect(trace).toHaveTextContent(/tracing/i);

    await waitFor(() => {
      expect(trace).toHaveTextContent(/live/i);
    });

    const hops = within(trace).getAllByRole("listitem");
    expect(hops).toHaveLength(3);
    expect(hops[0]).toHaveTextContent("You");
    expect(hops[0]).toHaveTextContent("Toronto, CA");
    expect(hops[1]).toHaveTextContent("yyz1");
    expect(hops[1]).toHaveTextContent("h3");
    expect(hops[2]).toHaveTextContent(window.location.host);
    expect(hops[2]).toHaveTextContent("23 ms");
  });

  it("links to the site source", () => {
    render(<RouteTrace />);

    expect(
      screen.getByRole("link", { name: /how this site is built/i }),
    ).toHaveAttribute("href", "https://github.com/j-cadena-g/cadena-sh");
  });

  it("shares a single /api/pop lookup with the footer chip", async () => {
    render(
      <>
        <RouteTrace />
        <PopChip />
      </>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /served from yyz1 over h3 in 23/i }),
      ).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("figure")).toHaveTextContent("23 ms");
  });

  it("reports the trace as unavailable when the lookup fails", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    render(<RouteTrace />);

    const trace = screen.getByRole("figure", { name: /your connection/i });

    await waitFor(() => {
      expect(trace).toHaveTextContent(/unavailable/i);
    });
    expect(within(trace).getAllByText("—")).toHaveLength(3);
  });
});
