import { useEffect, useState } from 'react'
import AgentCard from '../components/AgentCard'
import SectionHeader from '../components/SectionHeader'
import { supabase } from '../lib/supabase'

interface Agent {
  id: string
  name: string
  description: string
  status: 'online' | 'idle' | 'offline'
  tasks_completed: number
  tasks_in_progress: number
  last_activity: string
}

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Coco',
    description: 'Strategic Partner — Router / Orchestrator',
    status: 'online',
    tasks_completed: 47,
    tasks_in_progress: 1,
    last_activity: 'Routed CA101 heatmap report to Documents · 1d ago',
  },
  {
    id: '2',
    name: 'Max',
    description: 'Content Factory — Blog, Video, Social, Copy',
    status: 'online',
    tasks_completed: 32,
    tasks_in_progress: 2,
    last_activity: 'Completed CA101 week 8 ecosystem video · 2h ago',
  },
  {
    id: '3',
    name: 'Chaz',
    description: 'Revenue Optimization — Merch, Directory, Conversions',
    status: 'idle',
    tasks_completed: 18,
    tasks_in_progress: 0,
    last_activity: 'Generated Directory blockers report · 3h ago',
  },
  {
    id: '4',
    name: 'Sheila',
    description: 'Research & Signal — Trends, Competitive, Insight',
    status: 'online',
    tasks_completed: 25,
    tasks_in_progress: 1,
    last_activity: 'Published CA101 competitor analysis · 5h ago',
  },
  {
    id: '5',
    name: 'Bob',
    description: 'Builder — Code, Infrastructure, Automation',
    status: 'idle',
    tasks_completed: 41,
    tasks_in_progress: 0,
    last_activity: 'Deployed Hustle Flow dashboard v2 · 1h ago',
  },
]

const agentDetails = {
  Coco: {
    tier: 'T1/T2 Router',
    cost: '$0.00/mo',
    role: 'Decision Engine',
    specialty: 'Strategy, routing, oversight',
    models: ['Gemini Flash', 'Claude Sonnet'],
  },
  Max: {
    tier: 'T1/T2 Content',
    cost: '$3.20/mo',
    role: 'Content Factory',
    specialty: 'Blog, video, newsletters, social',
    models: ['Gemini Flash', 'Claude Haiku'],
  },
  Chaz: {
    tier: 'T1 Revenue',
    cost: '$1.80/mo',
    role: 'Revenue Optimizer',
    specialty: 'Merch, directory, conversions',
    models: ['Gemini Flash'],
  },
  Sheila: {
    tier: 'T1/T2 Research',
    cost: '$2.40/mo',
    role: 'Research Analyst',
    specialty: 'Trends, competitive intelligence',
    models: ['Gemini Flash', 'Claude Haiku'],
  },
  Bob: {
    tier: 'T2/T3 Builder',
    cost: '$4.60/mo',
    role: 'Infrastructure Engineer',
    specialty: 'Code, automation, deployments',
    models: ['Claude Haiku', 'Claude Sonnet'],
  },
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      const { data } = await supabase.from('agents').select('*')
      if (data && data.length > 0) {
        setAgents(data as Agent[])
      }
    } catch (err) {
      console.error('Failed to load agents:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <SectionHeader title="Agents Center" action={{ label: 'Logs' }} />

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAgents.map((agent, idx) => {
          const details = agentDetails[agent.name as keyof typeof agentDetails]
          return (
            <div key={agent.id} style={{ animationDelay: `${0.1 + idx * 0.08}s` }} className="animate-fadeUp">
              {/* Card */}
              <div className="bg-hf-surface border border-hf-border rounded-xs p-4 hover:border-hf-border2 transition">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-mono text-lg font-bold text-hf-head">
                      {agent.name}
                    </h2>
                    <p className="text-xs text-hf-sub mt-1">
                      {details.specialty}
                    </p>
                  </div>
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                      agent.status === 'online' ? 'bg-hf-teal' : 'bg-hf-muted'
                    }`}
                    style={
                      agent.status === 'online'
                        ? { boxShadow: '0 0 8px #1EC9A0' }
                        : undefined
                    }
                  />
                </div>

                {/* Role & Tier */}
                <div className="border-b border-hf-border py-3 mb-3">
                  <div className="font-mono text-xs text-hf-muted uppercase tracking-wider mb-1">
                    Role
                  </div>
                  <p className="text-sm text-hf-head font-semibold">
                    {details.role}
                  </p>
                  <p className="text-xs text-hf-sub mt-2">
                    {details.tier}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-hf-surface2 rounded-xs p-2 text-center">
                    <div className="font-mono text-lg font-bold text-hf-head">
                      {agent.tasks_completed}
                    </div>
                    <div className="font-mono text-xs text-hf-muted mt-1">
                      Completed
                    </div>
                  </div>
                  <div className="bg-hf-surface2 rounded-xs p-2 text-center">
                    <div className="font-mono text-lg font-bold text-hf-amber">
                      {agent.tasks_in_progress}
                    </div>
                    <div className="font-mono text-xs text-hf-muted mt-1">
                      Working
                    </div>
                  </div>
                  <div className="bg-hf-surface2 rounded-xs p-2 text-center">
                    <div className="font-mono text-lg font-bold text-hf-teal">
                      {details.cost.split('/')[0]}
                    </div>
                    <div className="font-mono text-xs text-hf-muted mt-1">
                      Cost
                    </div>
                  </div>
                </div>

                {/* Models */}
                <div className="border-t border-hf-border pt-3 mb-3">
                  <div className="font-mono text-xs text-hf-muted uppercase tracking-wider mb-2">
                    Models
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {details.models.map((model) => (
                      <span
                        key={model}
                        className="font-mono text-xs px-2 py-1 bg-hf-border rounded text-hf-sub"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last Activity */}
                <div className="border-t border-hf-border pt-3">
                  <div className="font-mono text-xs text-hf-muted uppercase tracking-wider mb-1">
                    Last Activity
                  </div>
                  <p className="text-xs text-hf-body">
                    {agent.last_activity}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cost Summary */}
      <SectionHeader title="Total Monthly Cost" action={{ label: 'Ledger' }} />
      <div className="bg-hf-surface border border-hf-border rounded-xs p-4 text-center">
        <div className="font-mono text-4xl font-bold text-hf-teal mb-2">
          $12.00
        </div>
        <div className="font-mono text-sm text-hf-sub">
          Feb 2026 • $50 monthly cap • 24% used
        </div>
      </div>
    </div>
  )
}
