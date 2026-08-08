import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Coffee, Package, Users, Tag } from 'lucide-react';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Coffee },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
];

export default function AdminLayout({ children, title }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <aside className="lg:w-56 lg:shrink-0">
        <div className="card sticky top-24 p-3">
          <p className="px-3 py-2 font-display text-sm font-bold uppercase tracking-wide text-coffee-mocha">
            Admin Panel
          </p>
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-coffee-mocha text-white'
                      : 'hover:bg-coffee-cream dark:hover:bg-coffee-bean/20'
                  }`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex-1">
        <h1 className="section-title mb-6">{title}</h1>
        {children}
      </div>
    </div>
  );
}
