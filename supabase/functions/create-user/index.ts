import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Variables de entorno faltantes')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { email, password, fullName, role } = await req.json()

    // 1. Crear el auth user usando admin api
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError) throw authError
    const userId = authData.user.id

    // 2. Insertar en tabla profiles public
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId,
          full_name: fullName,
          email,
          role: role || 'staff'
        }
      ])

    if (profileError) {
      console.error('Error creando profile:', profileError)
      // No anulamos la res de auth, pero informamos
    }

    return new Response(
      JSON.stringify({ message: "Usuario creado", user: authData.user }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})
