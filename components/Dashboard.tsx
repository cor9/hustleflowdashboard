import { useEffect, useState } from 'react'
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
  priority: 'urgent' | 'high' | 'medium'
  tag?: string
  assignee?: string
  due_date?: string
  status?: string
}

interface Agent {
  id: string
  name: string
  description: string
  status: 'online' | 'idle' | 'offline'
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .limit(10)

      // Fetch agents
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*')
        .limit(10)

      setTasks(tasksData || [])
      setAgents(agentsData || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Mock data if empty
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Update email sequences for parent workshop',
      priority: 'urgent',
      tag: 'CA101',
      assignee: '🤖 Gemini Flash',
      due_date: 'Today',
    },
    {
      id: '2',
      title: 'Send Q1 check-ins to 25 actor roster',
      priority: 'urgent',
      tag: 'TALENT',
      assignee: '👤 Corey',
      due_date: 'Today',
    },
    {
      id: '3',
      title: 'Connect OpenClaw to Qdrant on VPS node',
      priority: 'urgent',
      tag: 'INFRA',
      assignee: '👤 Corey',
      due_date: 'Today',
    },
  ]

  const mockAgents = [
    { id: '1', name: 'Coco', description: 'Partner · T1/T2', status: 'online' as const },
    { id: '2', name: 'Max', description: 'Content · T1/T2', status: 'online' as const },
    { id: '3', name: 'Chaz', description: 'Revenue · T1', status: 'idle' as const },
    { id: '4', name: 'Sheila', description: 'Research · T1/T2', status: 'online' as const },
    { id: '5', name: 'Bob', description: 'Builder · T2/T3', status: 'idle' as const },
  ]

  const displayTasks = tasks.length > 0 ? tasks : mockTasks
  const displayAgents = agents.length > 0 ? agents : mockAgents

  const urgentCount = displayTasks.filter((t) => t.priority === 'urgent').length
  const openCount = displayTasks.length
  const completedToday = 8
  const monthlyRevenue = '$312'

  return (
    <div className="max-w-7xl">
      {/* Greeting */}
      <Greeting taskCount={urgentCount} workingAgent="Max on CA101 blog" />

      {/* Stat Strip */}
      <StatStrip
        urgent={urgentCount}
        open={openCount}
        completed={completedToday}
        revenue={monthlyRevenue}
      />

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          {/* Today's Focus Tasks */}
          <div>
            <SectionHeader title="Today's Focus" action={{ label: 'All tasks' }} />
            <div className="space-y-2">
              {displayTasks.slice(0, 6).map((task, idx) => (
                <div
                  key={task.id}
                  style={{ animationDelay: `${0.18 + idx * 0.05}s` }}
                >
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    priority={task.priority}
                    tag={task.tag}
                    assignee={task.assignee}
                    dueDate={task.due_date}
                    overdue={task.due_date === 'Today' && task.priority === 'urgent'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Hustles */}
          <div>
            <SectionHeader title="Hustles" action={{ label: 'Manage' }} />

            {/* Primary Engines */}
            <div className="text-xs font-mono text-hf-muted uppercase tracking-wider mb-2">
              Primary Engines
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <HustlePrimaryCard
                name="CA101"
                description="Child Actor 101 — blog, social, classes, workshops"
                stats={[
                  { label: 'community', value: '11K+' },
                  { label: 'tasks open', value: '3' },
                ]}
                status="active"
              />
              <HustlePrimaryCard
                name="Bohemia"
                description="Youth Talent Management — Bohemia Group"
                stats={[
                  { label: 'on roster', value: '25' },
                  { label: 'tasks open', value: '5' },
                ]}
                status="needs"
                isBohemia
              />
            </div>

            {/* Revenue Engines */}
            <div className="text-xs font-mono text-hf-muted uppercase tracking-wider mb-2">
              Revenue Engines
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
              <HustleRevenueCard
                icon="⚡"
                name="PREP101"
                type="SaaS · $312/mo"
                tasks="2 open"
                hasTasks
              />
              <HustleRevenueCard
                icon="🎭"
                name="Coaching"
                type="Services"
                tasks="1 open"
                hasTasks
              />
              <HustleRevenueCard
                icon="📂"
                name="Directory"
                type="Vendor listings"
                tasks="quiet"
              />
              <HustleRevenueCard
                icon="📚"
                name="Books/KDP"
                type="Publishing"
                tasks="3 WIP"
                hasTasks
              />
              <HustleRevenueCard
                icon="🛒"
                name="Amazon"
                type="Affiliate"
                tasks="auto"
              />
              <HustleRevenueCard
                icon="👕"
                name="WearPSA"
                type="Merch/POD"
                tasks="auto"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Agents */}
          <div>
            <SectionHeader title="Vault · Agents" action={{ label: 'Full view' }} />
            <div className="space-y-2">
              {mockAgents.map((agent, idx) => (
                <div key={agent.id} style={{ animationDelay: `${0.18 + idx * 0.05}s` }}>
                  <AgentCard
                    name={agent.name}
                    role={agent.description.split(' · ')[0]}
                    tier={agent.description.split(' · ')[1]}
                    status={idx === 1 || idx === 3 ? 'online' : idx === 0 ? 'online' : 'idle'}
                    cost={
                      agent.name === 'Coco'
                        ? '$0.00 mo'
                        : agent.name === 'Max'
                        ? '$3.20 mo'
                        : agent.name === 'Chaz'
                        ? '$1.80 mo'
                        : agent.name === 'Sheila'
                        ? '$2.40 mo'
                        : '$4.60 mo'
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cost Panel */}
          <CostPanel
            monthYear="Feb 2026"
            spent="$8.40"
            cap="$50 cap"
            percentUsed={17}
            remainingBudget="$41.60"
            agents={[
              { agent: 'Coco', percentage: 0, color: 'bg-hf-muted' },
              { agent: 'Max', percentage: 38, color: 'bg-hf-teal' },
              { agent: 'Chaz', percentage: 21, color: 'bg-hf-accent' },
              { agent: 'Sheila', percentage: 29, color: 'bg-hf-accent' },
              { agent: 'Bob', percentage: 55, color: 'bg-hf-red' },
            ]}
          />

          {/* Activity Feed */}
          <div>
            <SectionHeader title="Activity" action={{ label: 'All' }} />
            <ActivityFeed
              items={[
                {
                  icon: '🤖',
                  agent: 'Max',
                  action: 'completed "CA101 blog draft: Legit Agent post"',
                  context: 'CA101 · Content',
                  timeAgo: '2h ago',
                },
                {
                  icon: '🤖',
                  agent: 'Chaz',
                  action: 'generated "Directory money list + blockers report"',
                  context: 'Directory',
                  timeAgo: '3h ago',
                },
                {
                  icon: '🤖',
                  agent: 'Sheila',
                  action: 'published "CA101 competitor analysis — Feb 2026"',
                  context: 'Research',
                  timeAgo: '5h ago',
                },
                {
                  icon: '🤖',
                  agent: 'Bob',
                  action: 'deployed "Hustle Flow dashboard v2"',
                  context: 'Infrastructure',
                  timeAgo: '1h ago',
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
