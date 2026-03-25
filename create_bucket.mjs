import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('fichas', {
    public: true
  });
  console.log('Result:', data, error);
}

createBucket();
