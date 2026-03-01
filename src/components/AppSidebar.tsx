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
  const { user, logout, isAdmin } = useAuth();
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
    <div className="flex flex-col h-full" style={{ background: 'hsl(217 33% 17%)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b" style={{ borderColor: 'hsl(215 25% 27%)' }}>
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Package className="h-4 w-4" style={{ color: 'white' }} />
        </div>
        {!collapsed && <span className="font-bold text-base" style={{ color: 'hsl(210 40% 98%)' }}>Stock Control</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-primary'
                  : 'hover:bg-[hsl(215,25%,27%)]'
              )}
              style={{ color: 'hsl(210 40% 98%)' }}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'hsl(215 25% 27%)' }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold" style={{ color: 'white' }}>{user?.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'hsl(210 40% 98%)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'hsl(215 20% 65%)' }}>{user?.role}</p>
            </div>
          )}
          <button onClick={logout} className="p-1.5 rounded-md hover:bg-[hsl(215,25%,27%)] transition-colors" title="Cerrar sesión">
            <LogOut className="h-4 w-4" style={{ color: 'hsl(215 20% 65%)' }} />
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
