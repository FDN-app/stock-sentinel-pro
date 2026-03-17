import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL as string, process.env.VITE_SUPABASE_ANON_KEY as string);

async function test() {
    const { data, error } = await supabase.auth.signUp({
        email: `test_user_${Date.now()}@example.com`,
        password: 'password123'
    });
    console.log("Signup res:", { user: data.user?.id, error });

    if (data?.user) {
        const { data: pData, error: pError } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: 'Test User',
            email: data.user.email,
            role: 'staff'
        });
        console.log("Profile res:", { pData, pError });
    }
}
test();
