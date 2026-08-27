import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { setTheme, useThemeMock } = vi.hoisted(() => ({
  setTheme: vi.fn(),
  useThemeMock: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => useThemeMock(),
}));

import { ThemeSwitcher } from "./theme-switcher";

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    setTheme.mockReset();
    useThemeMock.mockReturnValue({
      theme: "system",
      setTheme,
      resolvedTheme: "dark",
    });
  });

  it("renders dark, system, and light options", () => {
    render(<ThemeSwitcher />);

    expect(
      screen.getByRole("radiogroup", { name: "Theme" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Dark" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Light" })).toBeInTheDocument();
  });

  it("marks the stored preference as selected", () => {
    useThemeMock.mockReturnValue({
      theme: "light",
      setTheme,
      resolvedTheme: "light",
    });

    render(<ThemeSwitcher />);

    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Dark" })).not.toBeChecked();
  });

  it("persists the chosen preference", () => {
    render(<ThemeSwitcher />);

    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
