// Fetches rooms via the Vercel backend API (uses supabaseAdmin — no RLS issues)
// NOTE: We import from expo/fetch directly to bypass the __create/fetch.ts
// monkey-patch, which adds incorrect host headers that route requests to the
// create.xyz platform instead of our actual backend.
import { fetch as rawFetch } from "expo/fetch";

const BASE_URL = (
  process.env.EXPO_PUBLIC_BASE_URL || "https://tnmubuntuapp.vercel.app"
).replace(/\/$/, "");

/** Fetch rooms with images from the Vercel API */
export async function fetchRoomsWithImages() {
  const res = await rawFetch(`${BASE_URL}/api/rooms`);
  if (!res.ok)
    throw new Error(`Rooms API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  // Backend returns array directly
  return Array.isArray(data) ? data : (data.rooms ?? []);
}
