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
import { ROLE_COLORS } from '../../config/constants';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

// ─────────────────────────────────────────────────────────────────────────────
// AdminUserManagementPage — View and remove users
// Wrapped by DashboardLayout (Sidebar + TopHeader).
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage all registered users.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl w-full" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <span className="font-medium text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROLE_COLORS[u.role] || ROLE_COLORS.candidate}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <Button
                          variant="danger"
                          size="sm"
                          loading={deleteStatus === 'loading'}
                          onClick={() => handleDelete(u._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementPage;
