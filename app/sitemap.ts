import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = "https://educhinapro.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: universities }, { data: programs }] = await Promise.all([
    supabase
      .from("universities")
      .select("slug, updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("programs")
      .select("slug, updated_at, university:universities(slug)")
      .order("updated_at", { ascending: false }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/universities`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/programs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${BASE}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/signup`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const universityPages: MetadataRoute.Sitemap = (universities ?? []).map(
    (u) => ({
      url: `${BASE}/universities/${u.slug}`,
      lastModified: u.updated_at ? new Date(u.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  const programPages: MetadataRoute.Sitemap = (programs ?? []).map(
    (p: any) => ({
      url: `${BASE}/universities/${p.university?.slug}/programs/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  return [...staticPages, ...universityPages, ...programPages];
}
