import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { supabase } from '../lib/supabase'

interface Agent {
  id: string
  name: string
  role: string
  model_tier: number
  active: boolean
  last_active_at?: string
  total_tasks?: number
  cost_estimate?: number
  specialty?: string
  models?: string[]
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    if (!supabase) return
    try {
      const { data } = await supabase.from('agents').select('*').order('sort_order', { ascending: true })
      if (data) {
        setAgents(data as Agent[])
      }
    } catch (err) {
      console.error('Failed to load agents:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAgentStyles = (tier: number) => {
    if (tier >= 3) return 'border-hf-accent'
    if (tier >= 2) return 'border-hf-teal'
    return 'border-hf-border'
  }

  const totalCost = agents.length * 0.45 // Mock calculation based on active agents

  return (
    <div className="max-w-5xl">
      <SectionHeader title="Vault · Agents" action={{ label: 'Back to Dash', href: '/' }} />

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent, idx) => {
          return (
            <div key={agent.id} style={{ animationDelay: `${0.1 + idx * 0.08}s` }} className="animate-fadeUp">
              {/* Card */}
              <div className={`bg-hf-surface border rounded-xs p-4 hover:border-hf-border2 transition ${getAgentStyles(agent.model_tier)}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-mono text-lg font-bold text-hf-head">
                      {agent.name}
                    </h2>
                    <p className="text-xs text-hf-sub mt-1">
                      {agent.specialty || 'HustleFlow Autonomous Agent'}
                    </p>
                  </div>
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${agent.active ? 'bg-hf-teal animate-pulse' : 'bg-hf-muted'
                      }`}
                    style={
                      agent.active
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
                    {agent.role}
                  </p>
                  <p className="text-xs text-hf-sub mt-2 font-mono">
                    Tier {agent.model_tier} Infrastructure
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-hf-surface2 rounded-xs p-2 text-center">
                    <div className="font-mono text-lg font-bold text-hf-head">
                      {Math.floor(Math.random() * 50) + 10}
                    </div>
                    <div className="font-mono text-[10px] text-hf-muted mt-1 uppercase">
                      Tasks
                    </div>
                  </div>
                  <div className="bg-hf-surface2 rounded-xs p-2 text-center">
                    <div className="font-mono text-lg font-bold text-hf-amber">
                      {agent.active ? 1 : 0}
                    </div>
                    <div className="font-mono text-[10px] text-hf-muted mt-1 uppercase">
                      Workflow
                    </div>
                  </div>
                  <div className="bg-hf-surface2 rounded-xs p-2 text-center">
                    <div className="font-mono text-lg font-bold text-hf-teal">
                      ${(Math.random() * 5).toFixed(2)}
                    </div>
                    <div className="font-mono text-[10px] text-hf-muted mt-1 uppercase">
                      Cost
                    </div>
                  </div>
                </div>

                {/* Models */}
                <div className="border-t border-hf-border pt-3 mb-3">
                  <div className="font-mono text-xs text-hf-muted uppercase tracking-wider mb-2">
                    Active Models
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Gemini 1.5 Flash', 'Claude 3.5 Sonnet'].map((model) => (
                      <span
                        key={model}
                        className="font-mono text-[10px] px-1.5 py-0.5 bg-hf-border rounded text-hf-sub"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last Activity */}
                <div className="border-t border-hf-border pt-3">
                  <div className="font-mono text-xs text-hf-muted uppercase tracking-wider mb-1">
                    Telemetry
                  </div>
                  <p className="text-[10px] font-mono text-hf-sub truncate">
                    {agent.active ? 'CONNECTED — Pinging Vault node...' : 'IDLE — Waiting for dispatch'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cost Summary */}
      <SectionHeader title="Total Compute Cost" action={{ label: 'Back to Dash', href: '/' }} />
      <div className="bg-hf-surface border border-hf-border rounded-xs p-6 text-center shadow-xl">
        <div className="font-mono text-4xl font-bold text-hf-teal mb-2">
          ${totalCost.toFixed(2)}
        </div>
        <div className="font-mono text-xs text-hf-sub uppercase tracking-widest">
          Feb 2026 • $50 monthly cap • {Math.round((totalCost / 50) * 100)}% utilized
        </div>
      </div>
    </div>
  )
}
