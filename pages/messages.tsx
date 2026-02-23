import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'

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
    name: 'CA101 Blog Strategy',
    topic: 'Content planning & distribution',
    lastMessage: 'Max: Ready for week 9 outline?',
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
    name: 'Directory Money Ops',
    topic: 'Vendor monetization & blockers',
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
    name: 'Bohemia Roster Updates',
    topic: 'Actor management & coaching',
    lastMessage: 'Corey: Q1 check-ins going out this week',
    participants: 'Corey, Max',
    unread: 0,
    messages: [
      { id: '1', author: 'Corey', avatar: 'C', text: '3 of the 25 are ready for pilot season push', timestamp: '4h ago' },
      { id: '2', author: 'Max', avatar: 'M', text: 'Want me to prep coaching materials for them?', timestamp: '3h ago' },
    ],
  },
  {
    id: '4',
    name: 'Infrastructure & Deployments',
    topic: 'System updates and monitoring',
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
    <div className="max-w-5xl h-[calc(100vh-150px)] flex gap-4">
      {/* Threads List */}
      <div className="w-full md:w-80 bg-hf-surface border border-hf-border rounded-xs overflow-hidden flex flex-col">
        <SectionHeader title="Messages" />
        <div className="flex-1 overflow-y-auto">
          {mockThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedThread(thread)}
              className={`w-full px-3 py-3 border-b border-hf-border text-left transition-colors ${
                selectedThread.id === thread.id
                  ? 'bg-hf-accent/10 border-l-2 border-l-hf-accent'
                  : 'hover:bg-hf-surface2'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm text-hf-head truncate">
                  {thread.name}
                </h3>
                {thread.unread > 0 && (
                  <span className="font-mono text-xs bg-hf-accent text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {thread.unread}
                  </span>
                )}
              </div>
              <p className="text-xs text-hf-sub line-clamp-1">
                {thread.topic}
              </p>
              <p className="text-xs text-hf-muted mt-1 line-clamp-1">
                {thread.lastMessage}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-hf-surface border border-hf-border rounded-xs overflow-hidden">
        {/* Header */}
        <div className="border-b border-hf-border px-4 py-3">
          <h2 className="font-semibold text-hf-head">{selectedThread.name}</h2>
          <p className="text-xs text-hf-muted mt-1">
            {selectedThread.participants}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {selectedThread.messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-hf-accent/20 flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold text-hf-accent">
                {msg.avatar}
              </div>

              {/* Message */}
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-sm font-semibold text-hf-head">
                    {msg.author}
                  </span>
                  <span className="font-mono text-xs text-hf-muted">
                    {msg.timestamp}
                  </span>
                </div>
                <p className="text-sm text-hf-body leading-relaxed bg-hf-surface2 rounded-xs p-2.5">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-hf-border p-3 flex gap-2">
          <input
            type="text"
            placeholder="Message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-hf-surface2 border border-hf-border rounded-xs px-3 py-2 text-sm text-hf-head outline-none focus:border-hf-accent transition"
          />
          <button
            onClick={handleSend}
            className="px-3 py-2 bg-hf-accent text-white rounded-xs font-mono text-xs font-semibold hover:bg-hf-accent/90 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
