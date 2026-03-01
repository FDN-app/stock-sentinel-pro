import { REQUISICIONES } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  Pendiente: 'bg-warning/15 text-warning border-warning/30',
  Aprobado: 'bg-success/15 text-success border-success/30',
  Rechazado: 'bg-destructive/15 text-destructive border-destructive/30',
};

const Requisiciones = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Requisiciones</h1>
          <p className="text-sm text-muted-foreground">Solicitudes de compra y reposición</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nueva Requisición</Button>
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              {['ID', 'Ítem', 'Categoría', 'Cantidad', 'Unidad', 'Estado', 'Fecha', 'Solicitado por'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REQUISICIONES.map((req, idx) => (
              <tr key={req.id} className={cn('border-t border-border', idx % 2 === 0 ? 'bg-card' : 'bg-muted/30')}>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{req.id}</td>
                <td className="px-4 py-2.5 font-medium text-foreground">{req.item}</td>
                <td className="px-4 py-2.5"><Badge variant="secondary" className="text-[10px]">{req.categoria}</Badge></td>
                <td className="px-4 py-2.5 text-foreground">{req.cantidadSolicitada}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{req.unidad}</td>
                <td className="px-4 py-2.5">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border', statusStyles[req.estado])}>
                    {req.estado}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{req.fecha}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{req.solicitadoPor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Requisiciones;
