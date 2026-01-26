import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // Fetch images from the database gallery table
    const images = await sql`
      SELECT * FROM gallery
      ORDER BY display_order ASC, id ASC
    `;

    return Response.json({ images });
  } catch (error) {
    console.error("GET /api/gallery error:", error);
    return Response.json(
      { error: "Failed to fetch gallery images", details: error.message },
      { status: 500 },
    );
  }
}
