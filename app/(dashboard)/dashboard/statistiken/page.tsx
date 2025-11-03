'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TrendingUp, Phone, Clock, Users, Calendar } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function StatistikenPage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, year
  const supabase = createClient()

  useEffect(() => {
    loadStats()
  }, [timeRange])

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: membership } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user?.id)
      .single()

    if (membership) {
      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      
      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange === 'month') {
        startDate.setMonth(now.getMonth() - 1)
      } else if (timeRange === 'year') {
        startDate.setFullYear(now.getFullYear() - 1)
      }

      // Get calls in range
      const { data: calls } = await supabase
        .from('calls')
        .select('*')
        .eq('org_id', membership.org_id)
        .gte('started_at', startDate.toISOString())

      // Get all calls for comparison
      const { data: allCalls } = await supabase
        .from('calls')
        .select('*')
        .eq('org_id', membership.org_id)

      // Get tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('org_id', membership.org_id)

      // Get employees
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('org_id', membership.org_id)
        .eq('is_active', true)

      // Calculate statistics
      const totalCalls = calls?.length || 0
      const completedCalls = calls?.filter(c => c.call_status === 'completed').length || 0
      const missedCalls = calls?.filter(c => c.call_status === 'missed').length || 0
      const forwardedCalls = calls?.filter(c => c.call_status === 'forwarded').length || 0
      
      // Calculate average duration (in seconds)
      const callsWithDuration = calls?.filter(c => c.started_at && c.ended_at) || []
      const totalDuration = callsWithDuration.reduce((sum, call) => {
        const start = new Date(call.started_at).getTime()
        const end = new Date(call.ended_at).getTime()
        return sum + (end - start) / 1000
      }, 0)
      const avgDuration = callsWithDuration.length > 0 ? totalDuration / callsWithDuration.length : 0

      // Group calls by day for chart
      const callsByDay: { [key: string]: number } = {}
      calls?.forEach(call => {
        const date = new Date(call.started_at).toLocaleDateString('de-DE')
        callsByDay[date] = (callsByDay[date] || 0) + 1
      })

      // Task statistics
      const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0

      setStats({
        totalCalls,
        completedCalls,
        missedCalls,
        forwardedCalls,
        avgDuration: Math.round(avgDuration),
        allCallsCount: allCalls?.length || 0,
        callsByDay,
        pendingTasks,
        completedTasks,
        activeEmployees: employees?.length || 0,
        completionRate: totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0
      })
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#316bfe' }}></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('statistics')}</h1>
          <p className="text-gray-600 mt-2">{t('stats_overview')}</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === range
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={timeRange === range ? { backgroundColor: '#316bfe' } : {}}
            >
              {range === 'week' ? t('week') : range === 'month' ? t('month') : t('year')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#e8f0ff' }}>
              <Phone size={24} style={{ color: '#316bfe' }} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats?.totalCalls || 0}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">{t('total_calls')}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('calls_in_selected').replace('{count}', '')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats?.completionRate || 0}%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">{t('success_rate')}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('calls_in_selected').replace('{count}', String(stats?.completedCalls || 0))}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Clock size={24} className="text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{Math.floor((stats?.avgDuration || 0) / 60)}m</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">{t('avg_duration_stat')}</h3>
          <p className="text-xs text-gray-500 mt-1">{stats?.avgDuration || 0}s gesamt</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <Users size={24} className="text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats?.activeEmployees || 0}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">{t('active_employees')}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('in_team')}</p>
        </div>
      </div>

      {/* Call Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 size={24} style={{ color: '#316bfe' }} />
            {t('call_status')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-gray-700">{t('completed')}</span>
              </div>
              <span className="font-bold text-gray-900">{stats?.completedCalls || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-gray-700">{t('missed')}</span>
              </div>
              <span className="font-bold text-gray-900">{stats?.missedCalls || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-gray-700">{t('forwarded')}</span>
              </div>
              <span className="font-bold text-gray-900">{stats?.forwardedCalls || 0}</span>
            </div>
          </div>

          {/* Simple Progress Bars */}
          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{t('completed')}</span>
                <span>{stats?.completionRate || 0}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${stats?.completionRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar size={24} style={{ color: '#316bfe' }} />
            {t('task_status')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700">{t('pending_tasks')}</span>
              </div>
              <span className="font-bold text-gray-900">{stats?.pendingTasks || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-gray-700">{t('completed')}</span>
              </div>
              <span className="font-bold text-gray-900">{stats?.completedTasks || 0}</span>
            </div>
          </div>

          {/* Task Completion Rate */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{t('completion_rate')}</span>
              <span>
                {stats?.pendingTasks + stats?.completedTasks > 0
                  ? Math.round((stats?.completedTasks / (stats?.pendingTasks + stats?.completedTasks)) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all"
                style={{ 
                  width: `${stats?.pendingTasks + stats?.completedTasks > 0
                    ? Math.round((stats?.completedTasks / (stats?.pendingTasks + stats?.completedTasks)) * 100)
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('daily_activity')}</h2>
        {stats?.callsByDay && Object.keys(stats.callsByDay).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(stats.callsByDay).map(([date, count]: [string, any]) => (
              <div key={date} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24">{date}</span>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full flex items-center px-3 text-white text-sm font-medium transition-all"
                    style={{ 
                      backgroundColor: '#316bfe',
                      width: `${Math.min((count / Math.max(...Object.values(stats.callsByDay))) * 100, 100)}%`
                    }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Keine Daten für diesen Zeitraum</p>
        )}
      </div>
    </div>
  )
}
