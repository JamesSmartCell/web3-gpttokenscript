import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "W3GPT",
    short_name: "W3GPT",
    description: "Write and deploy smart contracts with AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#22DA00",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon"
      }
    ]
  }
}
