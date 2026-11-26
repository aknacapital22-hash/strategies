import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "15Stocks by AKNA Capital: systematic investing for wealth creation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const mark = `data:image/png;base64,${readFileSync(path.join(process.cwd(), "public", "logo-mark.png")).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#fcfbf6", color: "#0b1d33" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={mark} width={157} height={120} />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 28 }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 700 }}>
              <span>15</span>
              <span style={{ color: "#0f766e" }}>Stocks</span>
            </div>
            <div style={{ fontSize: 24, color: "#5b6779" }}>by AKNA Capital</div>
          </div>
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, marginTop: 56, lineHeight: 1.15 }}>Systematic investing for wealth creation.</div>
        <div style={{ fontSize: 30, marginTop: 28, color: "#3b475a" }}>Ready-made share baskets that follow fixed rules. You buy in your own account.</div>
      </div>
    ),
    size,
  );
}
