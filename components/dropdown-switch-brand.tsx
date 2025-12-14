'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Brand {
  id: string
  domain: string
  name: string | null
  brand_profile: any
}

export default function DropdownSwitchBrand({ align }: {
  align?: 'left' | 'right'
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    fetchBrands()
    
    // Listen for brand changes
    const handleBrandChanged = () => {
      fetchBrands()
    }
    window.addEventListener('brandAdded', handleBrandChanged)
    
    return () => {
      window.removeEventListener('brandAdded', handleBrandChanged)
    }
  }, [])

  const fetchBrands = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('brands')
        .select('id, domain, name, brand_profile')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching brands:', error)
        setLoading(false)
        return
      }

      const fetchedBrands = data || []
      setBrands(fetchedBrands)

      if (fetchedBrands.length > 0) {
        const savedBrandId = localStorage.getItem('selectedBrandId')
        const brandToSelect = savedBrandId
          ? fetchedBrands.find(brand => brand.id === savedBrandId) || fetchedBrands[0]
          : fetchedBrands[0]
        setSelectedBrand(brandToSelect)
        localStorage.setItem('selectedBrandId', brandToSelect.id)
      } else {
        setSelectedBrand(null)
        localStorage.removeItem('selectedBrandId')
        
        // Redirect to /new if user has no brands and is not already on /new or auth pages
        if (user && !hasChecked) {
          setHasChecked(true)
          const isNewPage = pathname === '/new'
          const isAuthPage = pathname.startsWith('/signin') || 
                           pathname.startsWith('/signup') || 
                           pathname.startsWith('/reset-password')
          
          // Redirect authenticated users without brands to /new (even on public pages)
          // Only skip redirect if already on /new or auth pages
          if (!isNewPage && !isAuthPage) {
            router.push('/new')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand)
    localStorage.setItem('selectedBrandId', brand.id)
    // Trigger a custom event so other components can react to brand changes
    window.dispatchEvent(new CustomEvent('brandChanged', { detail: brand }))
  }

  const getBrandDisplayName = (brand: Brand): string => {
    return brand.name || brand.domain
  }

  const getBrandInitial = (brand: Brand): string => {
    const display = getBrandDisplayName(brand)
    return display.charAt(0).toUpperCase()
  }

  if (loading) {
    return null
  }

  if (brands.length === 0) {
    return (
      <Link
        href="/new"
        className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
      >
        Add Brand
      </Link>
    )
  }

  return (
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="inline-flex justify-center items-center group cursor-pointer">
        <div className="flex items-center truncate">
          {selectedBrand && (
            <>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                <span className="text-white text-xs font-semibold">
                  {getBrandInitial(selectedBrand)}
                </span>
              </div>
              <span className="truncate text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
                {getBrandDisplayName(selectedBrand)}
              </span>
              <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
              </svg>
            </>
          )}
        </div>
      </MenuButton>
      <Transition
        as="div"
        className={`origin-top-left z-10 absolute top-full min-w-[14rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase pt-1.5 pb-2 px-4">Switch Brand</div>
        <MenuItems as="ul" className="focus:outline-hidden max-h-64 overflow-y-auto">
          {brands.map((brand) => (
            <MenuItem key={brand.id} as="li">
              {({ active }) => (
                <button
                  onClick={() => handleSelectBrand(brand)}
                  className={`w-full flex items-center py-2 px-4 cursor-pointer ${
                    active && 'bg-gray-50 dark:bg-gray-700/20'
                  } ${selectedBrand?.id === brand.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-semibold">
                      {getBrandInitial(brand)}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {getBrandDisplayName(brand)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                      {brand.domain}
                    </div>
                  </div>
                  {selectedBrand?.id === brand.id && (
                    <svg className="w-4 h-4 fill-current text-blue-500" viewBox="0 0 12 12">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
        <div className="border-t border-gray-200 dark:border-gray-700/60 pt-1.5">
          <MenuItem as="li">
            {({ active }) => (
              <Link
                href="/new"
                className={`w-full flex items-center py-2 px-4 cursor-pointer ${
                  active && 'bg-gray-50 dark:bg-gray-700/20'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 fill-current text-gray-500 dark:text-gray-400" viewBox="0 0 12 12">
                    <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  Add New Brand
                </div>
              </Link>
            )}
          </MenuItem>
        </div>
      </Transition>
    </Menu>
  )
}

