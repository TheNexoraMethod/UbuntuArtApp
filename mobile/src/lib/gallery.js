// apps/mobile/src/lib/gallery.js
// NOTE: Use expo/fetch directly to bypass the __create/fetch.ts monkey-patch,
// which adds incorrect host headers that route first-party requests to the
// create.xyz platform instead of our actual backend.
import { fetch as rawFetch } from "expo/fetch";

const BASE_URL = (
  process.env.EXPO_PUBLIC_BASE_URL || "https://tnmubuntuapp.vercel.app"
).replace(/\/$/, "");

export async function fetchGalleryImages() {
  const res = await rawFetch(`${BASE_URL}/api/gallery`);

  if (!res.ok) {
    const msg = await res.text();
    console.error("GALLERY ERROR:", res.status, msg);
    throw new Error(`Gallery API error (${res.status}): ${msg}`);
  }

  const data = await res.json();
  // Backend returns { images: [...] }
  const rows = data.images ?? data ?? [];
  console.log("GALLERY DATA:", rows.length, "rows");

  return rows
    .map((row) => ({
      id: row.id,
      name: row.title || row.name || "Untitled",
      url: row.image_url || "",
      description: row.description || "",
      category: row.category || "",
    }))
    .filter((img) => img.url);
}
