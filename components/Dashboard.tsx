import { useEffect, useState } from 'react'
import Link from 'next/link'
import Greeting from './Greeting'
import StatStrip from './StatStrip'
import TaskCard from './TaskCard'
import AgentCard from './AgentCard'
import { HustlePrimaryCard, HustleRevenueCard } from './HustleCard'
import CostPanel from './CostPanel'
import ActivityFeed from './ActivityFeed'
import SectionHeader from './SectionHeader'
import { supabase } from '../lib/supabase'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  tag?: string
  assigned_agent?: string
  due_date?: string
  status?: string
}

interface Agent {
  id: string
  name: string
  role: string
  model_tier: number
  active: boolean
}

interface Hustle {
  id: string
  name: string
  description: string
  tier: string
  status: string
  budget: number
  goal: number
  color: string
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [hustles, setHustles] = useState<Hustle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!supabase) return

    // Wait for session to be confirmed before querying
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No session — user not authenticated')
      return
    }

    try {
      setLoading(true)
      const [tasksRes, agentsRes, hustlesRes] = await Promise.all([
        supabase.from('tasks').select('*').limit(6).order('created_at', { ascending: false }),
        supabase.from('agents').select('*').limit(5).order('sort_order', { ascending: true }),
        supabase.from('hustles').select('*').order('sort_order', { ascending: true })
      ])
      console.log('session uid:', session.user.id)
      console.log('hustles:', hustlesRes.data, hustlesRes.error)
      setTasks(tasksRes.data || [])
      setAgents(agentsRes.data || [])
      setHustles(hustlesRes.data || [])
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const primaryHustles = hustles.filter(h => h?.tier?.includes('P1'))
  const revenueHustles = hustles.filter(h => h?.tier?.includes('R2'))

  const urgentTasks = tasks.filter(t => t.priority === 'urgent')

  return (
    <div className="max-w-7xl">
      <Greeting taskCount={urgentTasks.length} workingAgent="Monitoring HustleFlow" />

      <StatStrip
        urgent={urgentTasks.length}
        open={tasks.length}
        completed={0}
        revenue={(hustles || []).reduce((sum, h) => sum + (h?.goal || 0), 0).toLocaleString()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <SectionHeader title="Today's Focus" action={{ label: 'All tasks', href: '/tasks' }} />
            <div className="space-y-2">
              {tasks.length > 0 ? tasks.map((task, idx) => (
                <Link key={task.id} href="/tasks">
                  <div style={{ animationDelay: `${0.18 + idx * 0.05}s` }}>
                    <TaskCard
                      title={task.title}
                      description={task.description}
                      priority={task.priority}
                      tag={task.tag || 'TASK'}
                      assignee={task.assigned_agent}
                      dueDate={task.due_date}
                    />
                  </div>
                </Link>
              )) : (
                <div className="bg-hf-surface/30 border border-hf-border border-dashed rounded-xs p-8 text-center text-hf-muted font-mono text-sm">
                  No urgent tasks. System is optimal.
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionHeader title="Hustles" action={{ label: 'Manage All', href: '/hustles' }} />

            {/* Primary Engines */}
            {primaryHustles.length > 0 && (
              <>
                <div className="text-xs font-mono text-hf-muted uppercase tracking-wider mb-2">
                  Primary Engines
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {primaryHustles.map(h => (
                    <HustlePrimaryCard
                      key={h.id}
                      id={h.id}
                      name={h.name}
                      description={h.description}
                      stats={[
                        { label: 'goal', value: `$${h.goal}` },
                        { label: 'tier', value: h?.tier?.split(' · ')[0] || '' },
                      ]}
                      status={h.status === 'active' ? 'active' : 'needs'}
                      isBohemia={h.name === 'Bohemia'}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Revenue Engines */}
            {revenueHustles.length > 0 && (
              <>
                <div className="text-xs font-mono text-hf-muted uppercase tracking-wider mb-2 mt-4">
                  Revenue Engines
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                  {revenueHustles.map(h => (
                    <HustleRevenueCard
                      key={h.id}
                      id={h.id}
                      icon="💰"
                      name={h.name}
                      type={h?.tier?.split(' · ')[1] || ''}
                      tasks="Active"
                      hasTasks={true}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          <div>
            <SectionHeader title="Vault · Agents" action={{ label: 'Full view', href: '/agents' }} />
            <div className="space-y-2">
              {agents.map((agent, idx) => (
                <Link key={agent.id} href="/agents">
                  <div style={{ animationDelay: `${0.18 + idx * 0.05}s` }}>
                    <AgentCard
                      name={agent.name}
                      role={agent.role}
                      tier={`T${agent.model_tier}`}
                      status={agent.active ? 'online' : 'idle'}
                      cost="$0.00 mo"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <CostPanel
            monthYear="Feb 2026"
            spent="$0.00"
            cap="$50 cap"
            percentUsed={0}
            remainingBudget="$50.00"
            agents={agents.map(a => ({ agent: a.name, percentage: 0, color: 'bg-hf-teal' }))}
          />

          <div>
            <SectionHeader title="Activity" action={{ label: 'All', href: '/messages' }} />
            <ActivityFeed
              items={[
                {
                  icon: '🤖',
                  agent: 'System',
                  action: 'connected to Supabase real-time engine',
                  context: 'Infrastructure',
                  timeAgo: 'now',
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
