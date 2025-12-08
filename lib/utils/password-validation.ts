/**
 * Password Validation Utilities
 * 
 * Provides password strength validation and requirements checking.
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
  score: number // 0-100
}

/**
 * Validates password strength and requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else {
    score += 20
  }

  // Maximum length check (prevent DoS)
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score += 20
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score += 20
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    score += 20
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)')
  } else {
    score += 20
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 80) {
    strength = 'strong'
  } else if (score >= 60) {
    strength = 'medium'
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  }
}

/**
 * Calculates password strength score (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0

  // Length scoring
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 5

  // Character variety
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[^a-zA-Z0-9]/.test(password)) score += 10

  // Bonus for longer passwords with variety
  if (password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
    score += 10
  }

  return Math.min(100, score)
}

/**
 * Gets password strength indicator color
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'strong':
      return 'text-green-500'
    case 'medium':
      return 'text-yellow-500'
    case 'weak':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

