import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRequisitions, useUpdateRequisition } from '@/hooks/useSupabase';
import { toast } from 'sonner';

const statusStyles: Record<string, string> = {
  Pendiente: 'bg-warning/15 text-warning border-warning/30',
  Aprobado: 'bg-success/15 text-success border-success/30',
  Rechazado: 'bg-destructive/15 text-destructive border-destructive/30',
};

const Requisitions = () => {
  const { isAdmin } = useAuth();
  const { data: requisitions, isLoading } = useRequisitions();
  const updateReq = useUpdateRequisition();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateReq.mutateAsync({ id, estado: newStatus });
      toast.success(`Requisición ${newStatus.toLowerCase()}`);
    } catch (e) {
      toast.error('Error al actualizar estado en Supabase (Verificar si existe la tabla)');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Requisiciones</h1>
          <p className="text-sm text-muted-foreground">Solicitudes de compra y reposición</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nueva Requisición</Button>
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
              {requisitions?.map((req, idx) => (
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
                            disabled={updateReq.isPending}
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8 text-success hover:text-success hover:bg-success/10 border-success/30" 
                            onClick={() => handleUpdateStatus(req.id, 'Aprobado')}
                            title="Aprobar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            disabled={updateReq.isPending}
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
