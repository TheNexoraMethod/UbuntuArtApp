// apps/mobile/src/lib/roomImages.js
import { supabase } from "./supabase";

export const ROOMS_BUCKET = "rooms";

export function buildRoomImageUrl(path) {
  if (!path) return null;
  const cleanPath = path.trim();
  const { data, error } = supabase.storage
    .from("rooms")
    .getPublicUrl(cleanPath);
  if (error) {
    console.error("Error getting room image URL", error, "path:", cleanPath);
    return null;
  }
  console.log("ROOM PUBLIC URL:", data.publicUrl, "for path:", cleanPath);
  return data.publicUrl;
}

export async function attachPrimaryImageToRooms(rooms) {
  if (!rooms || rooms.length === 0) return [];

  console.log("📸 Fetching images for", rooms.length, "rooms");

  const { data: images, error } = await supabase
    .from("room_images")
    .select("*")
    .in(
      "room_id",
      rooms.map((r) => r.id),
    );

  if (error) {
    console.error("❌ Error fetching room_images:", error);
    // Attach no image if error
    return rooms.map((room) => ({
      ...room,
      primary_image_path: undefined,
      primary_image_url: undefined,
    }));
  }

  console.log("✅ Fetched", images?.length || 0, "room images from database");

  return rooms.map((room) => {
    console.log("ROOM OBJECT:", room);

    const roomImages = images.filter((img) => img.room_id === room.id);
    console.log("IMAGES FOR ROOM:", roomImages);
    console.log(
      `  Room "${room.title}" (ID: ${room.id}) has ${roomImages.length} images`,
    );

    let chosenImage = roomImages.find((img) => img.is_primary);
    if (!chosenImage && roomImages.length > 0) chosenImage = roomImages[0];

    console.log("CHOSEN IMAGE OBJECT:", chosenImage);

    if (chosenImage) {
      console.log(`    ➡️ Using image URL: "${chosenImage.image_url}"`);
    } else {
      console.log(`    ⚠️ No images found for room "${room.title}"`);
    }

    const imageUrl = chosenImage?.image_url ?? null;
    const roomWithImage = {
      ...room,
      primary_image_path: imageUrl,
      primary_image_url: imageUrl,
    };

    console.log("FINAL ROOM IMAGE URL:", roomWithImage.primary_image_url);

    return roomWithImage;
  });
}
