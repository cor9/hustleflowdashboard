interface StatStripProps {
  urgent: number
  open: number
  completed: number
  revenue: string
}

export default function StatStrip({ urgent, open, completed, revenue }: StatStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 animate-fadeUp" style={{ animationDelay: '0.05s' }}>
      {/* Urgent */}
      <div className="bg-hf-surface border border-hf-border rounded-xs p-3 text-center">
        <div className={`font-mono text-2xl md:text-3xl font-bold mb-1 ${urgent > 0 ? 'text-hf-red' : 'text-hf-head'}`}>
          {urgent}
        </div>
        <div className="font-mono text-xs text-hf-muted uppercase tracking-wider">
          Urgent
        </div>
      </div>

      {/* Open Tasks */}
      <div className="bg-hf-surface border border-hf-border rounded-xs p-3 text-center">
        <div className="font-mono text-2xl md:text-3xl font-bold text-hf-head mb-1">
          {open}
        </div>
        <div className="font-mono text-xs text-hf-muted uppercase tracking-wider">
          Open Tasks
        </div>
      </div>

      {/* Completed Today */}
      <div className="bg-hf-surface border border-hf-border rounded-xs p-3 text-center">
        <div className="font-mono text-2xl md:text-3xl font-bold text-hf-teal mb-1">
          {completed}
        </div>
        <div className="font-mono text-xs text-hf-muted uppercase tracking-wider">
          Done Today
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-hf-surface border border-hf-border rounded-xs p-3 text-center">
        <div className="font-mono text-2xl md:text-3xl font-bold text-hf-amber mb-1">
          {revenue}
        </div>
        <div className="font-mono text-xs text-hf-muted uppercase tracking-wider">
          MRR
        </div>
      </div>
    </div>
  )
}
