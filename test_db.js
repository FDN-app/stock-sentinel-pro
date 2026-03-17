import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://nywbaqviknsdpncvyoev.supabase.co"; // changed .com to .co
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55d2JhcXZpa25zZHBuY3Z5b2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQ3NTUsImV4cCI6MjA4ODMxMDc1NX0.eA1GB5raY9vuQZvD7EIAqlYcHvjqf_HaaON9y9d5T78";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- Testing Categories ---');
    const { data: cats, error: errCats } = await supabase.from('categories').select('*');
    console.log('Categories data:', cats);
    console.log('Categories error:', errCats);

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
            console.log('\n--- Cleaning up ---');
            await supabase.from('products').delete().eq('id', ins[0].id);
        }
    }
}

run();
