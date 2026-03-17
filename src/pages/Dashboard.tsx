import { useAuth } from '@/context/AuthContext';
import { useProducts, useCategories } from '@/hooks/useSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, XCircle, AlertTriangle, Clock, Beef, Carrot, Drumstick, Fish, Apple, Milk, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const CATEGORY_ICONS: Record<string, typeof Beef> = {
  'Carnes': Beef,
  'Vegetales': Carrot,
  'Aves': Drumstick,
  'Mariscos': Fish,
  'Frutas': Apple,
  'Lácteos': Milk,
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
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: categories, isLoading: loadingCategories } = useCategories();

  if (loadingProducts || loadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const safeProducts = products || [];
  const safeCategories = categories || [];

  const sinStock = safeProducts.filter(i => i.current_stock === 0);
  const stockBajo = safeProducts.filter(i => i.current_stock > 0 && i.current_stock < i.min_stock);
  const proximoVencer = safeProducts.filter(i => {
    if (!i.expiry_date) return false;
    const diff = differenceInDays(new Date(i.expiry_date), new Date());
    return diff <= 7 && diff >= 0; // Alerta 7 días antes
  });

  // Cálculo de valor mockeado ya que la DB no tiene precios aún
  const valorTotalMock = safeProducts.reduce((acc, curr) => acc + (curr.current_stock * 1500), 0);

  const kpis = [
    { label: 'Valor en Stock (Aprox)', value: `$${valorTotalMock.toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
    { label: 'Total de Ítems', value: safeProducts.length.toString(), icon: Package, color: 'text-primary' },
    { label: 'Sin Stock', value: sinStock.length.toString(), icon: XCircle, color: 'text-destructive' },
    { label: 'Stock Bajo', value: stockBajo.length.toString(), icon: AlertTriangle, color: 'text-warning' },
    { label: 'Próximo a Vencer', value: proximoVencer.length.toString(), icon: Clock, color: 'text-warning' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
  const userName = user?.nombre ? user.nombre.split(' ')[0] : 'Usuario';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{greeting}, {userName}!</h1>
        <p className="text-muted-foreground text-sm">Resumen del inventario de hoy</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="glass-card transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-background/50 backdrop-blur-sm shadow-sm ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="glass-card border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stockBajo.length === 0 && <p className="text-sm text-muted-foreground">No hay items con stock bajo.</p>}
            {stockBajo.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <span className="font-medium text-foreground">{item.name}</span>
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">{item.categories?.name}</Badge>
                </div>
                <span className="text-warning font-bold bg-warning/10 px-2 py-0.5 rounded-md">{item.current_stock}/{item.min_stock}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" /> Sin Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sinStock.length === 0 && <p className="text-sm text-muted-foreground">Ningún item sin stock.</p>}
            {sinStock.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="font-medium text-foreground">{item.name}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 bg-destructive/10 text-destructive border-destructive/20">{item.categories?.name}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" /> Próximo a Vencer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximoVencer.length === 0 && <p className="text-sm text-muted-foreground">No hay items próximos a vencer.</p>}
            {proximoVencer.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="text-xs font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-md">
                  {item.expiry_date ? format(new Date(item.expiry_date), 'dd/MM/yyyy') : ''}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-5 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> Categorías del Stock
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {safeCategories.map((cat, idx) => {
            const Icon = CATEGORY_ICONS[cat.name] || Package;
            const count = safeProducts.filter(i => i.category_id === cat.id).length;
            const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

            return (
              <Card key={cat.id} className="glass-card transition-all duration-300 cursor-pointer hover:-translate-y-1 group hover:shadow-lg">
                <CardContent className="p-5 text-center">
                  <div className={`h-12 w-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground tracking-tight">{cat.name}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-2 bg-background/50 inline-block px-2.5 py-0.5 rounded-full border border-border/50">{count} ítems</p>
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

