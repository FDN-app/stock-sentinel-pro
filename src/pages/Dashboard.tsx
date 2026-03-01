import { useAuth } from '@/context/AuthContext';
import { STOCK_ITEMS, CATEGORIES } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, XCircle, AlertTriangle, Clock, Beef, Carrot, Drumstick, Fish, Apple, Milk } from 'lucide-react';

const CATEGORY_ICONS: Record<string, typeof Beef> = {
  'CARNE ROJA': Beef,
  'VERDURAS': Carrot,
  'POLLO': Drumstick,
  'PESCADO': Fish,
  'FRUTAS': Apple,
  'LÁCTEOS': Milk,
};

const CATEGORY_COLORS = [
  'bg-destructive/10 text-destructive',
  'bg-success/10 text-success',
  'bg-warning/10 text-warning',
  'bg-primary/10 text-primary',
  'bg-accent text-accent-foreground',
  'bg-secondary text-secondary-foreground',
];

const Dashboard = () => {
  const { user } = useAuth();
  const sinStock = STOCK_ITEMS.filter(i => i.cantidadActual === 0);
  const stockBajo = STOCK_ITEMS.filter(i => i.cantidadActual > 0 && i.cantidadActual < i.stockMinimo);
  const proximoVencer = STOCK_ITEMS.filter(i => {
    const d = new Date(i.vencimiento);
    const now = new Date('2026-03-01');
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 3 && diff >= 0;
  });

  const kpis = [
    { label: 'Valor en Stock', value: '$24,850.00', icon: DollarSign, color: 'text-primary' },
    { label: 'Total de Ítems', value: '18', icon: Package, color: 'text-primary' },
    { label: 'Sin Stock', value: sinStock.length.toString(), icon: XCircle, color: 'text-destructive' },
    { label: 'Stock Bajo', value: stockBajo.length.toString(), icon: AlertTriangle, color: 'text-warning' },
    { label: 'Próximo a Vencer', value: proximoVencer.length.toString(), icon: Clock, color: 'text-warning' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{greeting}, {user?.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground text-sm">Resumen del inventario de hoy</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stockBajo.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-foreground">{item.producto}</span>
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">{item.categoria}</Badge>
                </div>
                <span className="text-warning font-semibold">{item.cantidadActual}/{item.stockMinimo}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" /> Sin Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sinStock.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">{item.producto}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5">{item.categoria}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" /> Próximo a Vencer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {proximoVencer.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">{item.producto}</span>
                <span className="text-xs text-muted-foreground">{item.vencimiento}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Categorías del Stock</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = CATEGORY_ICONS[cat] || Package;
            const count = STOCK_ITEMS.filter(i => i.categoria === cat).length;
            return (
              <Card key={cat} className="shadow-card hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-0.5">
                <CardContent className="p-4 text-center">
                  <div className={`h-10 w-10 rounded-lg mx-auto mb-2 flex items-center justify-center ${CATEGORY_COLORS[idx]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{cat}</p>
                  <p className="text-xs text-muted-foreground">{count} ítems</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
