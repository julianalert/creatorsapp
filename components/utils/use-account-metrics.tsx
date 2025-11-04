'use client'

import { useState, useEffect } from 'react'
import { useAppProvider } from '@/app/app-provider'
import { createClient } from '@/lib/supabase/client'

interface AccountMetrics {
  totalReels: number
  totalViews: number
  totalLikes: number
  totalComments: number
  engagementRate: number
  qualityScore: number | null
  reelsChange: number
  viewsChange: number
  likesChange: number
  commentsChange: number
  engagementRateChange: number
}

interface PostItem {
  like_count?: number
  comment_count?: number
  view_count?: number
  video_view_count?: number
  play_count?: number
  taken_at?: number
  media_type?: number // 1 = photo, 2 = video, 8 = reel
}

export function useAccountMetrics() {
  const { selectedAccount, dateRange } = useAppProvider()
  const [metrics, setMetrics] = useState<AccountMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedAccount) {
      setLoading(false)
      return
    }

    const fetchMetrics = async () => {
      try {
        const supabase = createClient()
        
        // Fetch the account with postsData and qualityScore
        const { data, error } = await supabase
          .from('account')
          .select('postsdata, profiledata, qualityscore')
          .eq('id', selectedAccount.id)
          .single()

        if (error) {
          console.error('Error fetching account metrics:', error)
          setLoading(false)
          return
        }

        // Parse postsData - it could be stored as postsdata (lowercase) or postsData
        const postsData = data.postsdata || (data as any).postsData || null
        
        // Get qualityScore from the account or from profiledata
        const qualityScore = data.qualityscore || (data.profiledata as any)?.qualityscore || null

        if (!postsData || !postsData.items || !Array.isArray(postsData.items)) {
          // No posts data available, set defaults
          setMetrics({
            totalReels: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            engagementRate: 0,
            qualityScore,
            reelsChange: 0,
            viewsChange: 0,
            likesChange: 0,
            commentsChange: 0,
            engagementRateChange: 0,
          })
          setLoading(false)
          return
        }

        const items: PostItem[] = postsData.items

        // Filter items by date range if dateRange is set
        const filteredItems = dateRange?.from && dateRange?.to
          ? items.filter((item) => {
              if (!item.taken_at) return false
              // Convert Unix timestamp to Date (taken_at is typically in seconds)
              const itemDate = new Date(item.taken_at * 1000)
              const fromDate = dateRange.from
              const toDate = dateRange.to
              return itemDate >= fromDate && itemDate <= toDate
            })
          : items

        // Calculate totals
        let totalReels = 0
        let totalViews = 0
        let totalLikes = 0
        let totalComments = 0

        // Separate reels (media_type 8) and regular posts
        const reels: PostItem[] = []
        const allPosts: PostItem[] = []

        filteredItems.forEach((item) => {
          // Count likes and comments for all posts
          totalLikes += item.like_count || 0
          totalComments += item.comment_count || 0

          // For views, use view_count or video_view_count or play_count
          const views = item.view_count || item.video_view_count || item.play_count || 0
          totalViews += views

          // Count reels (media_type 8) or videos (media_type 2)
          if (item.media_type === 8 || (item.media_type === 2 && views > 0)) {
            reels.push(item)
            totalReels++
          }

          allPosts.push(item)
        })

        // Calculate percentage changes by comparing recent vs older posts
        // Split posts into two halves: recent (first half) vs older (second half)
        const sortedPosts = [...allPosts].sort((a, b) => (b.taken_at || 0) - (a.taken_at || 0))
        const midpoint = Math.floor(sortedPosts.length / 2)
        const recentPosts = sortedPosts.slice(0, midpoint)
        const olderPosts = sortedPosts.slice(midpoint)

        const calculateChange = (recent: PostItem[], older: PostItem[], getValue: (item: PostItem) => number): number => {
          const recentTotal = recent.reduce((sum, item) => sum + getValue(item), 0)
          const olderTotal = older.reduce((sum, item) => sum + getValue(item), 0)
          
          if (olderTotal === 0) return recentTotal > 0 ? 100 : 0
          return Math.round(((recentTotal - olderTotal) / olderTotal) * 100)
        }

        const reelsChange = calculateChange(
          recentPosts.filter(p => p.media_type === 8 || (p.media_type === 2 && (p.view_count || p.video_view_count || p.play_count || 0) > 0)),
          olderPosts.filter(p => p.media_type === 8 || (p.media_type === 2 && (p.view_count || p.video_view_count || p.play_count || 0) > 0)),
          () => 1 // Count
        )

        const viewsChange = calculateChange(
          recentPosts,
          olderPosts,
          (item) => item.view_count || item.video_view_count || item.play_count || 0
        )

        const likesChange = calculateChange(
          recentPosts,
          olderPosts,
          (item) => item.like_count || 0
        )

        const commentsChange = calculateChange(
          recentPosts,
          olderPosts,
          (item) => item.comment_count || 0
        )

        // Calculate engagement rate: (Total Likes + 3 × Total Comments) / Total Views × 100
        const engagementRate = totalViews > 0 
          ? ((totalLikes + 3 * totalComments) / totalViews) * 100 
          : 0

        // Calculate engagement rate change
        const recentEngagement = recentPosts.length > 0 && recentPosts.reduce((sum, item) => {
          const views = item.view_count || item.video_view_count || item.play_count || 0
          return sum + views
        }, 0) > 0
          ? ((recentPosts.reduce((sum, item) => sum + (item.like_count || 0), 0) + 
              3 * recentPosts.reduce((sum, item) => sum + (item.comment_count || 0), 0)) /
             recentPosts.reduce((sum, item) => {
               const views = item.view_count || item.video_view_count || item.play_count || 0
               return sum + views
             }, 0)) * 100
          : 0

        const olderEngagement = olderPosts.length > 0 && olderPosts.reduce((sum, item) => {
          const views = item.view_count || item.video_view_count || item.play_count || 0
          return sum + views
        }, 0) > 0
          ? ((olderPosts.reduce((sum, item) => sum + (item.like_count || 0), 0) + 
              3 * olderPosts.reduce((sum, item) => sum + (item.comment_count || 0), 0)) /
             olderPosts.reduce((sum, item) => {
               const views = item.view_count || item.video_view_count || item.play_count || 0
               return sum + views
             }, 0)) * 100
          : 0

        const engagementRateChange = olderEngagement > 0
          ? Math.round(((recentEngagement - olderEngagement) / olderEngagement) * 100)
          : recentEngagement > 0 ? 100 : 0

        setMetrics({
          totalReels,
          totalViews,
          totalLikes,
          totalComments,
          engagementRate: Math.round(engagementRate * 100) / 100, // Round to 2 decimal places
          qualityScore,
          reelsChange,
          viewsChange,
          likesChange,
          commentsChange,
          engagementRateChange,
        })
      } catch (error) {
        console.error('Error calculating metrics:', error)
        setMetrics({
          totalReels: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          engagementRate: 0,
          qualityScore: null,
          reelsChange: 0,
          viewsChange: 0,
          likesChange: 0,
          commentsChange: 0,
          engagementRateChange: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [selectedAccount, dateRange])

  return { metrics, loading }
}

