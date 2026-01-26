import sql from "@/app/api/utils/sql";

// Get all rooms/residencies with their images
export async function GET(request) {
  try {
    const rooms = await sql`
      SELECT 
        id,
        title,
        description,
        image_url,
        location,
        available,
        pricing_config,
        created_at
      FROM residencies
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
        return { ...room, images };
      }),
    );

    return Response.json({ rooms: roomsWithImages });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return Response.json(
      {
        error: "Failed to fetch rooms",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Add, update, or delete room images
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      action,
      roomId,
      imageId,
      imageUrl,
      isPrimary,
      displayOrder,
      caption,
    } = body;

    if (action === "add") {
      // Add new image to room
      const result = await sql`
        INSERT INTO room_images (residency_id, image_url, display_order, is_primary, caption)
        VALUES (${roomId}, ${imageUrl}, ${displayOrder || 0}, ${isPrimary || false}, ${caption || null})
        RETURNING *
      `;

      // If this is set as primary, unset others
      if (isPrimary) {
        await sql`
          UPDATE room_images
          SET is_primary = false
          WHERE residency_id = ${roomId} AND id != ${result[0].id}
        `;
      }

      return Response.json({ image: result[0] });
    } else if (action === "update") {
      // Update existing image
      const result = await sql`
        UPDATE room_images
        SET 
          is_primary = ${isPrimary !== undefined ? isPrimary : false},
          display_order = ${displayOrder !== undefined ? displayOrder : 0},
          caption = ${caption !== undefined ? caption : null}
        WHERE id = ${imageId}
        RETURNING *
      `;

      // If this is set as primary, unset others
      if (isPrimary) {
        await sql`
          UPDATE room_images
          SET is_primary = false
          WHERE residency_id = ${roomId} AND id != ${imageId}
        `;
      }

      return Response.json({ image: result[0] });
    } else if (action === "delete") {
      // Delete image
      await sql`
        DELETE FROM room_images
        WHERE id = ${imageId}
      `;

      return Response.json({ success: true });
    } else if (action === "reorder") {
      // Reorder images - body.images should be array of {id, displayOrder}
      const { images } = body;
      for (const img of images) {
        await sql`
          UPDATE room_images
          SET display_order = ${img.displayOrder}
          WHERE id = ${img.id}
        `;
      }

      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating room:", error);
    return Response.json(
      {
        error: "Failed to update room",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
