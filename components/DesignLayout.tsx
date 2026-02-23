import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Topbar from './Topbar'
import DesignSidebar from './DesignSidebar'
import CommandPalette from './CommandPalette'

interface DesignLayoutProps {
  children: ReactNode
}

const bottomNavItems = [
  { label: 'Dash', href: '/', icon: '⬛' },
  { label: 'Tasks', href: '/tasks', icon: '✓' },
  { label: 'Agents', href: '/agents', icon: '🤖' },
  { label: 'Messages', href: '/messages', icon: '💬' },
  { label: 'Hustles', href: '/hustles', icon: '🚀' },
]

export default function DesignLayout({ children }: DesignLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Close sidebar on route change
    setSidebarOpen(false)
  }, [router.pathname])

  useEffect(() => {
    // Close sidebar on desktop resize
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-hf-bg text-hf-body">
      {/* Topbar */}
      <Topbar 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onCommandClick={() => setCommandOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 pt-nav-h pb-14 md:pb-0">
        {/* Sidebar */}
        <DesignSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-4 md:px-6 py-6 md:py-8 max-w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 h-14 bg-hf-surface/96 backdrop-blur-md border-t border-hf-border flex">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs font-mono transition-colors ${
              router.pathname === item.href
                ? 'text-hf-accent'
                : 'text-hf-muted hover:text-hf-sub'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* FAB (Mobile) */}
      <button className="fixed md:hidden bottom-20 right-4 w-12 h-12 rounded-full bg-hf-accent text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition text-xl z-20">
        ＋
      </button>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  )
}
