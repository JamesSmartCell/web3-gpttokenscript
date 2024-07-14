import type { MetadataRoute } from "next"

import { APP_URL } from "@/app/config"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1
    }
  ]
}
