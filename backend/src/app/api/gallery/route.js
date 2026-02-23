import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("gallery")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Keep response shape stable for mobile:
  return Response.json({ images: data ?? [] });
}
