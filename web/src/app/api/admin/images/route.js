import sql from "@/app/api/utils/sql";
import { upload } from "@/app/api/utils/upload";

// Get all images (from gallery and residencies)
export async function GET(request) {
  try {
    const galleryImages = await sql`
      SELECT 
        id, 
        title, 
        description, 
        image_url, 
        category, 
        is_featured,
        display_order,
        created_at,
        'gallery' as source
      FROM gallery
      ORDER BY display_order ASC, created_at DESC
    `;

    const residencyImages = await sql`
      SELECT 
        id,
        title as title,
        description,
        image_url,
        location as category,
        false as is_featured,
        0 as display_order,
        created_at,
        'residency' as source
      FROM residencies
      WHERE image_url IS NOT NULL
      ORDER BY created_at DESC
    `;

    const allImages = [...galleryImages, ...residencyImages];

    return Response.json({ images: allImages });
  } catch (error) {
    console.error("Error fetching images:", error);
    return Response.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

// Upload new image
export async function POST(request) {
  try {
    const body = await request.json();

    // Check if this is a bulk upload (array of images)
    if (Array.isArray(body)) {
      const results = [];

      for (const imageData of body) {
        const {
          imageUrl,
          title,
          description,
          category,
          isFeatured,
          source,
          residencyId,
          roomName,
        } = imageData;

        try {
          // Images are already uploaded, just use the URL directly
          const finalImageUrl = imageUrl;

          if (source === "gallery") {
            const result = await sql`
              INSERT INTO gallery (title, description, image_url, category, is_featured, display_order)
              VALUES (
                ${title || "Untitled"},
                ${description || ""},
                ${finalImageUrl},
                ${category || "general"},
                ${isFeatured || false},
                0
              )
              RETURNING *
            `;
            results.push({ success: true, image: result[0], title });
          } else if (source === "residency") {
            // Match by room name if provided (Ubuntu, Muntu, Bantu)
            let updateResult;
            if (roomName) {
              updateResult = await sql`
                UPDATE residencies
                SET image_url = ${finalImageUrl}
                WHERE LOWER(title) LIKE LOWER(${"%" + roomName + "%"})
                RETURNING *
              `;
            } else if (residencyId) {
              updateResult = await sql`
                UPDATE residencies
                SET image_url = ${finalImageUrl}
                WHERE id = ${residencyId}
                RETURNING *
              `;
            }

            if (updateResult && updateResult.length > 0) {
              results.push({
                success: true,
                image: updateResult[0],
                title,
                roomName,
              });
            } else {
              results.push({
                success: false,
                error: `Room not found: ${roomName || residencyId}`,
                title,
                roomName,
              });
            }
          }
        } catch (error) {
          console.error(`Error uploading image ${title}:`, error);
          results.push({ success: false, error: error.message, title });
        }
      }

      return Response.json({
        images: results.filter((r) => r.success).map((r) => r.image),
        results,
        total: body.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      });
    }

    // Single image upload (original logic)
    const {
      imageUrl,
      title,
      description,
      category,
      isFeatured,
      source,
      residencyId,
      roomName,
    } = body;

    // For single uploads, images are already uploaded, use URL directly
    const finalImageUrl = imageUrl;

    if (source === "gallery") {
      // Add to gallery
      const result = await sql`
        INSERT INTO gallery (title, description, image_url, category, is_featured, display_order)
        VALUES (
          ${title || "Untitled"},
          ${description || ""},
          ${finalImageUrl},
          ${category || "general"},
          ${isFeatured || false},
          0
        )
        RETURNING *
      `;
      return Response.json({ image: result[0] });
    } else if (source === "residency") {
      // Match by room name if provided
      let updateResult;
      if (roomName) {
        updateResult = await sql`
          UPDATE residencies
          SET image_url = ${finalImageUrl}
          WHERE LOWER(title) LIKE LOWER(${"%" + roomName + "%"})
          RETURNING *
        `;
      } else if (residencyId) {
        updateResult = await sql`
          UPDATE residencies
          SET image_url = ${finalImageUrl}
          WHERE id = ${residencyId}
          RETURNING *
        `;
      }

      if (updateResult && updateResult.length > 0) {
        return Response.json({ image: updateResult[0] });
      } else {
        return Response.json(
          { error: `Room not found: ${roomName || residencyId}` },
          { status: 404 },
        );
      }
    }

    return Response.json({ error: "Invalid source" }, { status: 400 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return Response.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

// Update image
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      source,
      title,
      description,
      category,
      isFeatured,
      displayOrder,
    } = body;

    if (source === "gallery") {
      const result = await sql`
        UPDATE gallery
        SET 
          title = ${title},
          description = ${description},
          category = ${category},
          is_featured = ${isFeatured},
          display_order = ${displayOrder || 0}
        WHERE id = ${id}
        RETURNING *
      `;
      return Response.json({ image: result[0] });
    } else if (source === "residency") {
      const result = await sql`
        UPDATE residencies
        SET 
          title = ${title},
          description = ${description},
          location = ${category}
        WHERE id = ${id}
        RETURNING *
      `;
      return Response.json({ image: result[0] });
    }

    return Response.json({ error: "Invalid source" }, { status: 400 });
  } catch (error) {
    console.error("Error updating image:", error);
    return Response.json({ error: "Failed to update image" }, { status: 500 });
  }
}

// Delete image
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const source = searchParams.get("source");

    if (source === "gallery") {
      await sql`DELETE FROM gallery WHERE id = ${id}`;
      return Response.json({ success: true });
    } else if (source === "residency") {
      // Don't delete residency, just clear the image
      await sql`UPDATE residencies SET image_url = NULL WHERE id = ${id}`;
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid source" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting image:", error);
    return Response.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
