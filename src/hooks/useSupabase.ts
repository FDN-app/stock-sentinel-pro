import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product, Category, Movement, Profile } from '../lib/supabase';

// --- CATEGORÍAS ---
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching categories:', error);
                throw new Error(error.message);
            }
            return data as Category[];
        },
    });
}

export function useAddCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newCategory: { name: string }) => {
            const { data, error } = await supabase
                .from('categories')
                .insert([newCategory])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as Category;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, name }: { id: string, name: string }) => {
            const { data, error } = await supabase
                .from('categories')
                .update({ name })
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as Category;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

// --- PRODUCTOS (STOCK) ---
export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          categories (
            name
          )
        `)
                .order('name');

            if (error) {
                console.error('Error fetching products:', error);
                throw new Error(error.message);
            }
            return data as Product[];
        },
    });
}

export function useAddProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newProduct: Omit<Product, 'id' | 'created_at'>) => {
            const { data, error } = await supabase
                .from('products')
                .insert([newProduct])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as Product;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdateProductStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, newStock }: { id: string, newStock: number }) => {
            const { data, error } = await supabase
                .from('products')
                .update({ current_stock: newStock })
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as Product;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdateProductExpiry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, expiry_date }: { id: string, expiry_date: string | null }) => {
            const { data, error } = await supabase
                .from('products')
                .update({ expiry_date: expiry_date })
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as Product;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// --- MOVIMIENTOS ---
export function useMovements() {
    return useQuery({
        queryKey: ['movements'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('movements')
                .select(`
          *,
          products (
            name,
            unit
          )
        `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching movements:', error);
                throw new Error(error.message);
            }
            return data as Movement[];
        },
    });
}

export function useAddMovement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newMovement: Omit<Movement, 'id' | 'created_at'>) => {
            const { data, error } = await supabase
                .from('movements')
                .insert([newMovement])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as Movement;
        },
    });
}

// --- PERFILES (USUARIOS) ---
export function useProfiles() {
    return useQuery({
        queryKey: ['profiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching profiles:', error);
                throw new Error(error.message);
            }
            return data as Profile[];
        },
    });
}

// --- ORGANIZATION SETTINGS ---
export type OrganizationSettings = {
    id: string;
    name: string;
    address?: string;
    currency?: string;
    timezone?: string;
};

export function useOrganizationSettings() {
    return useQuery({
        queryKey: ['organization_settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organization_settings')
                .select('*')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Si no existe fila, retornar default
                    return { id: '1', name: 'Parrilla Don Carlos', address: 'Av. Corrientes 1234, CABA', currency: 'ARS', timezone: 'America/Buenos_Aires' } as OrganizationSettings;
                }
                console.error('Error fetching organization_settings:', error);
                throw new Error(error.message);
            }
            return data as OrganizationSettings;
        },
    });
}

export function useUpdateOrganizationSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (settings: Partial<OrganizationSettings>) => {
            // Upsert asumiendo id '1' si no existe
            const { data, error } = await supabase
                .from('organization_settings')
                .upsert({ id: settings.id || '1', ...settings })
                .select()
                .single();

            if (error) {
                console.error('Error updating organization_settings:', error);
                throw new Error(error.message);
            }
            return data as OrganizationSettings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization_settings'] });
        },
    });
}


// --- REQUISICIONES ---
export type Requisition = { id: string; item: string; categoria: string; cantidadSolicitada: number; unidad: string; estado: string; fecha: string; solicitadoPor: string; };

export function useRequisitions() { return useQuery({ queryKey: ['requisitions'], queryFn: async () => { const { data, error } = await supabase.from('requisitions').select('*').order('fecha', { ascending: false }); if (error) { console.warn('Fallback to mock data for requisitions (table may not exist):', error); const { REQUISICIONES } = await import('../data/mockData'); return REQUISICIONES as Requisition[]; } return data as Requisition[]; } }); }

export function useUpdateRequisition() { const queryClient = useQueryClient(); return useMutation({ mutationFn: async ({ id, estado }: { id: string, estado: string }) => { const { data, error } = await supabase.from('requisitions').update({ estado }).eq('id', id).select().single(); if (error) { console.error('Error updating requisition:', error); throw new Error(error.message); } return data; }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['requisitions'] }); } }); }

// --- FICHAS TÉCNICAS ---
export type FichaTecnica = {
    id: string;
    producto: string;
    categoria: string;
    proveedor: string;
    costoUnitario: number;
    descripcion?: string;
    ultimaActualizacion: string;
    imageUrl?: string;
};

export function useTechnicalSheets() {
    return useQuery({
        queryKey: ['fichas_tecnicas'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('fichas_tecnicas')
                .select('*')
                .order('ultimaActualizacion', { ascending: false });

            if (error) {
                console.warn('Fallback a mock data para fichas técnicas:', error);
                const { FICHAS_TECNICAS } = await import('../data/mockData');
                return FICHAS_TECNICAS as unknown as FichaTecnica[];
            }
            return data as FichaTecnica[];
        },
    });
}

export function useAddTechnicalSheet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ficha: Omit<FichaTecnica, 'id'>) => {
            const { data, error } = await supabase
                .from('fichas_tecnicas')
                .insert([ficha])
                .select()
                .single();

            if (error) {
                console.error('Error insertando ficha_tecnica:', error);
                throw new Error(error.message);
            }
            return data as FichaTecnica;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fichas_tecnicas'] });
        },
    });
}