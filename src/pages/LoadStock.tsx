import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProducts, useCategories, useUpdateProductStock, useUpdateProductExpiry, useAddMovement, useAddCategory } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save, X, Loader2, Plus, Minus, Search, Box, Tag, Scale, ShieldAlert, Truck, DollarSign, Calendar, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { differenceInDays, format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LoadStock = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const updateStock = useUpdateProductStock();
  const updateExpiry = useUpdateProductExpiry();
  const addMovement = useAddMovement();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  
  const [openAdd, setOpenAdd] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
     name: '', category_id: '', unit: '', min_stock: '', supplier: '', costPrice: '', expiry_date: ''
  });

  const addCategory = useAddCategory();

  // Track local un-saved changes to quantities and expiry dates
  const [draftStock, setDraftStock] = useState<Record<string, number>>({});
  const [draftExpiry, setDraftExpiry] = useState<Record<string, string | null>>({});

  if (loadingProducts || loadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const safeProducts = products || [];
  const safeCategories = categories || [];

  const handleStockChange = (id: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setDraftStock(prev => ({ ...prev, [id]: num }));
    } else if (value === '') {
      // allow clearing just visually
      setDraftStock(prev => ({ ...prev, [id]: 0 }));
    } else {
      const next = { ...draftStock };
      delete next[id];
      setDraftStock(next);
    }
  };

  const handleAdjustStock = (id: string, currentVal: number, step: number) => {
    const newVal = Math.max(0, currentVal + step);
    setDraftStock(prev => ({ ...prev, [id]: newVal }));
  };

  const handleExpiryChange = (id: string, value: string) => {
    setDraftExpiry(prev => ({ ...prev, [id]: value || null }));
  };

  const getExpiryStatus = (date: string | null) => {
    if (!date) return 'none';
    const [year, month, day] = date.split('-').map(Number);
    const expiry = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = differenceInDays(expiry, today);
    if (diff < 7) return 'critical';
    if (diff >= 7 && diff <= 30) return 'warning';
    return 'ok';
  };

  const handleSave = async () => {
    const stockChangeIds = Object.keys(draftStock);
    const expiryChangeIds = Object.keys(draftExpiry);
    const allChangeIds = Array.from(new Set([...stockChangeIds, ...expiryChangeIds]));

    if (allChangeIds.length === 0) {
      toast.info('No hay cambios para guardar.');
      return;
    }

    try {
      const promises = allChangeIds.map(id => {
        const product = safeProducts.find(p => p.id === id);
        if (!product) return Promise.resolve();

        const promisesForId = [];

        if (draftStock[id] !== undefined && draftStock[id] !== product.current_stock) {
          const newStock = draftStock[id];
          const oldStock = product.current_stock;
          const diff = newStock - oldStock;

          const movementType = diff > 0 ? 'in' : 'out';
          promisesForId.push(addMovement.mutateAsync({
            product_id: id,
            type: movementType,
            quantity: Math.abs(diff),
            user_id: user?.id || null,
            notes: 'Ajuste desde Conteo Diario'
          }));

          promisesForId.push(updateStock.mutateAsync({ id, newStock }));
        }

        if (draftExpiry[id] !== undefined && draftExpiry[id] !== product.expiry_date) {
          promisesForId.push(updateExpiry.mutateAsync({ id, expiry_date: draftExpiry[id] }));
        }

        return Promise.all(promisesForId);
      });

      await Promise.all(promises);

      queryClient.setQueryData(['products'], (old: any) => {
        if (!old) return old;
        return old.map((p: any) => {
          let updatedProduct = { ...p };
          if (draftExpiry[p.id] !== undefined) {
            updatedProduct.expiry_date = draftExpiry[p.id];
          }
          if (draftStock[p.id] !== undefined) {
            updatedProduct.current_stock = draftStock[p.id];
          }
          return updatedProduct;
        });
      });

      toast.success('✅ Se guardaron los cambios correctamente.');
      setDraftStock({});
      setDraftExpiry({});
    } catch (error) {
      toast.error('❌ Hubo un error al guardar los cambios.');
      console.error(error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Producto "${name}" eliminado`);
    } catch(err: any) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await addCategory.mutateAsync({ name: newCategoryName.trim() });
      setFormData(prev => ({ ...prev, category_id: newCat.id }));
      setIsAddingCategory(false);
      setNewCategoryName('');
      toast.success('Categoría agregada');
    } catch (error) {
      toast.error('Error al agregar categoría');
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id || !formData.unit || formData.min_stock === '') {
      toast.error('Completá los campos obligatorios');
      return;
    }
    
    try {
      const { data, error } = await supabase.from('products').insert([{
        name: formData.name,
        category_id: formData.category_id,
        unit: formData.unit,
        min_stock: parseFloat(formData.min_stock),
        current_stock: 0,
        expiry_date: formData.expiry_date || null
      }]).select().single();
      
      if (error) throw error;
      
      toast.success('Producto agregado a la base de datos');
      setOpenAdd(false);
      setFormData({ name: '', category_id: '', unit: '', min_stock: '', supplier: '', costPrice: '', expiry_date: '' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      toast.error('Error al guardar producto nuevo');
      console.error(error);
    }
  };

  const handleDiscard = () => {
    setDraftStock({});
    setDraftExpiry({});
    toast.info('Cambios descartados');
  };

  const isSaving = updateStock.isPending || addMovement.isPending || updateExpiry.isPending;
  const hasDrafts = Object.keys(draftStock).length > 0 || Object.keys(draftExpiry).length > 0;

  // Filter Products globally
  const filteredProducts = safeProducts.filter(p => {
    const productName = p.name ? p.name.toLowerCase() : '';
    const matchSearch = productName.includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.category_id === catFilter;
    return matchSearch && matchCat;
  });

  // Then derive active categories
  const activeCategories = safeCategories.filter(cat => 
    filteredProducts.some(p => p.category_id === cat.id)
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10" style={{ backgroundColor: '#0d0f14', minHeight: 'calc(100vh - 4rem)', padding: '1.5rem', borderRadius: '0.5rem' }}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e2130] pb-4 sticky top-0 bg-[#0d0f14] z-10">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Conteo Diario</h1>
          <p className="text-sm text-muted-foreground mt-1">Actualizá rápidamente las cantidades del inventario</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Button onClick={() => setOpenAdd(true)} variant="outline" className="border-primary/50 text-foreground bg-primary/10 hover:bg-primary/20">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none border-[#1e2130] bg-transparent hover:bg-white/5" onClick={handleDiscard} disabled={!hasDrafts || isSaving}>
            <X className="h-4 w-4 mr-2" /> Descartar
          </Button>
          <Button onClick={handleSave} disabled={!hasDrafts || isSaving} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white min-w-[150px]">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Cambios
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 w-full sm:w-64 bg-[#111318] border-[#1e2130] h-10 text-white" 
            placeholder="Buscar producto..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-[#111318] border-[#1e2130] h-10">
            <SelectValue placeholder="Categorías" />
          </SelectTrigger>
          <SelectContent className="bg-[#111318] border-[#1e2130]">
            <SelectItem value="all">Todas las categorías</SelectItem>
            {safeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-[#111318] rounded-xl border border-[#1e2130] overflow-hidden shadow-lg">
        {activeCategories.length === 0 ? (
           <div className="p-8 text-center text-muted-foreground">
             No se encontraron productos para contar.
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1a1d27] border-b border-[#1e2130]">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-300 uppercase text-xs tracking-wider w-1/3">Producto</th>
                  <th className="px-5 py-4 font-semibold text-slate-300 uppercase text-xs tracking-wider text-center">Unidad</th>
                  <th className="px-5 py-4 font-semibold text-slate-300 uppercase text-xs tracking-wider text-center">Cant. Actual</th>
                  <th className="px-5 py-4 font-semibold text-slate-300 uppercase text-xs tracking-wider">Vencimiento</th>
                  <th className="px-5 py-4 font-semibold text-slate-300 uppercase text-xs tracking-wider text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {activeCategories.map(cat => {
                  const items = filteredProducts.filter(p => p.category_id === cat.id);
                  
                  return (
                    <React.Fragment key={cat.id}>
                      {/* Category Header */}
                      <tr className="bg-[#151822] border-y border-[#1e2130]">
                        <td colSpan={5} className="px-5 py-3 font-bold text-slate-400 text-xs tracking-widest uppercase">
                          {cat.name}
                        </td>
                      </tr>
                      {/* Items */}
                      {items.map(item => {
                        const currentStockDraft = draftStock[item.id] !== undefined ? draftStock[item.id] : item.current_stock;
                        const isStockModified = draftStock[item.id] !== undefined && draftStock[item.id] !== item.current_stock;
                        const stockStatus = currentStockDraft === 0 ? 'empty' : currentStockDraft <= item.min_stock ? 'low' : 'ok';
          
                        const currentExpiryDraft = draftExpiry[item.id] !== undefined ? draftExpiry[item.id] : item.expiry_date;
                        const isExpiryModified = draftExpiry[item.id] !== undefined && draftExpiry[item.id] !== item.expiry_date;
                        const expiryStatus = getExpiryStatus(currentExpiryDraft);

                        return (
                          <tr key={item.id} className="border-b border-[#1e2130] hover:bg-[#1a1d27] transition-colors group">
                            <td className="px-5 py-3 font-medium text-white group-hover:text-primary transition-colors flex items-center justify-between min-w-[200px]">
                              <div>
                                {item.name}
                                {isStockModified && <span className="ml-2 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Modificado</span>}
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 text-muted-foreground hover:text-red-500 shrink-0">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[#111318] border-[#1e2130]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción es permanente y eliminará "{item.name}" del sistema.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-[#1e2130] hover:bg-white/5">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleDelete(item.id, item.name)}>Eliminar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                            <td className="px-5 py-3 text-muted-foreground text-center">{item.unit}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button 
                                  variant="ghost" size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                                  onClick={() => handleAdjustStock(item.id, currentStockDraft, -1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={currentStockDraft}
                                  onChange={(e) => handleStockChange(item.id, e.target.value)}
                                  className={cn(
                                    "w-20 text-center h-8 bg-black/40 border-[#1e2130]",
                                    isStockModified ? "border-primary ring-1 ring-primary/20 text-primary font-bold" : "text-white focus-visible:ring-primary/50"
                                  )}
                                />
                                <Button 
                                  variant="ghost" size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                                  onClick={() => handleAdjustStock(item.id, currentStockDraft, 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="relative inline-flex items-center">
                                <Input
                                  type="date"
                                  value={currentExpiryDraft ? currentExpiryDraft.split('T')[0] : ''}
                                  onChange={(e) => handleExpiryChange(item.id, e.target.value)}
                                  className={cn(
                                    "bg-black/40 w-[140px] h-8 text-xs cursor-pointer border-[#1e2130] focus-visible:ring-primary/50",
                                    isExpiryModified && "border-primary ring-1 ring-primary/20",
                                    expiryStatus === 'critical' ? 'text-red-500 font-bold border-red-500/50' :
                                      expiryStatus === 'warning' ? 'text-yellow-500 font-bold border-yellow-500/50' :
                                        currentExpiryDraft ? 'text-green-500' : 'text-muted-foreground'
                                  )}
                                />
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <Badge variant="outline" className={cn(
                                'font-semibold tracking-wide',
                                stockStatus === 'empty' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                                  stockStatus === 'low' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                                    'bg-green-500/10 text-green-500 border-green-500/30'
                              )}>
                                {stockStatus === 'empty' ? 'VACÍO' : stockStatus === 'low' ? 'BAJO' : 'OK'}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-[500px] border-[#1e2130] bg-[#111318] text-[#f1f5f9] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Agregar Nuevo Ítem</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAdd} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 col-span-2">
                 <Label className="flex items-center gap-2"><Box className="w-4 h-4 text-muted-foreground"/> Nombre *</Label>
                 <Input required className="bg-[#0d0f14] text-white border-[#1e2130]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Lomo de Res" />
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
                    <Input autoFocus className="bg-[#0d0f14] text-white border-primary/50 flex-1" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nueva categoría..." />
                    <Button type="button" size="sm" onClick={handleAddCategory} disabled={addCategory.isPending} className="bg-primary"><Save className="w-4 h-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddingCategory(false)}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <Select required value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                    <SelectTrigger className="bg-[#0d0f14] text-white border-[#1e2130]"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent className="bg-[#111318] border-[#1e2130]">
                      {safeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
               </div>

               <div className="space-y-2">
                 <Label className="flex items-center gap-2"><Scale className="w-4 h-4 text-muted-foreground"/> Unidad *</Label>
                 <Input required className="bg-[#0d0f14] text-white border-[#1e2130]" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Ej. kg, unid" />
               </div>
               <div className="space-y-2">
                 <Label className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-muted-foreground"/> Stock Mín. *</Label>
                 <Input required type="number" min="0" step="0.1" className="bg-[#0d0f14] text-white border-[#1e2130]" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: e.target.value})} placeholder="0" />
               </div>

               <div className="space-y-2">
                 <Label className="flex items-center gap-2"><Truck className="w-4 h-4 text-muted-foreground"/> Proveedor</Label>
                 <Input className="bg-[#0d0f14] text-white border-[#1e2130]" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="Ej. Distribuidora X" />
               </div>
               <div className="space-y-2">
                 <Label className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground"/> Precio Costo</Label>
                 <Input type="number" step="0.01" className="bg-[#0d0f14] text-white border-[#1e2130]" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} placeholder="0.00" />
               </div>

               <div className="space-y-2 col-span-2">
                 <Label className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground"/> Vencimiento</Label>
                 <Input type="date" className="bg-[#0d0f14] text-white border-[#1e2130]" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
               </div>
            </div>
            <DialogFooter className="mt-4 pt-4 border-t border-[#1e2130]">
              <Button type="button" variant="ghost" onClick={() => setOpenAdd(false)}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                 <Save className="h-4 w-4 mr-2" /> Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoadStock;
