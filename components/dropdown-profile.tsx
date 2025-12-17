'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function getInitials(email: string | null | undefined): string {
  if (!email) return 'U'
  
  // Extract the part before @
  const localPart = email.split('@')[0]
  
  // If it's a single word, use first two characters
  if (!localPart.includes('.')) {
    return localPart.substring(0, 2).toUpperCase()
  }
  
  // If it has dots, use first letter of first and last part
  const parts = localPart.split('.')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  
  // Fallback: first two characters
  return localPart.substring(0, 2).toUpperCase()
}

function Avatar({ email, size = 32 }: { email: string | null | undefined; size?: number }) {
  const initials = getInitials(email)
  const sizeClass = size === 32 ? 'w-8 h-8' : size === 40 ? 'w-10 h-10' : 'w-8 h-8'
  const textSizeClass = size === 32 ? 'text-sm' : size === 40 ? 'text-base' : 'text-sm'
  
  return (
    <div className={`${sizeClass} rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold ${textSizeClass}`}>
      {initials}
    </div>
  )
}

export default function DropdownProfile() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
      setLoading(false)
    }

    fetchUser()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user?.email || null)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    )
  }

  return (
    <div className="inline-flex justify-center items-center">
        <Avatar email={userEmail} size={32} />
        </div>
  )
}
