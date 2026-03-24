import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProducts, useCategories, useUpdateProductStock, useUpdateProductExpiry, useAddMovement } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save, X, Loader2, Plus, Minus, Search } from 'lucide-react';
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

  const handleDiscard = () => {
    setDraftStock({});
    setDraftExpiry({});
    toast.info('Cambios descartados');
  };

  const isSaving = updateStock.isPending || addMovement.isPending || updateExpiry.isPending;
  const hasDrafts = Object.keys(draftStock).length > 0 || Object.keys(draftExpiry).length > 0;

  // Filter Categories that have matching products
  const activeCategories = safeCategories.filter(cat => {
    if (catFilter !== 'all' && cat.id !== catFilter) return false;
    const items = safeProducts.filter(p => p.category_id === cat.id);
    if (search) {
      return items.some(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    return items.length > 0;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10" style={{ backgroundColor: '#0d0f14', minHeight: 'calc(100vh - 4rem)', padding: '1.5rem', borderRadius: '0.5rem' }}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e2130] pb-4 sticky top-0 bg-[#0d0f14] z-10">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Conteo Diario</h1>
          <p className="text-sm text-muted-foreground mt-1">Actualizá rápidamente las cantidades del inventario</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="border-[#1e2130] bg-transparent hover:bg-white/5" onClick={handleDiscard} disabled={!hasDrafts || isSaving}>
            <X className="h-4 w-4 mr-2" /> Descartar
          </Button>
          <Button onClick={handleSave} disabled={!hasDrafts || isSaving} className="bg-primary hover:bg-primary/90 text-white min-w-[150px]">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Cambios
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 w-64 bg-[#111318] border-[#1e2130] h-10" 
            placeholder="Buscar producto..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-48 bg-[#111318] border-[#1e2130] h-10">
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
                  let items = safeProducts.filter(p => p.category_id === cat.id);
                  if (search) {
                    items = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
                  }
                  
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
                            <td className="px-5 py-3 font-medium text-white group-hover:text-primary transition-colors">
                              {item.name}
                              {isStockModified && <span className="ml-2 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Modificado</span>}
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
    </div>
  );
};

export default LoadStock;
