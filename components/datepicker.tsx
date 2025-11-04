"use client"

import * as React from "react"
import { format, startOfDay, endOfDay, startOfMonth, startOfYear, subDays, subMonths } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAppProvider } from "@/app/app-provider"

type PeriodOption = {
  label: string
  value: string
  getRange: () => DateRange
}

export default function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { dateRange, setDateRange } = useAppProvider()
  const [selectedPeriod, setSelectedPeriod] = React.useState<string | null>("last-28-days")

  const today = new Date()
  const periods: PeriodOption[] = [
    {
      label: "Today",
      value: "today",
      getRange: () => ({
        from: startOfDay(today),
        to: endOfDay(today),
      }),
    },
    {
      label: "Yesterday",
      value: "yesterday",
      getRange: () => {
        const yesterday = subDays(today, 1)
        return {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        }
      },
    },
    {
      label: "Last 7 days",
      value: "last-7-days",
      getRange: () => ({
        from: startOfDay(subDays(today, 6)),
        to: endOfDay(today),
      }),
    },
    {
      label: "Last 14 days",
      value: "last-14-days",
      getRange: () => ({
        from: startOfDay(subDays(today, 13)),
        to: endOfDay(today),
      }),
    },
    {
      label: "Last 28 days",
      value: "last-28-days",
      getRange: () => ({
        from: startOfDay(subDays(today, 27)),
        to: endOfDay(today),
      }),
    },
    {
      label: "Month to date",
      value: "month-to-date",
      getRange: () => ({
        from: startOfMonth(today),
        to: endOfDay(today),
      }),
    },
    {
      label: "Last month",
      value: "last-month",
      getRange: () => {
        const firstDayLastMonth = startOfMonth(subMonths(today, 1))
        const lastDayLastMonth = endOfDay(subDays(startOfMonth(today), 1))
        return {
          from: firstDayLastMonth,
          to: lastDayLastMonth,
        }
      },
    },
    {
      label: "Year to date",
      value: "year-to-date",
      getRange: () => ({
        from: startOfYear(today),
        to: endOfDay(today),
      }),
    },
  ]

  // Sync selectedPeriod with dateRange when dateRange changes
  React.useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) {
      setSelectedPeriod(null)
      return
    }

    // Check if current dateRange matches any predefined period
    const matchingPeriod = periods.find(period => {
      const periodRange = period.getRange()
      if (!periodRange.from || !periodRange.to) return false
      
      // Compare dates (ignoring time) - we've already checked dateRange.from and dateRange.to exist
      const rangeFromStr = dateRange.from!.toDateString()
      const rangeToStr = dateRange.to!.toDateString()
      const periodFromStr = periodRange.from.toDateString()
      const periodToStr = periodRange.to.toDateString()
      
      return rangeFromStr === periodFromStr && rangeToStr === periodToStr
    })

    setSelectedPeriod(matchingPeriod?.value || null)
  }, [dateRange])

  const handlePeriodSelect = (period: PeriodOption) => {
    const range = period.getRange()
    setDateRange(range)
    setSelectedPeriod(period.value)
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    setSelectedPeriod(null) // Clear period selection when manually selecting dates
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            id="date"
            className={cn(
              "btn px-2.5 min-w-[15.5rem] bg-white border-gray-200 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600 dark:bg-gray-800 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 font-medium text-left justify-start cursor-pointer",
              !dateRange && "text-muted-foreground"
            )}
          >
            <svg className="fill-current text-gray-400 dark:text-gray-500 ml-1 mr-2" width="16" height="16" viewBox="0 0 16 16">
              <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"></path>
              <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z"></path>
            </svg>
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            {/* Period Selector */}
            <div className="border-r border-gray-200 dark:border-gray-700/60 p-3 w-[9rem] overflow-hidden">
              <div className="space-y-1">
                {periods.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => handlePeriodSelect(period)}
                    className={cn(
                      "w-full text-left px-2 py-2 text-sm rounded-md transition-colors cursor-pointer",
                      selectedPeriod === period.value
                        ? "bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30 hover:text-gray-900 dark:hover:text-gray-100"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Calendar */}
            <div className="relative overflow-hidden">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleCalendarSelect}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
