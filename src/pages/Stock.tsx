import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useProducts, useCategories, useAddCategory, useAddProduct } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Pencil, Trash2, Search, Save, Package, Tag, Scale, ShieldAlert, DollarSign, Truck, Calendar, Box, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORY_COLORS = [
  'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'bg-pink-500/10 text-pink-500 border-pink-500/20',
  'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
];

const Stock = () => {
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const addCategory = useAddCategory();
  const addProduct = useAddProduct();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const [openAdd, setOpenAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  
  // Local state for Supplier and Cost Price (Since Supabase doesn't have it explicitly)
  const [localMetaData, setLocalMetaData] = useState<Record<string, {supplier: string, costPrice: string}>>({});

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    unit: '',
    min_stock: '',
    supplier: '',
    costPrice: '',
    expiry_date: ''
  });

  const getCategoryColor = (catId: string) => {
    if (!categories) return CATEGORY_COLORS[0];
    const index = categories.findIndex(c => c.id === catId);
    return CATEGORY_COLORS[Math.max(0, index) % CATEGORY_COLORS.length];
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id || !formData.name || !formData.unit || !formData.min_stock) {
      toast.error('Completá los campos obligatorios');
      return;
    }
    
    try {
      const result = await addProduct.mutateAsync({
        name: formData.name,
        category_id: formData.category_id,
        unit: formData.unit,
        min_stock: parseFloat(formData.min_stock) || 0,
        current_stock: 0,
        expiry_date: formData.expiry_date || null
      });

      // Save local meta
      if (result && result.id) {
        setLocalMetaData(prev => ({
          ...prev, 
          [result.id]: { supplier: formData.supplier, costPrice: formData.costPrice }
        }));
      }

      toast.success(`Producto "${formData.name}" agregado`);
      setOpenAdd(false);
      setFormData({ name: '', category_id: '', unit: '', min_stock: '', supplier: '', costPrice: '', expiry_date: '' });
    } catch(err: any) {
      toast.error(err.message || 'Error al agregar producto');
    }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          name: editItem.name, 
          category_id: editItem.category_id,
          unit: editItem.unit,
          min_stock: editItem.min_stock,
          expiry_date: editItem.expiry_date || null 
        })
        .eq('id', editItem.id);

      if (error) throw new Error(error.message);
      
      // Update local meta
      setLocalMetaData(prev => ({
        ...prev, 
        [editItem.id]: { supplier: editItem.supplier || '', costPrice: editItem.costPrice || '' }
      }));

      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado');
      setEditItem(null);
    } catch(err: any) {
      toast.error('Error al actualizar: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Producto "${name}" eliminado`);
      
      const newMeta = {...localMetaData};
      delete newMeta[id];
      setLocalMetaData(newMeta);
    } catch(err: any) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  const handleAddCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const result = await addCategory.mutateAsync({ name: newCategoryName.trim() });
      toast.success('Categoría agregada');
      setFormData({ ...formData, category_id: result.id });
      if (editItem) setEditItem({ ...editItem, category_id: result.id });
      setIsAddingCategory(false);
      setNewCategoryName('');
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar la categoría');
    }
  };

  if (loadingProducts || loadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const safeProducts = products || [];
  const safeCategories = categories || [];

  const filtered = safeProducts.filter(i => {
    if (catFilter !== 'all' && i.category_id !== catFilter) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10" style={{ backgroundColor: '#0d0f14', minHeight: 'calc(100vh - 4rem)', padding: '1.5rem', borderRadius: '0.5rem' }}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e2130] pb-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Inventario</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión visual del inventario completo</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9 w-64 bg-[#111318] border-[#1e2130] focus-visible:ring-primary h-10" 
              placeholder="Buscar producto..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-48 bg-[#111318] border-[#1e2130] h-10">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="bg-[#111318] border-[#1e2130]">
              <SelectItem value="all">Todas las categorías</SelectItem>
              {safeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg h-10 px-4">
                <Plus className="h-4 w-4 mr-2" /> Agregar Ítem
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-[#1e2130] bg-[#111318] shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Agregar Nuevo Ítem</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveAdd} className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2 col-span-2">
                     <Label className="flex items-center gap-2"><Box className="w-4 h-4 text-muted-foreground"/> Nombre *</Label>
                     <Input required className="bg-[#0cf1414] border-[#1e2130]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Lomo de Res" />
                   </div>

                   <div className="space-y-2 col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2"><Tag className="w-4 h-4 text-muted-foreground"/> Categoría *</Label>
                      <button type="button" onClick={() => setIsAddingCategory(!isAddingCategory)} className="text-xs text-primary hover:text-primary/80 flex items-center">
                        <Plus className="w-3 h-3 mr-1" /> Nueva
                      </button>
                    </div>
                    {isAddingCategory ? (
                      <div className="flex gap-2 items-center">
                        <Input autoFocus className="bg-[#0cf1414] border-primary/50 flex-1" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nueva categoría..." />
                        <Button type="button" size="sm" onClick={handleAddCategory} disabled={addCategory.isPending} className="bg-primary"><Save className="w-4 h-4" /></Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddingCategory(false)}><X className="w-4 h-4" /></Button>
                      </div>
                    ) : (
                      <Select required value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                        <SelectTrigger className="bg-[#0cf1414] border-[#1e2130]"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent className="bg-[#111318] border-[#1e2130]">
                          {safeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                   </div>

                   <div className="space-y-2">
                     <Label className="flex items-center gap-2"><Scale className="w-4 h-4 text-muted-foreground"/> Unidad *</Label>
                     <Input required className="bg-[#0cf1414] border-[#1e2130]" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Ej. kg, unid" />
                   </div>
                   <div className="space-y-2">
                     <Label className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-muted-foreground"/> Stock Mín. *</Label>
                     <Input required type="number" min="0" step="0.1" className="bg-[#0cf1414] border-[#1e2130]" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: e.target.value})} placeholder="0" />
                   </div>

                   <div className="space-y-2">
                     <Label className="flex items-center gap-2"><Truck className="w-4 h-4 text-muted-foreground"/> Proveedor</Label>
                     <Input className="bg-[#0cf1414] border-[#1e2130]" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="Ej. Distribuidora X" />
                   </div>
                   <div className="space-y-2">
                     <Label className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground"/> Precio Costo</Label>
                     <Input type="number" step="0.01" className="bg-[#0cf1414] border-[#1e2130]" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} placeholder="0.00" />
                   </div>

                   <div className="space-y-2 col-span-2">
                     <Label className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground"/> Vencimiento</Label>
                     <Input type="date" className="bg-[#0cf1414] border-[#1e2130]" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                   </div>
                </div>
                <DialogFooter className="mt-4 pt-4 border-t border-[#1e2130]">
                  <Button type="button" variant="ghost" onClick={() => setOpenAdd(false)}>Cancelar</Button>
                  <Button type="submit" disabled={addProduct.isPending} className="bg-primary hover:bg-primary/90 text-white">
                     {addProduct.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Guardar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111318] rounded-xl border border-[#1e2130]">
          <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg text-muted-foreground">No hay productos que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => {
            const cat = safeCategories.find(c => c.id === item.category_id);
            const badgeColor = getCategoryColor(item.category_id);
            const stockStatus = item.current_stock === 0 ? 'empty' : item.current_stock <= item.min_stock ? 'low' : 'ok';
            const meta = localMetaData[item.id] || { supplier: '-', costPrice: '-' };
            
            return (
              <div key={item.id} className="bg-[#111318] border border-[#1e2130] rounded-xl p-5 hover:border-[#2a2f45] transition-all group flex flex-col shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                    <Badge variant="outline" className={cn("mt-1.5", badgeColor)}>
                      {cat?.name || 'Sin Categoría'}
                    </Badge>
                  </div>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg p-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-muted-foreground hover:text-white" onClick={() => {
                            setEditItem({
                              ...item, 
                              supplier: meta.supplier !== '-' ? meta.supplier : '',
                              costPrice: meta.costPrice !== '-' ? meta.costPrice : '',
                              expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : ''
                            });
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar ítem</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/20 text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#111318] border-[#1e2130]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará "{item.name}" de forma permanente del inventario y no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-[#1e2130] hover:bg-white/5">Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleDelete(item.id, item.name)}>
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5 flex-1 relative">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Truck className="h-3 w-3"/> Proveedor</p>
                    <p className="text-sm font-medium text-slate-300 truncate">{meta.supplier || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-3 w-3"/> Precio Costo</p>
                    <p className="text-sm font-medium text-slate-300 truncate">{meta.costPrice ? `$${meta.costPrice}` : '-'}</p>
                  </div>
                  {item.expiry_date && (
                     <div className="space-y-1 col-span-2 mt-1">
                       <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3 w-3"/> Vencimiento</p>
                       <p className="text-sm font-medium text-slate-300">{item.expiry_date.split('-').reverse().join('/')}</p>
                     </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#1e2130] flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mínimo: <span className="font-medium text-slate-300">{item.min_stock} {item.unit}</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    'font-mono text-sm px-2.5 py-0.5 shadow-sm',
                    stockStatus === 'empty' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                    stockStatus === 'low' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                    'bg-green-500/10 text-green-500 border-green-500/30'
                  )}>
                    {item.current_stock} {item.unit}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-[500px] border-[#1e2130] bg-[#111318] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Editar Ítem</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label>Nombre *</Label>
                <Input required className="bg-[#0cf1414] border-[#1e2130]" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label>Categoría *</Label>
                <Select required value={editItem.category_id} onValueChange={v => setEditItem({...editItem, category_id: v})}>
                  <SelectTrigger className="bg-[#0cf1414] border-[#1e2130]"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent className="bg-[#111318] border-[#1e2130]">
                    {safeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unidad *</Label>
                <Input required className="bg-[#0cf1414] border-[#1e2130]" value={editItem.unit} onChange={e => setEditItem({...editItem, unit: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Stock Mín. *</Label>
                <Input required type="number" min="0" step="0.1" className="bg-[#0cf1414] border-[#1e2130]" value={editItem.min_stock} onChange={e => setEditItem({...editItem, min_stock: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Input className="bg-[#0cf1414] border-[#1e2130]" value={editItem.supplier} onChange={e => setEditItem({...editItem, supplier: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <Label>Precio Costo</Label>
                 <Input type="number" step="0.01" className="bg-[#0cf1414] border-[#1e2130]" value={editItem.costPrice} onChange={e => setEditItem({...editItem, costPrice: e.target.value})} />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Vencimiento</Label>
                <Input type="date" className="bg-[#0cf1414] border-[#1e2130]" value={editItem.expiry_date} onChange={e => setEditItem({...editItem, expiry_date: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 pt-4 border-t border-[#1e2130]">
            <Button variant="ghost" onClick={() => setEditItem(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90 text-white">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stock;
