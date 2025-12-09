'use client'

import { useEffect } from 'react'

export default function BeamAnalytics() {
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[data-token="a1af78f4-e22c-412d-9149-42af8e3897e4"]')) {
      return
    }

    // Create and inject the script exactly as Beam requires
    const script = document.createElement('script')
    script.src = 'https://beamanalytics.b-cdn.net/beam.min.js'
    script.setAttribute('data-token', 'a1af78f4-e22c-412d-9149-42af8e3897e4')
    script.async = true
    
    // Append to head (analytics scripts typically go in head)
    document.head.appendChild(script)
  }, [])

  return null
}

