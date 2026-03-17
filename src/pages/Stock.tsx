import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useProducts, useCategories, useAddCategory } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Pencil, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQueryClient } from '@tanstack/react-query';

const Stock = () => {
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const addCategory = useAddCategory();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openCategory, setOpenCategory] = useState(false);
  const [openColumn, setOpenColumn] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [newCatName, setNewCatName] = useState('');
  const [newColName, setNewColName] = useState('');

  const [localColumns, setLocalColumns] = useState<string[]>([]);

  const handleSaveEdit = async () => {
    if (!editItem) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          name: editItem.name, 
          expiry_date: editItem.expiry_date 
        })
        .eq('id', editItem.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      queryClient.setQueryData(['products'], (old: any) => {
        if (!old) return old;
        return old.map((p: any) => p.id === editItem.id ? { ...p, expiry_date: editItem.expiry_date } : p);
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado correctamente.');
      setEditItem(null);
    } catch(err: any) {
      toast.error('Error al actualizar el producto: ' + err.message);
    }
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

  if (loadingProducts || loadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const safeProducts = products || [];
  const safeCategories = categories || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Stock</h1>
          <p className="text-sm text-muted-foreground">Administrá el inventario completo del restaurante</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={openCategory} onOpenChange={setOpenCategory}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Agregar Categoría</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Categoría</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category-name" className="text-right">
                    Nombre
                  </Label>
                  <Input id="category-name" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Ej. Bebidas" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setOpenCategory(false); setNewCatName(''); }}>Cancelar</Button>
                <Button disabled={addCategory.isPending} onClick={async () => {
                  if (newCatName.trim()) {
                    try {
                      await addCategory.mutateAsync({ name: newCatName.trim() });
                      toast.success(`Categoría "${newCatName.trim()}" agregada!`);
                    } catch (err: any) {
                      toast.error(err.message || 'Error al agregar categoría.');
                    }
                  }
                  setOpenCategory(false);
                  setNewCatName('');
                }}>
                  {addCategory.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openColumn} onOpenChange={setOpenColumn}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Agregar Columna</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Columna</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="column-name" className="text-right">
                    Nombre
                  </Label>
                  <Input id="column-name" value={newColName} onChange={e => setNewColName(e.target.value)} placeholder="Ej. Marca" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setOpenColumn(false); setNewColName(''); }}>Cancelar</Button>
                <Button onClick={() => {
                  if (newColName.trim()) {
                    setLocalColumns([...localColumns, newColName.trim()]);
                  }
                  setOpenColumn(false);
                  setNewColName('');
                }}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button size="sm" onClick={() => navigate('/carga')}><Plus className="h-4 w-4 mr-1" /> Agregar Ítem</Button>
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
              <th className="text-left px-4 py-3 font-semibold text-slate-200 uppercase text-xs tracking-wider">Fecha Cont. (BD)</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-200 uppercase text-xs tracking-wider">Vencimiento</th>
              {localColumns.map(col => (
                <th key={col} className="text-left px-4 py-3 font-semibold text-slate-200 uppercase text-xs tracking-wider">{col} (Nueva)</th>
              ))}
              <th className="text-center px-4 py-3 font-semibold text-slate-200 uppercase text-xs tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {safeCategories.map(cat => {
              const items = safeProducts.filter(i => i.category_id === cat.id);

              return (
                <React.Fragment key={`cat-${cat.id}`}>
                  <tr>
                    <td colSpan={7 + localColumns.length} className="px-4 py-3 font-bold text-white bg-slate-800 text-sm tracking-wide">
                      {cat.name} ({items.length})
                    </td>
                  </tr>

                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7 + localColumns.length} className="px-4 py-4 text-center text-slate-400 italic bg-slate-900 border-b border-white/5">
                        Sin productos en esta categoría
                      </td>
                    </tr>
                  )}

                  {items.map((item, idx) => {
                    const expiryStatus = getExpiryStatus(item.expiry_date);
                    const stockStatus = item.current_stock === 0 ? 'empty' : item.current_stock <= item.min_stock ? 'low' : 'ok';

                    return (
                      <tr key={item.id} className={cn(
                        'border-b border-white/5 transition-colors hover:bg-slate-800/80',
                        idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'
                      )}>
                        <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{item.min_stock}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={cn(
                            'font-semibold',
                            stockStatus === 'empty' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              stockStatus === 'low' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                'bg-green-500/10 text-green-500 border-green-500/20'
                          )}>
                            {item.current_stock}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.created_at ? format(new Date(item.created_at), 'dd/MM/yyyy') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {item.expiry_date ? (
                            expiryStatus === 'critical' ? (
                              <Badge className="bg-red-500 hover:bg-red-600 text-white border-transparent">
                                {item.expiry_date.split('-').reverse().join('/')}
                              </Badge>
                            ) : expiryStatus === 'warning' ? (
                              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent text-slate-900">
                                {item.expiry_date.split('-').reverse().join('/')}
                              </Badge>
                            ) : (
                              <span className="text-foreground">{item.expiry_date.split('-').reverse().join('/')}</span>
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        {localColumns.map(col => (
                          <td key={`${item.id}-${col}`} className="px-4 py-3 text-muted-foreground">-</td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setEditItem(item)} className="h-8 w-8 hover:text-primary hover:bg-white/5">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar producto</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {safeProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No hay productos registrados en el inventario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-[425px] border border-white/10 dark:bg-[#0B0E14] shadow-[0_0_40px_-10px_rgba(255,107,107,0.2)]">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Producto</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre del producto</Label>
                <Input value={editItem.name} disabled className="bg-black/20 text-muted-foreground border-white/10" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Fecha de Vencimiento</Label>
                <Input
                  type="date"
                  className="bg-black/20 border-white/10 focus-visible:ring-primary"
                  value={editItem.expiry_date ? editItem.expiry_date.split('T')[0] : ''}
                  onChange={(e) => setEditItem({ ...editItem, expiry_date: e.target.value || null })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditItem(null)} className="hover:bg-white/5">Cancelar</Button>
            <Button onClick={handleSaveEdit} className="bg-gradient-primary">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stock;
