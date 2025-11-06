'use client'

import { useState, useEffect } from 'react'
import { useAppProvider } from '@/app/app-provider'
import { createClient } from '@/lib/supabase/client'
import { startOfDay, eachDayOfInterval, format, getDay, subDays } from 'date-fns'
import { HiInformationCircle } from 'react-icons/hi2'
import { HiFire } from 'react-icons/hi'

interface PostItem {
  taken_at?: number
}

interface DayActivity {
  date: Date
  count: number
}

export default function DashboardCard10() {
  const { selectedAccount } = useAppProvider()
  const [activityData, setActivityData] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState<number>(0)
  const [maxCount, setMaxCount] = useState<number>(0)

  useEffect(() => {
    if (!selectedAccount) {
      setLoading(false)
      return
    }

    const fetchPostingActivity = async () => {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('account')
          .select('postsdata')
          .eq('id', selectedAccount.id)
          .single()

        if (error) {
          console.error('Error fetching posting activity:', error)
          setLoading(false)
          return
        }

        const postsData = data.postsdata || (data as any).postsData || null
        
        if (!postsData || !postsData.items || !Array.isArray(postsData.items)) {
          setActivityData(new Map())
          setLoading(false)
          return
        }

        const items: PostItem[] = postsData.items

        // Get date range: last 52 weeks (364 days)
        const today = startOfDay(new Date())
        const startDate = subDays(today, 364)
        const dateRange = eachDayOfInterval({ start: startDate, end: today })

        // Count posts per day
        const activityMap = new Map<string, number>()
        let maxPostCount = 0

        items.forEach((item) => {
          if (!item.taken_at) return
          const itemDate = startOfDay(new Date(item.taken_at * 1000))
          const dateKey = format(itemDate, 'yyyy-MM-dd')
          
          // Only count posts within our date range
          if (itemDate >= startDate && itemDate <= today) {
            const currentCount = activityMap.get(dateKey) || 0
            const newCount = currentCount + 1
            activityMap.set(dateKey, newCount)
            maxPostCount = Math.max(maxPostCount, newCount)
          }
        })

        // Calculate streak (consecutive days with at least 1 post)
        let currentStreak = 0
        let checkDate = today
        let foundGap = false

        while (!foundGap && checkDate >= startDate) {
          const dateKey = format(checkDate, 'yyyy-MM-dd')
          const count = activityMap.get(dateKey) || 0
          
          if (count > 0) {
            currentStreak++
            checkDate = subDays(checkDate, 1)
          } else {
            foundGap = true
          }
        }

        setActivityData(activityMap)
        setMaxCount(maxPostCount)
        setStreak(currentStreak)

      } catch (error) {
        console.error('Error calculating posting activity:', error)
        setActivityData(new Map())
      } finally {
        setLoading(false)
      }
    }

    fetchPostingActivity()
  }, [selectedAccount])

  // Generate grid data: 7 rows (days of week) x 52 columns (weeks)
  const generateGrid = () => {
    const today = startOfDay(new Date())
    
    // Find the Monday of the current week
    const todayDayOfWeek = getDay(today) // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1
    const thisMonday = subDays(today, daysToMonday)
    
    // Calculate the Monday 52 weeks ago
    const firstMonday = subDays(thisMonday, 51 * 7)
    
    const grid: (DayActivity | null)[][] = []
    
    // Initialize grid: 7 rows (days of week) x 52 columns (weeks)
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      grid[dayOfWeek] = []
      for (let week = 0; week < 52; week++) {
        grid[dayOfWeek][week] = null
      }
    }

    // Fill grid: iterate through all days from firstMonday for 52 weeks (364 days)
    let currentDate = new Date(firstMonday)
    
    // Fill exactly 52 weeks worth of days
    for (let week = 0; week < 52; week++) {
      // Fill each week (Monday through Sunday)
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dayOfWeekActual = getDay(currentDate) // 0 = Sunday, 1 = Monday, etc.
        // Adjust to Monday = 0, Sunday = 6
        const adjustedDay = dayOfWeekActual === 0 ? 6 : dayOfWeekActual - 1
        
        const dateKey = format(currentDate, 'yyyy-MM-dd')
        const count = activityData.get(dateKey) || 0
        
        // Always set the cell, even if count is 0 (to show days with no posts)
        grid[adjustedDay][week] = {
          date: new Date(currentDate),
          count: count
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    return grid
  }

  // Get color intensity based on post count
  const getColorIntensity = (count: number): string => {
    // Always show a visible square, even for 0 posts
    if (count === 0) {
      return 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
    }
    
    // Use quartiles for better distribution (similar to GitHub)
    if (maxCount === 0) return 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
    
    const quartile1 = Math.ceil(maxCount * 0.25)
    const quartile2 = Math.ceil(maxCount * 0.5)
    const quartile3 = Math.ceil(maxCount * 0.75)
    
    // Vibrant fuchsia/purple with decreasing opacity for lower activity
    // Use the same vibrant color but with different opacity levels
    if (count <= quartile1) {
      return 'bg-fuchsia-500/20 dark:bg-fuchsia-400/20'      // Level 1 - lowest opacity
    } else if (count <= quartile2) {
      return 'bg-fuchsia-500/40 dark:bg-fuchsia-400/40'      // Level 2
    } else if (count <= quartile3) {
      return 'bg-fuchsia-500/60 dark:bg-fuchsia-400/60'      // Level 3
    } else {
      return 'bg-fuchsia-500 dark:bg-fuchsia-400'            // Level 4 - full intensity
    }
  }

  const grid = generateGrid()
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  if (loading) {
    return (
      <div className="flex flex-col col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Posting activity</h2>
        </header>
        <div className="px-5 py-6">
          <div className="animate-pulse text-gray-400 dark:text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Posting activity</h2>
            <HiInformationCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-lg shrink-0">
              <HiFire className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                You are on a {streak} day streak
              </span>
            </div>
          )}
        </div>
      </header>
      
      <div className="px-4 sm:px-5 py-4 sm:py-6">
        <div className="flex gap-2 sm:gap-3 items-start w-full overflow-x-auto">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pt-2 pr-2 shrink-0">
            {dayLabels.map((label, idx) => (
              <div
                key={idx}
                className="text-xs text-gray-500 dark:text-gray-400 flex items-center"
                style={{ height: '10px' }}
              >
                {idx % 2 === 0 ? label : ''}
              </div>
            ))}
          </div>
          
          {/* Activity grid - full width and responsive */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex gap-1">
              {Array.from({ length: 52 }).map((_, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1 shrink-0">
                  {Array.from({ length: 7 }).map((_, rowIdx) => {
                    const cell = grid[rowIdx]?.[colIdx]
                    // Always show a square, even if cell is null - default to 0 posts
                    const count = cell ? (cell.count ?? 0) : 0
                    const cellDate = cell?.date
                    const today = startOfDay(new Date())
                    const isToday = cellDate && format(cellDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                    const isFuture = cellDate && cellDate > today
                    
                    // Always render a square - never skip rendering
                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className={`w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-sm shrink-0 ${getColorIntensity(count)} ${
                          isToday ? 'ring-2 ring-gray-400 dark:ring-gray-500 ring-offset-1 dark:ring-offset-gray-800' : ''
                        } ${isFuture ? 'opacity-30' : ''}`}
                        style={{ minWidth: '10px', minHeight: '10px', display: 'block' }}
                        title={cellDate ? `${format(cellDate, 'MMM d, yyyy')}: ${count} post${count !== 1 ? 's' : ''}` : 'No data'}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400">Fewer Posts</span>
          <div className="flex gap-1">
            <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-sm bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
            <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-sm bg-fuchsia-500/20 dark:bg-fuchsia-400/20" />
            <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-sm bg-fuchsia-500/40 dark:bg-fuchsia-400/40" />
            <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-sm bg-fuchsia-500/60 dark:bg-fuchsia-400/60" />
            <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-sm bg-fuchsia-500 dark:bg-fuchsia-400" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">More Posts</span>
        </div>
      </div>
    </div>
  )
}
