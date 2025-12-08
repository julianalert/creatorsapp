'use client'

import { useEffect } from 'react'

export default function BeamAnalytics() {
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[data-token="a1af78f4-e22c-412d-9149-42af8e3897e4"]')) {
      return
    }

    // Create and inject the script
    const script = document.createElement('script')
    script.src = 'https://beamanalytics.b-cdn.net/beam.min.js'
    script.setAttribute('data-token', 'a1af78f4-e22c-412d-9149-42af8e3897e4')
    script.async = true
    script.defer = true
    
    // Append to head
    document.head.appendChild(script)

    // Cleanup function (though we probably don't want to remove it)
    return () => {
      // Optionally remove script on unmount, but usually we want it to persist
    }
  }, [])

  return null
}

