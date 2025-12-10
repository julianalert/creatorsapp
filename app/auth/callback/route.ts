import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { addContactAndTriggerSignup } from '@/lib/utils/loops'

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
      
      // Check if this is a new user (Google OAuth signup)
      // A user is considered "new" if they were created very recently (within 10 minutes)
      // This is reliable because OAuth callback happens immediately after user creation
      if (data.user && data.user.email) {
        const userCreatedAt = new Date(data.user.created_at)
        const now = new Date()
        const timeSinceCreation = now.getTime() - userCreatedAt.getTime()
        
        // Check if user was created very recently (within 10 minutes)
        // This window is large enough to be reliable but small enough to avoid false positives
        const isNewUser = timeSinceCreation < 600000 // 10 minutes threshold
        
        if (isNewUser) {
          console.log('Detected new OAuth user, adding to Loops.so:', {
            email: data.user.email,
            userId: data.user.id,
            created_at: data.user.created_at,
            timeSinceCreationSeconds: Math.round(timeSinceCreation / 1000),
            origin: origin, // Log the origin to debug redirect issues
          })
          
          // Add contact to Loops.so and trigger signedUp event
          // Do this asynchronously so it doesn't block the redirect
          addContactAndTriggerSignup(data.user.email, data.user.id)
            .then((result) => {
              if (result.success) {
                console.log('✅ Successfully added user to Loops.so:', data.user.email)
              } else {
                console.warn('⚠️ Failed to add user to Loops.so:', result.message)
              }
            })
            .catch((err) => {
              // Silently fail - don't interrupt user flow if Loops.so is down
              console.error('❌ Error adding contact to Loops.so:', err)
            })
        } else {
          console.log('Existing user (created', Math.round(timeSinceCreation / 1000 / 60), 'minutes ago), skipping Loops.so signup:', data.user.email)
        }
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

