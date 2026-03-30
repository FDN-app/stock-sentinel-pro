DROP TABLE IF EXISTS public.fichas_tecnicas CASCADE;

CREATE TABLE public.fichas_tecnicas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  producto text NOT NULL,
  categoria text NOT NULL,
  proveedor text NOT NULL,
  costoUnitario numeric NOT NULL,
  descripcion text,
  ultimaActualizacion date NOT NULL,
  imageUrl text
);

ALTER TABLE public.fichas_tecnicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crud authenticated" ON public.fichas_tecnicas
FOR ALL TO authenticated USING (true) WITH CHECK (true);
