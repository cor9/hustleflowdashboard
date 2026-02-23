'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SectionHeader from '../components/SectionHeader'
import { supabase } from '../lib/supabase'

interface Hustle {
  id: string
  name: string
  description: string
  status: string
  goal: number
  budget: number
  tier: string
  color: string
}

function HustleBar({ id, name, goal, budget, color }: { id: string; name: string; goal: number; budget: number; color?: string }) {
  const percent = goal > 0 ? Math.round((budget / goal) * 100) : 0
  return (
    <Link href={`/hustles/${id}`} className="block group mb-4 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-hf-head group-hover:text-hf-accent transition-colors">{name}</h3>
          <p className="text-[10px] font-mono text-hf-muted uppercase tracking-widest mt-0.5">System ID: {id.slice(0, 8)}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-bold text-hf-teal">
            ${budget?.toLocaleString() || '0'}
          </div>
          <div className="font-mono text-[10px] text-hf-muted uppercase">
            {percent}% of ${goal?.toLocaleString() || '0'} TARGET
          </div>
        </div>
      </div>
      <div className="w-full bg-hf-surface2 border border-hf-border/30 rounded-xs h-1.5 overflow-hidden">
        <div
          className="h-full rounded-xs transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(percent, 100)}%`,
            backgroundColor: color || '#1EC9A0',
            boxShadow: `0 0 10px ${color || '#1EC9A0'}44`
          }}
        />
      </div>
    </Link>
  )
}

export default function HustlesPage() {
  const [hustles, setHustles] = useState<Hustle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHustles()
  }, [])

  const loadHustles = async () => {
    if (!supabase) return
    try {
      const { data } = await supabase.from('hustles').select('*').order('sort_order', { ascending: true })
      if (data) {
        setHustles(data as Hustle[])
      }
    } catch (err) {
      console.error('Failed to load hustles:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeHustles = hustles.filter((h) => h.status === 'active')
  const otherHustles = hustles.filter((h) => h.status !== 'active')
  const totalBudget = hustles.reduce((sum, h) => sum + (h.budget || 0), 0)
  const totalGoal = hustles.reduce((sum, h) => sum + (h.goal || 0), 0)

  return (
    <div className="max-w-4xl">
      <SectionHeader title="Hustle Registry" action={{ label: 'New Prototype', href: '/' }} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <div className="bg-hf-surface border border-hf-border rounded-xs p-4 shadow-lg">
          <div className="font-mono text-[10px] text-hf-muted uppercase tracking-widest mb-1">
            Total Deployed
          </div>
          <div className="font-mono text-3xl font-bold text-hf-teal">
            ${totalBudget.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-hf-sub mt-2 uppercase">
            Across {hustles.length} engines
          </div>
        </div>

        <div className="bg-hf-surface border border-hf-border rounded-xs p-4 shadow-lg">
          <div className="font-mono text-[10px] text-hf-muted uppercase tracking-widest mb-1">
            Revenue Target
          </div>
          <div className="font-mono text-3xl font-bold text-hf-amber">
            ${totalGoal.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-hf-sub mt-2 uppercase">
            Combined ecosystem goal
          </div>
        </div>

        <div className="bg-hf-surface border border-hf-border rounded-xs p-4 shadow-lg">
          <div className="font-mono text-[10px] text-hf-muted uppercase tracking-widest mb-1">
            Utilization
          </div>
          <div className="font-mono text-3xl font-bold text-hf-accent">
            {totalGoal > 0 ? Math.round((totalBudget / totalGoal) * 100) : 0}%
          </div>
          <div className="text-[10px] font-mono text-hf-sub mt-2 uppercase">
            Resource efficiency
          </div>
        </div>
      </div>

      {/* Active Hustles */}
      <SectionHeader title="Active Engines" />
      <div className="bg-hf-surface border border-hf-border rounded-xs p-5 mb-8 shadow-inner">
        {activeHustles.length > 0 ? activeHustles.map((hustle, idx) => (
          <div
            key={hustle.id}
            style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
            className="animate-fadeUp"
          >
            <HustleBar id={hustle.id} name={hustle.name} goal={hustle.goal} budget={hustle.budget} color={hustle.color} />
          </div>
        )) : (
          <div className="py-12 text-center text-hf-muted font-mono text-xs uppercase tracking-[0.2em]">
            No active engines found
          </div>
        )}
      </div>

      {/* Non-Active Hustles */}
      {otherHustles.length > 0 && (
        <>
          <SectionHeader title="Archived / Pipeline" />
          <div className="bg-hf-surface/30 border border-hf-border/50 rounded-xs p-5">
            {otherHustles.map((hustle, idx) => (
              <div
                key={hustle.id}
                style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                className="animate-fadeUp opacity-60 grayscale-[0.5]"
              >
                <HustleBar id={hustle.id} name={hustle.name} goal={hustle.goal} budget={hustle.budget} color={hustle.color || '#444'} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
