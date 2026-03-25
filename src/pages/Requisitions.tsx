import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, CheckCircle, XCircle, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRequisitions, useUpdateRequisition, useCategories } from '@/hooks/useSupabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const statusStyles: Record<string, string> = {
  Pendiente: 'bg-warning/15 text-warning border-warning/30',
  Aprobado: 'bg-success/15 text-success border-success/30',
  Rechazado: 'bg-destructive/15 text-destructive border-destructive/30',
};

const Requisitions = () => {
  const { isAdmin, user } = useAuth();
  const { data: requisitions, isLoading } = useRequisitions();
  const { data: categories } = useCategories();
  const updateReq = useUpdateRequisition();

  const [localReqs, setLocalReqs] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    item: '', categoria: '', cantidadSolicitada: '', unidad: ''
  });

  useEffect(() => {
    if (requisitions && requisitions.length > 0) {
      const saved = localStorage.getItem('sentinel_reqs');
      if (saved) {
        setLocalReqs(JSON.parse(saved));
      } else {
        setLocalReqs(requisitions);
        localStorage.setItem('sentinel_reqs', JSON.stringify(requisitions));
      }
    }
  }, [requisitions]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic / local fallback
    const updated = localReqs.map(r => r.id === id ? { ...r, estado: newStatus } : r);
    setLocalReqs(updated);
    localStorage.setItem('sentinel_reqs', JSON.stringify(updated));
    toast.success(`Requisición ${newStatus.toLowerCase()}`);

    try {
      await updateReq.mutateAsync({ id, estado: newStatus });
    } catch (e) {
      console.warn('Supabase update failed, used local state', e);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.categoria || !formData.cantidadSolicitada) {
      toast.error('Completá los campos obligatorios');
      return;
    }

    const newReq = {
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      item: formData.item,
      categoria: formData.categoria,
      cantidadSolicitada: parseFloat(formData.cantidadSolicitada) || 1,
      unidad: formData.unidad || 'Unidad',
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0],
      solicitadoPor: user?.email?.split('@')[0] || 'Admin'
    };
    
    const updated = [newReq, ...localReqs];
    setLocalReqs(updated);
    localStorage.setItem('sentinel_reqs', JSON.stringify(updated));
    setIsOpen(false);
    toast.success('Requisición creada correctamente');
    setFormData({ item: '', categoria: '', cantidadSolicitada: '', unidad: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Requisiciones</h1>
          <p className="text-sm text-muted-foreground">Solicitudes de compra y reposición</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-1" /> Nueva Requisición
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-[#1e2130] bg-[#111318] text-[#f1f5f9] shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Nueva Requisición</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Ítem / Producto *</Label>
                <Input required className="bg-[#0d0f14] border-[#1e2130] text-white" value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})} placeholder="Ej: Aceite de Oliva" />
              </div>
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select required value={formData.categoria} onValueChange={v => setFormData({...formData, categoria: v})}>
                  <SelectTrigger className="bg-[#0d0f14] border-[#1e2130] text-white">
                    <SelectValue placeholder="Seleccionar categoría..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111318] border-[#1e2130]">
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad *</Label>
                  <Input required type="number" step="0.01" className="bg-[#0d0f14] border-[#1e2130] text-white" value={formData.cantidadSolicitada} onChange={e => setFormData({...formData, cantidadSolicitada: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Unidad</Label>
                  <Input className="bg-[#0d0f14] border-[#1e2130] text-white" value={formData.unidad} onChange={e => setFormData({...formData, unidad: e.target.value})} placeholder="Ej: Litros, Kg" />
                </div>
              </div>
              <DialogFooter className="mt-6 pt-4 border-t border-[#1e2130]">
                <Button type="button" variant="ghost" className="hover:bg-white/5 hover:text-white" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white min-w-[100px]">
                  <Save className="h-4 w-4 mr-2" /> Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-x-auto border border-border">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {['ID', 'Ítem', 'Categoría', 'Cantidad', 'Unidad', 'Estado', 'Fecha', 'Solicitado por', isAdmin ? 'Acciones' : ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localReqs?.map((req, idx) => (
                <tr key={req.id} className={cn('border-t border-border/50 hover:bg-muted/20 transition-colors', idx % 2 === 0 ? 'bg-card' : 'bg-muted/10')}>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{req.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{req.item}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] bg-background/50">{req.categoria}</Badge></td>
                  <td className="px-4 py-3 text-foreground font-semibold">{req.cantidadSolicitada}</td>
                  <td className="px-4 py-3 text-muted-foreground">{req.unidad}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-1 rounded-md text-[11px] font-semibold border', statusStyles[req.estado] || statusStyles['Pendiente'])}>
                      {req.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{req.fecha}</td>
                  <td className="px-4 py-3 text-muted-foreground">{req.solicitadoPor}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {req.estado === 'Pendiente' ? (
                        <div className="flex gap-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8 text-success hover:text-success hover:bg-success/10 border-success/30" 
                            onClick={() => handleUpdateStatus(req.id, 'Aprobado')}
                            title="Aprobar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30" 
                            onClick={() => handleUpdateStatus(req.id, 'Rechazado')}
                            title="Rechazar"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Requisitions;
