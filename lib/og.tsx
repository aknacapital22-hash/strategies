// The picture shown when a link is shared. No return figures: a shared image travels without its disclaimers.
import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

export async function shareImage(label: string, title: string, text: string) {
  const mark = `data:image/png;base64,${readFileSync(path.join(process.cwd(), "public", "logo-mark.png")).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#fcfbf6", color: "#0b1d33" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={mark} width={105} height={80} />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 20 }}>
            <div style={{ display: "flex", fontSize: 46, fontWeight: 700 }}>
              <span>15</span>
              <span style={{ color: "#0f766e" }}>Stocks</span>
            </div>
            <div style={{ fontSize: 20, color: "#5b6779" }}>by AKNA Capital</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0f766e" }}>{label}</div>
          <div style={{ fontSize: title.length > 40 ? 56 : 72, fontWeight: 700, marginTop: 16, lineHeight: 1.15 }}>{title}</div>
        </div>
        <div style={{ fontSize: 30, color: "#3b475a" }}>{text}</div>
      </div>
    ),
    OG_SIZE,
  );
}
