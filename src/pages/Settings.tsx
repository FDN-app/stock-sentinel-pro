import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Tag, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useCategories, useAddCategory, useOrganizationSettings, useUpdateOrganizationSettings } from '@/hooks/useSupabase';

const Settings = () => {
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const addCategory = useAddCategory();
  
  const { data: orgSettings, isLoading: loadingOrgSettings } = useOrganizationSettings();
  const updateOrgSettings = useUpdateOrganizationSettings();

  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [orgForm, setOrgForm] = useState(() => {
    const saved = localStorage.getItem('sentinel_org_settings');
    if (saved) return JSON.parse(saved);
    return { name: 'Parrilla Don Carlos', address: 'Av. Corrientes 1234, CABA' };
  });

  useEffect(() => {
    if (orgSettings && orgSettings.name) {
      setOrgForm({ name: orgSettings.name || '', address: orgSettings.address || '' });
    }
  }, [orgSettings]);

  const safeCategories = categories || [];

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('El nombre de la categoría no puede estar vacío');
      return;
    }
    try {
      await addCategory.mutateAsync({ name: newCatName.trim() });
      toast.success('Categoría agregada correctamente');
      setIsAddCatOpen(false);
      setNewCatName('');
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar la categoría');
    }
  };
  const handleSaveOrgSettings = async () => {
    // Optimistic / local fallback save
    localStorage.setItem('sentinel_org_settings', JSON.stringify(orgForm));
    toast.success('Perfil del restaurante actualizado');
    
    try {
       // Attempt to update Supabase, but don't crash UI if it fails
      await updateOrgSettings.mutateAsync({ name: orgForm.name, address: orgForm.address });
    } catch (e: any) {
      console.warn('Supabase org table not found, saved to local storage fallback instead.', e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground">Ajustes generales del sistema</p>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Perfil del Restaurante</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {loadingOrgSettings ? (
            <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nombre</Label><Input value={orgForm.name} onChange={e => setOrgForm({...orgForm, name: e.target.value})} /></div>
                <div className="space-y-2"><Label>Dirección</Label><Input value={orgForm.address} onChange={e => setOrgForm({...orgForm, address: e.target.value})} /></div>
                <div className="space-y-2"><Label>Moneda</Label><Input defaultValue="ARS" disabled /></div>
                <div className="space-y-2"><Label>Zona Horaria</Label><Input defaultValue="America/Buenos_Aires" disabled /></div>
              </div>
              <Button size="sm" onClick={handleSaveOrgSettings} disabled={updateOrgSettings.isPending}>
                {updateOrgSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </>
          )}
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

      <Card className="shadow-card border-white/5 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Gestión de Categorías</CardTitle>
          <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 border-primary/20 hover:bg-primary/10 text-primary">
                <Plus className="h-4 w-4 mr-1" /> Nueva
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] border border-white/10 dark:bg-[#0B0E14]/90 dark:backdrop-blur-3xl shadow-[0_0_40px_-10px_rgba(255,107,107,0.3)]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Nueva Categoría</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4 mt-2">
                <div className="space-y-2 focus-within:text-primary transition-colors">
                  <label className="text-sm font-medium flex items-center gap-2"><Tag className="w-4 h-4" /> Nombre comercial</label>
                  <Input
                    autoFocus
                    required
                    className="bg-black/20 border-white/10 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Ej. Bebidas sin Alcohol"
                  />
                </div>
                <DialogFooter className="mt-6 pt-4 border-t border-white/5">
                  <Button type="button" variant="ghost" className="hover:bg-white/5 hover:text-white" onClick={() => setIsAddCatOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={addCategory.isPending} className="bg-gradient-primary hover:opacity-90 min-w-[100px]">
                    {addCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {addCategory.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loadingCategories ? (
            <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-2">
              {safeCategories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between py-2.5 px-3 rounded-md bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                  <span className="text-sm font-medium text-foreground">{cat.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
              {safeCategories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No hay categorías configuradas.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
