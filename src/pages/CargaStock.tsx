import { useState } from 'react';
import { STOCK_ITEMS, CATEGORIES } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Save, X } from 'lucide-react';

const CargaStock = () => {
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = STOCK_ITEMS.filter(i => {
    if (catFilter !== 'all' && i.categoria !== catFilter) return false;
    if (search && !i.producto.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSave = () => {
    toast.success('✅ Se actualizaron 12 ítems. 3 están por debajo del stock mínimo. 1 ítem está cerca del vencimiento.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carga de Stock</h1>
          <p className="text-sm text-muted-foreground">Actualizá las cantidades del inventario</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Cambios descartados')}><X className="h-4 w-4 mr-1" /> Descartar</Button>
          <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Guardar Cambios</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-48 bg-card"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 w-64 bg-card" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                <td className="px-4 py-2.5 font-medium text-foreground">{item.producto}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{item.unidad}</td>
                <td className="px-4 py-2.5 text-center text-muted-foreground">{item.stockMinimo}</td>
                <td className="px-4 py-2.5 text-center">
                  <Input type="number" defaultValue={item.cantidadActual} className="w-20 mx-auto text-center h-8" />
                </td>
                <td className="px-4 py-2.5">
                  <Input type="date" defaultValue="2026-03-01" className="h-8 w-36" />
                </td>
                <td className="px-4 py-2.5">
                  <Input type="date" defaultValue={item.vencimiento} className="h-8 w-36" />
                </td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{item.responsable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CargaStock;
