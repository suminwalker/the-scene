import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Ensure environment variables are defined to avoid runtime errors
if (!supabaseUrl || !supabaseKey) {
    // We don't want to crash the app during build or if envs are missing in dev
    // enabling a graceful degrade or checking configured state might be better
    console.warn('Supabase URL or Key is missing. Check your .env.local file.')
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseKey || ''
)

