import { UsersTable } from "./UsersTable";

export function UsersTab({
  usersData,
  loadingUsers,
  onEditUser,
  onDeleteUser,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
      </div>

      {loadingUsers ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        </div>
      ) : (
        <UsersTable
          users={usersData?.users || []}
          onEdit={onEditUser}
          onDelete={onDeleteUser}
        />
      )}
    </div>
  );
}
