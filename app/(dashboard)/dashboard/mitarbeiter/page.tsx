'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Plus, Mail, Phone, X, Edit2, Trash2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MitarbeiterPage() {
  const { t } = useLanguage()
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'agent'
  })
  const supabase = createClient()

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: membership } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user?.id)
      .single()

    if (membership) {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('org_id', membership.org_id)
        .order('created_at', { ascending: false })

      if (data) setEmployees(data)
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

    if (editingEmployee) {
      await supabase
        .from('employees')
        .update(formData)
        .eq('id', editingEmployee.id)
    } else {
      const { data: newEmployee } = await supabase
        .from('employees')
        .insert({
          ...formData,
          org_id: membership?.org_id,
          is_active: true,
          invited_at: new Date().toISOString()
        })
        .select()
        .single()

      // Send invitation email
      if (newEmployee) {
        fetch('/api/notifications/employee-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: newEmployee.id,
            orgId: membership?.org_id,
            invitedBy: user?.id
          })
        }).catch(err => console.error('Failed to send invitation:', err))
      }
    }

    setShowModal(false)
    setEditingEmployee(null)
    setFormData({ full_name: '', email: '', phone: '', role: 'agent' })
    loadEmployees()
  }

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee)
    setFormData({
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('delete_confirm'))) {
      await supabase
        .from('employees')
        .update({ is_active: false })
        .eq('id', id)
      loadEmployees()
    }
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
          <h1 className="text-3xl font-bold text-gray-900">{t('employees')}</h1>
          <p className="text-gray-600 mt-2">{t('manage_team')}</p>
        </div>
        <button
          onClick={() => {
            setEditingEmployee(null)
            setFormData({ full_name: '', email: '', phone: '', role: 'agent' })
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
          style={{ backgroundColor: '#316bfe' }}
        >
          <Plus size={20} />
          {t('add_employee')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#e8f0ff' }}>
              <Users size={24} style={{ color: '#316bfe' }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('total')}</p>
              <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">{t('admin')}</p>
          <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.role === 'admin' && e.is_active).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">{t('manager')}</p>
          <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.role === 'manager' && e.is_active).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">{t('agent')}</p>
          <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.role === 'agent' && e.is_active).length}</p>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.filter(e => e.is_active).map(employee => (
          <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: '#316bfe' }}>
                {employee.full_name[0]}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(employee)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <Edit2 size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{employee.full_name}</h3>
            <span className={`inline-block px-2 py-1 text-xs rounded-full mb-3 ${
              employee.role === 'admin' ? 'bg-purple-100 text-purple-700' :
              employee.role === 'manager' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {employee.role === 'admin' ? t('admin') :
               employee.role === 'manager' ? t('manager') :
               t('agent')}
            </span>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span className="truncate">{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  <span>{employee.phone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {employees.filter(e => e.is_active).length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{t('no_employees')}</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEmployee ? t('edit_employee') : t('add_employee')}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')} *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')} *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone_number')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('role')} *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
                >
                  <option value="agent">{t('agent')}</option>
                  <option value="manager">{t('manager')}</option>
                  <option value="admin">{t('admin')}</option>
                </select>
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
                  {editingEmployee ? t('save') : t('add_employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
