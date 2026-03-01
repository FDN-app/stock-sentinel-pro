import { useState } from 'react';
import { USER_RECORDS } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Usuarios = () => {
  const [open, setOpen] = useState(false);

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
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Nombre</Label><Input placeholder="Nombre completo" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="email@ejemplo.com" /></div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select><SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                  <SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Staff">Staff</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Contraseña</Label><Input type="password" placeholder="••••••" /></div>
              <Button className="w-full" onClick={() => { toast.success('Usuario creado exitosamente'); setOpen(false); }}>Crear Usuario</Button>
            </div>
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
            {USER_RECORDS.map((u, idx) => (
              <tr key={u.id} className={cn('border-t border-border', idx % 2 === 0 ? 'bg-card' : 'bg-muted/30')}>
                <td className="px-4 py-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-foreground">{u.avatar}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 font-medium text-foreground">{u.nombre}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-2.5"><Badge variant="secondary" className="text-[10px]">{u.rol}</Badge></td>
                <td className="px-4 py-2.5">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold',
                    u.estado === 'Activo' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                  )}>{u.estado}</span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.fechaAlta}</td>
                <td className="px-4 py-2.5"><Button variant="ghost" size="sm" className="text-xs">Editar</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;
