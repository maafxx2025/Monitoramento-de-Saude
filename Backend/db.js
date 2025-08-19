const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

// Cliente normal (para auth)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Cliente admin (para operações que precisam bypassar RLS)
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// module.exports = supabase;

module.exports = { supabase, supabaseAdmin };
