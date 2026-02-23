'use client'

import React, { useEffect, useState } from "react";

interface Document {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

const SUPABASE_URL = "https://uxrpljylbhifolcqslju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cnBsanlsYmhpZm9sY3FzbGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDgzNzAsImV4cCI6MjA4NjY4NDM3MH0.WMR3fZpubA-lEGUWCMwqFya5Nucg17LHR5pNRCpitEs";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/documents?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: Document[] = await response.json();
      console.log("Documents fetched:", data.length);
      setDocuments(data);
      if (data.length > 0) {
        setSelectedDoc(data[0]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to fetch documents:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMarkdown = (content: string) => {
    const lines = content.split("\n");
    return (
      <div className="prose prose-invert max-w-none">
        {lines.map((line, i) => {
          if (line.startsWith("# ")) {
            return (
              <h1 key={i} className="text-2xl font-bold mt-4 mb-2">
                {line.replace("# ", "")}
              </h1>
            );
          } else if (line.startsWith("## ")) {
            return (
              <h2 key={i} className="text-xl font-bold mt-3 mb-2">
                {line.replace("## ", "")}
              </h2>
            );
          } else if (line.startsWith("### ")) {
            return (
              <h3 key={i} className="text-lg font-semibold mt-2 mb-1">
                {line.replace("### ", "")}
              </h3>
            );
          } else if (line.startsWith("- ")) {
            return (
              <li key={i} className="ml-4">
                {line.replace("- ", "")}
              </li>
            );
          } else if (line.startsWith("**") && line.endsWith("**")) {
            return (
              <p key={i} className="font-bold">
                {line.replace(/\*\*/g, "")}
              </p>
            );
          } else if (line.startsWith("|")) {
            // Simple table rendering
            return (
              <p key={i} className="text-sm font-mono bg-dark-700 p-2 rounded mb-2">
                {line}
              </p>
            );
          } else if (line.trim() === "") {
            return <div key={i} className="h-2" />;
          } else {
            return (
              <p key={i} className="text-dark-200 mb-1">
                {line}
              </p>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">📄 Documents & Cron Reports</h2>
        {error && <div className="text-red-400 text-sm mb-4">Error: {error}</div>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-dark-400">Loading documents...</p>
          </div>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-dark-800 rounded-lg p-8 border border-dark-700 text-center">
          <p className="text-dark-400">No documents yet. Cron jobs will populate reports here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document List */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-lg p-4 border border-dark-700 max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-3 text-sm text-dark-300">Documents ({documents.length})</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedDoc?.id === doc.id
                        ? "bg-blue-600 text-white"
                        : "bg-dark-700 text-dark-300 hover:bg-dark-600"
                      }`}
                  >
                    <div className="font-medium text-xs truncate">{doc.title}</div>
                    <div className="text-xs text-dark-400 mt-1">{formatDate(doc.created_at)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Document Viewer */}
          <div className="lg:col-span-3">
            {selectedDoc ? (
              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <div className="mb-4 pb-4 border-b border-dark-700">
                  <h1 className="text-xl font-bold mb-2">{selectedDoc.title}</h1>
                  <p className="text-xs text-dark-400">by {selectedDoc.author} • {formatDate(selectedDoc.created_at)}</p>
                </div>
                <div className="prose prose-invert max-w-none overflow-y-auto max-h-96">
                  {renderMarkdown(selectedDoc.content)}
                </div>
              </div>
            ) : (
              <div className="bg-dark-800 rounded-lg p-8 border border-dark-700 flex items-center justify-center h-96">
                <p className="text-dark-400">Select a document to view</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
