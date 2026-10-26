import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://nfxmyxxnwpilmrqpowgw.supabase.co';
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Q_8SrCgLo5oCuBHhOT0PPw_NNEqqPp9';

export const supabase = createClient(supabaseUrl, supabaseKey);
