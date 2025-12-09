'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type AgentRatingProps = {
  agentId: string
}

function StarIcon({ filled, onClick, onMouseEnter, onMouseLeave, clickable = true }: { 
  filled: boolean
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  clickable?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`focus:outline-none ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className="sr-only">{filled ? 'Filled star' : 'Empty star'}</span>
      <svg
        className={`w-5 h-5 transition-colors ${
          filled
            ? 'fill-current text-yellow-500'
            : 'fill-current text-gray-300 dark:text-gray-600'
        }`}
        viewBox="0 0 16 16"
      >
        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
      </svg>
    </button>
  )
}

export default function AgentRating({ agentId }: AgentRatingProps) {
  const [userRating, setUserRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [averageRating, setAverageRating] = useState<number>(0)
  const [ratingCount, setRatingCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)

      // Fetch agent stats
      const { data: agent } = await supabase
        .from('agents')
        .select('rating_average, rating_count')
        .eq('id', agentId)
        .single()

      if (agent) {
        setAverageRating(Number(agent.rating_average) || 0)
        setRatingCount(agent.rating_count || 0)
      }

      // Fetch user's rating if authenticated
      if (user) {
        const { data: rating } = await supabase
          .from('agent_ratings')
          .select('rating')
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .maybeSingle()

        if (rating) {
          setUserRating(rating.rating)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [agentId])

  const handleStarClick = async (rating: number) => {
    if (!isAuthenticated || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/agents/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          rating,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUserRating(rating)
        if (data.agentStats) {
          setAverageRating(Number(data.agentStats.rating_average) || 0)
          setRatingCount(data.agentStats.rating_count || 0)
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const displayRating = hoveredRating !== null ? hoveredRating : (userRating || Math.round(averageRating))

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
      <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-3">
        Rate this agent
      </div>
      
      {/* Stars and Rating stats */}
      <div className="flex items-center space-x-3">
        {/* Stars */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= displayRating}
              clickable={isAuthenticated}
              onClick={() => isAuthenticated && handleStarClick(star)}
              onMouseEnter={() => isAuthenticated && setHoveredRating(star)}
              onMouseLeave={() => isAuthenticated && setHoveredRating(null)}
            />
          ))}
        </div>

        {/* Rating stats */}
        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
          {averageRating > 0 ? (
            <>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {averageRating.toFixed(1)}
              </span>
              <span>·</span>
              <span>{ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}</span>
            </>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
      </div>

      {!isAuthenticated && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Sign in to rate this agent
        </p>
      )}

      {userRating && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          You rated this {userRating} {userRating === 1 ? 'star' : 'stars'}
        </p>
      )}
    </div>
  )
}

