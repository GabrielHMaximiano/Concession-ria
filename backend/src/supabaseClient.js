const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Variáveis SUPABASE_URL e SUPABASE_SECRET_KEY são obrigatórias.');
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

module.exports = supabase;
