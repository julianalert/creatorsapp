/**
 * URL Validation Utilities
 * 
 * Provides secure URL validation to prevent SSRF (Server-Side Request Forgery) attacks
 * by blocking access to private/internal network addresses.
 */

/**
 * Checks if a URL is safe to fetch (prevents SSRF attacks)
 * 
 * @param urlString - The URL string to validate
 * @param allowHttp - Whether to allow HTTP (default: false in production, true in dev)
 * @returns true if the URL is safe to fetch, false otherwise
 */
export function isSafeUrl(urlString: string, allowHttp?: boolean): boolean {
  try {
    const url = new URL(urlString)
    
    // Determine if HTTP should be allowed
    const isDevelopment = process.env.NODE_ENV === 'development'
    const shouldAllowHttp = allowHttp ?? isDevelopment
    
    // In production, only allow HTTPS
    if (!shouldAllowHttp && url.protocol !== 'https:') {
      return false
    }
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false
    }
    
    const hostname = url.hostname.toLowerCase()
    
    // Block private IP ranges and localhost
    const privatePatterns = [
      'localhost',
      '127.',
      '192.168.',
      '10.',
      '172.16.',
      '172.17.',
      '172.18.',
      '172.19.',
      '172.20.',
      '172.21.',
      '172.22.',
      '172.23.',
      '172.24.',
      '172.25.',
      '172.26.',
      '172.27.',
      '172.28.',
      '172.29.',
      '172.30.',
      '172.31.',
      '0.0.0.0',
      '[::1]',
      '::1',
    ]
    
    // Check for private IP patterns
    if (privatePatterns.some(pattern => hostname.includes(pattern))) {
      return false
    }
    
    // Block IPv4 private ranges more precisely
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const match = hostname.match(ipv4Regex)
    
    if (match) {
      const [, a, b, c, d] = match.map(Number)
      
      // 127.0.0.0/8 (loopback)
      if (a === 127) return false
      
      // 10.0.0.0/8 (private)
      if (a === 10) return false
      
      // 192.168.0.0/16 (private)
      if (a === 192 && b === 168) return false
      
      // 172.16.0.0/12 (private)
      if (a === 172 && b >= 16 && b <= 31) return false
      
      // 0.0.0.0/8 (invalid)
      if (a === 0) return false
      
      // 169.254.0.0/16 (link-local)
      if (a === 169 && b === 254) return false
    }
    
    // Block IPv6 localhost and private ranges
    if (hostname.startsWith('::') || hostname.startsWith('fc00:') || hostname.startsWith('fe80:')) {
      return false
    }
    
    // Block common internal hostnames
    const internalHostnames = [
      'internal',
      'intranet',
      'local',
      'localdomain',
    ]
    
    if (internalHostnames.some(host => hostname.includes(host))) {
      // Allow if it's a subdomain of a public domain (e.g., internal.example.com)
      const parts = hostname.split('.')
      if (parts.length <= 2) {
        return false
      }
    }
    
    return true
  } catch {
    // Invalid URL format
    return false
  }
}

/**
 * Validates and normalizes a URL string
 * 
 * @param urlString - The URL string to validate
 * @param allowHttp - Whether to allow HTTP
 * @returns The validated URL object, or null if invalid
 */
export function validateUrl(urlString: string, allowHttp?: boolean): URL | null {
  if (!urlString || typeof urlString !== 'string') {
    return null
  }
  
  if (!isSafeUrl(urlString, allowHttp)) {
    return null
  }
  
  try {
    return new URL(urlString)
  } catch {
    return null
  }
}

/**
 * Sanitizes a URL string by removing dangerous characters and validating it
 * 
 * @param urlString - The URL string to sanitize
 * @param allowHttp - Whether to allow HTTP
 * @returns The sanitized URL string, or null if invalid
 */
export function sanitizeUrl(urlString: string, allowHttp?: boolean): string | null {
  // Remove null bytes and other dangerous characters
  const cleaned = urlString.replace(/\0/g, '').trim()
  
  if (!cleaned) {
    return null
  }
  
  const url = validateUrl(cleaned, allowHttp)
  return url ? url.toString() : null
}

