export function TabNavigation({
  activeTab,
  setActiveTab,
  roomsCount,
  imagesCount,
  usersCount,
}) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex gap-8">
        <button
          onClick={() => setActiveTab("rooms")}
          className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "rooms"
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Room Images ({roomsCount || 0})
        </button>
        <button
          onClick={() => setActiveTab("images")}
          className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "images"
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Gallery Images ({imagesCount || 0})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "users"
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Users ({usersCount || 0})
        </button>
      </nav>
    </div>
  );
}
