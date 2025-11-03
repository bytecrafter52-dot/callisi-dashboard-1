'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, Download, Search, Filter, Eye } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AnrufePage() {
  const { t } = useLanguage()
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    loadCalls()
  }, [])

  const loadCalls = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: membership } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user?.id)
      .single()

    if (membership) {
      const { data, error } = await supabase
        .from('calls')
        .select('*, agents(name)')
        .eq('org_id', membership.org_id)
        .order('started_at', { ascending: false })

      if (data) setCalls(data)
    }
    setLoading(false)
  }

  const exportToCSV = () => {
    const headers = ['Anrufer', 'Telefon', 'Startzeit', 'Endzeit', 'Dauer (Sek)', 'Status', 'Zusammenfassung']
    const rows = filteredCalls.map(call => [
      call.caller_name || '',
      call.caller_phone || '',
      new Date(call.started_at).toLocaleString('de-DE'),
      call.ended_at ? new Date(call.ended_at).toLocaleString('de-DE') : '',
      call.duration_seconds || '',
      call.call_status || '',
      call.summary || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `anrufe_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredCalls = calls.filter(call => {
    const matchesSearch = !searchTerm || 
      call.caller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.caller_phone?.includes(searchTerm) ||
      call.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || call.call_status === filterStatus

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#316bfe' }}></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('calls')}</h1>
          <p className="text-gray-600 mt-2">{t('calls_overview')}</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
          style={{ backgroundColor: '#316bfe' }}
        >
          <Download size={20} />
          {t('export_csv')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none appearance-none"
            >
              <option value="all">{t('all_status')}</option>
              <option value="completed">{t('completed')}</option>
              <option value="missed">{t('missed')}</option>
              <option value="forwarded">{t('forwarded')}</option>
              <option value="failed">{t('failed')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('caller')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phone')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('start_time')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('duration')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tags')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCalls.length > 0 ? (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#316bfe' }}>
                          {call.caller_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{call.caller_name || t('unknown')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.caller_phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(call.started_at).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        call.call_status === 'completed' ? 'bg-green-100 text-green-800' :
                        call.call_status === 'missed' ? 'bg-red-100 text-red-800' :
                        call.call_status === 'forwarded' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {call.call_status === 'completed' ? t('completed') :
                         call.call_status === 'missed' ? t('missed') :
                         call.call_status === 'forwarded' ? t('forwarded') :
                         call.call_status || t('unknown')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {call.tags && call.tags.length > 0 ? (
                          call.tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">{t('no_tags')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/anrufe/${call.id}`}
                        className="inline-flex items-center gap-1 text-[#316bfe] hover:text-[#2451cc]"
                      >
                        <Eye size={16} />
                        {t('details')}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Phone size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">{t('no_calls_found')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-4 text-sm text-gray-600">
        {t('showing_x_of_y_calls').replace('{x}', String(filteredCalls.length)).replace('{y}', String(calls.length))}
      </div>
    </div>
  )
}
