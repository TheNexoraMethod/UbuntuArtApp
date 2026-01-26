import { ImageGrid } from "./ImageGrid";

export function ImagesTab({
  imagesData,
  loadingImages,
  onImageUpload,
  onBulkUpload,
  onEditImage,
  onDeleteImage,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">All Images</h2>
        <div className="flex gap-3">
          <button
            onClick={() => document.getElementById("bulk-upload").click()}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Bulk Upload
          </button>
          <button
            onClick={() => document.getElementById("image-upload").click()}
            className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
          >
            Upload New Image
          </button>
        </div>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
        />
        <input
          id="bulk-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={onBulkUpload}
          className="hidden"
        />
      </div>

      {loadingImages ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        </div>
      ) : (
        <ImageGrid
          images={imagesData?.images || []}
          onEdit={onEditImage}
          onDelete={onDeleteImage}
        />
      )}
    </div>
  );
}
