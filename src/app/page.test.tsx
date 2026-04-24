import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home", () => {
  it("renders the core sections and primary profile links", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /james cadena/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /selected work/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /get in touch/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /send message/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /github/i,
      }),
    ).toHaveAttribute("href", "https://github.com/j-cadena-g");

    expect(
      screen.getByRole("link", {
        name: /linkedin/i,
      }),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/j-cadena-g");

    expect(
      screen.getByRole("link", {
        name: /^x$/i,
      }),
    ).toHaveAttribute("href", "https://x.com/j_cadena_g");
  });
});
