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
  const errorCode = searchParams.get('error_code')
  const nextParam = searchParams.get('next') ?? '/'
  
  // Log all parameters for debugging
  console.log('OAuth callback received:', {
    hasCode: !!code,
    error,
    errorDescription,
    errorCode,
    next: nextParam,
    origin,
  })
  
  // Check for OAuth errors from the provider
  if (error) {
    console.error('OAuth error from provider:', { error, errorDescription, errorCode })
    // Redirect to signin with error message
    const signInUrl = new URL('/signin', origin)
    const errorMsg = errorDescription || error || 'OAuth authentication failed'
    signInUrl.searchParams.set('error', `${errorMsg}. Check Supabase Auth Logs for details.`)
    return NextResponse.redirect(signInUrl.toString())
  }
  
  // Validate redirect path to prevent open redirect attacks
  const next = isValidRedirectPath(nextParam) ? nextParam : '/'

  if (code) {
    try {
      console.log('Exchanging code for session...')
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', {
          message: exchangeError.message,
          status: exchangeError.status,
          name: exchangeError.name,
        })
        // Redirect to signin with error message
        const signInUrl = new URL('/signin', origin)
        const errorMsg = exchangeError.message || 'Authentication failed'
        signInUrl.searchParams.set('error', `${errorMsg}. Check Supabase Auth Logs (Logs → Auth Logs) for more details.`)
        return NextResponse.redirect(signInUrl.toString())
      }
      
      console.log('Session exchange successful, redirecting to:', next)
      
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
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred during authentication'
      signInUrl.searchParams.set('error', `${errorMsg}. Check browser console and Supabase Auth Logs.`)
      return NextResponse.redirect(signInUrl.toString())
    }
  }

  // No code provided - redirect to signin
  console.warn('OAuth callback received but no code parameter')
  const signInUrl = new URL('/signin', origin)
  signInUrl.searchParams.set('error', 'No authentication code provided. The OAuth flow may have been interrupted.')
  return NextResponse.redirect(signInUrl.toString())
}

