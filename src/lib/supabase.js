import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Variabili VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY mancanti in .env.local')
}

export const supabase = createClient(url, key)
