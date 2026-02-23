'use client'

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "../../lib/supabase";

// ── TYPES ────────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  status: "todo" | "progress" | "review" | "done" | "blocked";
  priority: "urgent" | "high" | "medium" | "low";
  assigned_agent?: string;
  hustle_id: string;
  created_at?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  revenue: number;
  goal: number;
  status: "active" | "passive" | "paused" | "archived";
  tier: string;
  created_at?: string;
}

// ── CONSTANTS ────────────────────────────────────────────
const AGENTS = [
  { name: 'Coco', color: '#1EC9A0', bg: 'rgba(30,201,160,.18)', role: 'Research · Analysis', tier: 'T1 Flash' },
  { name: 'Max', color: '#3D7EFF', bg: 'rgba(61,126,255,.18)', role: 'Strategy · Planning', tier: 'T1 Flash' },
  { name: 'Chaz', color: '#F0A832', bg: 'rgba(240,168,50,.18)', role: 'Copywriting · Voice', tier: 'T2 Haiku' },
  { name: 'Sheila', color: '#A855F7', bg: 'rgba(168,85,247,.18)', role: 'Creative · Design notes', tier: 'T2 Haiku' },
  { name: 'Bob', color: '#6B7A9F', bg: 'rgba(107,122,159,.18)', role: 'Utility · Local tasks', tier: 'T0 Ollama' },
];

const STATUS_LABEL: Record<string, string> = {
  todo: 'Todo',
  progress: 'In Progress',
  review: 'Review',
  done: 'Done',
  blocked: 'Blocked'
};

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low'];

