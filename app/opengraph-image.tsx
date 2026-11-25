import { ImageResponse } from "next/og";

export const alt = "AKNA Capital Stock Strategies: alpha by design";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#060a14,#12284c)", color: "#f2f5fb" }}>
        <div style={{ fontSize: 28, color: "#7fb2ff", letterSpacing: 4 }}>AKNA CAPITAL</div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>Quant investing you can read, approve and own.</div>
        <div style={{ fontSize: 30, marginTop: 32, color: "#e2e9f6" }}>Rules-based stock strategies. Your broker. Your demat.</div>
      </div>
    ),
    size,
  );
}
