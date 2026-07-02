'use client'

import { useState, useEffect } from 'react'

// BeforeInstallPromptEvent is not in standard TS DOM lib
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the browser's default mini-infobar
      e.preventDefault()
      // Store the event so we can trigger it manually later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Clean up when the app is actually installed
    const onAppInstalled = () => {
      setDeferredPrompt(null)
      setIsVisible(false)
    }
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Trigger the native install prompt
    await deferredPrompt.prompt()

    // Check what the user chose
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      console.log('TiltCheck installed')
    }

    // Prompt can only be used once — clear it
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 max-w-md mx-auto">
      <button
        onClick={handleInstall}
        className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#6366f1] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 backdrop-blur-sm transition-all duration-200 ease-out active:scale-95 hover:bg-[#5558e0] hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform group-hover:-translate-y-0.5"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Install TiltCheck App
      </button>
    </div>
  )
}
