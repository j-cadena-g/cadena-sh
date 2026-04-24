import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "./contact-form";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("ContactForm", () => {
  it("keeps the submit button disabled while the request is in flight", async () => {
    let resolveResponse: ((value: Response) => void) | undefined;

    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    );

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "James Cadena" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "james@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: {
        value:
          "I would like to discuss a role focused on secure infrastructure.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /send message/i,
      }),
    );

    expect(
      screen.getByRole("button", {
        name: /sending/i,
      }),
    ).toBeDisabled();

    resolveResponse?.({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /message sent/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it("shows an inline error message when the request fails before a response arrives", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "James Cadena" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "james@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: {
        value:
          "I would like to discuss a role focused on secure infrastructure.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /send message/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/network error/i);
    });
  });

  it("shows a fallback error when the server responds without JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("<html>upstream exploded</html>", {
        status: 502,
        headers: {
          "content-type": "text/html",
        },
      }),
    );

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "James Cadena" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "james@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: {
        value:
          "I would like to discuss a role focused on secure infrastructure.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /send message/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /unable to send your message right now/i,
      );
    });
  });

  it("shows an inline success panel after a successful submission", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "James Cadena" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "james@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: {
        value:
          "I would like to discuss a role focused on secure infrastructure.",
      },
    });

    fireEvent.submit(
      screen
        .getByRole("button", {
          name: /send message/i,
        })
        .closest("form")!,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /message sent/i,
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/i will follow up when i can/i),
    ).toBeInTheDocument();
  });
});
