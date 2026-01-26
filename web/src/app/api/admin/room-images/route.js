import sql from "@/app/api/utils/sql";

// Get all images for a specific room
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const residencyId = searchParams.get("residency_id");

    if (!residencyId) {
      return Response.json(
        { error: "residency_id is required" },
        { status: 400 },
      );
    }

    const images = await sql`
      SELECT * FROM room_images
      WHERE residency_id = ${residencyId}
      ORDER BY display_order ASC, id ASC
    `;

    return Response.json({ images });
  } catch (error) {
    console.error("Error fetching room images:", error);
    return Response.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

// Add image to room (from gallery or new upload)
export async function POST(request) {
  try {
    const body = await request.json();
    const { residency_id, image_url, gallery_id, is_primary, caption } = body;

    if (!residency_id || !image_url) {
      return Response.json(
        { error: "residency_id and image_url are required" },
        { status: 400 },
      );
    }

    // Get the current max display order
    const [maxOrder] = await sql`
      SELECT COALESCE(MAX(display_order), -1) as max_order
      FROM room_images
      WHERE residency_id = ${residency_id}
    `;

    const newOrder = maxOrder.max_order + 1;

    // If this is set as primary, unset all other primary images for this room
    if (is_primary) {
      await sql`
        UPDATE room_images
        SET is_primary = false
        WHERE residency_id = ${residency_id}
      `;
    }

    const [newImage] = await sql`
      INSERT INTO room_images (residency_id, image_url, display_order, is_primary, caption)
      VALUES (${residency_id}, ${image_url}, ${newOrder}, ${is_primary || false}, ${caption || null})
      RETURNING *
    `;

    return Response.json({ image: newImage });
  } catch (error) {
    console.error("Error adding room image:", error);
    return Response.json({ error: "Failed to add image" }, { status: 500 });
  }
}

// Update image (reorder, set primary, update caption)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, display_order, is_primary, caption } = body;

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    // Get the room image to know which residency it belongs to
    const [existingImage] = await sql`
      SELECT residency_id FROM room_images WHERE id = ${id}
    `;

    if (!existingImage) {
      return Response.json({ error: "Image not found" }, { status: 404 });
    }

    // If setting as primary, unset all other primary images for this room
    if (is_primary === true) {
      await sql`
        UPDATE room_images
        SET is_primary = false
        WHERE residency_id = ${existingImage.residency_id} AND id != ${id}
      `;
    }

    // Build update query dynamically
    let updates = [];
    let values = [];

    if (display_order !== undefined) {
      updates.push(`display_order = $${updates.length + 1}`);
      values.push(display_order);
    }
    if (is_primary !== undefined) {
      updates.push(`is_primary = $${updates.length + 1}`);
      values.push(is_primary);
    }
    if (caption !== undefined) {
      updates.push(`caption = $${updates.length + 1}`);
      values.push(caption);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE room_images SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING *`;

    const [updatedImage] = await sql(query, values);

    return Response.json({ image: updatedImage });
  } catch (error) {
    console.error("Error updating room image:", error);
    return Response.json({ error: "Failed to update image" }, { status: 500 });
  }
}

// Delete image
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    await sql`DELETE FROM room_images WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting room image:", error);
    return Response.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
