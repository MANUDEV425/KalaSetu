import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wrap any route element with this to require login.
 * Optionally pass requireRole="artisan" or "customer" to restrict further.
 *
 * Usage: <Route path="/dashboard" element={<ProtectedRoute requireRole="artisan"><Dashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, requireRole }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && profile?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
