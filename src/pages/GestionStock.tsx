import { STOCK_ITEMS, CATEGORIES } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const GestionStock = () => {
  const isExpiringSoon = (date: string) => {
    const d = new Date(date);
    const now = new Date('2026-03-01');
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 1;
  };

  const isLowStock = (item: typeof STOCK_ITEMS[0]) => item.cantidadActual > 0 && item.cantidadActual < item.stockMinimo;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Stock</h1>
          <p className="text-sm text-muted-foreground">Administrá el inventario completo del restaurante</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Agregar Categoría</Button>
          <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Agregar Columna</Button>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Agregar Ítem</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Producto</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Unidad</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Stock Mín.</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Cant. Actual</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Fecha Conteo</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Vencimiento</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Responsable</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(cat => {
              const items = STOCK_ITEMS.filter(i => i.categoria === cat);
              if (items.length === 0) return null;
              return [
                <tr key={`cat-${cat}`}>
                  <td colSpan={8} className="px-4 py-2.5 font-bold text-foreground bg-muted/50 text-xs tracking-wide">{cat} ({items.length})</td>
                </tr>,
                ...items.map((item, idx) => {
                  const expiring = isExpiringSoon(item.vencimiento);
                  const low = isLowStock(item);
                  return (
                    <tr key={item.id} className={cn(
                      'border-t border-border transition-colors',
                      expiring ? 'bg-destructive/10' : idx % 2 === 0 ? 'bg-card' : 'bg-muted/30'
                    )}>
                      <td className="px-4 py-2.5 font-medium text-foreground">{item.producto}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{item.unidad}</td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{item.stockMinimo}</td>
                      <td className={cn('px-4 py-2.5 text-center font-semibold', low ? 'bg-warning/20 text-warning' : 'text-foreground')}>
                        {item.cantidadActual}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{item.fechaConteo}</td>
                      <td className="px-4 py-2.5">
                        {expiring ? (
                          <Badge variant="destructive" className="text-[10px]">{item.vencimiento}</Badge>
                        ) : (
                          <span className="text-muted-foreground">{item.vencimiento}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{item.responsable}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Button variant="ghost" size="sm" className="text-xs">Editar</Button>
                      </td>
                    </tr>
                  );
                })
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionStock;
