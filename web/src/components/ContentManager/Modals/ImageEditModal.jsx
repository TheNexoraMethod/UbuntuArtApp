export function ImageEditModal({ imageModal, onClose, onSave, isPending }) {
  if (!imageModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSave({
      id: imageModal.id,
      source: imageModal.source,
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      isFeatured: formData.get("isFeatured") === "on",
      displayOrder: parseInt(formData.get("displayOrder") || "0"),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Image</h3>
          <form onSubmit={handleSubmit}>
            <img
              src={imageModal.image_url}
              alt={imageModal.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={imageModal.title}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={imageModal.description}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  defaultValue={imageModal.category}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {imageModal.source === "gallery" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      defaultValue={imageModal.display_order}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      id="editIsFeatured"
                      defaultChecked={imageModal.is_featured}
                      className="h-4 w-4 text-green-700 rounded"
                    />
                    <label
                      htmlFor="editIsFeatured"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Featured image
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
