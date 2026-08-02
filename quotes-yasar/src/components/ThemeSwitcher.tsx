'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      
      className="font-medium flex items-center justify-center gap-1.5 sm:gap-2 bg-base-200 text-primary text-xs sm:text-sm p-1.5 px-3 sm:p-2 sm:px-4 rounded-full shadow-md hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
      aria-label="Toggle Theme"
    > 
      {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  )
}
export default ThemeSwitcher



