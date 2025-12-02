import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Package, FileBarChart, LogOut, Store, Moon, Sun, Layers, Menu, X, Users as UsersIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

export default function Layout() {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ShoppingCart, label: 'Punto de Venta', path: '/pos' },
        { icon: Package, label: 'Inventario', path: '/inventory' },
        { icon: Layers, label: 'Categorías', path: '/categories', role: 'admin' },
        { icon: UsersIcon, label: 'Usuarios', path: '/users', role: 'admin' },
        { icon: FileBarChart, label: 'Reportes', path: '/reports', role: 'admin' },
    ];

    const SidebarContent = () => (
        <>
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-border dark:border-border-dark shrink-0">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Store className="w-6 h-6 text-primary" />
                </div>
                <span className="ml-3 font-semibold text-text-main dark:text-gray-100 lg:block">Mi Tienda</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    if (item.role && user?.role !== item.role) return null;

                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-md transition-all duration-200 group',
                                isActive
                                    ? 'bg-primary/5 text-primary font-medium'
                                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-main dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                            )}
                        >
                            <item.icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-text-muted group-hover:text-text-main dark:text-gray-500 dark:group-hover:text-gray-300")} />
                            <span className="block">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border dark:border-border-dark space-y-2 shrink-0">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-start gap-3 px-3 py-3 lg:py-2 text-text-secondary hover:bg-gray-50 rounded-md transition-colors dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span className="block text-sm">Tema</span>
                </button>

                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-text-secondary dark:bg-gray-700 dark:text-gray-300">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-text-main truncate dark:text-gray-200">{user?.username}</p>
                        <p className="text-xs text-text-muted capitalize">{user?.role === 'admin' ? 'Admin' : 'Vendedor'}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-start gap-3 px-3 py-3 lg:py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors text-sm font-medium dark:hover:bg-red-900/20"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="block">Salir</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-background dark:bg-background-dark transition-colors duration-300 overflow-hidden">
            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar (Desktop & Mobile Drawer) */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static dark:bg-surface-dark dark:border-border-dark",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="absolute top-4 right-4 lg:hidden">
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-text-secondary">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-surface/80 backdrop-blur-sm border-b border-border sticky top-0 z-30 flex items-center px-4 lg:px-8 justify-between shrink-0 dark:bg-surface-dark/80 dark:border-border-dark">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-text-main hover:bg-gray-100 rounded-md dark:text-gray-100 dark:hover:bg-gray-800"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-text-main capitalize dark:text-gray-100 truncate">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
