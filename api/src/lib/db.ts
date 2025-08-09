import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// On récupère les variables d'environnement depuis `.env.local`
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("❌ Missing Supabase environment variables");
}

// Client public (lecture/écriture via RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Si besoin plus tard : client admin (backend only) avec clé secrète
export const supabaseAdmin = process.env.SUPABASE_SECRET_KEY
    ? createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY)
    : null;