import { useEffect, useState } from 'react'
import TaskCard from '../components/TaskCard'
import SectionHeader from '../components/SectionHeader'
import { supabase } from '../lib/supabase'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'urgent' | 'high' | 'medium'
  status: string
  tag?: string
  assignee?: string
  due_date?: string
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Update email sequences for parent workshop',
    description: 'Send follow-up sequences',
    priority: 'urgent',
    status: 'To Do',
    tag: 'CA101',
    assignee: '🤖 Max',
    due_date: 'Today',
  },
  {
    id: '2',
    title: 'Send Q1 check-ins to 25 actor roster',
    priority: 'urgent',
    status: 'To Do',
    tag: 'TALENT',
    assignee: '👤 Corey',
    due_date: 'Today',
  },
  {
    id: '3',
    title: 'Connect OpenClaw to Qdrant on VPS node',
    priority: 'urgent',
    status: 'To Do',
    tag: 'INFRA',
    assignee: '👤 Corey',
    due_date: 'Today',
  },
  {
    id: '4',
    title: 'Build March coaching class schedule',
    priority: 'high',
    status: 'In Progress',
    tag: 'COACHING',
    assignee: '👤 Corey',
    due_date: 'Feb 25',
  },
  {
    id: '5',
    title: 'Analyze PREP101 onboarding drop-off',
    priority: 'high',
    status: 'In Progress',
    tag: 'PREP101',
    assignee: '🤖 Chaz',
    due_date: 'Feb 25',
  },
  {
    id: '6',
    title: 'KDP competitor pricing research',
    priority: 'medium',
    status: 'Backlog',
    tag: 'BOOKS',
    assignee: '🤖 Sheila',
    due_date: 'Feb 28',
  },
  {
    id: '7',
    title: 'Update Amazon affiliate widget',
    priority: 'medium',
    status: 'Backlog',
    tag: 'AMAZON',
    assignee: '🤖 Max',
    due_date: 'Mar 5',
  },
  {
    id: '8',
    title: 'Design WearPSA Q2 merchandise',
    priority: 'medium',
    status: 'Backlog',
    tag: 'MERCH',
    assignee: '👤 Corey',
    due_date: 'Mar 10',
  },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const { data } = await supabase.from('tasks').select('*').limit(20)
      if (data && data.length > 0) {
        setTasks(data as Task[])
      }
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = {
    'To Do': tasks.filter((t) => t.status === 'To Do'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    'Backlog': tasks.filter((t) => t.status === 'Backlog'),
    'Done': tasks.filter((t) => t.status === 'Done'),
  }

  return (
    <div className="max-w-full">
      <SectionHeader title="Tasks Kanban" action={{ label: 'List view' }} />

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(columns).map(([status, statusTasks]) => (
          <div key={status} className="bg-hf-surface/30 rounded-xs p-3 min-h-96">
            <h3 className="font-mono text-xs font-bold text-hf-muted uppercase tracking-wider mb-3">
              {status}
              <span className="ml-2 text-hf-sub">({statusTasks.length})</span>
            </h3>
            <div className="space-y-2">
              {statusTasks.map((task, idx) => (
                <div key={task.id} style={{ animationDelay: `${0.1 + idx * 0.05}s` }} className="animate-fadeUp">
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    priority={task.priority}
                    tag={task.tag}
                    tagColor={
                      task.tag === 'CA101'
                        ? 'border-hf-accent/20 text-hf-accent'
                        : task.tag === 'PREP101'
                        ? 'border-hf-teal/20 text-hf-teal'
                        : task.tag === 'TALENT'
                        ? 'border-hf-amber/20 text-hf-amber'
                        : 'border-hf-border text-hf-muted'
                    }
                    assignee={task.assignee}
                    dueDate={task.due_date}
                    overdue={task.due_date === 'Today' && task.priority === 'urgent'}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
