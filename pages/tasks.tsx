'use client'

import { useEffect, useState } from 'react'
import TaskCard from '../components/TaskCard'
import SectionHeader from '../components/SectionHeader'
import { supabase } from '../lib/supabase'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: string
  tag?: string
  assigned_agent?: string
  due_date?: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    if (!supabase) return
    try {
      const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (data) {
        setTasks(data as Task[])
      }
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = {
    'Todo': tasks.filter((t) => t.status === 'todo'),
    'Dispatched': tasks.filter((t) => t.status === 'dispatched'),
    'Active': tasks.filter((t) => ['claimed', 'running', 'review'].includes(t.status)),
    'Done': tasks.filter((t) => t.status === 'done' || t.status === 'completed'),
  }

  return (
    <div className="max-w-full">
      <SectionHeader title="System Task Queue" action={{ label: 'Back to Dash', href: '/' }} />

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(columns).map(([status, statusTasks]) => (
          <div key={status} className="bg-hf-surface/30 border border-hf-border/50 rounded-xs p-3 min-h-[70vh]">
            <h3 className="font-mono text-xs font-bold text-hf-muted uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>{status}</span>
              <span className="text-[10px] bg-hf-border px-1.5 py-0.5 rounded text-hf-sub">{statusTasks.length}</span>
            </h3>
            <div className="space-y-2">
              {statusTasks.map((task, idx) => (
                <div key={task.id} style={{ animationDelay: `${0.1 + idx * 0.05}s` }} className="animate-fadeUp">
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    priority={task.priority}
                    tag={task.tag || 'TASK'}
                    assignee={task.assigned_agent}
                    dueDate={task.due_date}
                    overdue={task.due_date === 'Today' && (task.priority === 'urgent' || task.priority === 'high')}
                  />
                </div>
              ))}
              {statusTasks.length === 0 && (
                <div className="py-8 text-center border border-dashed border-hf-border rounded-xs text-[10px] font-mono text-hf-muted uppercase tracking-widest">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
