'use client'

import { useAccountMetrics } from '@/components/utils/use-account-metrics'
import { HiChartBar } from 'react-icons/hi2'

export default function DashboardCard05() {
  const { metrics, loading } = useAccountMetrics()

  if (loading || !metrics) {
    return (
      <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <div className="px-5 pt-5 pb-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </div>
    )
  }

  return(
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <div className="px-5 pt-5 pb-5">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/20 mr-4">
            <HiChartBar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Engagement rate</div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{metrics.engagementRate.toFixed(2)}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
