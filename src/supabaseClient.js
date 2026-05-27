import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvbgjudpoojgmrujxkta.supabase.co';
const supabaseKey = 'sb_publishable_amhb-ddOCKcuRseFXenf-w_5j6PasQg';

export const supabase = createClient(supabaseUrl, supabaseKey);
