export function ImageCard({ image, onEdit, onDelete }) {
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this image?")) {
      onDelete({ id: image.id, source: image.source });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <img
        src={image.image_url}
        alt={image.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex-1">
            {image.title || "Untitled"}
          </h3>
          <span
            className={`px-2 py-1 text-xs rounded ${
              image.source === "gallery"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {image.source}
          </span>
        </div>
        {image.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {image.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          {image.category && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              {image.category}
            </span>
          )}
          {image.is_featured && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(image)}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
