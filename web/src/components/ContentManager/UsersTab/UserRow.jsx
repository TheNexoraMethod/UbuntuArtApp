export function UserRow({ user, onEdit, onDelete }) {
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this user?")) {
      onDelete(user.id);
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-green-700 flex items-center justify-center text-white font-semibold">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.name || "No name"}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs rounded ${
            user.user_role === "admin"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.user_role || "user"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {user.membership_tier || "None"}
        </div>
        <div
          className={`text-xs ${
            user.membership_status === "active"
              ? "text-green-600"
              : "text-gray-500"
          }`}
        >
          {user.membership_status || "inactive"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>{user.total_bookings} bookings</div>
        <div>{user.total_applications} applications</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onEdit(user)}
          className="text-green-700 hover:text-green-900 mr-4"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
