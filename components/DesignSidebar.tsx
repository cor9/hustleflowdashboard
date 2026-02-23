import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

interface DesignSidebarProps {
  open: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  href: string
  icon: string
  count?: number
}

interface SidebarHustle {
  id: string
  name: string
  tier: string
  color?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: '⬛' },
  { label: 'Tasks', href: '/tasks', icon: '✓' },
  { label: 'Documents', href: '/documents', icon: '📁' },
  { label: 'Projects', href: '/hustles', icon: '🚀' },
  { label: 'Agents', href: '/agents', icon: '🤖' },
  { label: 'Messages', href: '/messages', icon: '💬' },
]

export default function DesignSidebar({ open, onClose }: DesignSidebarProps) {
  const router = useRouter()
  const [hustles, setHustles] = useState<SidebarHustle[]>([])
  const [taskCount, setTaskCount] = useState<number>(0)
  const [msgCount, setMsgCount] = useState<number>(0)

  useEffect(() => {
    loadSidebarData()
    // Set up realtime subscriptions
    const taskSub = supabase?.channel('sidebar-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        updateCounts()
      })
      .subscribe()

    return () => {
      taskSub?.unsubscribe()
    }
  }, [])

  const loadSidebarData = async () => {
    if (!supabase) return
    try {
      const { data } = await supabase
        .from('hustles')
        .select('id, name, tier, color')
        .order('sort_order', { ascending: true })

      if (data) setHustles(data as SidebarHustle[])
      updateCounts()
    } catch (err) {
      console.error('Error loading sidebar data:', err)
    }
  }

  const updateCounts = async () => {
    if (!supabase) return
    const { count: tc } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'done')
    const { count: mc } = await supabase.from('messages').select('*', { count: 'exact', head: true })
    setTaskCount(tc || 0)
    setMsgCount(mc || 0)
  }

  const getTierCode = (tier: string) => {
    if (tier.includes('P1')) return 'P1'
    if (tier.includes('R2')) return 'R2'
    if (tier.includes('P3')) return 'P3'
    return '??'
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-sidebar-w bg-hf-surface border-r border-hf-border flex flex-col transform transition-transform duration-300 md:translate-x-0 overflow-y-auto ${open ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{ marginTop: '56px' }}
      >
        {/* Navigate Section */}
        <div className="px-0 py-3 border-b border-hf-border">
          <div className="font-mono text-xs font-bold tracking-wider text-hf-muted uppercase px-4 pb-2">
            Navigate
          </div>
          <nav className="space-y-0">
            {navItems.map((item) => {
              const currentCount = item.label === 'Tasks' ? taskCount : item.label === 'Messages' ? msgCount : 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-l-2 cursor-pointer ${router.pathname === item.href
                      ? 'border-l-hf-accent bg-hf-accent/10 text-hf-accent'
                      : 'border-l-transparent text-hf-sub hover:text-hf-body hover:bg-hf-surface2'
                    }`}
                >
                  <span className="text-base w-5">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {currentCount > 0 && (
                    <span className="font-mono text-xs bg-hf-border text-hf-muted rounded px-1.5 py-0.5">
                      {currentCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Hustles Section */}
        <div className="px-0 py-3 border-b border-hf-border">
          <div className="font-mono text-xs font-bold tracking-wider text-hf-muted uppercase px-4 pb-2 flex items-center justify-between">
            <span>Hustles</span>
            <Link href="/hustles" className="hover:text-hf-accent transition text-[10px]">+ Add</Link>
          </div>
          <div className="space-y-0.5">
            {hustles.map((hustle) => (
              <Link
                key={hustle.id}
                href={`/hustles/${hustle.id}`}
                onClick={onClose}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-mono transition border-l-2 ${router.query.id === hustle.id
                    ? 'border-l-hf-teal bg-hf-teal/5 text-hf-teal'
                    : 'border-l-transparent text-hf-sub hover:text-hf-body hover:bg-hf-surface2 cursor-pointer'
                  }`}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: hustle.color || '#1EC9A0',
                    boxShadow: `0 0 4px ${hustle.color || '#1EC9A0'}`
                  }}
                />
                <span className="flex-1 truncate">{hustle.name}</span>
                <span className="text-hf-muted text-[10px]">{getTierCode(hustle.tier)}</span>
              </Link>
            ))}
            {hustles.length === 0 && (
              <div className="px-4 py-1.5 text-xs font-mono text-hf-muted italic">
                No hustles found
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-3 flex-1 flex flex-col justify-end gap-3 opacity-60">
          <div className="flex items-center gap-2 text-[10px] font-mono text-hf-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-hf-teal animate-pulse" />
            <span>VAULT CONNECTED</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-hf-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-hf-accent" />
            <span>5 AGENTS ONLINE</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-hf-border flex items-center gap-2 bg-hf-surface2/30">
          <div className="w-7 h-7 rounded-xs bg-gradient-to-br from-hf-accent to-hf-teal flex items-center justify-center font-mono text-xs font-bold text-white shadow-lg">
            C
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-sm font-semibold text-hf-head truncate">
              Corey
            </div>
            <div className="font-mono text-xs text-hf-muted truncate">
              HustleFlow Dashboard
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
