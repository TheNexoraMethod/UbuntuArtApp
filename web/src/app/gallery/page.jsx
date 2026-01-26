"use client";

import { useState, useEffect } from "react";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchImages();
  }, [filter]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const url =
        filter === "all" ? "/api/gallery" : `/api/gallery?category=${filter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "all", label: "All" },
    { value: "rooms", label: "Rooms" },
    { value: "common_spaces", label: "Common Spaces" },
    { value: "exterior", label: "Exterior" },
    { value: "art_studios", label: "Art Studios" },
    { value: "artwork", label: "Resident Artwork" },
    { value: "events", label: "Events" },
  ];

  const goToPrevious = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") goToPrevious(e);
    if (e.key === "ArrowRight") goToNext(e);
    if (e.key === "Escape") setSelectedIndex(null);
  };

  useEffect(() => {
    if (selectedIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedIndex, images]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F4] to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Camera size={40} />
            <h1 className="text-5xl font-bold">Gallery</h1>
          </div>
          <p className="text-xl text-green-50 max-w-2xl">
            Explore Ubuntu Art Village through images - our rooms, studios,
            creative spaces, and the incredible artwork created by our resident
            artists
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setFilter(category.value)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  filter === category.value
                    ? "bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <Camera size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No Images Yet
            </h3>
            <p className="text-gray-500">
              Images will be added to the gallery soon
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className="group relative aspect-square overflow-hidden rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <img
                  src={image.image_url}
                  alt={image.title || "Gallery image"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {image.title && (
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {image.title}
                      </h3>
                    )}
                    {image.description && (
                      <p className="text-white/90 text-sm line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>
                </div>
                {image.is_featured && (
                  <div className="absolute top-4 right-4 bg-[#F59E0B] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal with Carousel */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X size={32} />
          </button>

          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all z-10"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all z-10"
          >
            <ChevronRight size={32} />
          </button>

          <div className="max-w-6xl max-h-[90vh] w-full">
            <img
              src={images[selectedIndex].image_url}
              alt={images[selectedIndex].title || "Gallery image"}
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {(images[selectedIndex].title ||
              images[selectedIndex].description) && (
              <div className="bg-white/10 backdrop-blur-md text-white p-6 mt-4 rounded-lg">
                {images[selectedIndex].title && (
                  <h2 className="text-2xl font-bold mb-2">
                    {images[selectedIndex].title}
                  </h2>
                )}
                {images[selectedIndex].description && (
                  <p className="text-gray-200">
                    {images[selectedIndex].description}
                  </p>
                )}
                <p className="text-gray-400 text-sm mt-2">
                  {selectedIndex + 1} / {images.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
