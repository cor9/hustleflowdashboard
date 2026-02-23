import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { supabase } from '../lib/supabase'

interface Hustle {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed'
  revenue_target: number
  current_revenue: number
  owner: string
}

const mockHustles: Hustle[] = [
  {
    id: '1',
    name: 'CA101 — Child Actor 101',
    description: 'Brand + audience ecosystem: blog, social, classes, workshops',
    status: 'active',
    revenue_target: 50000,
    current_revenue: 12000,
    owner: 'Corey',
  },
  {
    id: '2',
    name: 'Bohemia — Youth Talent Management',
    description: 'Roster of 25+ actors, coaching, bookings, networking',
    status: 'active',
    revenue_target: 25000,
    current_revenue: 8500,
    owner: 'Corey',
  },
  {
    id: '3',
    name: 'PREP101 — SaaS Training Platform',
    description: 'Monthly subscription service for actor prep & audition coaching',
    status: 'active',
    revenue_target: 15000,
    current_revenue: 312,
    owner: 'Corey',
  },
  {
    id: '4',
    name: 'Coaching — 1:1 & Group Sessions',
    description: 'Personalized coaching, workshops, masterclasses',
    status: 'active',
    revenue_target: 12000,
    current_revenue: 4200,
    owner: 'Corey',
  },
  {
    id: '5',
    name: 'Directory — Vendor Listings',
    description: 'Casting agencies, coaches, photographers, workshops marketplace',
    status: 'active',
    revenue_target: 8000,
    current_revenue: 2100,
    owner: 'Corey',
  },
  {
    id: '6',
    name: 'Amazon — Affiliate & Influencer',
    description: 'Books, gear, courses affiliate revenue + Amazon Influencer program',
    status: 'active',
    revenue_target: 6000,
    current_revenue: 450,
    owner: 'Corey',
  },
  {
    id: '7',
    name: 'Books / KDP — Self-Publishing',
    description: 'Kindle Direct Publishing: actor guides, workbooks, scripts',
    status: 'active',
    revenue_target: 5000,
    current_revenue: 890,
    owner: 'Corey',
  },
  {
    id: '8',
    name: 'WearablePSA / Merch — Print-on-Demand',
    description: 'Branded merchandise, apparel, sublimation products',
    status: 'paused',
    revenue_target: 10000,
    current_revenue: 2300,
    owner: 'Corey',
  },
]

function HustleBar({ name, target, current }: { name: string; target: number; current: number }) {
  const percent = Math.round((current / target) * 100)
  return (
    <div className="mb-4 animate-fadeUp">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-hf-head">{name}</h3>
        <div className="text-right">
          <div className="font-mono text-sm font-bold text-hf-teal">
            ${current.toLocaleString()}
          </div>
          <div className="font-mono text-xs text-hf-muted">
            {percent}% of ${target.toLocaleString()} goal
          </div>
        </div>
      </div>
      <div className="w-full bg-hf-surface2 rounded-sm h-2 overflow-hidden">
        <div
          className="h-full rounded-sm bg-gradient-to-r from-hf-teal to-hf-accent transition-all duration-600"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default function HustlesPage() {
  const [hustles, setHustles] = useState<Hustle[]>(mockHustles)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHustles()
  }, [])

  const loadHustles = async () => {
    try {
      const { data } = await supabase.from('hustles').select('*')
      if (data && data.length > 0) {
        setHustles(data as Hustle[])
      }
    } catch (err) {
      console.error('Failed to load hustles:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeHustles = hustles.filter((h) => h.status === 'active')
  const pausedHustles = hustles.filter((h) => h.status === 'paused')
  const totalRevenue = hustles.reduce((sum, h) => sum + h.current_revenue, 0)
  const totalTarget = hustles.reduce((sum, h) => sum + h.revenue_target, 0)

  return (
    <div className="max-w-4xl">
      <SectionHeader title="Hustles" action={{ label: 'New hustle' }} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <div className="bg-hf-surface border border-hf-border rounded-xs p-4">
          <div className="font-mono text-xs text-hf-muted uppercase tracking-wider mb-2">
            Total Revenue
          </div>
          <div className="font-mono text-3xl font-bold text-hf-teal">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-hf-sub mt-2">
            Across {hustles.length} projects
          </div>
        </div>

        <div className="bg-hf-surface border border-hf-border rounded-xs p-4">
          <div className="font-mono text-xs text-hf-muted uppercase tracking-wider mb-2">
            Goal
          </div>
          <div className="font-mono text-3xl font-bold text-hf-amber">
            ${totalTarget.toLocaleString()}
          </div>
          <div className="text-xs text-hf-sub mt-2">
            Combined annual target
          </div>
        </div>

        <div className="bg-hf-surface border border-hf-border rounded-xs p-4">
          <div className="font-mono text-xs text-hf-muted uppercase tracking-wider mb-2">
            Progress
          </div>
          <div className="font-mono text-3xl font-bold text-hf-accent">
            {Math.round((totalRevenue / totalTarget) * 100)}%
          </div>
          <div className="text-xs text-hf-sub mt-2">
            of annual goal
          </div>
        </div>
      </div>

      {/* Active Hustles */}
      <SectionHeader title="Active Projects" />
      <div className="bg-hf-surface border border-hf-border rounded-xs p-4 mb-8">
        {activeHustles.map((hustle, idx) => (
          <div
            key={hustle.id}
            style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
            className="animate-fadeUp"
          >
            <HustleBar name={hustle.name} target={hustle.revenue_target} current={hustle.current_revenue} />
          </div>
        ))}
      </div>

      {/* Paused Hustles */}
      {pausedHustles.length > 0 && (
        <>
          <SectionHeader title="Paused / Archived" />
          <div className="bg-hf-surface/50 border border-hf-border rounded-xs p-4">
            {pausedHustles.map((hustle, idx) => (
              <div
                key={hustle.id}
                style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                className="animate-fadeUp opacity-75"
              >
                <HustleBar name={hustle.name} target={hustle.revenue_target} current={hustle.current_revenue} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
