-- SQL Script para inicializar Stock Sentinel Pro 
-- Ejecutar en el SQL Editor de Supabase (https://app.supabase.com/project/_/sql)

-- 1. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Perfiles (Extensión de Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    unit TEXT NOT NULL,
    min_stock NUMERIC DEFAULT 0,
    current_stock NUMERIC DEFAULT 0,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Movimientos
CREATE TABLE IF NOT EXISTS public.movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('in', 'out', 'adjustment')) NOT NULL,
    quantity NUMERIC NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configuración de Row Level Security (RLS) - Opcional por ahora para desarrollo, actívalo luego para prod
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Permisos MUY PERMISIVAS (solo para MVP / desarrollo local)
-- ¡IMPORTANTE! Reemplazar con políticas estrictas (usando auth.uid()) antes de producción!

CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.categories FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.movements FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON public.movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.movements FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);

-- DB Inicial - Semilla de Categorías (Mock Data)
INSERT INTO public.categories (name) VALUES 
  ('Carnes'), 
  ('Aves'), 
  ('Mariscos'), 
  ('Vegetales'), 
  ('Lácteos')
ON CONFLICT (name) DO NOTHING;


-- 5. Tabla de Requisiciones
CREATE TABLE IF NOT EXISTS public.requisitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  status TEXT CHECK (status IN ('Pendiente','Aprobado','Rechazado')) 
    NOT NULL DEFAULT 'Pendiente',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  requested_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
