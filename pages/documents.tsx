'use client'

import React, { useEffect, useState } from "react"
import Link from 'next/link'
import SectionHeader from '../components/SectionHeader'
import { supabase } from '../lib/supabase'

interface Document {
  id: string
  name: string
  storage_path: string
  mime_type: string
  size_bytes: number
  source: string
  tags: string[]
  created_at: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [docContent, setDocContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    if (selectedDoc) {
      if (selectedDoc.mime_type === 'text/markdown' || selectedDoc.mime_type === 'text/plain') {
        fetch(`/api/documents/download?path=${encodeURIComponent(selectedDoc.storage_path)}`)
          .then(async (res) => {
            if (!res.ok) {
              const errInfo = await res.json().catch(() => ({ error: res.statusText }));
              throw new Error(errInfo.error || 'Failed to download document');
            }
            return res.text();
          })
          .then(text => setDocContent(text))
          .catch(err => setDocContent('Error loading document content: ' + err.message));
      } else {
        setDocContent(`Document is of type ${selectedDoc.mime_type} and cannot be previewed in the current viewer. Download it directly from Supabase.`)
      }
    } else {
      setDocContent('')
    }
  }, [selectedDoc])

  const fetchDocuments = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err

      if (data) {
        setDocuments(data as Document[])
        if (data.length > 0) setSelectedDoc(data[0] as Document)
      }
    } catch (err: any) {
      console.error("Failed to fetch documents:", err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const renderMarkdown = (content: string) => {
    const lines = (content || "").split("\n")
    return (
      <div className="prose prose-invert max-w-none font-mono text-sm leading-relaxed whitespace-pre-wrap">
        {lines.length === 0 || (lines.length === 1 && lines[0] === "") ? (
          <p className="text-hf-muted italic">Downloading or processing document contents...</p>
        ) : lines.map((line, i) => {
          if (line.startsWith("# ")) {
            return <h1 key={i} className="text-xl font-bold text-hf-head mt-6 mb-3 border-b border-hf-border pb-1">{line.replace("# ", "")}</h1>
          } else if (line.startsWith("## ")) {
            return <h2 key={i} className="text-lg font-bold text-hf-head mt-5 mb-2">{line.replace("## ", "")}</h2>
          } else if (line.startsWith("- ")) {
            return <div key={i} className="flex gap-2 ml-2 mb-1 text-hf-body"><span className="text-hf-accent">•</span><span>{line.replace("- ", "")}</span></div>
          } else if (line.trim() === "") {
            return <div key={i} className="h-4" />
          } else {
            return <p key={i} className="text-hf-sub mb-2">{line}</p>
          }
        })}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader title="Knowledge Vault · Documents" action={{ label: 'Back to Dash', href: '/' }} />

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-hf-surface/30 border border-hf-border border-dashed rounded-xs">
          <div className="w-12 h-12 border-2 border-hf-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-hf-muted font-mono text-xs uppercase tracking-widest">Querying Vault...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-hf-surface border border-hf-border rounded-xs p-12 text-center shadow-2xl">
          <div className="text-4xl mb-4">📂</div>
          <h3 className="text-hf-head font-bold mb-2">No documents index found</h3>
          <p className="text-hf-muted text-sm max-w-xs mx-auto">Autonomous reports and cron documentation will appear here once generated.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Index List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-hf-surface border border-hf-border rounded-xs overflow-hidden shadow-lg">
              <div className="bg-hf-surface2 px-4 py-2 border-b border-hf-border">
                <h3 className="font-mono text-[10px] font-bold text-hf-muted uppercase tracking-widest">Registry ({documents.length})</h3>
              </div>
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => { setSelectedDoc(doc); setDocContent('Loading...'); }}
                    className={`w-full text-left px-4 py-3 border-b border-hf-border last:border-0 transition-colors ${selectedDoc?.id === doc.id
                      ? "bg-hf-accent/10 border-l-2 border-l-hf-accent"
                      : "hover:bg-hf-surface2"
                      }`}
                  >
                    <div className={`font-medium text-xs truncate ${selectedDoc?.id === doc.id ? 'text-hf-accent' : 'text-hf-head'}`}>{doc.name}</div>
                    <div className="text-[10px] font-mono text-hf-muted mt-1 uppercase">{formatDate(doc.created_at)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Viewer */}
          <div className="lg:col-span-3">
            {selectedDoc ? (
              <div className="bg-hf-surface border border-hf-border rounded-xs p-8 shadow-2xl min-h-[70vh]">
                <div className="mb-8 pb-6 border-b border-hf-border">
                  <div className="font-mono text-[10px] text-hf-accent uppercase tracking-[0.3em] mb-2 font-bold">Document Content</div>
                  <h1 className="text-2xl font-bold text-hf-head mb-4">{selectedDoc.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-hf-muted uppercase">
                    <span>Source: {selectedDoc.source || 'System'}</span>
                    <span className="w-1 h-1 bg-hf-border rounded-full" />
                    <span>Created: {formatDate(selectedDoc.created_at)}</span>
                    <span className="w-1 h-1 bg-hf-border rounded-full" />
                    <span>Type: {selectedDoc.mime_type}</span>
                    <span className="w-1 h-1 bg-hf-border rounded-full" />
                    <span>ID: {selectedDoc.id.slice(0, 8)}</span>
                  </div>
                </div>
                <div className="max-w-none">
                  {renderMarkdown(docContent)}
                </div>
              </div>
            ) : (
              <div className="bg-hf-surface/30 border border-hf-border border-dashed rounded-xs p-12 flex flex-col items-center justify-center h-[70vh] text-center">
                <p className="text-hf-muted font-mono text-xs uppercase tracking-widest">Select an entry from the registry</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
