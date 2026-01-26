import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const rooms = await sql`
      SELECT 
        id,
        title,
        description,
        image_url,
        location,
        amenities,
        available,
        rating,
        room_type,
        pricing_config
      FROM residencies
      WHERE available = true
      ORDER BY title ASC
    `;

    // Fetch images for each room
    const roomsWithImages = await Promise.all(
      rooms.map(async (room) => {
        const images = await sql`
          SELECT id, image_url, display_order, is_primary, caption
          FROM room_images
          WHERE residency_id = ${room.id}
          ORDER BY display_order ASC, created_at ASC
        `;

        // Get primary image or first image or fallback to legacy image_url
        const primaryImage = images.find((img) => img.is_primary) || images[0];
        const displayImage = primaryImage?.image_url || room.image_url;

        return {
          id: room.id,
          title: room.title,
          description: room.description,
          pricing_config: room.pricing_config || { price_per_night: 150 },
          image_url: displayImage, // Legacy field for backwards compatibility
          images, // New field with all images
          amenities: room.amenities || [],
          maxGuests: room.pricing_config?.max_guests || 2,
          available: room.available !== false,
          location: room.location,
          rating: parseFloat(room.rating) || 0,
          room_type: room.room_type || "standard",
        };
      }),
    );

    return Response.json({ rooms: roomsWithImages });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return Response.json(
      { error: "Failed to fetch rooms", details: error.message },
      { status: 500 },
    );
  }
}
