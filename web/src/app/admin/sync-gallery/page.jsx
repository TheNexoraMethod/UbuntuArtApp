"use client";

import { useState } from "react";
import { RefreshCw, Image, CheckCircle, AlertCircle } from "lucide-react";

export default function SyncGalleryPage() {
  const [preview, setPreview] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/sync-gallery");
      if (!response.ok) throw new Error("Failed to load preview");
      const data = await response.json();
      setPreview(data);
    } catch (error) {
      console.error("Error loading preview:", error);
      alert("Failed to load preview: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const syncGallery = async () => {
    if (
      !confirm("Sync all images from Firebase Storage to Firestore gallery?")
    ) {
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch("/api/admin/sync-gallery", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to sync gallery");
      const data = await response.json();
      setSyncResult(data);
      // Reload preview after sync
      await loadPreview();
    } catch (error) {
      console.error("Error syncing gallery:", error);
      alert("Failed to sync gallery: " + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F4] to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Image size={40} />
            <h1 className="text-4xl font-bold">Sync Gallery Images</h1>
          </div>
          <p className="text-xl text-green-50 max-w-3xl">
            Automatically sync images from Firebase Storage (gallery/ folder) to
            Firestore
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            How this works:
          </h2>
          <ul className="text-blue-800 space-y-2 list-disc list-inside">
            <li>
              This tool scans your Firebase Storage{" "}
              <code className="bg-blue-100 px-1 rounded">gallery/</code> folder
            </li>
            <li>It finds all image files (.jpg, .png, .gif, .webp)</li>
            <li>
              Creates Firestore documents in the{" "}
              <code className="bg-blue-100 px-1 rounded">gallery</code>{" "}
              collection
            </li>
            <li>Images will then appear in your mobile app's Gallery tab</li>
            <li>Already synced images will be skipped (no duplicates)</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={loadPreview}
            disabled={loading}
            className="px-6 py-3 bg-white border-2 border-[#22C55E] text-[#22C55E] font-semibold rounded-lg hover:bg-green-50 transition disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Preview Images"}
          </button>

          <button
            onClick={syncGallery}
            disabled={syncing || !preview}
            className="px-6 py-3 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={20} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync to Firestore"}
          </button>
        </div>

        {/* Sync Result */}
        {syncResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle size={24} className="text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Sync Complete!
                </h3>
                <div className="text-green-800 space-y-1">
                  <p>
                    ✓ Total images processed:{" "}
                    <strong>{syncResult.synced}</strong>
                  </p>
                  <p>
                    ✓ New images added: <strong>{syncResult.new}</strong>
                  </p>
                  <p>
                    ✓ Already existed: <strong>{syncResult.existing}</strong>
                  </p>
                  {syncResult.errors > 0 && (
                    <p className="text-red-600">
                      ⚠ Errors: <strong>{syncResult.errors}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Results */}
        {preview && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Preview: {preview.total} images found
            </h2>

            <div className="mb-6 grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">
                  {preview.newImages}
                </div>
                <div className="text-sm text-green-800">New Images</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">
                  {preview.alreadySynced}
                </div>
                <div className="text-sm text-blue-800">Already Synced</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-gray-600">
                  {preview.total}
                </div>
                <div className="text-sm text-gray-800">Total</div>
              </div>
            </div>

            {/* Image List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {preview.preview.map((image, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    image.alreadyInFirestore
                      ? "bg-gray-50 border-gray-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {image.filename}
                    </h3>
                    <p className="text-sm text-gray-500">{image.path}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Size: {(parseInt(image.size) / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  {image.alreadyInFirestore ? (
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <CheckCircle size={16} />
                      Synced
                    </span>
                  ) : (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <AlertCircle size={16} />
                      New
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!preview && !loading && (
          <div className="text-center py-12">
            <Image size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Click "Preview Images" to start
            </h3>
            <p className="text-gray-500">
              We'll scan your Firebase Storage gallery folder
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
