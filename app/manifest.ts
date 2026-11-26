import type { MetadataRoute } from "next";
import { HOME_DESCRIPTION } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "15Stocks",
    description: HOME_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#fcfbf6",
    theme_color: "#0f766e",
    lang: "en-IN",
    icons: [{ src: "/icon.png", sizes: "256x256", type: "image/png" }],
  };
}
