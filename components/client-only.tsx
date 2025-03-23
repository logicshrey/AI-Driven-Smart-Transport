"use client"

import { useEffect, useState, ReactNode } from "react"

export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Clean up browser extension attributes when mounted
    const body = document.querySelector('body')
    if (body) {
      const attributesToRemove = Array.from(body.attributes)
        .filter(attr => attr.name.startsWith('data-') || attr.name.includes('-gr-'))
        .map(attr => attr.name)
      
      attributesToRemove.forEach(attr => {
        body.removeAttribute(attr)
      })
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
} 