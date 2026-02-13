import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';

const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const ownerMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/medicines', icon: Pill, label: 'Medicines' },
    { path: '/dashboard/add-medicine', icon: PlusCircle, label: 'Add Medicine' },
    { path: '/dashboard/suppliers', icon: Users, label: 'Suppliers' },
    { path: '/dashboard/sales', icon: ShoppingCart, label: 'Sales' },
    { path: '/dashboard/create-bill', icon: FileText, label: 'Create Bill' },
    { path: '/dashboard/reports', icon: TrendingUp, label: 'Reports' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const staffMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/create-bill', icon: FileText, label: 'Create Bill' },
    { path: '/dashboard/sales', icon: ShoppingCart, label: 'My Sales' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const menuItems = user?.role === 'owner' ? ownerMenuItems : staffMenuItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-blue-500">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">GK</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>G.K. Medicos</h2>
                <p className="text-blue-200 text-xs capitalize">{user?.role || 'User'} Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-blue-500'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  data-testid={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-blue-500">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-white hover:bg-blue-500 rounded-lg transition-colors"
              data-testid="logout-button"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              className="lg:hidden text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="mobile-sidebar-toggle"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <h1 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Welcome, {user?.name || 'User'}
            </h1>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;