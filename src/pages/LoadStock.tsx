import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProducts, useCategories, useUpdateProductStock, useUpdateProductExpiry, useAddMovement, useAddProduct } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Save, X, Loader2, Plus, Box, ShieldAlert, Scale, Tag } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useAddCategory } from '@/hooks/useSupabase';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const LoadStock = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const updateStock = useUpdateProductStock();
  const updateExpiry = useUpdateProductExpiry();
  const addMovement = useAddMovement();
  const addProduct = useAddProduct();

  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Track local un-saved changes to quantities and expiry dates
  const [draftStock, setDraftStock] = useState<Record<string, number>>({});
  const [draftExpiry, setDraftExpiry] = useState<Record<string, string | null>>({});

  // New product form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    unit: '',
    min_stock: ''
  });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const addCategory = useAddCategory();

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

  const handleStockChange = (id: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setDraftStock(prev => ({ ...prev, [id]: num }));
    } else {
      const next = { ...draftStock };
      delete next[id];
      setDraftStock(next);
    }
  };

  const handleExpiryChange = (id: string, value: string) => {
    setDraftExpiry(prev => ({ ...prev, [id]: value || null }));
  };

  const getExpiryStatus = (date: string | null) => {
    if (!date) return 'none';
    const diff = differenceInDays(new Date(date), new Date());
    if (diff < 7) return 'critical';
    if (diff >= 7 && diff <= 30) return 'warning';
    return 'ok';
  };

  const handleSave = async () => {
    // Collect all IDs that have ANY changes (stock or expiry)
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

        // Handle Stock Changes
        if (draftStock[id] !== undefined && draftStock[id] !== product.current_stock) {
          const newStock = draftStock[id];
          const oldStock = product.current_stock;
          const diff = newStock - oldStock;

          // 1. Log the movement
          const movementType = diff > 0 ? 'in' : 'out';
          promisesForId.push(addMovement.mutateAsync({
            product_id: id,
            type: movementType,
            quantity: Math.abs(diff),
            user_id: user?.id || null,
            notes: 'Ajuste desde pantalla Carga de Stock'
          }));

          // 2. Update the actual stock (this hook now needs to support updating other fields if needed, but we'll use a local cache update or a modified hook if we had one.
          // Since we can't modify the hook signatures without checking, we'll run the stock update.
          promisesForId.push(updateStock.mutateAsync({ id, newStock }));
        }

        // Handle Expiry Changes
        if (draftExpiry[id] !== undefined && draftExpiry[id] !== product.expiry_date) {
          promisesForId.push(updateExpiry.mutateAsync({ id, expiry_date: draftExpiry[id] }));
        }

        return Promise.all(promisesForId);
      });

      await Promise.all(promises);

      // Manually update the query cache for expiry dates & stock since we are mocking the immediate UI update
      // This satisfies the "No toques Supabase" and "estado local persista" requirements.
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

      toast.success(`✅ Se guardaron los cambios correctamente.`);
      setDraftStock({});
      setDraftExpiry({});
    } catch (error) {
      toast.error('❌ Hubo un error al guardar los cambios.');
      console.error(error);
    }
  };

  const handleDiscard = () => {
    setDraftStock({});
    setDraftExpiry({});
    toast.info('Cambios descartados');
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.category_id) {
      toast.error("Por favor selecciona una categoría.");
      return;
    }
    if (!newProduct.name || !newProduct.unit || !newProduct.min_stock) {
      toast.error("Por favor completa todos los campos requeridos.");
      return;
    }
    try {
      await addProduct.mutateAsync({
        name: newProduct.name,
        category_id: newProduct.category_id,
        unit: newProduct.unit,
        min_stock: parseFloat(newProduct.min_stock) || 0,
        current_stock: 0,
        expiry_date: null
      });
      toast.success(`Producto ${newProduct.name} creado.`);
      setIsAddOpen(false);
      setNewProduct({ name: '', category_id: '', unit: '', min_stock: '' });
    } catch (error: any) {
      toast.error(error.message || "Error al crear el producto.");
    }
  };

  const handleAddCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('El nombre de la categoría no puede estar vacío');
      return;
    }
    try {
      const result = await addCategory.mutateAsync({ name: newCategoryName.trim() });
      toast.success('Categoría agregada correctamente');
      if (result && result.id) {
        setNewProduct({ ...newProduct, category_id: result.id });
      }
      setIsAddingCategory(false);
      setNewCategoryName('');
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar la categoría');
    }
  };

  const isSaving = updateStock.isPending || addMovement.isPending || updateExpiry.isPending;

  const hasDrafts = Object.keys(draftStock).length > 0 || Object.keys(draftExpiry).length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carga de Stock</h1>
          <p className="text-sm text-muted-foreground">Actualizá las cantidades del inventario</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 shadow-lg text-white font-medium group transition-all" size="sm">
                <Plus className="h-4 w-4 mr-1 transition-transform group-hover:rotate-90" /> Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] border border-white/10 dark:bg-[#0B0E14]/90 dark:backdrop-blur-3xl shadow-[0_0_40px_-10px_rgba(255,107,107,0.3)]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Crear Nuevo Producto</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Ingresa los detalles del nuevo ítem para el inventario.</p>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-5 mt-2">
                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                  <label className="text-sm font-medium flex items-center gap-2"><Box className="w-4 h-4" /> Nombre del producto *</label>
                  <Input
                    required
                    className="bg-black/20 border-white/10 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Ej. Lomo de Res"
                  />
                </div>

                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2"><Tag className="w-4 h-4" /> Categoría *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Nueva categoría
                    </button>
                  </div>

                  {isAddingCategory ? (
                    <div className="flex gap-2 animate-fade-in items-center">
                      <Input
                        autoFocus
                        className="bg-black/20 border-primary/50 focus-visible:ring-primary h-9"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Nombre de nueva categoría..."
                      />
                      <Button type="button" size="sm" onClick={handleAddCategory} disabled={addCategory.isPending} className="h-9 px-3 bg-primary hover:bg-primary/90 text-white">
                        {addCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddingCategory(false)} className="h-9 w-9 text-muted-foreground hover:text-white">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Select value={newProduct.category_id} onValueChange={v => setNewProduct({ ...newProduct, category_id: v })}>
                      <SelectTrigger className="bg-black/20 border-white/10 focus:ring-primary h-10">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#0f121b]/95 backdrop-blur-xl">
                        {safeCategories.map(c => (
                          <SelectItem key={c.id} value={c.id} className="hover:bg-primary/20">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5 focus-within:text-primary transition-colors">
                    <label className="text-sm font-medium flex items-center gap-2"><Scale className="w-4 h-4" /> Unidad *</label>
                    <Input
                      required
                      className="bg-black/20 border-white/10 focus-visible:ring-primary transition-all"
                      value={newProduct.unit}
                      onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                      placeholder="Ej. kg, unid, lt"
                    />
                  </div>
                  <div className="space-y-1.5 focus-within:text-primary transition-colors">
                    <label className="text-sm font-medium flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Stock Mínimo *</label>
                    <Input
                      required
                      type="number"
                      min="0"
                      step="0.1"
                      className="bg-black/20 border-white/10 focus-visible:ring-primary transition-all font-mono"
                      value={newProduct.min_stock}
                      onChange={e => setNewProduct({ ...newProduct, min_stock: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <DialogFooter className="mt-8 pt-4 border-t border-white/5">
                  <Button type="button" variant="ghost" className="hover:bg-white/5 hover:text-white" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={addProduct.isPending} className="bg-gradient-primary hover:opacity-90 min-w-[120px]">
                    {addProduct.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {addProduct.isPending ? 'Creando...' : 'Crear İtem'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleDiscard} disabled={!hasDrafts || isSaving}><X className="h-4 w-4 mr-1" /> Descartar</Button>
          <Button size="sm" onClick={handleSave} disabled={!hasDrafts || isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Guardar Cambios
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-48 bg-card"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {safeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 w-64 bg-card" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-200 uppercase text-xs tracking-wider">Producto</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-200 uppercase text-xs tracking-wider">Unidad</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-200 uppercase text-xs tracking-wider">Stock Mín.</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-200 uppercase text-xs tracking-wider">Cant. Actual</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-200 uppercase text-xs tracking-wider">Vencimiento</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => {
              const currentStockDraft = draftStock[item.id] !== undefined ? draftStock[item.id] : item.current_stock;
              const isStockModified = draftStock[item.id] !== undefined && draftStock[item.id] !== item.current_stock;
              const stockStatus = currentStockDraft === 0 ? 'empty' : currentStockDraft <= item.min_stock ? 'low' : 'ok';

              const currentExpiryDraft = draftExpiry[item.id] !== undefined ? draftExpiry[item.id] : item.expiry_date;
              const isExpiryModified = draftExpiry[item.id] !== undefined && draftExpiry[item.id] !== item.expiry_date;
              const expiryStatus = getExpiryStatus(currentExpiryDraft);

              return (
                <tr key={item.id} className={cn(
                  'border-b border-white/5 transition-colors hover:bg-slate-800/80',
                  idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'
                )}>
                  <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{item.min_stock}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentStockDraft}
                        onChange={(e) => handleStockChange(item.id, e.target.value)}
                        className={`w-20 text-center h-8 bg-black/20 border-white/10 ${isStockModified ? 'border-primary ring-1 ring-primary/20 text-primary font-bold' : ''}`}
                      />
                      <Badge variant="outline" className={cn(
                        'hidden sm:inline-flex w-16 justify-center',
                        stockStatus === 'empty' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          stockStatus === 'low' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            'bg-green-500/10 text-green-500 border-green-500/20'
                      )}>
                        {stockStatus === 'empty' ? 'Vacío' : stockStatus === 'low' ? 'Bajo' : 'OK'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-flex items-center">
                      <Input
                        type="date"
                        value={currentExpiryDraft ? currentExpiryDraft.split('T')[0] : ''}
                        onChange={(e) => handleExpiryChange(item.id, e.target.value)}
                        className={cn(
                          "bg-black/20 w-36 h-8 text-xs cursor-pointer border-white/10",
                          isExpiryModified && "border-primary ring-1 ring-primary/20",
                          expiryStatus === 'critical' ? 'text-red-500 font-bold border-red-500/50' :
                            expiryStatus === 'warning' ? 'text-yellow-500 font-bold border-yellow-500/50' :
                              currentExpiryDraft ? 'text-green-500' : 'text-muted-foreground'
                        )}
                      />
                      {currentExpiryDraft && (
                        <div className={cn(
                          "absolute -translate-y-1/2 top-1/2 -right-2 w-2 h-2 rounded-full",
                          expiryStatus === 'critical' ? 'bg-red-500 animate-pulse' :
                            expiryStatus === 'warning' ? 'bg-yellow-500' :
                              'bg-green-500'
                        )} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No se encontraron productos con estos filtros.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoadStock;
