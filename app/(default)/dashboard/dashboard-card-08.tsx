'use client'

import { useState, useEffect } from 'react'
import { useAppProvider } from '@/app/app-provider'
import { createClient } from '@/lib/supabase/client'
import EngagementChart from '@/components/charts/engagement-chart'
import { getCssVariable } from '@/components/utils/utils'
import { format, startOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, addDays } from 'date-fns'

interface PostItem {
  like_count?: number
  comment_count?: number
  view_count?: number
  video_view_count?: number
  play_count?: number
  taken_at?: number
}

export default function DashboardCard08() {
  const { selectedAccount, dateRange } = useAppProvider()
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [averageEngagement, setAverageEngagement] = useState<number>(0)
  const [engagementChange, setEngagementChange] = useState<number>(0)

  useEffect(() => {
    if (!selectedAccount || !dateRange?.from || !dateRange?.to) {
      setLoading(false)
      return
    }

    const fetchEngagementData = async () => {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('account')
          .select('postsdata')
          .eq('id', selectedAccount.id)
          .single()

        if (error) {
          console.error('Error fetching engagement data:', error)
          setLoading(false)
          return
        }

        const postsData = data.postsdata || (data as any).postsData || null
        
        if (!postsData || !postsData.items || !Array.isArray(postsData.items)) {
          setChartData(null)
          setLoading(false)
          return
        }

        const items: PostItem[] = postsData.items

        // Filter items by date range
        const filteredItems = items.filter((item) => {
          if (!item.taken_at) return false
          const itemDate = new Date(item.taken_at * 1000)
          return itemDate >= dateRange.from! && itemDate <= dateRange.to!
        })

        // Determine time unit based on date range span
        const daysDiff = Math.ceil((dateRange.to!.getTime() - dateRange.from!.getTime()) / (1000 * 60 * 60 * 24))
        let intervals: Date[] = []
        let timeUnit: 'day' | 'week' | 'month' = 'day'

        if (daysDiff <= 28) {
          // Daily grouping for up to 28 days
          intervals = eachDayOfInterval({ start: dateRange.from!, end: dateRange.to! })
          timeUnit = 'day'
        } else if (daysDiff <= 90) {
          // Weekly grouping for 29-90 days
          intervals = eachWeekOfInterval({ start: dateRange.from!, end: dateRange.to! }, { weekStartsOn: 1 })
          timeUnit = 'week'
        } else {
          // Monthly grouping for more than 90 days
          intervals = eachMonthOfInterval({ start: dateRange.from!, end: dateRange.to! })
          timeUnit = 'month'
        }

        // Calculate engagement rate for each time period
        const engagementData: { date: Date; engagement: number }[] = []

        for (let i = 0; i < intervals.length; i++) {
          const periodStart = startOfDay(intervals[i])
          const periodEnd = i < intervals.length - 1 
            ? startOfDay(intervals[i + 1])
            : dateRange.to!

          const periodItems = filteredItems.filter((item) => {
            if (!item.taken_at) return false
            const itemDate = new Date(item.taken_at * 1000)
            return itemDate >= periodStart && itemDate < periodEnd
          })

          let totalLikes = 0
          let totalComments = 0
          let totalViews = 0

          periodItems.forEach((item) => {
            totalLikes += item.like_count || 0
            totalComments += item.comment_count || 0
            const views = item.view_count || item.video_view_count || item.play_count || 0
            totalViews += views
          })

          const engagementRate = totalViews > 0 
            ? ((totalLikes + 3 * totalComments) / totalViews) * 100 
            : 0

          engagementData.push({
            date: periodStart,
            engagement: Math.round(engagementRate * 100) / 100
          })
        }

        // Calculate average engagement and change
        const allEngagement = engagementData.map(d => d.engagement)
        const avgEngagement = allEngagement.length > 0
          ? allEngagement.reduce((sum, val) => sum + val, 0) / allEngagement.length
          : 0

        const firstHalf = allEngagement.slice(0, Math.floor(allEngagement.length / 2))
        const secondHalf = allEngagement.slice(Math.floor(allEngagement.length / 2))
        const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length : 0
        const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length : 0
        const change = firstHalfAvg > 0 ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0

        setAverageEngagement(Math.round(avgEngagement * 100) / 100)
        setEngagementChange(change)

        // Prepare chart data - format dates as MM-DD-YYYY for Chart.js time parser
        const labels = engagementData.map(d => format(d.date, 'MM-dd-yyyy'))
        const engagementValues = engagementData.map(d => d.engagement)

        setChartData({
          labels,
          datasets: [
            {
              label: 'Engagement Rate',
              data: engagementValues,
              borderColor: getCssVariable('--color-violet-500'),
              fill: false,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 3,
              pointBackgroundColor: getCssVariable('--color-violet-500'),
              pointHoverBackgroundColor: getCssVariable('--color-violet-500'),
              pointBorderWidth: 0,
              pointHoverBorderWidth: 0,
              clip: 20,
              tension: 0.2,
            },
          ],
        })

      } catch (error) {
        console.error('Error calculating engagement data:', error)
        setChartData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchEngagementData()
  }, [selectedAccount, dateRange])

  if (loading) {
    return (
      <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Engagement Rate Through Time</h2>
        </header>
        <div className="h-[248px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400 dark:text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Engagement Rate Through Time</h2>
        </header>
        <div className="h-[248px] flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500">No data available</div>
        </div>
      </div>
    )
  }

  return(
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Engagement Rate Through Time</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <div className="px-5 py-3">
        <div className="flex flex-wrap justify-between items-end gap-y-2 gap-x-4">
          <div className="flex items-start">
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">{averageEngagement.toFixed(2)}%</div>
            {engagementChange !== 0 && (
              <div className={`text-sm font-medium px-1.5 rounded-full ${
                engagementChange >= 0 
                  ? 'text-green-700 bg-green-500/20' 
                  : 'text-red-700 bg-red-500/20'
              }`}>
                {engagementChange >= 0 ? '+' : ''}{engagementChange}%
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grow">
        <EngagementChart data={chartData} width={595} height={248} />
      </div>
    </div>
  )
}
