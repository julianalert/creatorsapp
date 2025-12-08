/**
 * Account Lockout Utilities
 * 
 * Provides client-side tracking of failed login attempts.
 * Note: Supabase may have built-in lockout, but this provides additional client-side protection.
 */

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

interface LockoutData {
  attempts: number
  lockedUntil: number | null
}

const STORAGE_KEY = 'auth_lockout'

/**
 * Gets lockout data from localStorage
 */
function getLockoutData(): LockoutData {
  if (typeof window === 'undefined') {
    return { attempts: 0, lockedUntil: null }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { attempts: 0, lockedUntil: null }
    }

    const data = JSON.parse(stored) as LockoutData
    
    // Check if lockout has expired
    if (data.lockedUntil && data.lockedUntil < Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return { attempts: 0, lockedUntil: null }
    }

    return data
  } catch {
    return { attempts: 0, lockedUntil: null }
  }
}

/**
 * Saves lockout data to localStorage
 */
function saveLockoutData(data: LockoutData): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Records a failed login attempt
 */
export function recordFailedAttempt(): { isLocked: boolean; remainingAttempts: number; lockoutUntil: number | null } {
  const data = getLockoutData()

  // If already locked, return lockout info
  if (data.lockedUntil && data.lockedUntil > Date.now()) {
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutUntil: data.lockedUntil,
    }
  }

  // Increment attempts
  const newAttempts = data.attempts + 1
  let lockedUntil: number | null = null

  // Lock account if max attempts reached
  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    lockedUntil = Date.now() + LOCKOUT_DURATION_MS
  }

  saveLockoutData({
    attempts: newAttempts,
    lockedUntil,
  })

  return {
    isLocked: lockedUntil !== null,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts),
    lockoutUntil: lockedUntil,
  }
}

/**
 * Clears failed attempts (on successful login)
 */
export function clearFailedAttempts(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}

/**
 * Checks if account is currently locked
 */
export function isAccountLocked(): boolean {
  const data = getLockoutData()
  return data.lockedUntil !== null && data.lockedUntil > Date.now()
}

/**
 * Gets remaining lockout time in seconds
 */
export function getRemainingLockoutTime(): number {
  const data = getLockoutData()
  if (!data.lockedUntil || data.lockedUntil <= Date.now()) {
    return 0
  }

  return Math.ceil((data.lockedUntil - Date.now()) / 1000)
}

