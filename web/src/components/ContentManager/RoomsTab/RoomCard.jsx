import { useState, useEffect } from "react";
import useUpload from "@/utils/useUpload";

export function RoomCard({ room, onUpdateRoom, onOpenGalleryPicker }) {
  const [upload] = useUpload();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomImages();
  }, [room.id]);

  const fetchRoomImages = async () => {
    try {
      const response = await fetch(
        `/api/admin/room-images?residency_id=${room.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Error fetching room images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await upload({ file });

      // Add image to room_images table
      const response = await fetch("/api/admin/room-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residency_id: room.id,
          image_url: result.url,
          is_primary: images.length === 0, // First image is primary by default
        }),
      });

      if (!response.ok) throw new Error("Failed to add image");

      await fetchRoomImages();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageId) => {
    if (!confirm("Remove this image?")) return;

    try {
      const response = await fetch(`/api/admin/room-images?id=${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove image");
      await fetchRoomImages();
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Failed to remove image");
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      const response = await fetch("/api/admin/room-images", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: imageId,
          is_primary: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to set primary");
      await fetchRoomImages();
    } catch (error) {
      console.error("Error setting primary:", error);
      alert("Failed to set primary image");
    }
  };

  const handleMoveImage = async (imageId, direction) => {
    const currentIndex = images.findIndex((img) => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    try {
      // Update display orders for both images
      const currentImage = images[currentIndex];
      const swapImage = images[newIndex];

      await fetch("/api/admin/room-images", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentImage.id,
          display_order: swapImage.display_order,
        }),
      });

      await fetch("/api/admin/room-images", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: swapImage.id,
          display_order: currentImage.display_order,
        }),
      });

      await fetchRoomImages();
    } catch (error) {
      console.error("Error reordering:", error);
      alert("Failed to reorder images");
    }
  };

  const pricePerNight = room.pricing_config?.price_per_night;
  const primaryImage = images.find((img) => img.is_primary) || images[0];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition">
      {/* Primary Image Preview */}
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : primaryImage ? (
          <>
            <img
              src={primaryImage.image_url}
              alt={room.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Primary
            </div>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
              {images.length} {images.length === 1 ? "image" : "images"}
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">No images</p>
          </div>
        )}
      </div>

      {/* Room Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {room.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {room.description || "No description"}
        </p>

        {pricePerNight && (
          <div className="text-green-600 font-semibold mb-3">
            ${pricePerNight}/night
          </div>
        )}

        {/* All Images Grid */}
        {images.length > 0 && (
          <div className="mb-4 space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="flex items-center gap-2 bg-gray-50 p-2 rounded"
              >
                <img
                  src={image.image_url}
                  alt={`${room.title} ${index + 1}`}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-600 truncate">
                    Image {index + 1}
                  </div>
                  {image.is_primary && (
                    <div className="text-xs text-green-600 font-semibold">
                      Primary
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  {/* Move Up */}
                  {index > 0 && (
                    <button
                      onClick={() => handleMoveImage(image.id, "up")}
                      className="p-1 text-gray-600 hover:text-gray-900"
                      title="Move up"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                  )}
                  {/* Move Down */}
                  {index < images.length - 1 && (
                    <button
                      onClick={() => handleMoveImage(image.id, "down")}
                      className="p-1 text-gray-600 hover:text-gray-900"
                      title="Move down"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                  {/* Set Primary */}
                  {!image.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                      title="Set as primary"
                    >
                      Primary
                    </button>
                  )}
                  {/* Delete */}
                  <button
                    onClick={() => handleRemoveImage(image.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <div
              className={`w-full px-4 py-2 text-center rounded-md cursor-pointer transition text-sm ${
                uploading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {uploading ? "Uploading..." : "+ Upload New Image"}
            </div>
          </label>

          <button
            onClick={() => onOpenGalleryPicker(room.id)}
            className="w-full px-4 py-2 text-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
          >
            + Add from Gallery
          </button>
        </div>
      </div>
    </div>
  );
}
