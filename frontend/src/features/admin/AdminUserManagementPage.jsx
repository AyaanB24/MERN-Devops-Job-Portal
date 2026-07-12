import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchUsersList,
  removeUser,
  clearDeleteState,
  selectUsers,
  selectUsersStatus,
  selectUsersError,
  selectUserPagination,
  selectDeleteStatus,
} from './adminSlice';

// ─────────────────────────────────────────────────────────────────────────────
// AdminUserManagementPage — View and remove users
// ─────────────────────────────────────────────────────────────────────────────

const AdminUserManagementPage = () => {
  const dispatch = useDispatch();
  
  const users = useSelector(selectUsers);
  const status = useSelector(selectUsersStatus);
  const error = useSelector(selectUsersError);
  const { page, totalPages } = useSelector(selectUserPagination);
  const deleteStatus = useSelector(selectDeleteStatus);

  useEffect(() => {
    dispatch(fetchUsersList({ page: 1, limit: 20 }));
    return () => { dispatch(clearDeleteState()); };
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const result = await dispatch(removeUser(id));
      if (removeUser.fulfilled.match(result)) {
        toast.success('User deleted successfully');
      } else {
        toast.error(result.payload || 'Failed to delete user');
      }
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchUsersList({ page: newPage, limit: 20 }));
  };

  const isLoading = status === 'loading';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage all registered users.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl w-full" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'recruiter' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          disabled={deleteStatus === 'loading'}
                          onClick={() => handleDelete(u._id)}
                          className="text-red-500 hover:text-red-700 font-semibold text-xs disabled:opacity-50"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementPage;
