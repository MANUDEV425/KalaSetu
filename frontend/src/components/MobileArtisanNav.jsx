import { NavLink } from 'react-router-dom';

const navigationItems = [
  {
    name: 'Home',
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
    name: 'Profile',
    path: '/profile',
    icon: '👤',
  },
];

export default function MobileArtisanNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">

      <div className="grid grid-cols-4">

        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 text-xs ${
                isActive
                  ? 'text-kala-700 font-semibold'
                  : 'text-gray-500'
              }`
            }
          >
            <span className="text-lg">
              {item.icon}
            </span>

            <span className="mt-0.5">
              {item.name}
            </span>
          </NavLink>
        ))}

      </div>

    </nav>
  );
}