import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

interface Command {
  id: string
  label: string
  description?: string
  action: () => void
  icon?: string
  category?: string
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const commands: Command[] = [
    {
      id: '1',
      label: 'Dashboard',
      description: 'View overview',
      icon: '📊',
      category: 'Navigation',
      action: () => {
        router.push('/')
        onClose()
      },
    },
    {
      id: '2',
      label: 'Tasks',
      description: 'Manage tasks',
      icon: '✓',
      category: 'Navigation',
      action: () => {
        router.push('/tasks')
        onClose()
      },
    },
    {
      id: '3',
      label: 'Agents',
      description: 'Agent center',
      icon: '🤖',
      category: 'Navigation',
      action: () => {
        router.push('/agents')
        onClose()
      },
    },
    {
      id: '4',
      label: 'Hustles',
      description: 'Revenue tracking',
      icon: '🚀',
      category: 'Navigation',
      action: () => {
        router.push('/hustles')
        onClose()
      },
    },
    {
      id: '5',
      label: 'Documents',
      description: 'View cron reports',
      icon: '📄',
      category: 'Navigation',
      action: () => {
        router.push('/documents')
        onClose()
      },
    },
    {
      id: '6',
      label: 'New Task',
      description: 'Create task',
      icon: '➕',
      category: 'Actions',
      action: () => {
        alert('Task creation coming soon')
        onClose()
      },
    },
    {
      id: '7',
      label: 'Search Documents',
      description: 'Find reports',
      icon: '🔍',
      category: 'Actions',
      action: () => {
        alert('Document search coming soon')
        onClose()
      },
    },
  ]

  const filtered = search
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(search.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(search.toLowerCase())
      )
    : commands

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setSearch('')
      setSelectedIdx(0)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIdx((prev) => (prev + 1) % filtered.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIdx((prev) => (prev - 1 + filtered.length) % filtered.length)
          break
        case 'Enter':
          e.preventDefault()
          filtered[selectedIdx]?.action()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, filtered, selectedIdx, onClose])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Palette */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 bg-hf-surface border border-hf-border rounded-sm shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="border-b border-hf-border p-3 flex items-center gap-2">
          <span className="text-hf-muted">⌘</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedIdx(0)
            }}
            className="flex-1 bg-transparent text-hf-head outline-none font-mono text-sm"
          />
        </div>

        {/* Commands */}
        <div className="max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-hf-muted text-sm">
              No commands found
            </div>
          ) : (
            <div>
              {filtered.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${
                    idx === selectedIdx
                      ? 'bg-hf-accent/10 text-hf-head'
                      : 'text-hf-body hover:bg-hf-surface2'
                  }`}
                >
                  <span className="text-lg">{cmd.icon}</span>
                  <div className="flex-1">
                    <div className="font-mono text-sm font-semibold">
                      {cmd.label}
                    </div>
                    {cmd.description && (
                      <div className="text-xs text-hf-muted">
                        {cmd.description}
                      </div>
                    )}
                  </div>
                  {cmd.category && (
                    <div className="text-xs font-mono text-hf-muted">
                      {cmd.category}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
