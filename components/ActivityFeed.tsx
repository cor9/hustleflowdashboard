interface Activity {
  icon: string
  agent: string
  action: string
  context?: string
  timeAgo: string
}

interface ActivityFeedProps {
  items: Activity[]
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="space-y-0 animate-fadeUp" style={{ animationDelay: '0.3s' }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex gap-3 py-2.5 border-b border-hf-border last:border-b-0"
        >
          {/* Icon */}
          <div className="w-7 h-7 rounded-xs bg-hf-surface2 border border-hf-border flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
            {item.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-hf-body leading-relaxed">
              <strong className="text-hf-head">{item.agent}</strong> {item.action}
            </p>
            {item.context && (
              <p className="text-xs text-hf-sub mt-1">
                {item.context}
              </p>
            )}
            <p className="font-mono text-xs text-hf-muted mt-1">
              {item.timeAgo}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
