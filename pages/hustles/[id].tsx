import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

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
  created_at: string;
}

const SUPABASE_URL = "https://uxrpljylbhifolcqslju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cnBsanlsYmhpZm9sY3FzbGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDgzNzAsImV4cCI6MjA4NjY4NDM3MH0.WMR3fZpubA-lEGUWCMwqFya5Nucg17LHR5pNRCpitEs";

const AGENTS = [
  { name: "Coco", color: "#1EC9A0", bg: "rgba(30,201,160,.18)", role: "Partner" },
  { name: "Max", color: "#3D7EFF", bg: "rgba(61,126,255,.18)", role: "Content" },
  { name: "Chaz", color: "#F0A832", bg: "rgba(240,168,50,.18)", role: "Revenue" },
  { name: "Sheila", color: "#A855F7", bg: "rgba(168,85,247,.18)", role: "Research" },
  { name: "Bob", color: "#6B7A9F", bg: "rgba(107,122,159,.18)", role: "Builder" },
];

const DEMO_PROJECT: Project = {
  id: "demo",
  name: "CA101",
  description: "Child Actor 101 — core brand",
  budget: 500,
  revenue: 312,
  goal: 500,
  status: "active",
  tier: "P1 · Primary Engine",
  created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
};

const DEMO_TASKS: Task[] = [
  {
    id: "t1",
    title: "Update parent workshop email sequences",
    status: "todo",
    priority: "urgent",
    assigned_agent: "Coco",
    hustle_id: "demo",
  },
  {
    id: "t2",
    title: "Draft blog: How to spot a legit agent",
    status: "progress",
    priority: "high",
    assigned_agent: "Max",
    hustle_id: "demo",
  },
  {
    id: "t3",
    title: "Schedule March workshop",
    status: "todo",
    priority: "medium",
    hustle_id: "demo",
  },
];

