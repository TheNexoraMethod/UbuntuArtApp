export function BulkUploadModal({
  bulkUploadModal,
  roomsData,
  onClose,
  onSave,
  isPending,
  progress,
}) {
  if (!bulkUploadModal) return null;

  const rooms = roomsData?.rooms || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            Bulk Upload Images ({bulkUploadModal.files?.length || 0} files)
          </h3>

          {bulkUploadModal.uploadedUrls?.length > 0 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                onSave(formData);
              }}
            >
              {/* Debug info - remove after testing */}
              {!roomsData && (
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  ⚠️ Rooms data is loading... ({rooms.length} rooms available)
                </div>
              )}

              <div className="max-h-[60vh] overflow-y-auto space-y-4 mb-6">
                {bulkUploadModal.uploadedUrls.map((uploaded, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 flex gap-4"
                  >
                    <img
                      src={uploaded.url}
                      alt={uploaded.filename}
                      className="w-32 h-32 object-cover rounded"
                    />
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          name={`title-${uploaded.filename}`}
                          defaultValue={uploaded.filename.replace(
                            /\.[^/.]+$/,
                            "",
                          )}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assign to Room (Optional)
                          </label>
                          <select
                            name={`room-${uploaded.filename}`}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          >
                            <option value="">Gallery Only</option>
                            {rooms.length === 0 ? (
                              <option disabled>No rooms available</option>
                            ) : (
                              rooms.map((room) => (
                                <option key={room.id} value={room.title}>
                                  {room.title}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            name={`category-${uploaded.filename}`}
                            placeholder="e.g., pottery, room"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {progress && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-2">
                    {progress.successful === progress.total
                      ? "Upload Complete!"
                      : "Upload Progress"}
                  </div>
                  <div className="text-sm text-blue-700">
                    Successfully uploaded: {progress.successful} /{" "}
                    {progress.total}
                    {progress.failed > 0 && (
                      <span className="text-red-600 ml-2">
                        ({progress.failed} failed)
                      </span>
                    )}
                  </div>
                  {progress.results
                    ?.filter((r) => !r.success)
                    .map((result, i) => (
                      <div key={i} className="text-xs text-red-600 mt-1">
                        ✗ {result.title}: {result.error}
                      </div>
                    ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                  disabled={isPending}
                >
                  {progress?.successful === progress?.total
                    ? "Close"
                    : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={
                    isPending || progress?.successful === progress?.total
                  }
                  className="flex-1 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
                >
                  {isPending
                    ? "Uploading..."
                    : progress?.successful === progress?.total
                      ? "Uploaded!"
                      : `Upload ${bulkUploadModal.uploadedUrls.length} Images`}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mb-4"></div>
              <p className="text-gray-600">
                Processing {bulkUploadModal.files?.length} images...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
