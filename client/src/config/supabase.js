/*
Author: Vien Trieu (Date: 6-27-2025)
Description: Initializes and exports the Supabase client using environment variables for project URL and anon key.
*/

/* === Imports ============================================================ */
/* Import the Supabase client creator function */
import { createClient } from '@supabase/supabase-js';

/* === Configuration ====================================================== */
/* Supabase project URL from environment variables */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
/* Supabase anon public key from environment variables */
const supabaseKey = process.env.REACT_APP_ANON_KEY;

/* === Client Initialization ============================================= */
/* Create an instance of the Supabase client */
const supabase = createClient(supabaseUrl, supabaseKey);

/* === Export ============================================================= */
/* Export the Supabase client for use throughout the application */
export default supabase;
// Note: Ensure you have the necessary environment variables set in your .env file
// REACT_APP_SUPABASE_URL and REACT_APP_ANON_KEY should be defined in your .env file