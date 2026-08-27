"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useId, useSyncExternalStore } from "react";

import { THEME_STORAGE_KEY } from "@/lib/theme";

const THEME_OPTIONS = [
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
] as const;

type ThemePreference = (typeof THEME_OPTIONS)[number]["value"];

function isThemePreference(
  value: string | undefined | null,
): value is ThemePreference {
  return THEME_OPTIONS.some((option) => option.value === value);
}

function readStoredTheme(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(stored)) {
      return stored;
    }
  } catch {
    // Private mode and blocked storage both fall back to the default.
  }

  return "system";
}

function subscribeToClient() {
  return () => {};
}

function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const groupId = useId();
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );

  // Keep the first client render identical to the server so next-themes'
  // localStorage-backed state cannot mismatch the HTML. After mount, prefer
  // the provider value and fall back to storage if it is still empty.
  const selectedTheme: ThemePreference | null = mounted
    ? isThemePreference(theme)
      ? theme
      : readStoredTheme()
    : null;
  const selectedIndex = selectedTheme
    ? THEME_OPTIONS.findIndex((option) => option.value === selectedTheme)
    : -1;

  return (
    <div role="radiogroup" aria-label="Theme" className={className}>
      <div className="rounded-full border border-border/70 bg-muted/50 p-0.5">
        <div className="relative grid grid-cols-3">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 rounded-full bg-background shadow-[0_1px_2px_oklch(0.2_0.02_40/0.12)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out"
            style={{
              transform: `translateX(${Math.max(selectedIndex, 0) * 100}%)`,
              opacity: selectedIndex >= 0 ? 1 : 0,
            }}
          />
          {THEME_OPTIONS.map(({ value, label, Icon }) => {
            const optionId = `${groupId}-${value}`;

            return (
              <label
                key={value}
                htmlFor={optionId}
                title={label}
                className="relative z-10 flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors has-[:checked]:text-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/60 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
              >
                <input
                  id={optionId}
                  type="radio"
                  name={groupId}
                  value={value}
                  checked={selectedTheme === value}
                  onChange={() => setTheme(value)}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                <Icon
                  className="pointer-events-none size-3.5"
                  aria-hidden="true"
                />
                <span className="sr-only">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { THEME_OPTIONS, ThemeSwitcher };
export type { ThemePreference };
