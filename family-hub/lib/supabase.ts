import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null

export const HOUSEHOLD_ID = process.env.NEXT_PUBLIC_HOUSEHOLD_ID || 'home'
export const IS_DEMO = !supabase
