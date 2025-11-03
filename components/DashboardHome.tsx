'use client'

import { Phone, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface DashboardHomeProps {
  stats: {
    totalCalls: number
    todayCalls: number
    avgDuration: number
    pendingTasks: number
  }
  recentCalls: any[]
}

export default function DashboardHome({ stats, recentCalls }: DashboardHomeProps) {
  let t: any
  try {
    const lang = useLanguage()
    t = lang.t
  } catch {
    // Fallback if context not available
    t = (key: string) => {
      const fallback: any = {
        welcome_back: 'Willkommen zurück!',
        dashboard_overview: 'Hier ist Ihre Übersicht für Callisi',
        total_calls: 'Anrufe Gesamt',
        calls_today: 'Anrufe Heute',
        avg_duration: 'Ø Dauer',
        open_tasks: 'Offene Aufgaben',
        min: 'min',
        recent_calls: 'Letzte Anrufe',
        unknown: 'Unbekannt',
        no_number: 'Keine Nummer',
        no_calls_yet: 'Noch keine Anrufe vorhanden'
      }
      return fallback[key] || key
    }
  }

  const statItems = [
    {
      title: t('total_calls'),
      value: stats.totalCalls,
      icon: Phone,
      color: '#316bfe',
      bgColor: '#e8f0ff'
    },
    {
      title: t('calls_today'),
      value: stats.todayCalls,
      icon: TrendingUp,
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      title: t('avg_duration'),
      value: `${Math.floor(stats.avgDuration / 60)}:${(stats.avgDuration % 60).toString().padStart(2, '0')} ${t('min')}`,
      icon: Clock,
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: t('open_tasks'),
      value: stats.pendingTasks,
      icon: AlertCircle,
      color: '#ef4444',
      bgColor: '#fee2e2'
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('welcome_back')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('dashboard_overview')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statItems.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Calls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t('recent_calls')}</h2>
        </div>
        <div className="p-6">
          {recentCalls && recentCalls.length > 0 ? (
            <div className="space-y-4">
              {recentCalls.map((call: any) => (
                <div key={call.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#316bfe' }}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{call.caller_name || t('unknown')}</p>
                      <p className="text-sm text-gray-500">{call.caller_phone || t('no_number')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')} ${t('min')}` : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(call.started_at).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Phone size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">{t('no_calls_yet')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
