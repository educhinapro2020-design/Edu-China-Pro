import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/counselor", "/dashboard", "/onboarding", "/api"],
      },
    ],
    sitemap: "https://educhinapro.com/sitemap.xml",
  };
}
