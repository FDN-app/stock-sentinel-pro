import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCategories } from '@/hooks/useSupabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ImageIcon, DollarSign, Truck, CalendarDays, Plus, Upload, Save, X, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const TechnicalSheets = () => {
  const { data: categories } = useCategories();
  const [fichas, setFichas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    producto: '', categoria: '', proveedor: '', costoUnitario: '', descripcion: ''
  });

  const fetchFichas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('fichas_tecnicas').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setFichas(data || []);
    } catch (error: any) {
      toast.error('Error al cargar las fichas técnicas: ' + error.message);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFichas();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.producto || !formData.categoria || !formData.proveedor || !formData.costoUnitario) {
      toast.error('Completá los campos obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      let publicImageUrl = '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('fichas')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('fichas')
          .getPublicUrl(filePath);

        publicImageUrl = publicUrl;
      }

      const newFicha = {
        producto: formData.producto,
        categoria: formData.categoria,
        proveedor: formData.proveedor,
        costoUnitario: parseFloat(formData.costoUnitario),
        descripcion: formData.descripcion || 'Sin descripción detallada.',
        imagen_url: publicImageUrl
      };

      const { data, error } = await supabase
        .from('fichas_tecnicas')
        .insert([newFicha])
        .select()
        .single();

      if (error) throw error;

      setFichas([data, ...fichas]);
      
      setIsOpen(false);
      toast.success('Ficha Técnica creada correctamente');
      setFormData({ producto: '', categoria: '', proveedor: '', costoUnitario: '', descripcion: '' });
      setPreview(null);
      setImageFile(null);
    } catch (error: any) {
      toast.error('Error al guardar la ficha técnica: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (ficha: any) => {
    if (!confirm(`¿Estás seguro de eliminar la ficha técnica para ${ficha.producto}?`)) return;

    try {
      if (ficha.imagen_url) {
         const filePath = ficha.imagen_url.split('/').pop();
         if (filePath) {
            await supabase.storage.from('fichas').remove([filePath]);
         }
      }

      const { error } = await supabase.from('fichas_tecnicas').delete().eq('id', ficha.id);
      
      if (error) throw error;
      
      setFichas(prev => prev.filter(f => f.id !== ficha.id));
      toast.success('Ficha técnica eliminada');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fichas Técnicas</h1>
          <p className="text-sm text-muted-foreground">Detalle de productos del inventario</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" /> Nueva Ficha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-[#1e2130] bg-[#111318] text-[#f1f5f9] shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Agregar Ficha Técnica</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-2">
              <div className="flex justify-center mb-4">
                 <div className="relative h-24 w-24 rounded-lg border-2 border-dashed border-[#1e2130] bg-black/20 flex flex-col items-center justify-center overflow-hidden hover:bg-black/40 transition-colors">
                   {preview ? (
                     <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                   ) : (
                     <>
                       <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                       <span className="text-[10px] text-muted-foreground text-center px-1">Subir Imagen</span>
                     </>
                   )}
                   <Input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Producto *</Label>
                  <Input required className="bg-[#0d0f14] border-[#1e2130] text-white" value={formData.producto} onChange={e => setFormData({...formData, producto: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select required value={formData.categoria} onValueChange={v => setFormData({...formData, categoria: v})}>
                    <SelectTrigger className="bg-[#0d0f14] border-[#1e2130] text-white">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111318] border-[#1e2130]">
                      {categories?.map(c => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Proveedor *</Label>
                  <Input required className="bg-[#0d0f14] border-[#1e2130] text-white" value={formData.proveedor} onChange={e => setFormData({...formData, proveedor: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Precio de Costo *</Label>
                  <Input required type="number" step="0.01" className="bg-[#0d0f14] border-[#1e2130] text-white" value={formData.costoUnitario} onChange={e => setFormData({...formData, costoUnitario: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Descripción</Label>
                  <Input className="bg-[#0d0f14] border-[#1e2130] text-white" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Detalles, uso, etc." />
                </div>
              </div>
              
              <DialogFooter className="mt-6 pt-4 border-t border-[#1e2130]">
                <Button type="button" variant="ghost" className="hover:bg-white/5 hover:text-white" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white min-w-[100px]">
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : fichas.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No hay Fichas Técnicas cargadas.
          </div>
        ) : (
          fichas.map(ficha => (
          <Card key={ficha.id} className="bg-[#111318] border-[#1e2130] shadow-md hover:shadow-lg transition-all hover:bg-[#151822]">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="h-32 bg-[#0d0f14] border border-[#1e2130] rounded-md mb-3 flex items-center justify-center overflow-hidden">
                {ficha.imagen_url ? (
                  <img src={ficha.imagen_url} alt={ficha.producto} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                )}
              </div>
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-white text-sm line-clamp-2">{ficha.producto}</h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10 -mt-1 -mr-1 shrink-0" onClick={() => handleDelete(ficha)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Badge variant="outline" className="text-[9px] bg-background/50 border-[#1e2130] text-muted-foreground self-start mb-2">
                  {ficha.categoria}
                </Badge>
                <p className="text-[10px] text-muted-foreground mb-3 line-clamp-3 leading-relaxed flex-grow">{ficha.descripcion}</p>
                <div className="space-y-1.5 text-[10px] mt-auto border-t border-[#1e2130] pt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="h-3 w-3" />
                    <span className="truncate">{ficha.proveedor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-3 w-3 text-primary" />
                    <span className="font-medium text-white">${ficha.costoUnitario.toLocaleString('es-AR')}</span> / unidad
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <span>Act: {ficha.ultimaActualizacion}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>
    </div>
  );
};

export default TechnicalSheets;
