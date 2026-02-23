import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

const getSupabaseUrl = () => {
  if (typeof window === 'undefined') return ''
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}

const getSupabaseKey = () => {
  if (typeof window === 'undefined') return ''
  return process.env.NEXT_PUBLIC_SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

export const supabase = typeof window === 'undefined'
  ? null
  : (() => {
    if (!supabaseClient) {
      const url = getSupabaseUrl()
      const key = getSupabaseKey()
      if (url && key) {
        supabaseClient = createClient(url, key)
      }
    }
    return supabaseClient
  })()

export const getServiceRoleClient = () => {
  if (typeof window === 'undefined') return null
  const url = getSupabaseUrl()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (url && serviceRoleKey) {
    return createClient(url, serviceRoleKey)
  }
  return null
}
