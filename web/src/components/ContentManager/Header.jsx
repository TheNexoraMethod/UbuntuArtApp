export function Header() {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Content Manager
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage all images and users in your app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
