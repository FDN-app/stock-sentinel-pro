import { useState } from 'react';
import { HISTORICO, CATEGORIES } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const tipoStyles: Record<string, string> = {
  Entrada: 'bg-success/15 text-success',
  Salida: 'bg-destructive/15 text-destructive',
  Ajuste: 'bg-warning/15 text-warning',
};

const History = () => {
  const [catFilter, setCatFilter] = useState('all');
  const [tipoFilter, setTipoFilter] = useState('all');

  const filtered = HISTORICO.filter(e => {
    if (catFilter !== 'all' && e.categoria !== catFilter) return false;
    if (tipoFilter !== 'all' && e.tipo !== tipoFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        <p className="text-sm text-muted-foreground">Registro de todos los movimientos de stock</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input type="date" defaultValue="2026-02-24" className="w-40 bg-card" />
        <Input type="date" defaultValue="2026-03-01" className="w-40 bg-card" />
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-48 bg-card"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-36 bg-card"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Entrada">Entrada</SelectItem>
            <SelectItem value="Salida">Salida</SelectItem>
            <SelectItem value="Ajuste">Ajuste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              {['Fecha', 'Ítem', 'Categoría', 'Tipo', 'Cantidad', 'Stock Result.', 'Responsable'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, idx) => (
              <tr key={entry.id} className={cn('border-t border-border', idx % 2 === 0 ? 'bg-card' : 'bg-muted/30')}>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{entry.fecha}</td>
                <td className="px-4 py-2.5 font-medium text-foreground">{entry.item}</td>
                <td className="px-4 py-2.5"><Badge variant="secondary" className="text-[10px]">{entry.categoria}</Badge></td>
                <td className="px-4 py-2.5">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-semibold', tipoStyles[entry.tipo])}>{entry.tipo}</span>
                </td>
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {entry.tipo === 'Salida' ? `-${entry.cantidad}` : entry.tipo === 'Ajuste' ? entry.cantidad : `+${entry.cantidad}`}
                </td>
                <td className="px-4 py-2.5 text-foreground">{entry.stockResultante}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{entry.responsable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
