import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server"; // Add this if using Response/Request

export const runtime = "nodejs";

function sortImages(images) {
  return (images ?? []).slice().sort((a, b) => {
    const da = a?.display_order ?? 0;
    const db = b?.display_order ?? 0;
    return da - db;
  });
}

// Now use supabaseAdmin in your handlers, e.g.:
export async function GET() {
  const { data, error } = await supabaseAdmin.from("rooms").select("*");
  // ...
  return NextResponse.json(data);
}

export async function GET() {
  const { data, error } = await supabase
    .from("rooms")
    .select(
      `
    id, title, description, price, capacity, amenities,
    room_images (
      id, room_id, image_url, display_order, is_primary
    )
  `,
    )
    .order("id", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const normalized = (rooms ?? []).map((r) => {
    const images = sortImages(r.room_images);
    // Provide a convenient primary image_url for legacy UI if needed
    const primary = images.find((i) => i.is_primary) || images[0] || null;

    // Remove room_images raw key; return embedded `images`
    const { room_images, ...rest } = r;
    return {
      ...rest,
      images,
      primary_image_url: primary?.image_url ?? null,
    };
  });

  return Response.json(normalized);
}
