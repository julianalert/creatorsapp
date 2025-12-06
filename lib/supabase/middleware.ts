import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/signin') || 
                     pathname.startsWith('/signup') || 
                     pathname.startsWith('/reset-password')
  const isNewPage = pathname.startsWith('/new')
  const isApiRoute = pathname.startsWith('/api/')
  const isAuthCallback = pathname.startsWith('/auth/')
  const isPublicPage = pathname === '/' || 
                       pathname === '/agents' || 
                       pathname.startsWith('/agent/') ||
                       pathname.startsWith('/outreach/templates')

  // Redirect unauthenticated users to signin (except auth pages and public routes)
  if (
    !user &&
    !isAuthPage &&
    !isApiRoute &&
    !isAuthCallback &&
    !isPublicPage
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  // Check if authenticated user has submitted a website
  const isOutreachTemplates = pathname.startsWith('/outreach/templates')
  const isAgentPage = pathname.startsWith('/agent/')
  if (user && !isAuthPage && !isApiRoute && !isAuthCallback && pathname !== '/' && !isPublicPage && !isOutreachTemplates && !isAgentPage) {
    // Check if user has a website in the database
    const { data: websites, error: websiteError } = await supabase
      .from('website')
      .select('id, url')
      .eq('user_id', user.id)
      .limit(1)

    // Only redirect if we're certain about the website status
    // If there's an error, don't redirect (fail open to avoid redirect loops)
    if (!websiteError && !isNewPage) {
      const hasWebsite = Boolean(websites && websites.length > 0 && websites[0]?.url)

      // If user is logged in but has no website, redirect to the new flow
      if (!hasWebsite) {
        const url = request.nextUrl.clone()
        url.pathname = '/new'
        const redirectResponse = NextResponse.redirect(url)
        // Copy cookies from supabaseResponse to maintain session
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return redirectResponse
      }
    } else if (websiteError) {
      // Log error but don't redirect (fail open)
      console.error('Website query error in middleware:', websiteError)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}

