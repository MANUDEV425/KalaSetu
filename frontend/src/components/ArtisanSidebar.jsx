import { NavLink } from 'react-router-dom';

const navigationItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: '🏠',
  },
  {
    name: 'Products',
    path: '/products',
    icon: '📦',
  },
  {
    name: 'Orders',
    path: '/orders',
    icon: '🛍️',
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: '📊',
  },
  {
    name: 'AI Marketing',
    path: '/ai-marketing',
    icon: '📣',
  },
  {
    name: 'AI Business Advisor',
    path: '/ai-business-advisor',
    icon: '✨',
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: '👤',
  },
];

export default function ArtisanSidebar() {
  return (
    <aside className="hidden md:block w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-3 sticky top-6">

        <p className="px-3 pt-2 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Artisan Menu
        </p>

        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-kala-100 text-kala-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-kala-700'
                }`
              }
            >
              <span className="text-lg w-6 text-center">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

      </div>
    </aside>
  );
}