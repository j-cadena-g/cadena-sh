import { ImageResponse } from "next/og";

// Satori renders OG images in an isolated environment without access to CSS
// variables, so we mirror the brand tokens from globals.css as sRGB hex here.
// Keep in sync with --brand-start / --brand-end / dark --primary when those
// tokens change.
const BRAND_START = "#ff7a20";
const BRAND_END = "#ffb85c";
const SIGNAL = "#fd9e3d";
const BACKGROUND = "#050505";
const FOREGROUND = "#f3f2ee";
const MUTED = "#a3a19f";
const FAINT = "#6f6c69";
const GRID_LINE = "rgba(255, 244, 230, 0.06)";

export const alt = "James Cadena — Network & Security Engineer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const GRID_SIZE = 64;

const hops = [
  { kind: "CLIENT", value: "you" },
  { kind: "EDGE POP", value: "edge" },
  { kind: "ORIGIN", value: "james.cadena.sh" },
];

// Explicit 1px lines: Satori doesn't tile multi-layer gradient backgrounds.
const gridColumns = Array.from(
  { length: Math.floor(size.width / GRID_SIZE) },
  (_, index) => (index + 1) * GRID_SIZE,
);
const gridRows = Array.from(
  { length: Math.floor(size.height / GRID_SIZE) },
  (_, index) => (index + 1) * GRID_SIZE,
);

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: BACKGROUND,
        color: FOREGROUND,
        fontFamily: "sans-serif",
      }}
    >
      {/* Blueprint grid, faded out towards the edges by the vignette below. */}
      {gridColumns.map((x) => (
        <div
          key={`x${x}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: x,
            width: 1,
            background: GRID_LINE,
          }}
        />
      ))}
      {gridRows.map((y) => (
        <div
          key={`y${y}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: y,
            height: 1,
            background: GRID_LINE,
          }}
        />
      ))}
      {/* Satori reads a leading bare size keyword as a colour stop, so every
          radial gradient here names its shape first. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage: `radial-gradient(ellipse 75% 85% at 50% 0%, rgba(5, 5, 5, 0) 35%, ${BACKGROUND} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -300,
          left: 150,
          width: 900,
          height: 600,
          display: "flex",
          backgroundImage:
            "radial-gradient(ellipse closest-side at 50% 50%, rgba(255, 122, 32, 0.26), rgba(255, 122, 32, 0))",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{ display: "flex", fontSize: 28, letterSpacing: "-0.01em" }}
          >
            <span>cadena</span>
            <span style={{ color: SIGNAL }}>.sh</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 20,
              letterSpacing: "0.18em",
              color: MUTED,
            }}
          >
            <div style={{ width: 40, height: 2, background: SIGNAL }} />
            <span>NETWORK &amp; SECURITY ENGINEER</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              fontSize: 132,
              lineHeight: 0.9,
              letterSpacing: "-0.055em",
            }}
          >
            <span>James Cadena</span>
            <div
              style={{
                width: 58,
                height: 10,
                marginLeft: 12,
                marginBottom: 14,
                background: `linear-gradient(90deg, ${BRAND_START}, ${BRAND_END})`,
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 36, color: MUTED }}>
            Infrastructure across networks, systems, and security.
          </div>
        </div>

        {/* The hero's route trace, flattened into a single chain. */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {hops.map((hop, index) => {
            const isOrigin = index === hops.length - 1;

            return (
              <div
                key={hop.kind}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: isOrigin ? 0 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: isOrigin ? 18 : 16,
                      height: isOrigin ? 18 : 16,
                      borderRadius: 999,
                      border: `2.5px solid ${SIGNAL}`,
                      background: isOrigin ? SIGNAL : BACKGROUND,
                      boxShadow: isOrigin
                        ? "0 0 0 6px rgba(253, 158, 61, 0.18)"
                        : "none",
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                      style={{
                        fontSize: 15,
                        letterSpacing: "0.16em",
                        color: FAINT,
                      }}
                    >
                      {`0${index + 1} ${hop.kind}`}
                    </span>
                    <span
                      style={{
                        fontSize: 24,
                        color: isOrigin ? FOREGROUND : MUTED,
                      }}
                    >
                      {hop.value}
                    </span>
                  </div>
                </div>
                {isOrigin ? null : (
                  <div
                    style={{
                      display: "flex",
                      flexGrow: 1,
                      height: 2,
                      margin: "0 28px",
                      background: `linear-gradient(90deg, rgba(253, 158, 61, 0.25), rgba(253, 158, 61, 0.7))`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    size,
  );
}
