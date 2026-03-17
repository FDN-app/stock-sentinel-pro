import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useProfiles } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

const Users = () => {
  const [open, setOpen] = useState(false);
  const { data: profiles, isLoading: loadingProfiles, refetch } = useProfiles();

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'staff'>('staff');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulated network delay
    await new Promise(r => setTimeout(r, 1000));

    const newUser = {
      id: `local-${Date.now()}`,
      full_name: newName,
      email: newEmail,
      role: newRole,
      created_at: new Date().toISOString()
    };

    // Optimistic update to React Query cache to reflect immediately across the app
    queryClient.setQueryData(['profiles'], (old: any) => {
      return [newUser, ...(old || [])];
    });

    toast.success(`Usuario ${newName} agregado a la tabla.`);
    toast.info('Nota: La creación real en Supabase Auth requiere una Edge Function. Este es un mock visual.', { duration: 5000 });

    setOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('staff');
    setIsSaving(false);
  };

  const safeProfiles = profiles || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestión de accesos al sistema</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Agregar Usuario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Usuario</DialogTitle></DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Nombre</Label><Input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre completo" /></div>
              <div className="space-y-2"><Label>Email</Label><Input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@ejemplo.com" /></div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select required value={newRole} onValueChange={(v: 'admin' | 'staff') => setNewRole(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Contraseña</Label><Input required minLength={6} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••" /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Crear Usuario
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              {['', 'Nombre', 'Email', 'Rol', 'Estado', 'Fecha Alta', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loadingProfiles ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
            ) : safeProfiles.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No hay usuarios registrados.</td></tr>
            ) : safeProfiles.map((u, idx) => (
              <tr key={u.id} className={cn('border-t border-border', idx % 2 === 0 ? 'bg-card' : 'bg-muted/30')}>
                <td className="px-4 py-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-foreground">
                      {u.full_name ? u.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 font-medium text-foreground">{u.full_name || 'Sin nombre'}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-2.5"><Badge variant={u.role === 'admin' ? "default" : "secondary"} className="text-[10px] uppercase">{u.role}</Badge></td>
                <td className="px-4 py-2.5">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success')}>Activo</span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.created_at ? format(new Date(u.created_at), 'dd/MM/yyyy') : '-'}</td>
                <td className="px-4 py-2.5"><Button variant="ghost" size="sm" className="text-xs">Editar</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
