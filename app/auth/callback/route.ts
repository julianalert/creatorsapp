import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Validates that a redirect path is safe (relative path only)
 * Prevents open redirect vulnerabilities
 */
function isValidRedirectPath(path: string): boolean {
  // Only allow relative paths that start with /
  // Reject paths starting with // (protocol-relative URLs)
  // Reject paths with : (could be protocol like http:)
  if (!path.startsWith('/') || path.startsWith('//') || path.includes(':')) {
    return false
  }
  
  // Additional check: ensure it's not trying to escape with ../../
  // Normalize and check
  try {
    const normalized = new URL(path, 'http://example.com').pathname
    return normalized.startsWith('/') && !normalized.includes('..')
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const nextParam = searchParams.get('next') ?? '/'
  
  // Check for OAuth errors from the provider
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    // Redirect to signin with error message
    const signInUrl = new URL('/signin', origin)
    signInUrl.searchParams.set('error', errorDescription || error)
    return NextResponse.redirect(signInUrl.toString())
  }
  
  // Validate redirect path to prevent open redirect attacks
  const next = isValidRedirectPath(nextParam) ? nextParam : '/'

  if (code) {
    try {
      const supabase = await createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        // Redirect to signin with error message
        const signInUrl = new URL('/signin', origin)
        signInUrl.searchParams.set('error', exchangeError.message || 'Authentication failed')
        return NextResponse.redirect(signInUrl.toString())
      }
      
      // Success - redirect to the next page
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (err) {
      console.error('Unexpected error in callback:', err)
      const signInUrl = new URL('/signin', origin)
      signInUrl.searchParams.set('error', 'An unexpected error occurred during authentication')
      return NextResponse.redirect(signInUrl.toString())
    }
  }

  // No code provided - redirect to signin
  const signInUrl = new URL('/signin', origin)
  signInUrl.searchParams.set('error', 'No authentication code provided')
  return NextResponse.redirect(signInUrl.toString())
}

