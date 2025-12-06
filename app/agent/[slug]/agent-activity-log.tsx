'use client'

import { useState, useEffect } from 'react'

type AgentActivityLogProps = {
  agentSlug: string
}

export default function AgentActivityLog({ agentSlug }: AgentActivityLogProps) {
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [runTime, setRunTime] = useState<number>(0)
  const [isRunning, setIsRunning] = useState(false)

  // Listen for agent start/stop events
  useEffect(() => {
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
  }, [])

  // Update run time every second when agent is running
  useEffect(() => {
    if (!isRunning || !startTime) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
      setRunTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, startTime])

  const formatTime = (date: Date | null) => {
    if (!date) return 'Not started yet.'
    return date.toLocaleTimeString('en-US', {
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
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500 dark:text-gray-400">Starting Time</dt>
          <dd className="text-gray-800 dark:text-gray-100 text-right">{formatTime(startTime)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500 dark:text-gray-400">Run Time</dt>
          <dd className="text-gray-800 dark:text-gray-100 text-right">{formatRunTime(runTime)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500 dark:text-gray-400">Ending Time</dt>
          <dd className="text-gray-800 dark:text-gray-100 text-right">{formatTime(endTime)}</dd>
        </div>
      </dl>
    </div>
  )
}

