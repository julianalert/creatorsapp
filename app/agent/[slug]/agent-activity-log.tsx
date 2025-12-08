'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

type AgentActivityLogProps = {
  agentSlug: string
}

export default function AgentActivityLog({ agentSlug }: AgentActivityLogProps) {
  const searchParams = useSearchParams()
  const resultId = searchParams.get('resultId')
  
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [runTime, setRunTime] = useState<number>(0)
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch timing data from Supabase if resultId is present
  useEffect(() => {
    if (!resultId) {
      // If no resultId, fall back to live tracking via events
      return
    }

    const fetchTimingData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/agents/results?id=${resultId}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          const result = data.data
          if (result.started_at) {
            setStartTime(new Date(result.started_at))
          }
          if (result.ended_at) {
            setEndTime(new Date(result.ended_at))
            setIsRunning(false)
          }
          if (result.run_time_seconds !== null && result.run_time_seconds !== undefined) {
            setRunTime(result.run_time_seconds)
          }
        }
      } catch (error) {
        console.error('Error fetching timing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTimingData()
  }, [resultId])

  // Listen for agent start/stop events (for live tracking when no resultId)
  useEffect(() => {
    if (resultId) return // Don't listen to events if we have a resultId

    const handleAgentStart = () => {
      const now = new Date()
      setStartTime(now)
      setEndTime(null)
      setIsRunning(true)
      setRunTime(0)
    }

    const handleAgentStop = () => {
      const now = new Date()
      setEndTime(now)
      setIsRunning(false)
    }

    // Listen for custom events from AgentInterface
    window.addEventListener('agent:start', handleAgentStart)
    window.addEventListener('agent:stop', handleAgentStop)

    return () => {
      window.removeEventListener('agent:start', handleAgentStart)
      window.removeEventListener('agent:stop', handleAgentStop)
    }
  }, [resultId])

  // Update run time every second when agent is running (live tracking)
  useEffect(() => {
    if (resultId || !isRunning || !startTime) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
      setRunTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, startTime, resultId])

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Not started yet.'
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatRunTime = (seconds: number) => {
    if (seconds === 0) return 'Not started yet.'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
      <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-3">Activity log</div>
      {loading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500 dark:text-gray-400">Starting Time</dt>
            <dd className="text-gray-800 dark:text-gray-100 text-right">{formatDateTime(startTime)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500 dark:text-gray-400">Run Time</dt>
            <dd className="text-gray-800 dark:text-gray-100 text-right">{formatRunTime(runTime)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500 dark:text-gray-400">Ending Time</dt>
            <dd className="text-gray-800 dark:text-gray-100 text-right">{formatDateTime(endTime)}</dd>
          </div>
        </dl>
      )}
    </div>
  )
}

