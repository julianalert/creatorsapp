const getRedirectUrl = (path: string) => {
  // Use environment variable if set, otherwise fall back to window.location.origin
  if (typeof window !== 'undefined') {
    // Client-side: prioritize current origin to avoid redirect issues in development
    // Only use env var if we're explicitly in production
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    const baseUrl = (isProduction && process.env.NEXT_PUBLIC_APP_URL) 
      ? process.env.NEXT_PUBLIC_APP_URL.trim() 
      : window.location.origin
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


