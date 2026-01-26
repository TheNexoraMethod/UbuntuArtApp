import { RoomCard } from "./RoomCard";
import { useState } from "react";

export function RoomsTab({ roomsData, loadingRooms, onUpdateRoom }) {
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const handleOpenGalleryPicker = async (roomId) => {
    setSelectedRoomId(roomId);
    setShowGalleryPicker(true);
    setLoadingGallery(true);

    try {
      const response = await fetch("/api/gallery");
      if (!response.ok) throw new Error("Failed to fetch gallery");
      const data = await response.json();
      setGalleryImages(data.images || []);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      alert("Failed to load gallery images");
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleAddImageFromGallery = async (imageUrl) => {
    try {
      const response = await fetch("/api/admin/room-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residency_id: selectedRoomId,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to add image");

      alert("Image added successfully!");
    } catch (error) {
      console.error("Error adding image:", error);
      alert("Failed to add image");
    }
  };

  if (loadingRooms) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="text-gray-500">Loading rooms...</div>
      </div>
    );
  }

  if (!roomsData?.rooms || roomsData.rooms.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-500 mb-4">No rooms found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Room Images
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Upload and manage images for each room. These images will appear on
            the homepage and booking pages.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomsData.rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onUpdateRoom={onUpdateRoom}
                onOpenGalleryPicker={handleOpenGalleryPicker}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Picker Modal */}
      {showGalleryPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Select Images from Gallery
              </h3>
              <button
                onClick={() => setShowGalleryPicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              {loadingGallery ? (
                <div className="text-center py-12 text-gray-500">
                  Loading gallery...
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No images in gallery
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative group cursor-pointer"
                      onClick={() => handleAddImageFromGallery(image.image_url)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.title || "Gallery image"}
                        className="w-full h-32 object-cover rounded border-2 border-gray-200 hover:border-blue-500 transition"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                        <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition">
                          Add to Room
                        </span>
                      </div>
                      {image.title && (
                        <div className="mt-1 text-xs text-gray-600 truncate">
                          {image.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowGalleryPicker(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
