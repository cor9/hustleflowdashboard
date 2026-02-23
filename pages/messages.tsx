'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SectionHeader from '../components/SectionHeader'
import { supabase } from '../lib/supabase'

interface Message {
  id: string
  author: string
  avatar: string
  text: string
  timestamp: string
  unread?: boolean
}

interface Thread {
  id: string
  name: string
  topic: string
  lastMessage: string
  participants: string
  unread: number
  messages: Message[]
}

const mockThreads: Thread[] = [
  {
    id: '1',
    name: 'Vault · Strategy',
    topic: 'Core ecosystem planning',
    lastMessage: 'Coco: Ready for week 9 outline?',
    participants: 'Coco, Max, Corey',
    unread: 2,
    messages: [
      { id: '1', author: 'Coco', avatar: 'C', text: 'Let\'s plan next month of CA101 content', timestamp: '2h ago', unread: true },
      { id: '2', author: 'Max', avatar: 'M', text: 'I can have week 8 ecosystem done by Friday', timestamp: '1h ago', unread: true },
      { id: '3', author: 'Coco', avatar: 'C', text: 'Perfect. That gives us room for the guest interview series', timestamp: '30m ago' },
    ],
  },
  {
    id: '2',
    name: 'Revenue Ops',
    topic: 'Monetization & Blockers',
    lastMessage: 'Chaz: Running the money list report now',
    participants: 'Chaz, Corey',
    unread: 0,
    messages: [
      { id: '1', author: 'Chaz', avatar: 'C', text: 'Found 42 unclaimed listings with website + IG - major revenue opportunity', timestamp: 'Yesterday' },
      { id: '2', author: 'Corey', avatar: 'C', text: 'Nice. What\'s the conversion rate if we reach out?', timestamp: 'Yesterday' },
      { id: '3', author: 'Chaz', avatar: 'C', text: 'Running analysis now. Should have data by EOD', timestamp: '3h ago' },
    ],
  },
  {
    id: '3',
    name: 'Infrastructure',
    topic: 'System Updates',
    lastMessage: 'Bob: Dashboard v2 live on production',
    participants: 'Bob, Coco',
    unread: 0,
    messages: [
      { id: '1', author: 'Bob', avatar: 'B', text: 'Deployed Hustle Flow dashboard v2 to VPS. All routes live.', timestamp: '1h ago' },
      { id: '2', author: 'Coco', avatar: 'C', text: 'Verified at hustleflow.site. Good work.', timestamp: '45m ago' },
    ],
  },
]

export default function MessagesPage() {
  const [selectedThread, setSelectedThread] = useState(mockThreads[0])
  const [newMessage, setNewMessage] = useState('')

  const handleSend = () => {
    if (newMessage.trim()) {
      setNewMessage('')
    }
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <SectionHeader title="Communications · Agent Mesh" action={{ label: 'Back to Dash', href: '/' }} />

      <div className="flex-1 flex gap-4 overflow-hidden mt-2">
        {/* Threads List */}
        <div className="w-full md:w-80 bg-hf-surface border border-hf-border rounded-xs overflow-hidden flex flex-col shadow-xl">
          <div className="bg-hf-surface2 px-4 py-3 border-b border-hf-border">
            <h3 className="font-mono text-[10px] font-bold text-hf-muted uppercase tracking-widest">Active Channels</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {mockThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full px-4 py-4 border-b border-hf-border last:border-0 text-left transition-colors ${selectedThread.id === thread.id
                    ? 'bg-hf-accent/10 border-l-2 border-l-hf-accent'
                    : 'hover:bg-hf-surface2/50'
                  }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`font-bold text-xs truncate ${selectedThread.id === thread.id ? 'text-hf-accent' : 'text-hf-head'}`}>
                    {thread.name}
                  </h3>
                  {thread.unread > 0 && (
                    <span className="font-mono text-[9px] bg-hf-accent text-white px-1.5 py-0.5 rounded-full flex-shrink-0 font-bold">
                      {thread.unread}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-hf-sub line-clamp-1 italic">
                  {thread.topic}
                </p>
                <p className="text-[10px] font-mono text-hf-muted mt-2 truncate uppercase tracking-tight">
                  {thread.lastMessage}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-hf-surface border border-hf-border rounded-xs overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-hf-surface2 border-b border-hf-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-hf-head text-sm">{selectedThread.name}</h2>
                <p className="text-[10px] font-mono text-hf-muted mt-1 uppercase tracking-widest">
                  Channel Context: {selectedThread.topic}
                </p>
              </div>
              <div className="flex -space-x-2">
                {selectedThread.participants.split(',').map((p, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-hf-border border border-hf-surface flex items-center justify-center text-[10px] font-bold text-hf-sub shadow-sm">
                    {p.trim()[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar bg-hf-surface/30">
            {selectedThread.messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.author === 'Corey' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold shadow-lg ${msg.author === 'System' ? 'bg-hf-red/20 text-hf-red border border-hf-red/30' : 'bg-hf-accent/20 text-hf-accent border border-hf-accent/30'
                  }`}>
                  {msg.avatar}
                </div>

                {/* Message */}
                <div className={`flex flex-col max-w-[80%] ${msg.author === 'Corey' ? 'items-end' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-1.5 px-1">
                    <span className="font-mono text-[10px] font-bold text-hf-head uppercase tracking-wider">
                      {msg.author}
                    </span>
                    <span className="font-mono text-[9px] text-hf-muted">
                      {msg.timestamp}
                    </span>
                  </div>
                  <div className={`text-xs leading-relaxed p-3.5 shadow-sm ${msg.author === 'Corey'
                      ? 'bg-hf-accent text-white rounded-l-lg rounded-tr-lg'
                      : 'bg-hf-surface2 text-hf-body rounded-r-lg rounded-tl-lg border border-hf-border'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="bg-hf-surface2 border-t border-hf-border p-4">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                placeholder="Transmission packet..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-hf-surface border border-hf-border rounded-xs px-4 py-3 text-xs text-hf-head outline-none focus:border-hf-accent transition-all shadow-inner"
              />
              <button
                onClick={handleSend}
                className="px-6 py-3 bg-hf-accent text-white rounded-xs font-mono text-[10px] font-bold hover:bg-hf-accent/90 transition shadow-lg uppercase tracking-widest"
              >
                Send
              </button>
            </div>
            <div className="mt-2 px-1 flex items-center justify-between">
              <p className="text-[9px] font-mono text-hf-muted uppercase">Econet Encryption: ACTIVE</p>
              <p className="text-[9px] font-mono text-hf-muted uppercase">Agents Listening: {selectedThread.participants}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
