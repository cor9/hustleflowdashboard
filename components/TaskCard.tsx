interface TaskCardProps {
  title: string
  description?: string
  priority: 'urgent' | 'high' | 'medium'
  tag?: string
  tagColor?: string
  assignee?: string
  dueDate?: string
  overdue?: boolean
}

const priorityConfig = {
  urgent: {
    icon: '🔴',
    color: 'bg-hf-red/15 text-hf-red border-l-hf-red',
    label: 'URGENT',
  },
  high: {
    icon: '🟡',
    color: 'bg-hf-amber/15 text-hf-amber border-l-hf-amber',
    label: 'HIGH',
  },
  medium: {
    icon: '🔵',
    color: 'bg-hf-accent/15 text-hf-accent border-l-hf-accent',
    label: 'MEDIUM',
  },
}

export default function TaskCard({
  title,
  description,
  priority,
  tag,
  tagColor = 'border-hf-accent/20 text-hf-accent',
  assignee,
  dueDate,
  overdue,
}: TaskCardProps) {
  const config = priorityConfig[priority]

  return (
    <div
      className={`bg-hf-surface border border-hf-border border-l-4 rounded-xs p-3 flex gap-3 cursor-pointer hover:bg-hf-surface2 transition ${config.color}`}
      style={{ animationDelay: '0.18s' }}
    >
      {/* Priority Icon */}
      <div className="text-sm flex-shrink-0 mt-0.5">
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-hf-head line-clamp-1 mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-hf-sub line-clamp-1 mb-2">
            {description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          {tag && (
            <span className={`font-mono px-1.5 py-1 rounded border ${tagColor}`}>
              {tag}
            </span>
          )}
          {assignee && (
            <span className="font-mono text-hf-muted">
              {assignee}
            </span>
          )}
          {dueDate && (
            <span className={`font-mono ml-auto ${overdue ? 'text-hf-red' : 'text-hf-muted'}`}>
              {dueDate}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
