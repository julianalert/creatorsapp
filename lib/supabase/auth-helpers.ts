import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/signin')
  }
  return user
}

export async function getUserAccount(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('account')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  
  if (error) {
    console.error('Error checking account:', error)
    return null
  }
  
  return data
}

export async function hasAccount(userId: string): Promise<boolean> {
  const account = await getUserAccount(userId)
  return account !== null
}
