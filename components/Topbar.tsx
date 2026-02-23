import { useState, useEffect } from 'react'

interface TopbarProps {
  onMenuClick: () => void
  onCommandClick?: () => void
}

export default function Topbar({ onMenuClick, onCommandClick }: TopbarProps) {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const d = now.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).toUpperCase()
      const t = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      })
      setTime(`${d} · ${t}`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onCommandClick?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCommandClick])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-nav-h bg-hf-bg/92 backdrop-blur-md border-b border-hf-border flex items-center gap-3 px-4 md:px-6">
      {/* Hamburger (mobile only) */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 hover:bg-hf-surface rounded-xs transition flex flex-col gap-1"
        aria-label="Toggle menu"
      >
        <span className="w-4 h-0.5 bg-hf-sub rounded-full"></span>
        <span className="w-4 h-0.5 bg-hf-sub rounded-full"></span>
        <span className="w-4 h-0.5 bg-hf-sub rounded-full"></span>
      </button>

      {/* Logo */}
      <img 
        src="/logo.png" 
        alt="Hustle Flow" 
        className="h-10 md:h-12 flex-shrink-0 hidden sm:block"
      />

      {/* Search / Command */}
      <button onClick={onCommandClick} className="hidden sm:flex flex-1 max-w-sm items-center gap-2 bg-hf-surface border border-hf-border rounded-xs px-3 h-9 cursor-pointer hover:border-hf-border2 transition">
        <span className="text-hf-muted text-xs">⌘</span>
        <span className="text-hf-muted text-xs flex-1 text-left">Search or command...</span>
        <span className="font-mono text-xs bg-hf-border text-hf-muted rounded px-1.5 py-0.5">⌘K</span>
      </button>

      {/* Right: Status + Notifications + Avatar */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        {/* Vault Status */}
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-hf-sub">
          <div className="w-1.5 h-1.5 rounded-full bg-hf-teal animate-pulse"></div>
          <span>VAULT</span>
        </div>

        {/* Notification Bell */}
        <button className="w-8 h-8 flex items-center justify-center hover:bg-hf-surface border border-hf-border rounded-xs text-hf-sub text-sm transition relative">
          🔔
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-hf-red flex items-center justify-center font-mono text-xs font-bold text-white">
            3
          </div>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xs bg-gradient-to-br from-hf-accent to-hf-teal flex items-center justify-center font-mono text-xs font-bold text-white">
          C
        </div>
      </div>
    </header>
  )
}
