'use client'

import { createContext, Dispatch, SetStateAction, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DateRange } from 'react-day-picker'
import { addDays, startOfDay, endOfDay, subDays } from 'date-fns'

interface Account {
  id: string
  platform: string
  url: string | null
  profiledata: any
}

interface ContextProps {
  sidebarOpen: boolean
  setSidebarOpen: Dispatch<SetStateAction<boolean>>
  sidebarExpanded: boolean
  setSidebarExpanded: Dispatch<SetStateAction<boolean>>
  selectedAccount: Account | null
  setSelectedAccount: Dispatch<SetStateAction<Account | null>>
  accounts: Account[]
  setAccounts: Dispatch<SetStateAction<Account[]>>
  dateRange: DateRange | undefined
  setDateRange: Dispatch<SetStateAction<DateRange | undefined>>
}

const AppContext = createContext<ContextProps>({
  sidebarOpen: false,
  setSidebarOpen: (): boolean => false,
  sidebarExpanded: false,
  setSidebarExpanded: (): boolean => false,
  selectedAccount: null,
  setSelectedAccount: (): void => {},
  accounts: [],
  setAccounts: (): void => {},
  dateRange: undefined,
  setDateRange: (): void => {}
})

export default function AppProvider({
  children,
}: {
  children: React.ReactNode
}) {  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 27)),
    to: endOfDay(new Date()),
  })

  useEffect(() => {
    fetchAccounts()
    
    // Set sidebar expanded based on screen size on mount
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        const isLargeScreen = window.innerWidth >= 1024 // lg breakpoint
        setSidebarExpanded(isLargeScreen)
      }
    }
    
    checkScreenSize()
  }, [])

  useEffect(() => {
    // Listen for resize events to update sidebar state on large screens
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024
      // Auto-expand on large screens when window is resized to large size
      if (isLargeScreen) {
        setSidebarExpanded(true)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchAccounts = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('account')
        .select('id, platform, url, profiledata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching accounts:', error)
        return
      }

      const fetchedAccounts = data || []
      setAccounts(fetchedAccounts)
      
      // If no account is selected, select the first one
      if (fetchedAccounts.length > 0) {
        const savedAccountId = localStorage.getItem('selectedAccountId')
        const accountToSelect = savedAccountId 
          ? fetchedAccounts.find(acc => acc.id === savedAccountId) || fetchedAccounts[0]
          : fetchedAccounts[0]
        setSelectedAccount(accountToSelect)
        localStorage.setItem('selectedAccountId', accountToSelect.id)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  return (
    <AppContext.Provider value={{ 
      sidebarOpen, 
      setSidebarOpen, 
      sidebarExpanded, 
      setSidebarExpanded,
      selectedAccount,
      setSelectedAccount,
      accounts,
      setAccounts,
      dateRange,
      setDateRange
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppProvider = () => useContext(AppContext)