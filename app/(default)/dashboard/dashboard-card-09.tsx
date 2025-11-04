'use client'

import { useState, useEffect } from 'react'
import { useAppProvider } from '@/app/app-provider'
import { createClient } from '@/lib/supabase/client'
import MetricsChart from '@/components/charts/metrics-chart'
import { getCssVariable } from '@/components/utils/utils'
import { format, startOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'

interface PostItem {
  like_count?: number
  comment_count?: number
  view_count?: number
  video_view_count?: number
  play_count?: number
  taken_at?: number
}

type MetricType = 'views' | 'likes' | 'comments'

const metricOptions = [
  { id: 'views' as MetricType, label: 'Views' },
  { id: 'likes' as MetricType, label: 'Likes' },
  { id: 'comments' as MetricType, label: 'Comments' },
]

export default function DashboardCard09() {
  const { selectedAccount, dateRange } = useAppProvider()
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('views')
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [totalValue, setTotalValue] = useState<number>(0)
  const [changeValue, setChangeValue] = useState<number>(0)

  useEffect(() => {
    if (!selectedAccount || !dateRange?.from || !dateRange?.to) {
      setLoading(false)
      return
    }

    const fetchMetricsData = async () => {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('account')
          .select('postsdata')
          .eq('id', selectedAccount.id)
          .single()

        if (error) {
          console.error('Error fetching metrics data:', error)
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

        if (daysDiff <= 28) {
          intervals = eachDayOfInterval({ start: dateRange.from!, end: dateRange.to! })
        } else if (daysDiff <= 90) {
          intervals = eachWeekOfInterval({ start: dateRange.from!, end: dateRange.to! }, { weekStartsOn: 1 })
        } else {
          intervals = eachMonthOfInterval({ start: dateRange.from!, end: dateRange.to! })
        }

        // Calculate metric totals for each time period
        const metricsData: { date: Date; value: number }[] = []

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

          let total = 0

          periodItems.forEach((item) => {
            if (selectedMetric === 'views') {
              total += item.view_count || item.video_view_count || item.play_count || 0
            } else if (selectedMetric === 'likes') {
              total += item.like_count || 0
            } else if (selectedMetric === 'comments') {
              total += item.comment_count || 0
            }
          })

          metricsData.push({
            date: periodStart,
            value: total
          })
        }

        // Calculate total and change
        const allValues = metricsData.map(d => d.value)
        const total = allValues.reduce((sum, val) => sum + val, 0)

        const firstHalf = allValues.slice(0, Math.floor(allValues.length / 2))
        const secondHalf = allValues.slice(Math.floor(allValues.length / 2))
        const firstHalfTotal = firstHalf.reduce((sum, val) => sum + val, 0)
        const secondHalfTotal = secondHalf.reduce((sum, val) => sum + val, 0)
        const firstHalfAvg = firstHalf.length > 0 ? firstHalfTotal / firstHalf.length : 0
        const secondHalfAvg = secondHalf.length > 0 ? secondHalfTotal / secondHalf.length : 0
        const change = firstHalfAvg > 0 ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0

        setTotalValue(total)
        setChangeValue(change)

        // Prepare chart data
        const labels = metricsData.map(d => format(d.date, 'MM-dd-yyyy'))
        const values = metricsData.map(d => d.value)

        setChartData({
          labels,
          datasets: [
            {
              label: metricOptions.find(m => m.id === selectedMetric)?.label || 'Metric',
              data: values,
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
        console.error('Error calculating metrics data:', error)
        setChartData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMetricsData()
  }, [selectedAccount, dateRange, selectedMetric])

  if (loading) {
    return (
      <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Metrics Over Time</h2>
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
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Metrics Over Time</h2>
        </header>
        <div className="h-[248px] flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500">No data available</div>
        </div>
      </div>
    )
  }

  const selectedOption = metricOptions.find(m => m.id === selectedMetric) || metricOptions[0]

  return(
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Metrics Over Time</h2>
        <Menu as="div" className="relative inline-flex">
          {({ open }) => (
            <>
              <MenuButton className="btn min-w-[8rem] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100" aria-label="Select metric">
                <span className="flex items-center">
                  <span>{selectedOption.label}</span>
                </span>
                <svg className="shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" width="11" height="7" viewBox="0 0 11 7">
                  <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
                </svg>
              </MenuButton>
              <Transition
                as="div"
                className="z-10 absolute top-full right-0 min-w-[8rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1"
                enter="transition ease-out duration-100 transform"
                enterFrom="opacity-0 -translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-out duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <MenuItems className="font-medium text-sm text-gray-600 dark:text-gray-300 divide-y divide-gray-200 dark:divide-gray-700/60 focus:outline-hidden">
                  {metricOptions.map((option) => (
                    <MenuItem key={option.id}>
                      {({ active }) => (
                        <button
                          className={`flex items-center justify-between w-full py-2 px-3 cursor-pointer ${active ? 'bg-gray-50 dark:bg-gray-700/20' : ''} ${option.id === selectedMetric && 'text-violet-500'}`}
                          onClick={() => { setSelectedMetric(option.id) }}
                        >
                          <span>{option.label}</span>
                          <svg className={`shrink-0 mr-2 fill-current text-violet-500 ${option.id !== selectedMetric && 'invisible'}`} width="12" height="9" viewBox="0 0 12 9">
                            <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                          </svg>
                        </button>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Transition>
            </>
          )}
        </Menu>
      </header>
      <div className="px-5 py-3">
        <div className="flex items-start">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">{totalValue.toLocaleString()}</div>
          {changeValue !== 0 && (
            <div className={`text-sm font-medium px-1.5 rounded-full ${
              changeValue >= 0 
                ? 'text-green-700 bg-green-500/20' 
                : 'text-red-700 bg-red-500/20'
            }`}>
              {changeValue >= 0 ? '+' : ''}{changeValue}%
            </div>
          )}
        </div>
      </div>
      <div className="grow">
        <MetricsChart data={chartData} width={595} height={248} />
      </div>
    </div>
  )
}
