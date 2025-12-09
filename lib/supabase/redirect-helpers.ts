const getRedirectUrl = (path: string) => {
  // Use environment variable if set, otherwise fall back to window.location.origin
  if (typeof window !== 'undefined') {
    // Client-side: use env var or current origin (works for both localhost and production)
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).trim()
    return `${baseUrl}${path}`
  }
  // Server-side: use env var or detect from NODE_ENV
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL.trim()}${path}`
  }
  // Fallback: if in development, use localhost (though this shouldn't happen client-side)
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3000${path}`
  }
  // Production fallback
  return `https://yuzuu.co${path}`
}

export { getRedirectUrl }


