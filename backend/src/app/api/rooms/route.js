import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function sortImages(images) {
  return (images ?? []).slice().sort((a, b) => {
    const da = a?.display_order ?? 0;
    const db = b?.display_order ?? 0;
    return da - db;
  });
}

export async function GET() {
  const { data: rooms, error } = await supabaseAdmin
    .from("rooms")
    .select(`
      *,
      room_images (
        id,
        room_id,
        image_url,
        is_primary,
        display_order,
        created_at,
        updated_at
      )
    `)
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
