interface HustlePrimaryCardProps {
  name: string
  description: string
  stats: { label: string; value: string }[]
  status: 'active' | 'needs'
  isBohemia?: boolean
}

interface HustleRevenueCardProps {
  icon: string
  name: string
  type: string
  tasks: string
  hasTasks?: boolean
}

export function HustlePrimaryCard({
  name,
  description,
  stats,
  status,
  isBohemia,
}: HustlePrimaryCardProps) {
  return (
    <div
      className={`relative bg-hf-surface border rounded-sm p-3.5 cursor-pointer transition hover:-translate-y-0.5 overflow-hidden ${
        isBohemia
          ? 'border-hf-amber/50 border-t-2 border-t-hf-amber'
          : 'border-hf-border border-t-2 border-t-hf-accent'
      }`}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${isBohemia ? '#F0A832' : '#3D7EFF'}, transparent 60%)`,
        }}
      />

      {/* Status badge */}
      <div
        className={`absolute top-2.5 right-2.5 font-mono text-xs px-2 py-1 rounded border ${
          status === 'active'
            ? 'bg-hf-teal/10 border-hf-teal/30 text-hf-teal'
            : 'bg-hf-amber/10 border-hf-amber/30 text-hf-amber'
        }`}
      >
        {status === 'active' ? 'Active' : 'Needs Attn'}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="font-mono text-xs text-hf-muted uppercase tracking-wider mb-1">
          {isBohemia ? 'P1 · Primary Income' : 'P1 · Brand + Audience'}
        </div>
        <h3 className="font-mono text-lg font-bold text-hf-head mb-1">
          {name}
        </h3>
        <p className="text-xs text-hf-sub mb-3 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Stats */}
        <div className="flex gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-mono text-base font-bold text-hf-head">
                {stat.value}
              </div>
              <div className="font-mono text-xs text-hf-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HustleRevenueCard({
  icon,
  name,
  type,
  tasks,
  hasTasks,
}: HustleRevenueCardProps) {
  return (
    <div className="bg-hf-surface border border-hf-border rounded-xs p-2.5 flex gap-2 cursor-pointer hover:bg-hf-surface2 transition">
      {/* Icon */}
      <div className="text-xl flex-shrink-0 mt-0.5">
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-mono text-xs font-bold text-hf-head">
          {name}
        </h4>
        <p className="text-xs text-hf-sub mb-1">
          {type}
        </p>
        <p className={`font-mono text-xs ${hasTasks ? 'text-hf-accent' : 'text-hf-muted'}`}>
          {tasks}
        </p>
      </div>
    </div>
  )
}
