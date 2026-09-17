import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function checkIsMobileOrTablet(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const isIpadOs = navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)
  return isMobileUa || isIpadOs
}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
  )
}

function checkIsIos(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isMobileOrTablet] = useState(checkIsMobileOrTablet)
  const [isStandalone, setIsStandalone] = useState(checkIsStandalone)
  const [isIos] = useState(checkIsIos)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Кнопка доступна ТІЛЬКИ на планшетах та телефонах, і ТІЛЬКИ у веб-браузері (не в PWA)
  const canInstall = isMobileOrTablet && !isStandalone

  const installPwa = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else if (isIos) {
      setShowIosGuide(true)
    } else {
      // Якщо браузер ще не згенерував beforeinstallprompt
      alert('Щоб встановити застосунок, відкрийте меню браузера (три крапки) та оберіть «Встановити на головний екран».')
    }
  }

  return {
    canInstall,
    installPwa,
    isIos,
    showIosGuide,
    setShowIosGuide,
  }
}
