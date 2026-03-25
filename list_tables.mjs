import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.VITE_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.VITE_SUPABASE_ANON_KEY;

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log(Object.keys(data.paths).filter(p => p !== '/'));
  })
  .catch(err => console.error(err));
