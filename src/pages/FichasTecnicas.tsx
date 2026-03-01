import { FICHAS_TECNICAS } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, DollarSign, Truck, CalendarDays } from 'lucide-react';

const FichasTecnicas = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fichas Técnicas</h1>
        <p className="text-sm text-muted-foreground">Detalle de productos del inventario</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FICHAS_TECNICAS.map(ficha => (
          <Card key={ficha.id} className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="h-32 bg-muted rounded-md mb-4 flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{ficha.producto}</h3>
                <Badge variant="secondary" className="text-[10px]">{ficha.categoria}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{ficha.descripcion}</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" />
                  <span>{ficha.proveedor}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">${ficha.costoUnitario.toLocaleString('es-AR')}</span> / unidad
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Actualizado: {ficha.ultimaActualizacion}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FichasTecnicas;
