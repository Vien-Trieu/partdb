/*
Author: Vien Trieu (Date: 6-27-2025)
Description: Initializes and configures the Supabase client for interacting with the Supabase backend.
*/

/* === Imports ============================================================ */
/* Import Supabase client creator */
import { createClient } from '@supabase/supabase-js';

/* === Configuration ====================================================== */
/* URL of the Supabase project (replace with your project URL) */
const supabaseUrl = 'https://usgdhmzuqkfuauytbwdw.supabase.co';
/* Anonymous public key for Supabase (store securely, e.g., in .env) */
const supabaseAnonKey = 'your-anon-key'; // from your .env or secure source

/* === Client Initialization ============================================= */
/* Instantiate the Supabase client with URL and anon key */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
