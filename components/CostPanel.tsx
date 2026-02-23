interface AgentSpend {
  agent: string
  percentage: number
  color: 'bg-hf-muted' | 'bg-hf-teal' | 'bg-hf-accent' | 'bg-hf-red'
}

interface CostPanelProps {
  monthYear: string
  spent: string
  cap: string
  percentUsed: number
  remainingBudget: string
  agents: AgentSpend[]
}

export default function CostPanel({
  monthYear,
  spent,
  cap,
  percentUsed,
  remainingBudget,
  agents,
}: CostPanelProps) {
  return (
    <div className="bg-hf-surface border border-hf-border rounded-xs p-3.5 animate-fadeUp" style={{ animationDelay: '0.24s' }}>
      {/* Header */}
      <div className="flex justify-between items-baseline mb-2.5">
        <div className="font-mono text-xs text-hf-muted uppercase tracking-wider">
          AI Spend
        </div>
        <div className="font-mono text-lg font-bold text-hf-teal">
          {spent}
          <span className="text-xs text-hf-muted font-normal ml-1">/ {cap}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-hf-surface2 rounded-sm h-1 overflow-hidden mb-1.5">
        <div
          className="h-full rounded-sm bg-gradient-to-r from-hf-teal to-hf-accent transition-all duration-600"
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs font-mono text-hf-muted mb-4">
        <span>{percentUsed}% used</span>
        <span>{remainingBudget} remaining</span>
      </div>

      {/* Agent breakdown */}
      <div className="space-y-1.5">
        {agents.map((agent) => (
          <div key={agent.agent} className="flex items-center gap-2">
            <div className="font-mono text-xs text-hf-sub w-16 flex-shrink-0">
              {agent.agent}
            </div>
            <div className="flex-1 bg-hf-surface2 rounded-sm h-1 overflow-hidden">
              <div
                className={`h-full rounded-sm ${agent.color} transition-all duration-600`}
                style={{ width: `${agent.percentage}%` }}
              />
            </div>
            <div className="font-mono text-xs text-hf-muted w-8 text-right flex-shrink-0">
              {agent.percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
