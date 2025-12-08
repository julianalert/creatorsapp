import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Health Check Endpoint
 * 
 * Returns the health status of the application and its dependencies.
 * Used for monitoring and load balancer health checks.
 */
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown' as 'ok' | 'degraded' | 'down' | 'unknown',
      api: 'ok' as 'ok' | 'degraded' | 'down',
    },
  }

  // Check database connectivity
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('agents').select('id').limit(1)
    
    if (error) {
      health.services.database = 'degraded'
      health.status = 'degraded'
    } else {
      health.services.database = 'ok'
    }
  } catch (error) {
    health.services.database = 'down'
    health.status = 'down'
  }

  // Determine overall status code
  const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}

