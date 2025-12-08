/**
 * Structured Logging Utility
 * 
 * Provides consistent, structured logging for security events and application monitoring.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'security'

interface LogContext {
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  [key: string]: unknown
}

/**
 * Structured logger for security and application events
 */
export class Logger {
  /**
   * Log a security event (failed auth, rate limit, etc.)
   */
  static security(
    message: string,
    context: LogContext = {},
    level: 'warn' | 'error' = 'warn'
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'security',
      severity: level,
      message,
      ...context,
    }

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with logging service (Sentry, LogRocket, etc.)
      console.error(JSON.stringify(logEntry))
    } else {
      console.warn(`[SECURITY ${level.toUpperCase()}]`, logEntry)
    }

    return logEntry
  }

  /**
   * Log an error with context
   */
  static error(message: string, error?: Error, context: LogContext = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          }
        : undefined,
      ...context,
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify(logEntry))
    } else {
      console.error('[ERROR]', logEntry)
    }

    return logEntry
  }

  /**
   * Log an info message
   */
  static info(message: string, context: LogContext = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...context,
    }

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry))
    } else {
      console.log('[INFO]', logEntry)
    }

    return logEntry
  }

  /**
   * Log a warning
   */
  static warn(message: string, context: LogContext = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      ...context,
    }

    if (process.env.NODE_ENV === 'production') {
      console.warn(JSON.stringify(logEntry))
    } else {
      console.warn('[WARN]', logEntry)
    }

    return logEntry
  }

  /**
   * Log API request
   */
  static apiRequest(
    method: string,
    endpoint: string,
    context: LogContext = {}
  ) {
    return this.info(`API ${method} ${endpoint}`, {
      type: 'api_request',
      method,
      endpoint,
      ...context,
    })
  }

  /**
   * Log failed authentication attempt
   */
  static failedAuth(endpoint: string, ip?: string, userAgent?: string) {
    return this.security('Failed authentication attempt', {
      type: 'auth_failure',
      endpoint,
      ip,
      userAgent,
    })
  }

  /**
   * Log rate limit violation
   */
  static rateLimitExceeded(
    userId: string,
    endpoint: string,
    ip?: string
  ) {
    return this.security('Rate limit exceeded', {
      type: 'rate_limit',
      userId,
      endpoint,
      ip,
    })
  }

  /**
   * Log credit operation
   */
  static creditOperation(
    userId: string,
    operation: 'add' | 'deduct' | 'refund',
    amount: number,
    context: LogContext = {}
  ) {
    return this.info(`Credit ${operation}`, {
      type: 'credit_operation',
      userId,
      operation,
      amount,
      ...context,
    })
  }

  /**
   * Log payment operation
   */
  static paymentOperation(
    userId: string,
    operation: string,
    amount?: number,
    context: LogContext = {}
  ) {
    return this.info(`Payment ${operation}`, {
      type: 'payment_operation',
      userId,
      operation,
      amount,
      ...context,
    })
  }
}

