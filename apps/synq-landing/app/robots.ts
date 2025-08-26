import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/private/", "/_next/", "/static/"],
    },
    sitemap: "https://www.trysynq.com/sitemap.xml",
    host: "https://www.trysynq.com",
  };
}
