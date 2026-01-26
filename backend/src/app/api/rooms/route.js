import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function sortImages(images) {
  return (images ?? []).slice().sort((a, b) => {
    const da = a?.display_order ?? 0;
    const db = b?.display_order ?? 0;
    return da - db;
  });
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("rooms")
    .select(
      `
      id, title, description, price_per_night, max_guests,
      room_images (
        id, room_id, image_url, display_order, is_primary
      )
    `,
    )
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = (data ?? []).map((r) => {
    const images = sortImages(r.room_images);
    const primary = images.find((i) => i.is_primary) || images[0] || null;
    const { room_images, ...rest } = r;

    return {
      ...rest,
      images,
      primary_image_url: primary?.image_url ?? null,
    };
  });

  return NextResponse.json(normalized);
}
