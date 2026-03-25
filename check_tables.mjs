import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function check() {
  const t1 = await supabase.from('technical_sheets').select('*').limit(1);
  const t2 = await supabase.from('fichas_tecnicas').select('*').limit(1);
  const t3 = await supabase.from('fichas').select('*').limit(1);

  console.log('technical_sheets:', t1.error ? t1.error.message : 'EXISTS');
  console.log('fichas_tecnicas:', t2.error ? t2.error.message : 'EXISTS');
  console.log('fichas:', t3.error ? t3.error.message : 'EXISTS');
}

check();
