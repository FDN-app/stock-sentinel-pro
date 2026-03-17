import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        "Faltan las variables de entorno de Supabase. Asegúrate de configurar .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY."
    );
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

// Tipos de datos para las tablas en Supabase
export type Category = {
    id: string;
    name: string;
    created_at?: string;
};

export type Product = {
    id: string;
    name: string;
    category_id: string;
    unit: string;
    min_stock: number;
    current_stock: number;
    expiry_date: string | null;
    created_at?: string;

    // Relación opcional para tipado
    categories?: { name: string };
};

export type MovementType = 'in' | 'out' | 'adjustment';

export type Movement = {
    id: string;
    product_id: string;
    type: MovementType;
    quantity: number;
    user_id?: string | null;
    notes?: string | null;
    created_at?: string;

    // Relación opcional
    products?: { name: string; unit: string };
};

export type Profile = {
    id: string;
    full_name: string | null;
    role: 'admin' | 'staff';
    email: string | null;
    created_at?: string;
};
