import { ImageResponse } from "next/og";

// Satori renders OG images in an isolated environment without access to CSS
// variables, so we mirror the brand tokens from globals.css as sRGB hex here.
// Keep in sync with --brand-start / --brand-end when those tokens change.
const BRAND_START = "#ff7a20";
const BRAND_END = "#ffb85c";

export const alt = "James Cadena — Network & Security Engineer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#050505",
        color: "#f3f2ee",
        padding: "56px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignSelf: "flex-start",
          gap: "8px",
          fontSize: 24,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#a1a1aa",
        }}
      >
        <span>cadena.sh</span>
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, ${BRAND_START}, ${BRAND_END})`,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          maxWidth: 920,
        }}
      >
        <div
          style={{
            fontSize: 88,
            lineHeight: 0.95,
            letterSpacing: "-0.06em",
            fontWeight: 700,
          }}
        >
          James Cadena
        </div>
        <div
          style={{
            fontSize: 34,
            lineHeight: 1.2,
            color: "#d4d4d8",
          }}
        >
          Networks, systems, security, and infrastructure tooling.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 22,
          color: "#a1a1aa",
        }}
      >
        <span>james.cadena.sh</span>
        <span>Network &amp; Security Engineer</span>
      </div>
    </div>,
    size,
  );
}
