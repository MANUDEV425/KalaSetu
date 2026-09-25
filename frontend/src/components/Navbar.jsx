import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  const isArtisan =
    user && profile?.role === 'artisan';

  return (
    <nav className="bg-kala-600 text-white px-4 sm:px-6 py-4 shadow-sm">

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to={isArtisan ? '/dashboard' : '/'}
          className="text-xl font-semibold tracking-wide shrink-0"
        >
          KalaSetu
        </Link>


        {/* Public navigation */}
        {!user && (
          <div className="flex items-center gap-2 sm:gap-3">

            <Link
              to="/"
              className="hidden sm:block px-3 py-2 text-sm hover:bg-kala-700 rounded-lg transition"
            >
              Marketplace
            </Link>

            <Link
              to="/login"
              className="px-3 py-2 text-sm hover:bg-kala-700 rounded-lg transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="px-3 py-2 text-sm bg-white text-kala-700 rounded-lg hover:bg-gray-100 transition"
            >
              Join as Artisan
            </Link>

          </div>
        )}


        {/* Artisan navigation */}
        {user && isArtisan && (
          <div className="flex items-center gap-2 sm:gap-3">

            <Link
              to="/"
              className="hidden sm:block px-3 py-2 text-sm hover:bg-kala-700 rounded-lg transition"
            >
              Marketplace
            </Link>

            <Link
              to="/dashboard"
              className="hidden sm:block px-3 py-2 text-sm hover:bg-kala-700 rounded-lg transition"
            >
              Dashboard
            </Link>


            {/* Profile */}
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full overflow-hidden bg-kala-100 flex items-center justify-center shrink-0"
              title="Profile"
            >

              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-kala-700">
                  👤
                </span>
              )}

            </Link>


            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 text-sm bg-kala-700 hover:bg-kala-800 rounded-lg transition"
            >
              Logout
            </button>

          </div>
        )}

      </div>

    </nav>
  );
}