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
