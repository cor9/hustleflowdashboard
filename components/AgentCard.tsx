interface AgentCardProps {
  name: string
  role: string
  tier: string
  status: 'online' | 'idle' | 'working'
  cost: string
  costColor?: string
}

const statusConfig = {
  online: {
    dot: 'bg-hf-teal',
    label: 'online',
    glow: 'shadow-lg' ,
  },
  idle: {
    dot: 'bg-hf-teal',
    label: 'idle',
    glow: '',
  },
  working: {
    dot: 'bg-hf-amber animate-pulse',
    label: 'working',
    glow: 'shadow-md',
  },
}

export default function AgentCard({
  name,
  role,
  tier,
  status,
  cost,
  costColor = 'text-hf-body',
}: AgentCardProps) {
  const config = statusConfig[status]

  return (
    <div className="bg-hf-surface border border-hf-border rounded-xs p-3 flex items-center gap-3 hover:bg-hf-surface2 hover:border-hf-border2 transition cursor-pointer">
      {/* Indicator */}
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`}
        style={status === 'working' ? { boxShadow: '0 0 6px #F0A832' } : undefined}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-mono text-sm font-semibold text-hf-head">
          {name}
        </h3>
        <p className="font-mono text-xs text-hf-muted mt-0.5">
          {role} — {tier}
        </p>
      </div>

      {/* Status & Cost */}
      <div className="text-right flex-shrink-0">
        <p className={`font-mono text-xs ${status === 'working' ? 'text-hf-amber' : 'text-hf-sub'}`}>
          {config.label}
        </p>
        <p className={`font-mono text-xs font-semibold mt-0.5 ${costColor}`}>
          {cost}
        </p>
      </div>
    </div>
  )
}
