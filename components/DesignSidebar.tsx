import Link from 'next/link'
import { useRouter } from 'next/router'

interface DesignSidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Dashboard', href: '/', icon: '⬛' },
  { label: 'Tasks', href: '/tasks', icon: '✓', count: 11 },
  { label: 'Documents', href: '/documents', icon: '📁' },
  { label: 'Projects', href: '/hustles', icon: '🚀', count: 9 },
  { label: 'Calendar', href: '#', icon: '📅' },
  { label: 'Agents', href: '/agents', icon: '🤖' },
  { label: 'Messages', href: '/messages', icon: '💬', count: 2 },
  { label: 'Skills & Tools', href: '#', icon: '⚙️' },
]

const hustles = [
  { name: 'CA101', tier: 'P1', dot: 'accent' },
  { name: 'Bohemia / Talent', tier: 'P1', dot: 'amber' },
  { name: 'PREP101', tier: 'R2', dot: 'teal' },
  { name: 'Coaching', tier: 'R2', dot: 'teal' },
  { name: 'Directory', tier: 'R2', dot: 'muted' },
  { name: 'Amazon', tier: 'R2', dot: 'muted' },
  { name: 'Merch / WearPSA', tier: 'R2', dot: 'muted' },
  { name: 'Books / KDP', tier: 'R2', dot: 'pink' },
]

const agents = [
  { name: 'Coco', role: 'Partner', state: 'T1/T2' },
  { name: 'Max', role: 'Content', state: 'T1/T2' },
  { name: 'Chaz', role: 'Revenue', state: 'T1' },
  { name: 'Sheila', role: 'Research', state: 'T1/T2' },
  { name: 'Bob', role: 'Builder', state: 'T2/T3' },
]

export default function DesignSidebar({ open, onClose }: DesignSidebarProps) {
  const router = useRouter()

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
        className={`fixed md:static inset-y-0 left-0 z-40 w-sidebar-w bg-hf-surface border-r border-hf-border flex flex-col transform transition-transform duration-300 md:translate-x-0 overflow-y-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ marginTop: '56px' }}
      >
        {/* Navigate Section */}
        <div className="px-0 py-3 border-b border-hf-border">
          <div className="font-mono text-xs font-bold tracking-wider text-hf-muted uppercase px-4 pb-2">
            Navigate
          </div>
          <nav className="space-y-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-l-2 cursor-pointer ${
                  router.pathname === item.href
                    ? 'border-l-hf-accent bg-hf-accent/10 text-hf-accent'
                    : 'border-l-transparent text-hf-sub hover:text-hf-body hover:bg-hf-surface2'
                }`}
              >
                <span className="text-base w-5">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.count && (
                  <span className="font-mono text-xs bg-hf-border text-hf-muted rounded px-1.5 py-0.5">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Hustles Section */}
        <div className="px-0 py-3 border-b border-hf-border">
          <div className="font-mono text-xs font-bold tracking-wider text-hf-muted uppercase px-4 pb-2">
            Hustles
          </div>
          <div className="space-y-1">
            {hustles.map((hustle) => (
              <div
                key={hustle.name}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-mono text-hf-sub hover:text-hf-body hover:bg-hf-surface2 cursor-pointer transition"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    hustle.dot === 'accent'
                      ? 'bg-hf-accent'
                      : hustle.dot === 'amber'
                      ? 'bg-hf-amber'
                      : hustle.dot === 'teal'
                      ? 'bg-hf-teal'
                      : 'bg-hf-muted'
                  }`}
                  style={
                    hustle.dot !== 'muted'
                      ? {
                          boxShadow: `0 0 4px ${
                            hustle.dot === 'accent'
                              ? '#3D7EFF'
                              : hustle.dot === 'amber'
                              ? '#F0A832'
                              : '#1EC9A0'
                          }`,
                        }
                      : {}
                  }
                />
                <span className="flex-1">{hustle.name}</span>
                <span className="text-hf-muted">{hustle.tier}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-4 py-1.5 text-xs font-mono text-hf-muted">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-hf-border" />
              <span>+ Add hustle</span>
            </div>
          </div>
        </div>

        {/* Agents Section */}
        <div className="px-0 py-3 flex-1 border-b border-hf-border">
          <div className="font-mono text-xs font-bold tracking-wider text-hf-muted uppercase px-4 pb-2">
            Agents
          </div>
          <div className="space-y-1">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-mono text-hf-sub hover:text-hf-body hover:bg-hf-surface2 cursor-pointer transition"
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-hf-teal animate-pulse" />
                <span className="flex-1">{agent.name}</span>
                <span className="text-hf-muted text-xs">{agent.state}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-hf-border flex items-center gap-2">
          <div className="w-7 h-7 rounded-xs bg-gradient-to-br from-hf-accent to-hf-teal flex items-center justify-center font-mono text-xs font-bold text-white">
            C
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-sm font-semibold text-hf-head truncate">
              Corey
            </div>
            <div className="font-mono text-xs text-hf-muted truncate">
              hustleflow.site
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
