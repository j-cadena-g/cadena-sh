import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("renders dark, system, and light options", async () => {
    render(<ThemeSwitcher />);

    expect(
      screen.getByRole("radiogroup", { name: "Theme" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Dark" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Light" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    });
  });

  it("falls back to the stored preference when the provider has not set theme", async () => {
    localStorage.setItem("cadena-theme", "light");
    useThemeMock.mockReturnValue({
      theme: undefined,
      setTheme,
      resolvedTheme: undefined,
    });

    render(<ThemeSwitcher />);

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    });
  });

  it("marks the stored preference as selected", async () => {
    useThemeMock.mockReturnValue({
      theme: "light",
      setTheme,
      resolvedTheme: "light",
    });

    render(<ThemeSwitcher />);

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    });
    expect(screen.getByRole("radio", { name: "Dark" })).not.toBeChecked();
  });

  it("persists the chosen preference", async () => {
    render(<ThemeSwitcher />);

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    });

    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
