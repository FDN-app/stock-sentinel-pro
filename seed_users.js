import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function seed() {
    console.log('Seeding initial users...');

    const users = [
        { email: 'admin@stocksentinel.local', password: 'adminpassword', name: 'Carlos Méndez', role: 'admin' },
        { email: 'staff@stocksentinel.local', password: 'staffpassword', name: 'María González', role: 'staff' }
    ];

    for (const u of users) {
        // 1. Create via auth to get UID
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: u.email,
            password: u.password
        });

        if (authError) {
            console.error(`Error creating ${u.email} in auth:`, authError.message);
            continue;
        }

        if (authData.user) {
            // 2. Create profile
            const { error: profileError } = await supabase.from('profiles').insert({
                id: authData.user.id,
                full_name: u.name,
                role: u.role,
                email: u.email
            });

            if (profileError) {
                console.error(`Error creating profile for ${u.email}:`, profileError.message);
            } else {
                console.log(`Successfully created ${u.email}`);
            }
        }
    }
}

seed().catch(console.error);
