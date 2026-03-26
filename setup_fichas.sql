-- 1. Crear el Bucket "fichas" con acceso público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fichas', 'fichas', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas Storage para Bucket "fichas"
CREATE POLICY "Public Access for fichas bucket" ON storage.objects FOR SELECT USING (bucket_id = 'fichas');
CREATE POLICY "Auth Upload for fichas bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'fichas');
CREATE POLICY "Auth Update for fichas bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'fichas');
CREATE POLICY "Auth Delete for fichas bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'fichas');

-- 2. Crear Tabla fichas_tecnicas
CREATE TABLE IF NOT EXISTS public.fichas_tecnicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto TEXT NOT NULL,
    categoria TEXT NOT NULL,
    proveedor TEXT NOT NULL,
    costoUnitario NUMERIC NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    ultimaActualizacion DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- 3. Activar Row Level Security
ALTER TABLE public.fichas_tecnicas ENABLE ROW LEVEL SECURITY;

-- 4. Crear las Políticas RLS exigidas en la tabla fichas_tecnicas
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.fichas_tecnicas;
CREATE POLICY "Enable read access for authenticated users" 
ON public.fichas_tecnicas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.fichas_tecnicas;
CREATE POLICY "Enable insert for authenticated users" 
ON public.fichas_tecnicas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.fichas_tecnicas;
CREATE POLICY "Enable update for authenticated users" 
ON public.fichas_tecnicas FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.fichas_tecnicas;
CREATE POLICY "Enable delete for authenticated users" 
ON public.fichas_tecnicas FOR DELETE TO authenticated USING (true);
