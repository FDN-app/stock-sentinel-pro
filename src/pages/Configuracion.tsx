import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/data/mockData';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Configuracion = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground">Ajustes generales del sistema</p>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Perfil del Restaurante</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nombre</Label><Input defaultValue="Parrilla Don Carlos" /></div>
            <div className="space-y-2"><Label>Dirección</Label><Input defaultValue="Av. Corrientes 1234, CABA" /></div>
            <div className="space-y-2"><Label>Moneda</Label><Input defaultValue="ARS" disabled /></div>
            <div className="space-y-2"><Label>Zona Horaria</Label><Input defaultValue="America/Buenos_Aires" disabled /></div>
          </div>
          <Button size="sm" onClick={() => toast.success('Perfil actualizado')}>Guardar</Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Notificaciones</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><Label>Alerta de stock bajo</Label><p className="text-xs text-muted-foreground">Notificar cuando un ítem baje del mínimo</p></div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Alerta de vencimiento</Label><p className="text-xs text-muted-foreground">Notificar días antes del vencimiento</p></div>
            <div className="flex items-center gap-2">
              <Input type="number" defaultValue={3} className="w-16 h-8" />
              <span className="text-xs text-muted-foreground">días</span>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Alertas por email</Label><p className="text-xs text-muted-foreground">Enviar notificaciones al email del admin</p></div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Gestión de Categorías</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <div key={cat} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
                <span className="text-sm font-medium text-foreground">{cat}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracion;