const DEMO = {
  project: {
    id: 'demo', name: 'CA101', description: 'Child Actor 101 — core brand: blog, social, parent classes, workshops, and the 11K+ member community. Everything in the ecosystem traces back here.',
    budget: 500, revenue: 312, goal: 500, status: 'active' as const, tier: 'P1 · Primary Engine',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  tasks: [
    { id: 't1', title: 'Update parent workshop email sequences', status: 'todo' as const, priority: 'urgent' as const, assigned_agent: 'Coco', hustle_id: 'demo' },
    { id: 't2', title: 'Draft blog: "How to spot a legit agent"', status: 'progress' as const, priority: 'high' as const, assigned_agent: 'Chaz', hustle_id: 'demo' },
    { id: 't3', title: 'Schedule March workshop on calendar', status: 'todo' as const, priority: 'medium' as const, assigned_agent: '', hustle_id: 'demo' },
    { id: 't4', title: 'Q1 community engagement metrics report', status: 'review' as const, priority: 'medium' as const, assigned_agent: 'Max', hustle_id: 'demo' },
    { id: 't5', title: 'Update FAQ with new CA entertainment law', status: 'done' as const, priority: 'low' as const, assigned_agent: 'Coco', hustle_id: 'demo' },
    { id: 't6', title: 'Feb social media content calendar', status: 'done' as const, priority: 'high' as const, assigned_agent: 'Sheila', hustle_id: 'demo' },
  ],
};

// ── COMPONENT ────────────────────────────────────────────
export default function ProjectDashboard() {
  const router = useRouter();
  const { id: projectId } = router.query;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortMode, setSortMode] = useState(0); // 0=priority desc, 1=priority asc, 2=newest
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [toasts, setToasts] = useState<any[]>([]);

  // Modal / Form states
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form input states
  const [nTitle, setNTitle] = useState('');
  const [nStatus, setNStatus] = useState<'todo' | 'progress' | 'review' | 'blocked'>('todo');
  const [nPriority, setNPriority] = useState<Task['priority']>('medium');
  const [nAgent, setNAgent] = useState('');

  const [eName, setEName] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eBudget, setEBudget] = useState('');
  const [eGoal, setEGoal] = useState('');
  const [eStatus, setEStatus] = useState<Project['status']>('active');
  const [eTier, setETier] = useState('P1 · Primary Engine');

  const [etTitle, setEtTitle] = useState('');
  const [etStatus, setEtStatus] = useState<Task['status']>('todo');
  const [etPriority, setEtPriority] = useState<Task['priority']>('medium');
  const [etAgent, setEtAgent] = useState('');

  // ── INIT ───────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    if (projectId === 'demo') {
      loadDemo();
    } else {
      fetchProject();
    }
  }, [projectId]);

  const loadDemo = () => {
    setProject({ ...DEMO.project });
    setTasks([...DEMO.tasks]);
    setLoading(false);
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      const { data: p, error: pe } = await supabase
        .from('hustles').select('*').eq('id', projectId).single();
      if (pe || !p) throw pe;
      setProject(p);

      const { data: t, error: te } = await supabase
        .from('tasks').select('*').eq('hustle_id', projectId)
        .order('created_at', { ascending: false });
      if (te) throw te;
      setTasks(t || []);
    } catch (err) {
      console.error(err);
      addToast('Could not load project — showing demo', 'err');
      loadDemo();
    } finally {
      setLoading(false);
    }
  };

  // ── ACTIONS ────────────────────────────────────────────
  const addToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleAddTask = async () => {
    if (!nTitle.trim()) { addToast('Title is required', 'err'); return; }

    const newTaskObj: Partial<Task> = {
      title: nTitle,
      status: nStatus,
      priority: nPriority,
      assigned_agent: nAgent || undefined,
      hustle_id: projectId as string,
    };

    if (projectId === 'demo') {
      const demoTask = { ...newTaskObj, id: 'tmp-' + Date.now() } as Task;
      setTasks(prev => [demoTask, ...prev]);
      addToast('✓ Task added (Demo Mode)', 'ok');
      closeAddForm();
      return;
    }

    try {
      const taskToInsert = {
        title: nTitle,
        status: nStatus,
        priority: nPriority,
        assigned_agent: nAgent || null,
        hustle_id: projectId as string,
      };

      const { data, error } = await (supabase as any)
        .from('tasks')
        .insert(taskToInsert)
        .select()
        .single();
      if (error) throw error;
      setTasks(prev => [data, ...prev]);
      addToast('✓ Task added', 'ok');
      closeAddForm();
    } catch (error: any) {
      addToast('Save failed: ' + error.message, 'err');
    }
  };

  const toggleDone = async (task: Task) => {
    const nextStatus: Task['status'] = task.status === 'done' ? 'todo' : 'done';

    if (projectId === 'demo') {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
      addToast(nextStatus === 'done' ? '✓ Completed' : '↩ Reopened', 'ok');
      return;
    }

    try {
      const { error } = await supabase.from('tasks').update({ status: nextStatus }).eq('id', task.id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
      addToast(nextStatus === 'done' ? '✓ Completed' : '↩ Reopened', 'ok');
    } catch (error: any) {
      addToast('Update failed: ' + error.message, 'err');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (projectId === 'demo') {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addToast('🗑 Deleted (Demo Mode)', 'ok');
      return;
    }

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addToast('🗑 Deleted', 'ok');
    } catch (error: any) {
      addToast('Delete failed: ' + error.message, 'err');
    }
  };

  const assignAgent = async (taskId: string, agentName: string) => {
    setOpenDropdown(null);
    if (projectId === 'demo') {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assigned_agent: agentName } : t));
      addToast(agentName ? `→ Assigned to ${agentName}` : 'Agent removed', 'ok');
      return;
    }

    try {
      const { error } = await supabase.from('tasks')
        .update({ assigned_agent: agentName || null })
        .eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assigned_agent: agentName } : t));
      addToast(agentName ? `→ Assigned to ${agentName}` : 'Agent removed', 'ok');
    } catch (error: any) {
      addToast('Update failed: ' + error.message, 'err');
    }
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setEtTitle(task.title);
    setEtStatus(task.status);
    setEtPriority(task.priority);
    setEtAgent(task.assigned_agent || '');
    setIsEditTaskOpen(true);
  };

  const saveTaskEdit = async () => {
    if (!etTitle.trim()) { addToast('Title required', 'err'); return; }
    if (!editingTask) return;

    const updates: Partial<Task> = {
      title: etTitle,
      status: etStatus,
      priority: etPriority,
      assigned_agent: etAgent || undefined
    };

    if (projectId === 'demo') {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...updates } : t));
      addToast('✓ Task updated (Demo)', 'ok');
      setIsEditTaskOpen(false);
      return;
    }

    try {
      const { error } = await supabase.from('tasks')
        .update({ ...updates, assigned_agent: etAgent || null })
        .eq('id', editingTask.id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...updates } : t));
      addToast('✓ Task updated', 'ok');
      setIsEditTaskOpen(false);
    } catch (error: any) {
      addToast('Update failed: ' + error.message, 'err');
    }
  };

  const openEditProject = () => {
    if (!project) return;
    setEName(project.name);
    setEDesc(project.description);
    setEBudget(project.budget.toString());
    setEGoal(project.goal.toString());
    setEStatus(project.status);
    setETier(project.tier);
    setIsEditProjectOpen(true);
  };

  const saveProjectEdit = async () => {
    if (!eName.trim()) { addToast('Name required', 'err'); return; }

    const updates: Partial<Project> = {
      name: eName,
      description: eDesc,
      budget: parseFloat(eBudget) || 0,
      goal: parseFloat(eGoal) || 0,
      status: eStatus,
      tier: eTier
    };

    if (projectId === 'demo') {
      setProject(prev => prev ? { ...prev, ...updates } : null);
      addToast('✓ Project saved (Demo)', 'ok');
      setIsEditProjectOpen(false);
      return;
    }

    try {
      const { error } = await supabase.from('hustles')
        .update(updates)
        .eq('id', projectId);
      if (error) throw error;
      setProject(prev => prev ? { ...prev, ...updates } : null);
      addToast('✓ Project saved', 'ok');
      setIsEditProjectOpen(false);
    } catch (error: any) {
      addToast('Save failed: ' + error.message, 'err');
    }
  };

  const closeAddForm = () => {
    setIsAddTaskOpen(false);
    setNTitle('');
    setNStatus('todo');
    setNPriority('medium');
    setNAgent('');
  };

  // ── COMPUTED ───────────────────────────────────────────
  const getVisibleTasks = () => {
    let list = filter === 'all' ? [...tasks] : tasks.filter(t => t.status === filter);
    if (sortMode === 0) list.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority || 'medium') - PRIORITY_ORDER.indexOf(b.priority || 'medium'));
    if (sortMode === 1) list.sort((a, b) => PRIORITY_ORDER.indexOf(b.priority || 'medium') - PRIORITY_ORDER.indexOf(a.priority || 'medium'));
    // sortMode 2 is newest (default from supabase order)
    return list;
  };

  const totalTasks = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const openCount = totalTasks - doneCount;
  const progressPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const visibleTasks = getVisibleTasks();

  if (loading || !project) {
    return (
      <div className="wrap"><main className="main">
        <div className="sk sk-card" style={{ height: '200px' }}></div>
        <div className="sk sk-card" style={{ marginTop: '20px' }}></div>
        <div className="sk sk-card" style={{ marginTop: '10px' }}></div>
      </main></div>
    );
  }

  return (
    <>
      <Head>
        <title>{project.name} — HustleFlow</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <header className="topbar">
        <div className="logo">HF<span>.SITE</span></div>
        <div className="breadcrumb">
          <a href="/">Dashboard</a>
          <span className="sep">/</span>
          <a href="/hustles">Hustles</a>
          <span className="sep">/</span>
          <span className="cur">{project.name}</span>
        </div>
        <div className="vault-dot"></div>
      </header>

      <div className="wrap">
        <main className="main">
          {/* PAGE HEADER */}
          <div className="ph a1">
            <div className="ph-left">
              <div className="ph-eyebrow">
                <span>{project.tier}</span>
                <span className={`sbadge ${project.status}`}>{project.status}</span>
              </div>
              <h1 className="ph-title">{project.name}</h1>
              <p className="ph-desc">{project.description}</p>
            </div>
            <div className="ph-actions">
              <button className="btn btn-secondary" onClick={openEditProject}>✏️ Edit</button>
              <button className="btn btn-primary" onClick={() => setIsAddTaskOpen(true)}>＋ Task</button>
            </div>
          </div>

          {/* STAT STRIP */}
          <div className="stats a2">
            <div className="stat">
              <div className="stat-lbl">Budget</div>
              <div className="stat-val amber">${project.budget.toLocaleString()}</div>
              <div className="stat-sub">allocated</div>
            </div>
            <div className="stat">
              <div className="stat-lbl">Revenue</div>
              <div className="stat-val teal">${project.revenue.toLocaleString()}</div>
              <div className="stat-sub">this month</div>
            </div>
            <div className="stat">
              <div className="stat-lbl">Open Tasks</div>
              <div className="stat-val accent">{openCount}</div>
              <div className="stat-sub">of {totalTasks} total</div>
            </div>
            <div className="stat">
              <div className="stat-lbl">Goal</div>
              <div className="stat-val">${project.goal.toLocaleString()}</div>
              <div className="stat-sub">target</div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="progress-card a3">
            <div className="prog-head">
              <div className="prog-label">Task Completion</div>
              <div className="prog-pct">{progressPct}%</div>
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${progressPct}%` }}></div>
            </div>
            <div className="prog-labels">
              <span>{doneCount} done</span>
              <span>{openCount} remaining</span>
            </div>
          </div>

          {/* GRID */}
          <div className="grid">
            {/* LEFT: TASKS */}
            <div className="a4">
              <div className="sec-head">
                <div className="sec-title">Tasks <span className="sec-count">{totalTasks}</span></div>
                <div className="sec-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setSortMode((sortMode + 1) % 3)}>
                    ⇅ {sortMode === 0 ? 'Priority ↓' : sortMode === 1 ? 'Priority ↑' : 'Newest'}
                  </button>
                </div>
              </div>

              {/* FILTER TABS */}
              <div className="filter-tabs">
                {['all', 'todo', 'progress', 'review', 'done', 'blocked'].map(f => (
                  <button
                    key={f}
                    className={`ftab ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* TASK LIST */}
              <div className="task-list">
                {visibleTasks.length === 0 ? (
                  <div className="empty">
                    <div className="empty-ico">{filter === 'done' ? '🎉' : '📋'}</div>
                    <div className="empty-txt">{filter === 'all' ? 'No tasks yet — add one below' : `No ${filter} tasks`}</div>
                  </div>
                ) : (
                  visibleTasks.map((t, i) => {
                    const agent = AGENTS.find(a => a.name === t.assigned_agent);
                    return (
                      <div key={t.id} className={`task p-${t.priority || 'medium'} ${t.status === 'done' ? 'done' : ''}`} style={{ animationDelay: `${i * 0.04}s` }}>
                        <button className="check" onClick={() => toggleDone(t)}>
                          {t.status === 'done' && '✓'}
                        </button>
                        <div className="task-body">
                          <div className="task-title">{t.title}</div>
                          <div className="task-meta">
                            <span className={`sbadge ${t.status}`}>{STATUS_LABEL[t.status] || t.status}</span>
                            <span className={`pdot ${t.priority || 'medium'}`}></span>
                            <div className="agent-wrap">
                              <span
                                className={`agent-chip ${agent ? 'assigned' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === t.id ? null : t.id); }}
                              >
                                <span className="av" style={{ background: agent ? agent.bg : 'var(--surface2)', color: agent ? agent.color : 'var(--muted)' }}>
                                  {agent ? agent.name[0] : '?'}
                                </span>
                                {agent ? agent.name : 'Assign…'}
                              </span>

                              <div className={`agent-drop ${openDropdown === t.id ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                                <div className={`adrop-item ${!t.assigned_agent ? 'sel' : ''}`} onClick={() => assignAgent(t.id, '')}>
                                  <div className="adrop-av" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>—</div>
                                  <div className="adrop-info"><div className="name">Unassigned</div><div className="role">No agent</div></div>
                                </div>
                                {AGENTS.map(a => (
                                  <div key={a.name} className={`adrop-item ${t.assigned_agent === a.name ? 'sel' : ''}`} onClick={() => assignAgent(t.id, a.name)}>
                                    <div className="adrop-av" style={{ background: a.bg, color: a.color }}>{a.name[0]}</div>
                                    <div className="adrop-info">
                                      <div className="name">{a.name}</div>
                                      <div className="role">{a.role} · {a.tier}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="task-btns">
                          <button className="tBtn edit" onClick={() => openEditTask(t)}>✏️</button>
                          <button className="tBtn del" onClick={() => handleDeleteTask(t.id)}>🗑</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ADD TASK TRIGGER */}
              {!isAddTaskOpen && (
                <div className="add-trigger" onClick={() => setIsAddTaskOpen(true)}>
                  <span style={{ fontSize: '16px' }}>＋</span> Add a task…
                </div>
              )}

              {/* INLINE ADD TASK FORM */}
              {isAddTaskOpen && (
                <div className="add-form open">
                  <div className="fg">
                    <label className="flabel">Task Title *</label>
                    <input className="finput" value={nTitle} onChange={e => setNTitle(e.target.value)} placeholder="What needs to get done?" autoFocus />
                  </div>
                  <div className="frow">
                    <div className="fg">
                      <label className="flabel">Status</label>
                      <select className="fselect" value={nStatus} onChange={e => setNStatus(e.target.value as any)}>
                        <option value="todo">Todo</option>
                        <option value="progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                    <div className="fg">
                      <label className="flabel">Priority</label>
                      <select className="fselect" value={nPriority} onChange={e => setNPriority(e.target.value as any)}>
                        <option value="medium">Medium</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="fg">
                    <label className="flabel">Assign Agent</label>
                    <select className="fselect" value={nAgent} onChange={e => setNAgent(e.target.value)}>
                      <option value="">— Unassigned —</option>
                      {AGENTS.map(a => <option key={a.name} value={a.name}>● {a.name}</option>)}
                    </select>
                  </div>
                  <div className="factions">
                    <button className="btn btn-ghost btn-sm" onClick={closeAddForm}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleAddTask}>＋ Add Task</button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="a5">
              <div className="card">
                <div className="card-title">Project Info</div>
                <div className="irow"><div className="ikey">Tier</div><div className="ival">{project.tier}</div></div>
                <div className="irow"><div className="ikey">Status</div><div className="ival teal">{project.status}</div></div>
                <div className="irow"><div className="ikey">Budget</div><div className="ival amber">${project.budget.toLocaleString()}</div></div>
                <div className="irow"><div className="ikey">Revenue</div><div className="ival teal">${project.revenue.toLocaleString()}</div></div>
                <div className="irow"><div className="ikey">Goal</div><div className="ival">${project.goal.toLocaleString()}</div></div>
                <div className="irow">
                  <div className="ikey">Created</div>
                  <div className="ival">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : '-'}
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={openEditProject}>✏️ Edit Project</button>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Agents</div>
                <div className="agent-list">
                  {AGENTS.map(a => {
                    const count = tasks.filter(t => t.assigned_agent === a.name && t.status !== 'done').length;
                    return (
                      <div key={a.name} className="agent-row">
                        <div className="av-lg" style={{ background: a.bg, color: a.color }}>{a.name[0]}</div>
                        <div className="agent-row-info">
                          <div className="agent-row-name">{a.name}</div>
                          <div className="agent-row-role">{a.role} · {a.tier}</div>
                        </div>
                        <div className="agent-row-count">{count > 0 ? `${count} active` : 'idle'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* EDIT PROJECT MODAL */}
      <div className={`overlay ${isEditProjectOpen ? 'open' : ''}`} onClick={() => setIsEditProjectOpen(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="mhead">
            <div className="mtitle">✏️ EDIT PROJECT</div>
            <button className="mclose" onClick={() => setIsEditProjectOpen(false)}>✕</button>
          </div>
          <div className="mbody">
            <div className="fg">
              <label className="flabel">Project Name *</label>
              <input className="finput" value={eName} onChange={e => setEName(e.target.value)} />
            </div>
            <div className="fg">
              <label className="flabel">Description</label>
              <textarea className="ftextarea" value={eDesc} onChange={e => setEDesc(e.target.value)}></textarea>
            </div>
            <div className="frow">
              <div className="fg"><label className="flabel">Budget ($)</label><input className="finput" type="number" value={eBudget} onChange={e => setEBudget(e.target.value)} /></div>
              <div className="fg"><label className="flabel">Goal ($)</label><input className="finput" type="number" value={eGoal} onChange={e => setEGoal(e.target.value)} /></div>
            </div>
            <div className="frow">
              <div className="fg">
                <label className="flabel">Status</label>
                <select className="fselect" value={eStatus} onChange={e => setEStatus(e.target.value as any)}>
                  <option value="active">Active</option>
                  <option value="passive">Passive</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="fg">
                <label className="flabel">Tier</label>
                <select className="fselect" value={eTier} onChange={e => setETier(e.target.value)}>
                  <option value="P1 · Primary Engine">P1 · Primary Engine</option>
                  <option value="R2 · Revenue Engine">R2 · Revenue Engine</option>
                  <option value="P3 · Pipeline">P3 · Pipeline</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mfoot">
            <button className="btn btn-ghost" onClick={() => setIsEditProjectOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveProjectEdit}>💾 Save</button>
          </div>
        </div>
      </div>

      {/* EDIT TASK MODAL */}
      <div className={`overlay ${isEditTaskOpen ? 'open' : ''}`} onClick={() => setIsEditTaskOpen(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="mhead">
            <div className="mtitle">✏️ EDIT TASK</div>
            <button className="mclose" onClick={() => setIsEditTaskOpen(false)}>✕</button>
          </div>
          <div className="mbody">
            <div className="fg">
              <label className="flabel">Task Title *</label>
              <input className="finput" value={etTitle} onChange={e => setEtTitle(e.target.value)} />
            </div>
            <div className="frow">
              <div className="fg">
                <label className="flabel">Status</label>
                <select className="fselect" value={etStatus} onChange={e => setEtStatus(e.target.value as any)}>
                  <option value="todo">Todo</option>
                  <option value="progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div className="fg">
                <label className="flabel">Priority</label>
                <select className="fselect" value={etPriority} onChange={e => setEtPriority(e.target.value as any)}>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="fg">
              <label className="flabel">Assigned Agent</label>
              <select className="fselect" value={etAgent} onChange={e => setEtAgent(e.target.value)}>
                <option value="">— Unassigned —</option>
                {AGENTS.map(a => <option key={a.name} value={a.name}>● {a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mfoot">
            <button className="btn btn-ghost" onClick={() => setIsEditTaskOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveTaskEdit}>💾 Save Task</button>
          </div>
        </div>
      </div>

      {/* TOASTS */}
      <div className="toasts">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">{t.type === 'ok' ? '✓' : '⚠'}</span>
            {t.msg}
          </div>
        ))}
      </div>

      <style jsx global>{`
        /* Next.js specific tweaks if any */
      `}</style>
    </>
  );
}

ProjectDashboard.getLayout = (page: React.ReactElement) => page;
