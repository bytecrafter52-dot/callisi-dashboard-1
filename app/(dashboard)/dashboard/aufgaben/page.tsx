'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckSquare, Plus, Filter, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AufgabenPage() {
  const { t } = useLanguage()
  const [tasks, setTasks] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee_employee_id: '',
    due_at: '',
    call_id: null
  })
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: membership } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user?.id)
      .single()

    if (membership) {
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*, employees(full_name), calls(caller_name)')
        .eq('org_id', membership.org_id)
        .order('created_at', { ascending: false })

      const { data: employeesData } = await supabase
        .from('employees')
        .select('*')
        .eq('org_id', membership.org_id)
        .eq('is_active', true)

      if (tasksData) setTasks(tasksData)
      if (employeesData) setEmployees(employeesData)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()
    const { data: membership } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user?.id)
      .single()

    const { error } = await supabase
      .from('tasks')
      .insert({
        ...formData,
        org_id: membership?.org_id,
        created_by: user?.id,
        status: 'pending'
      })

    if (!error) {
      setShowModal(false)
      setFormData({ title: '', description: '', assignee_employee_id: '', due_at: '', call_id: null })
      loadData()
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    await supabase
      .from('tasks')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', taskId)
    
    loadData()
  }

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus)

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
          <h1 className="text-3xl font-bold text-gray-900">{t('tasks')}</h1>
          <p className="text-gray-600 mt-2">{t('tasks_manage')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
          style={{ backgroundColor: '#316bfe' }}
        >
          <Plus size={20} />
          {t('new_task')}
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-gray-400" />
          <div className="flex gap-2">
            {['all', 'pending', 'in_progress', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === status
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={filterStatus === status ? { backgroundColor: '#316bfe' } : {}}
              >
                {status === 'all' ? t('all') :
                 status === 'pending' ? t('open') :
                 status === 'in_progress' ? t('in_progress') :
                 t('closed')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['pending', 'in_progress', 'completed'].map(column => (
          <div key={column} className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckSquare size={20} style={{ color: '#316bfe' }} />
              {column === 'pending' ? t('open') :
               column === 'in_progress' ? t('in_progress') :
               t('closed')}
              <span className="ml-auto text-sm bg-gray-200 px-2 py-1 rounded">
                {tasks.filter(t => t.status === column).length}
              </span>
            </h3>
            <div className="space-y-3">
              {tasks.filter(t => t.status === column).map(task => (
                <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  )}
                  {task.employees && (
                    <p className="text-xs text-gray-500 mb-2">
                      👤 {task.employees.full_name}
                    </p>
                  )}
                  {task.due_at && (
                    <p className="text-xs text-gray-500 mb-3">
                      📅 {new Date(task.due_at).toLocaleDateString('de-DE')}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {column !== 'in_progress' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        {t('in_progress')}
                      </button>
                    )}
                    {column !== 'completed' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="flex-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                      >
                        {t('mark_complete')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === column).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">{t('no_tasks')}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('new_task')}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('task_title')} *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('task_description')}</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('assignee')}</label>
                <select
                  value={formData.assignee_employee_id}
                  onChange={(e) => setFormData({...formData, assignee_employee_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
                >
                  <option value="">{t('no_assignee')}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('due_date')}</label>
                <input
                  type="date"
                  value={formData.due_at}
                  onChange={(e) => setFormData({...formData, due_at: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
                  style={{ backgroundColor: '#316bfe' }}
                >
                  {t('create_task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