export default function ProjectPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingProject, setEditingProject] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const projRes = await fetch(
        `${SUPABASE_URL}/rest/v1/hustles?id=eq.${id}&select=*`,
        { headers: { apikey: SUPABASE_KEY } }
      );
      const projData = await projRes.json();
      if (projData.length > 0) {
        setProject(projData[0]);
      } else {
        setProject(DEMO_PROJECT);
      }

      const tasksRes = await fetch(
        `${SUPABASE_URL}/rest/v1/tasks?hustle_id=eq.${id}&select=*&order=created_at.desc`,
        { headers: { apikey: SUPABASE_KEY } }
      );
      const tasksData = await tasksRes.json();
      setTasks(tasksData.length > 0 ? tasksData : DEMO_TASKS);
    } catch (err) {
      console.error(err);
      setProject(DEMO_PROJECT);
      setTasks(DEMO_TASKS);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title: string, status: string, priority: string, agent: string) => {
    const task: Task = {
      id: `tmp-${Date.now()}`,
      title,
      status: status as Task["status"],
      priority: priority as Task["priority"],
      assigned_agent: agent || undefined,
      hustle_id: id as string,
    };
    setTasks([task, ...tasks]);
    setNewTask(false);

    if (id !== "demo") {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            title,
            status,
            priority,
            assigned_agent: agent || null,
            hustle_id: id,
          }),
        });
        const data = await res.json();
        if (data[0]) {
          setTasks(tasks.map(t => (t.id === task.id ? data[0] : t)));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t)));
    setEditingTask(null);

    if (id !== "demo") {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));

    if (id !== "demo") {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`, {
          method: "DELETE",
          headers: { apikey: SUPABASE_KEY },
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateProject = async (updates: Partial<Project>) => {
    setProject(project ? { ...project, ...updates } : null);
    setEditingProject(false);

    if (id !== "demo" && project) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/hustles?id=eq.${id}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading || !project) {
    return <div style={{ padding: "40px", color: "#B8C2DA" }}>Loading…</div>;
  }

  const visibleTasks = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <>
      <Head>
        <title>{project.name} — HustleFlow</title>
      </Head>
      <div style={styles.container}>
        <header style={styles.topbar}>
          <div style={styles.logo}>HF<span style={{color:'#3D4B6B'}}>.SITE</span></div>
          <div style={styles.breadcrumb}>
            <a href="/" style={styles.link}>Dashboard</a>
            <span style={{color:'#1E2538'}}> / </span>
            <a href="/hustles" style={styles.link}>Hustles</a>
            <span style={{color:'#1E2538'}}> / </span>
            <span style={{color:'#E2E8F5'}}>{project.name}</span>
          </div>
        </header>

        <main style={styles.main}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <div style={styles.eyebrow}>{project.tier}</div>
              <h1 style={styles.title}>{project.name}</h1>
              <p style={styles.desc}>{project.description}</p>
            </div>
            <div style={styles.actions}>
              <button
                onClick={() => setEditingProject(!editingProject)}
                style={{...styles.btn, ...styles.btnSecondary}}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setNewTask(!newTask)}
                style={{...styles.btn, ...styles.btnPrimary}}
              >
                ＋ Task
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Budget</div>
              <div style={{...styles.statVal, color:'#F0A832'}}>${project.budget}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Revenue</div>
              <div style={{...styles.statVal, color:'#1EC9A0'}}>${project.revenue}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Open Tasks</div>
              <div style={{...styles.statVal, color:'#3D7EFF'}}>{tasks.filter(t=>t.status!=='done').length}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Goal</div>
              <div style={styles.statVal}>${project.goal}</div>
            </div>
          </div>

          {/* Progress */}
          <div style={styles.progressCard}>
            <div style={styles.progHead}>
              <div style={styles.progLabel}>Task Completion</div>
              <div style={styles.progPct}>{progress}%</div>
            </div>
            <div style={styles.progTrack}>
              <div style={{...styles.progFill, width:`${progress}%`}}></div>
            </div>
            <div style={styles.progLabels}>
              <span>{doneTasks} done</span>
              <span>{tasks.filter(t=>t.status!=='done').length} remaining</span>
            </div>
          </div>

          {/* Tasks */}
          <div style={styles.grid}>
            <div>
              <div style={styles.sectionHead}>
                Tasks <span style={styles.count}>{tasks.length}</span>
              </div>

              {/* Filter tabs */}
              <div style={styles.filterTabs}>
                {["all", "todo", "progress", "review", "done", "blocked"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      ...styles.filterTab,
                      ...(filter === f ? styles.filterTabActive : {}),
                    }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Task list */}
              <div style={styles.taskList}>
                {visibleTasks.map(task => {
                  const agent = AGENTS.find(a => a.name === task.assigned_agent);
                  return (
                    <div key={task.id} style={{...styles.task, ...(task.status === 'done' ? {opacity: 0.5} : {})}}>
                      <input
                        type="checkbox"
                        checked={task.status === "done"}
                        onChange={() => updateTask(task.id, { status: task.status === "done" ? "todo" : "done" })}
                        style={styles.checkbox}
                      />
                      <div style={styles.taskBody}>
                        <div style={{...styles.taskTitle, ...(task.status === 'done' ? {textDecoration:'line-through', color:'#3D4B6B'} : {})}}>{task.title}</div>
                        <div style={styles.taskMeta}>
                          <span style={{...styles.badge, ...styles[`badge${task.status}`]}}>{task.status}</span>
                          {agent && (
                            <span style={{...styles.agent, background: agent.bg, color: agent.color}}>
                              {agent.name[0]} {agent.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={styles.taskActions}>
                        <button onClick={() => setEditingTask(task.id)} style={styles.actionBtn}>✏️</button>
                        <button onClick={() => deleteTask(task.id)} style={styles.actionBtn}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add task form */}
              {newTask && (
                <AddTaskForm onAdd={addTask} onCancel={() => setNewTask(false)} />
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Project Info</div>
                <div style={styles.infoRow}>
                  <span>Tier</span>
                  <span style={styles.infoVal}>{project.tier}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>Status</span>
                  <span style={{...styles.infoVal, color:'#1EC9A0'}}>{project.status}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>Budget</span>
                  <span style={{...styles.infoVal, color:'#F0A832'}}>${project.budget}</span>
                </div>
                <button
                  onClick={() => setEditingProject(!editingProject)}
                  style={{...styles.btn, ...styles.btnSecondary, width:'100%', marginTop:'12px'}}
                >
                  ✏️ Edit
                </button>
              </div>

              <div style={styles.card}>
                <div style={styles.cardTitle}>Assigned Agents</div>
                {AGENTS.map(a => {
                  const count = tasks.filter(t => t.assigned_agent === a.name && t.status !== 'done').length;
                  return (
                    <div key={a.name} style={{...styles.agentRow, background: a.bg, color: a.color, padding: '8px', borderRadius: '8px', marginBottom: '4px'}}>
                      <strong>{a.name}</strong>
                      <span style={{marginLeft:'auto'}}>{count > 0 ? `${count} active` : 'idle'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Edit Project Modal */}
        {editingProject && (
          <EditProjectModal project={project} onSave={updateProject} onClose={() => setEditingProject(false)} />
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <EditTaskModal
            task={tasks.find(t => t.id === editingTask)!}
            onSave={(updates) => updateTask(editingTask, updates)}
            onClose={() => setEditingTask(null)}
          />
        )}
      </div>
    </>
  );
}

function AddTaskForm({ onAdd, onCancel }: { onAdd: (title: string, status: string, priority: string, agent: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [agent, setAgent] = useState("");

  return (
    <div style={styles.formContainer}>
      <input placeholder="Task title..." value={title} onChange={e => setTitle(e.target.value)} style={styles.input} />
      <select value={status} onChange={e => setStatus(e.target.value)} style={styles.select}>
        <option value="todo">Todo</option>
        <option value="progress">In Progress</option>
      </select>
      <select value={agent} onChange={e => setAgent(e.target.value)} style={styles.select}>
        <option value="">— Unassigned —</option>
        {AGENTS.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
      </select>
      <div style={{display:'flex', gap:'8px'}}>
        <button onClick={() => onAdd(title, status, priority, agent)} style={{...styles.btn, ...styles.btnPrimary, flex:1}}>Add</button>
        <button onClick={onCancel} style={{...styles.btn, ...styles.btnSecondary, flex:1}}>Cancel</button>
      </div>
    </div>
  );
}

function EditProjectModal({ project, onSave, onClose }: { project: Project; onSave: (updates: Partial<Project>) => void; onClose: () => void }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [budget, setBudget] = useState(project.budget.toString());
  const [goal, setGoal] = useState(project.goal.toString());

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={{...styles.modalContent, minWidth:'500px'}} onClick={e => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Edit Project</h2>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={styles.input} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{...styles.input, minHeight:'80px'}} />
        <input type="number" placeholder="Budget" value={budget} onChange={e => setBudget(e.target.value)} style={styles.input} />
        <input type="number" placeholder="Goal" value={goal} onChange={e => setGoal(e.target.value)} style={styles.input} />
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={() => onSave({name, description, budget: parseFloat(budget), goal: parseFloat(goal)})} style={{...styles.btn, ...styles.btnPrimary, flex:1}}>Save</button>
          <button onClick={onClose} style={{...styles.btn, ...styles.btnSecondary, flex:1}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function EditTaskModal({ task, onSave, onClose }: { task: Task; onSave: (updates: Partial<Task>) => void; onClose: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status);
  const [agent, setAgent] = useState(task.assigned_agent || "");

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={{...styles.modalContent, minWidth:'500px'}} onClick={e => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Edit Task</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} style={styles.input} />
        <select value={status} onChange={e => setStatus(e.target.value as any)} style={styles.select}>
          <option value="todo">Todo</option>
          <option value="progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select value={agent} onChange={e => setAgent(e.target.value)} style={styles.select}>
          <option value="">— Unassigned —</option>
          {AGENTS.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
        </select>
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={() => onSave({title, status: status as any, assigned_agent: agent})} style={{...styles.btn, ...styles.btnPrimary, flex:1}}>Save</button>
          <button onClick={onClose} style={{...styles.btn, ...styles.btnSecondary, flex:1}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  container: { background: "#080B12", color: "#B8C2DA", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" },
  topbar: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: "56px", background: "rgba(8,11,18,.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1E2538", display: "flex", alignItems: "center", gap: "10px", padding: "0 16px" },
  logo: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "13px", color: "#3D7EFF" },
  breadcrumb: { display: "flex", alignItems: "center", gap: "6px", flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", overflow: "hidden" },
  link: { color: "#6B7A9F", textDecoration: "none", cursor: "pointer" },
  main: { paddingTop: "56px", maxWidth: "1200px", margin: "0 auto", padding: "80px 20px 40px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", marginBottom: "22px" },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#3D4B6B", textTransform: "uppercase", marginBottom: "6px" },
  title: { fontSize: "30px", fontWeight: 700, color: "#E2E8F5", marginBottom: "6px" },
  desc: { fontSize: "13px", color: "#6B7A9F", maxWidth: "500px" },
  actions: { display: "flex", gap: "8px" },
  btn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "0 14px", height: "36px", borderRadius: "8px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 600, cursor: "pointer", border: "none", transition: "all .15s" },
  btnPrimary: { background: "#3D7EFF", color: "#fff" },
  btnSecondary: { background: "#141826", color: "#B8C2DA", border: "1px solid #1E2538" },
  stats: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "20px" },
  stat: { background: "#0E1220", border: "1px solid #1E2538", borderRadius: "8px", padding: "14px", textAlign: "center" },
  statLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#3D4B6B", textTransform: "uppercase", marginBottom: "6px" },
  statVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: "22px", fontWeight: 700, color: "#E2E8F5" },
  progressCard: { background: "#0E1220", border: "1px solid #1E2538", borderRadius: "12px", padding: "18px", marginBottom: "22px" },
  progHead: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" },
  progLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#3D4B6B", textTransform: "uppercase" },
  progPct: { fontFamily: "'JetBrains Mono', monospace", fontSize: "20px", fontWeight: 700, color: "#E2E8F5" },
  progTrack: { height: "6px", background: "#141826", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" },
  progFill: { height: "100%", borderRadius: "3px", background: "linear-gradient(90deg,#1EC9A0,#3D7EFF)", transition: "width .8s" },
  progLabels: { display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#3D4B6B" },
  grid: { display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 700, color: "#3D4B6B", textTransform: "uppercase" },
  count: { fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: "#141826", border: "1px solid #1E2538", color: "#3D4B6B" },
  filterTabs: { display: "flex", gap: "3px", marginBottom: "10px", background: "#141826", borderRadius: "8px", padding: "3px", border: "1px solid #1E2538", overflowX: "auto" as any },
  filterTab: { fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "5px 11px", borderRadius: "5px", cursor: "pointer", color: "#3D4B6B", border: "none", background: "transparent", transition: "all .15s" },
  filterTabActive: { background: "#0E1220", color: "#E2E8F5", boxShadow: "0 1px 4px rgba(0,0,0,.3)" },
  taskList: { display: "flex", flexDirection: "column" as any, gap: "5px", marginBottom: "10px" },
  task: { background: "#0E1220", border: "1px solid #1E2538", borderRadius: "8px", padding: "11px 12px", display: "flex", alignItems: "center", gap: "9px", transition: "all .15s", borderLeft: "3px solid #3D4B6B" },
  checkbox: { width: "18px", height: "18px", cursor: "pointer", accentColor: "#1EC9A0" },
  taskBody: { flex: 1, minWidth: 0 },
  taskTitle: { fontSize: "13px", fontWeight: 500, color: "#E2E8F5", marginBottom: "4px" },
  taskMeta: { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" as any },
  badge: { fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", padding: "2px 7px", borderRadius: "4px", border: "1px solid" },
  badgetodo: { color: "#6B7A9F", borderColor: "#252D42", background: "#141826" },
  badgeprogress: { color: "#F0A832", borderColor: "rgba(240,168,50,.3)", background: "rgba(240,168,50,.08)" },
  badgedone: { color: "#1EC9A0", borderColor: "rgba(30,201,160,.3)", background: "rgba(30,201,160,.08)" },
  agent: { fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", padding: "2px 7px", borderRadius: "4px" },
  taskActions: { display: "flex", gap: "3px" },
  actionBtn: { width: "26px", height: "26px", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: "#3D4B6B", fontSize: "11px", transition: "all .12s" },
  card: { background: "#0E1220", border: "1px solid #1E2538", borderRadius: "12px", padding: "16px", marginBottom: "12px" },
  cardTitle: { fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#3D4B6B", textTransform: "uppercase", marginBottom: "12px" },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1E2538", fontSize: "10px" },
  infoVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#E2E8F5", fontWeight: 600 },
  agentRow: { padding: "8px", borderRadius: "8px", marginBottom: "4px", fontSize: "12px", display: "flex", justifyContent: "space-between" },
  input: { width: "100%", padding: "9px 12px", marginBottom: "10px", background: "#141826", border: "1px solid #252D42", borderRadius: "8px", color: "#E2E8F5", fontFamily: "'DM Sans', sans-serif", fontSize: "13px" },
  select: { width: "100%", padding: "9px 12px", marginBottom: "10px", background: "#141826", border: "1px solid #252D42", borderRadius: "8px", color: "#E2E8F5", fontFamily: "'DM Sans', sans-serif", fontSize: "13px" },
  formContainer: { background: "#0E1220", border: "1px solid #1E2538", borderRadius: "8px", padding: "14px", marginTop: "6px" },
  modal: { position: "fixed" as any, inset: 0, zIndex: 200, background: "rgba(0,0,0,.72)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modalContent: { background: "#0E1220", border: "1px solid #252D42", borderRadius: "12px", padding: "20px", boxShadow: "0 24px 80px rgba(0,0,0,.6)" },
  modalTitle: { fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: 700, color: "#E2E8F5", marginBottom: "20px" },
};
