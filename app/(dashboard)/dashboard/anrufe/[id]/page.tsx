'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Search, Download, Phone, Clock, User, Bot } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function TranscriptPage() {
  const params = useParams()
  const callId = params?.id as string
  const [call, setCall] = useState<any>(null)
  const [transcripts, setTranscripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (callId) {
      loadCallData()
    }
  }, [callId])

  const loadCallData = async () => {
    // Load call details
    const { data: callData } = await supabase
      .from('calls')
      .select('*, agents(name)')
      .eq('id', callId)
      .single()

    if (callData) {
      setCall(callData)
    }

    // Load transcripts
    const { data: transcriptData } = await supabase
      .from('call_transcripts')
      .select('*')
      .eq('call_id', callId)
      .order('seq', { ascending: true })

    if (transcriptData) {
      setTranscripts(transcriptData)
    }

    setLoading(false)
  }

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text

    const parts = text.split(new RegExp(`(${search})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === search.toLowerCase() 
        ? `<mark class="bg-yellow-200 px-1 rounded">${part}</mark>`
        : part
    ).join('')
  }

  const filteredTranscripts = searchTerm
    ? transcripts.filter(t => t.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : transcripts

  const downloadTranscript = () => {
    const text = transcripts.map(t => 
      `[${t.speaker.toUpperCase()}] ${t.text}`
    ).join('\n\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `transkript_${call?.caller_name || 'anruf'}_${new Date(call?.started_at).toISOString().split('T')[0]}.txt`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#316bfe' }}></div>
      </div>
    )
  }

  if (!call) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <Phone size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Anruf nicht gefunden</p>
          <Link href="/dashboard/anrufe" className="text-[#316bfe] hover:underline mt-4 inline-block">
            ← Zurück zur Übersicht
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/anrufe"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Anruf-Details
            </h1>
            <p className="text-gray-600 mt-2">
              {call.caller_name || 'Unbekannter Anrufer'} • {call.caller_phone}
            </p>
          </div>
        </div>
        <button
          onClick={downloadTranscript}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
          style={{ backgroundColor: '#316bfe' }}
        >
          <Download size={20} />
          Transkript exportieren
        </button>
      </div>

      {/* Call Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#e8f0ff' }}>
              <Clock size={20} style={{ color: '#316bfe' }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Dauer</p>
              <p className="font-bold text-gray-900">
                {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')} min` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Phone size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="font-bold text-gray-900">
                {call.call_status === 'completed' ? 'Abgeschlossen' :
                 call.call_status === 'missed' ? 'Verpasst' :
                 call.call_status === 'forwarded' ? 'Weitergeleitet' :
                 'Unbekannt'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Agent</p>
              <p className="font-bold text-gray-900">{call.agents?.name || 'Keine Angabe'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Bot size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Sentiments</p>
              <p className="font-bold text-gray-900">{call.sentiment || 'Neutral'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {call.tags && call.tags.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
          <div className="flex flex-wrap gap-2">
            {call.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {call.summary && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Zusammenfassung</h2>
          <p className="text-gray-700 leading-relaxed">{call.summary}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Suchen im Transkript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            {filteredTranscripts.length} Ergebnis(se) gefunden
          </p>
        )}
      </div>

      {/* Transcript */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Vollständiges Transkript</h2>
        </div>
        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
          {filteredTranscripts.length > 0 ? (
            filteredTranscripts.map((transcript) => (
              <div
                key={transcript.id}
                className={`flex gap-4 ${
                  transcript.speaker === 'agent' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: transcript.speaker === 'agent' ? '#316bfe' : '#e5e7eb',
                    color: transcript.speaker === 'agent' ? 'white' : '#1f2937'
                  }}
                >
                  {transcript.speaker === 'agent' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div
                  className={`flex-1 max-w-[70%] ${
                    transcript.speaker === 'agent' ? 'text-left' : 'text-right'
                  }`}
                >
                  <div
                    className="inline-block px-4 py-3 rounded-2xl"
                    style={{
                      backgroundColor: transcript.speaker === 'agent' ? '#e8f0ff' : '#f3f4f6',
                    }}
                  >
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {transcript.speaker === 'agent' ? 'AI-Agent' : 'Anrufer'} 
                      {transcript.started_at && (
                        <span className="ml-2">
                          • {new Date(transcript.started_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </p>
                    <p 
                      className="text-gray-900"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(transcript.text, searchTerm)
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? 'Keine Treffer gefunden' : 'Kein Transkript verfügbar'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
