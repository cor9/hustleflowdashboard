import Link from 'next/link'
import { useRouter } from 'next/router'

interface SidebarProps {
  open: boolean
  onClose?: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter()

  const navItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Tasks', href: '/tasks', icon: '✓' },
    { label: 'Agents', href: '/agents', icon: '🤖' },
    { label: 'Hustles', href: '/hustles', icon: '🚀' },
    { label: 'Messages', href: '/messages', icon: '💬' },
    { label: 'Documents', href: '/documents', icon: '📄' },
  ]

  const handleNavClick = () => {
    // Close sidebar on mobile after nav click
    if (onClose) onClose()
  }

  return (
    <aside className="bg-dark-800 border-r border-dark-700 w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <h2 className="font-bold text-lg text-white">HF</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm md:text-base cursor-pointer ${
              router.pathname === item.href
                ? 'bg-blue-600 text-white font-medium'
                : 'text-dark-300 hover:bg-dark-700'
            }`}
            onClick={handleNavClick}
          >
            <span className="text-lg md:text-xl flex-shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700">
        <button className="w-full px-3 py-2 bg-dark-700 rounded-lg text-sm hover:bg-dark-600 transition font-medium">
          ⚙️ Settings
        </button>
      </div>
    </aside>
  )
}
