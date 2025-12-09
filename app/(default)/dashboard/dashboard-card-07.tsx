'use client'

import { useState, useEffect } from 'react'
import { useAppProvider } from '@/app/app-provider'
import { createClient } from '@/lib/supabase/client'
import { HiVideoCamera } from 'react-icons/hi2'
import Image from 'next/image'

interface VideoItem {
  id?: string
  code?: string
  caption?: string | object
  like_count?: number
  comment_count?: number
  view_count?: number
  video_view_count?: number
  play_count?: number
  taken_at?: number
  image_versions2?: any
  thumbnail_url?: string
  display_url?: string
  image_url?: string
  carousel_media?: any[]
}

export default function DashboardCard07() {
  const { selectedAccount, dateRange } = useAppProvider()
  const [topVideos, setTopVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!selectedAccount) {
      setLoading(false)
      return
    }

    const fetchTopVideos = async () => {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('account')
          .select('postsdata')
          .eq('id', selectedAccount.id)
          .single()

        if (error) {
          console.error('Error fetching top videos:', error)
          setLoading(false)
          return
        }

        const postsData = data.postsdata || (data as any).postsData || null
        
        if (!postsData || !postsData.items || !Array.isArray(postsData.items)) {
          setTopVideos([])
          setLoading(false)
          return
        }

        const items: VideoItem[] = postsData.items

        // Filter items by date range if dateRange is set
        const filteredItems = dateRange?.from && dateRange?.to
          ? items.filter((item) => {
              if (!item.taken_at) return false
              // Convert Unix timestamp to Date (taken_at is typically in seconds)
              const itemDate = new Date(item.taken_at * 1000)
              const fromDate = dateRange.from!
              const toDate = dateRange.to!
              return itemDate >= fromDate && itemDate <= toDate
            })
          : items

        // Filter for videos/reels (media_type 2 or 8, or items with views)
        const videos = filteredItems
          .filter(item => {
            const views = item.view_count || item.video_view_count || item.play_count || 0
            return views > 0
          })
          .map(item => ({
            ...item,
            views: item.view_count || item.video_view_count || item.play_count || 0,
            likes: item.like_count || 0,
            comments: item.comment_count || 0,
            engagement: ((item.like_count || 0) + 3 * (item.comment_count || 0)) / 
                       Math.max(item.view_count || item.video_view_count || item.play_count || 1, 1) * 100
          }))
          .sort((a, b) => (b as any).views - (a as any).views)
          .slice(0, 5) // Top 5 videos

        setTopVideos(videos)
      } catch (error) {
        console.error('Error calculating top videos:', error)
        setTopVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchTopVideos()
  }, [selectedAccount, dateRange])

  const getVideoTitle = (video: VideoItem) => {
    // Handle caption - it might be a string or an object
    let captionText = ''
    if (video.caption) {
      if (typeof video.caption === 'string') {
        captionText = video.caption
      } else if (typeof video.caption === 'object' && video.caption !== null) {
        // If caption is an object, try to get text property
        captionText = (video.caption as any).text || (video.caption as any).node?.text || JSON.stringify(video.caption)
      }
    }
    
    if (captionText) {
      // Clean up the text - remove any HTML or special characters if needed
      const cleanText = captionText.replace(/\n/g, ' ').trim()
      return cleanText.length > 40 ? cleanText.substring(0, 40) + '...' : cleanText
    }
    
    return video.code || video.id || 'Video'
  }

  const getThumbnailUrl = (video: VideoItem): string | null => {
    // Try different possible thumbnail URL fields
    if (video.thumbnail_url) {
      return typeof video.thumbnail_url === 'string' ? video.thumbnail_url : null
    }
    
    if (video.display_url) {
      return typeof video.display_url === 'string' ? video.display_url : null
    }
    
    if (video.image_url) {
      return typeof video.image_url === 'string' ? video.image_url : null
    }
    
    // Try image_versions2 structure (Instagram format)
    if (video.image_versions2 && video.image_versions2.candidates && Array.isArray(video.image_versions2.candidates)) {
      const candidates = video.image_versions2.candidates
      // Get the first candidate or one with reasonable size
      if (candidates.length > 0 && candidates[0].url) {
        return candidates[0].url
      }
    }
    
    // Try carousel_media (for carousel posts)
    if (video.carousel_media && Array.isArray(video.carousel_media) && video.carousel_media.length > 0) {
      const firstMedia = video.carousel_media[0]
      if (firstMedia.image_versions2?.candidates?.[0]?.url) {
        return firstMedia.image_versions2.candidates[0].url
      }
      if (firstMedia.thumbnail_url) {
        return typeof firstMedia.thumbnail_url === 'string' ? firstMedia.thumbnail_url : null
      }
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Top Videos</h2>
        </header>
        <div className="p-3">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return(
    <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Top Videos</h2>
      </header>
      <div className="p-3">
        {topVideos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No videos found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full dark:text-gray-300">
              {/* Table header */}
              <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-xs">
                <tr>
                  <th className="p-2">
                    <div className="font-semibold text-left">Video</div>
                  </th>
                  <th className="p-2">
                    <div className="font-semibold text-center">Views</div>
                  </th>
                  <th className="p-2">
                    <div className="font-semibold text-center">Likes</div>
                  </th>
                  <th className="p-2">
                    <div className="font-semibold text-center">Comments</div>
                  </th>
                  <th className="p-2">
                    <div className="font-semibold text-center">Engagement</div>
                  </th>
                </tr>
              </thead>
              {/* Table body */}
              <tbody className="text-sm font-medium divide-y divide-gray-100 dark:divide-gray-700/60">
                {topVideos.map((video, index) => {
                  const views = Number(video.view_count || video.video_view_count || video.play_count || 0)
                  const likes = Number(video.like_count || 0)
                  const comments = Number(video.comment_count || 0)
                  const engagement = views > 0 ? ((likes + 3 * comments) / views) * 100 : 0
                  
                  // Ensure key is always a string
                  const videoKey = typeof video.id === 'string' ? video.id : 
                                  typeof video.code === 'string' ? video.code : 
                                  typeof video.id === 'number' ? String(video.id) :
                                  typeof video.code === 'number' ? String(video.code) :
                                  `video-${index}`
                  
                  return (
                    <tr key={videoKey}>
                      <td className="p-2">
                        <div className="flex items-center">
                          <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 mr-2 sm:mr-3 bg-gray-100 dark:bg-gray-700">
                            {getThumbnailUrl(video) && !failedImages.has(videoKey) ? (
                              <Image
                                src={getThumbnailUrl(video)!}
                                alt={String(getVideoTitle(video))}
                                fill
                                className="object-cover"
                                unoptimized
                                onError={() => {
                                  // Mark this image as failed
                                  setFailedImages(prev => new Set(prev).add(videoKey))
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
                                <HiVideoCamera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                            )}
                          </div>
                          <div className="text-gray-800 dark:text-gray-100 truncate max-w-xs">
                            {String(getVideoTitle(video))}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-center">{views.toLocaleString()}</div>
                      </td>
                      <td className="p-2">
                        <div className="text-center">{likes.toLocaleString()}</div>
                      </td>
                      <td className="p-2">
                        <div className="text-center">{comments.toLocaleString()}</div>
                      </td>
                      <td className="p-2">
                        <div className="text-center text-sky-500">{Number(engagement).toFixed(2)}%</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
