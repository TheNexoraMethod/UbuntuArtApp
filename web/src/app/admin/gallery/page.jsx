"use client";

import { useState, useEffect } from "react";
import { Camera, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { useUpload } from "@/utils/useUpload";

export default function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const { upload, uploading } = useUpload();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "",
    display_order: 0,
    is_featured: false,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gallery");
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await upload(file);
      setFormData({ ...formData, image_url: uploadedUrl });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image_url) {
      alert("Please upload an image");
      return;
    }

    try {
      const url = editingImage ? "/api/gallery" : "/api/gallery";
      const method = editingImage ? "PUT" : "POST";
      const body = editingImage
        ? { ...formData, id: editingImage.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save image");

      await fetchImages();
      setShowAddModal(false);
      setEditingImage(null);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        category: "",
        display_order: 0,
        is_featured: false,
      });
    } catch (error) {
      console.error("Error saving image:", error);
      alert("Failed to save image");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete image");

      await fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image");
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setFormData({
      title: image.title || "",
      description: image.description || "",
      image_url: image.image_url,
      category: image.category || "",
      display_order: image.display_order || 0,
      is_featured: image.is_featured || false,
    });
    setShowAddModal(true);
  };

  const categories = [
    { value: "", label: "Select category..." },
    { value: "rooms", label: "Rooms" },
    { value: "art_studios", label: "Art Studios" },
    { value: "lounge", label: "Bar & Lounge" },
    { value: "grounds", label: "Grounds" },
    { value: "events", label: "Events" },
    { value: "artwork", label: "Resident Artwork" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera size={32} className="text-[#22C55E]" />
              <h1 className="text-3xl font-bold text-gray-900">
                Gallery Management
              </h1>
            </div>
            <button
              onClick={() => {
                setEditingImage(null);
                setFormData({
                  title: "",
                  description: "",
                  image_url: "",
                  category: "",
                  display_order: 0,
                  is_featured: false,
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Image
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <Camera size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No Images Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start building your gallery by adding images
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add First Image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square">
                  <img
                    src={image.image_url}
                    alt={image.title || "Gallery image"}
                    className="w-full h-full object-cover"
                  />
                  {image.is_featured && (
                    <div className="absolute top-2 right-2 bg-[#F59E0B] text-white px-2 py-1 rounded text-xs font-semibold">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {image.title && (
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {image.title}
                    </h3>
                  )}
                  {image.category && (
                    <p className="text-sm text-gray-500 mb-2 capitalize">
                      {image.category.replace("_", " ")}
                    </p>
                  )}
                  {image.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {image.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(image)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingImage ? "Edit Image" : "Add New Image"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingImage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image *
                </label>
                {formData.image_url ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, image_url: "" })
                      }
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                    <label className="cursor-pointer">
                      <span className="text-[#22C55E] font-semibold hover:text-[#16A34A]">
                        {uploading ? "Uploading..." : "Click to upload"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  placeholder="Enter image title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  placeholder="Enter image description"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Order & Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured
                  </label>
                  <label className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_featured: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-[#22C55E] focus:ring-[#22C55E] rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Mark as featured
                    </span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingImage(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.image_url || uploading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={20} />
                  {editingImage ? "Update Image" : "Add Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
