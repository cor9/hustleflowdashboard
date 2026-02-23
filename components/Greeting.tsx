import { useEffect, useState } from 'react'

interface GreetingProps {
  taskCount: number
  workingAgent?: string
}

export default function Greeting({ taskCount, workingAgent }: GreetingProps) {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const day = now.toLocaleDateString('en-US', { weekday: 'short' })
      const d = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const t = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      setTime(`${day.toUpperCase()} · ${d.toUpperCase()} · ${t}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 30000)
    return () => clearInterval(interval)
  }, [])

  const urgentCount = taskCount > 0 ? Math.min(3, taskCount) : 0

  return (
    <div className="mb-5 animate-fadeUp">
      <div className="font-mono text-xs text-hf-muted tracking-wider uppercase mb-1">
        {time}
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-hf-head leading-tight mb-1">
        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, Corey.
        {urgentCount > 0 && (
          <>
            {' '}You have <span className="text-hf-red font-bold">{urgentCount} urgent</span> tasks.
          </>
        )}
      </h1>
      {workingAgent && (
        <div className="text-sm text-hf-sub font-mono">
          1 agent working · {workingAgent}
        </div>
      )}
    </div>
  )
}
