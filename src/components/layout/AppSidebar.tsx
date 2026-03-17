import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Package, Upload, FileText, ClipboardList,
  History, Users, Settings, LogOut, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, adminOnly: false },
  { label: 'Gestión de Stock', path: '/gestion', icon: Package, adminOnly: true },
  { label: 'Carga de Stock', path: '/carga', icon: Upload, adminOnly: false },
  { label: 'Fichas Técnicas', path: '/fichas', icon: FileText, adminOnly: false },
  { label: 'Requisiciones', path: '/requisiciones', icon: ClipboardList, adminOnly: false },
  { label: 'Histórico', path: '/historico', icon: History, adminOnly: false },
  { label: 'Usuarios', path: '/usuarios', icon: Users, adminOnly: true },
  { label: 'Configuración', path: '/configuracion', icon: Settings, adminOnly: true },
];

const AppSidebar = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border relative z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-sidebar-border">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg flex items-center justify-center flex-shrink-0 animate-float" style={{ animationDuration: '4s' }}>
          <Package className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-lg tracking-tight text-sidebar-foreground">Stock Sentinel</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {filteredItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 flex-shrink-0 transition-transform duration-300', !active && 'group-hover:scale-110')} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-6 border-t border-sidebar-border bg-sidebar/50 backdrop-blur-sm mt-auto">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-sm flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-sidebar-primary-foreground">
              {profile?.full_name ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-sidebar-foreground">{profile?.full_name || user?.email || 'Usuario'}</p>
              <p className="text-xs truncate text-sidebar-foreground/60">{profile?.role || 'Staff'}</p>
            </div>
          )}
          <button onClick={logout} className="p-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sidebar-foreground/60" title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/50" />
          <div className="relative w-64 h-full" onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 transition-all duration-200', collapsed ? 'w-16' : 'w-60')}>
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-card border shadow-card flex items-center justify-center hover:shadow-card-hover transition-shadow"
        >
          <span className="text-xs text-muted-foreground">{collapsed ? '→' : '←'}</span>
        </button>
      </aside>
    </>
  );
};

export default AppSidebar;
