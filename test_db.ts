import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- Testing Categories ---');
    const { data: cats, error: errCats } = await supabase.from('categories').select('*');
    console.log('Categories data:', cats);
    console.log('Categories error:', errCats);

    console.log('\n--- Testing Products ---');
    const { data: prods, error: errProds } = await supabase.from('products').select('*');
    console.log('Products data:', prods);
    console.log('Products error:', errProds);

    if (cats && cats.length > 0) {
        console.log('\n--- Inserting Test Product ---');
        const { data: ins, error: errIns } = await supabase.from('products').insert([
            {
                name: 'Test Product ' + Date.now(),
                category_id: cats[0].id,
                unit: 'kg',
                min_stock: 10,
                current_stock: 0,
                expiry_date: null
            }
        ]).select();

        console.log('Insert product data:', ins);
        console.log('Insert product error:', errIns);

        if (ins && ins.length > 0) {
            console.log('\n--- Cleaning up Test Product ---');
            await supabase.from('products').delete().eq('id', ins[0].id);
        }
    } else {
        console.log('\n--- Cannot insert product, no categories found ---');
    }
}

run();
