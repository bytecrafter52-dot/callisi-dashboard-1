'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Lock, Bell, Save } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function EinstellungenPage() {
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    company_name: '',
    email: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notificationPrefs, setNotificationPrefs] = useState({
    email_new_call: true,
    email_task_assigned: true,
    email_employee_invited: true
  })

  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (authUser) {
      setUser(authUser)
      
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setProfileData({
          full_name: userData.full_name || '',
          company_name: userData.company_name || '',
          email: userData.email
        })
      }

      const { data: prefsData } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      if (prefsData) {
        setNotificationPrefs({
          email_new_call: prefsData.email_new_call,
          email_task_assigned: prefsData.email_task_assigned,
          email_employee_invited: prefsData.email_employee_invited
        })
      }
    }
    setLoading(false)
  }

  const updateProfile = async () => {
    setSaving(true)
    setMessage(null)

    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: profileData.full_name,
        company_name: profileData.company_name
      })
      .eq('id', user.id)

    if (profileData.email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: profileData.email
      })

      if (emailError) {
        setMessage({ type: 'error', text: `E-Mail-Fehler: ${emailError.message}` })
        setSaving(false)
        return
      }
    }

    if (userError) {
      setMessage({ type: 'error', text: userError.message })
    } else {
      setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert!' })
      loadUserData()
    }
    setSaving(false)
  }

  const updatePassword = async () => {
    setSaving(true)
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Neue Passwörter stimmen nicht überein' })
      setSaving(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Passwort muss mindestens 8 Zeichen lang sein' })
      setSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Passwort erfolgreich geändert!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
    setSaving(false)
  }

  const updateNotifications = async () => {
    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: user.id,
        ...notificationPrefs
      })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Benachrichtigungseinstellungen gespeichert!' })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#316bfe' }}></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Einstellungen</h1>
      <p className="text-gray-600 mb-8">Verwalten Sie Ihr Konto und Ihre Präferenzen</p>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <User size={24} style={{ color: '#316bfe' }} />
          <h2 className="text-xl font-bold text-gray-900">Profil</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vollständiger Name</label>
            <input
              type="text"
              value={profileData.full_name}
              onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Firmenname</label>
            <input
              type="text"
              value={profileData.company_name}
              onChange={(e) => setProfileData({...profileData, company_name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Bei Änderung der E-Mail erhalten Sie eine Bestätigungsmail
            </p>
          </div>
          <button
            onClick={updateProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: '#316bfe' }}
          >
            <Save size={20} />
            {saving ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Password Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <Lock size={24} style={{ color: '#316bfe' }} />
          <h2 className="text-xl font-bold text-gray-900">Passwort ändern</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
              placeholder="Mindestens 8 Zeichen"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort bestätigen</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none"
              placeholder="Passwort wiederholen"
            />
          </div>
          <button
            onClick={updatePassword}
            disabled={saving || !passwordData.newPassword}
            className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: '#316bfe' }}
          >
            <Save size={20} />
            {saving ? 'Wird gespeichert...' : 'Passwort ändern'}
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <Bell size={24} style={{ color: '#316bfe' }} />
          <h2 className="text-xl font-bold text-gray-900">Benachrichtigungen</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">E-Mail bei neuem Anruf</p>
              <p className="text-sm text-gray-500">Benachrichtigung, wenn ein neuer Anruf eingeht</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.email_new_call}
                onChange={(e) => setNotificationPrefs({...notificationPrefs, email_new_call: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#316bfe]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">E-Mail bei Aufgabenzuweisung</p>
              <p className="text-sm text-gray-500">Benachrichtigung, wenn Ihnen eine Aufgabe zugewiesen wird</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.email_task_assigned}
                onChange={(e) => setNotificationPrefs({...notificationPrefs, email_task_assigned: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#316bfe]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">E-Mail bei Mitarbeiter-Einladung</p>
              <p className="text-sm text-gray-500">Benachrichtigung, wenn ein neuer Mitarbeiter eingeladen wird</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.email_employee_invited}
                onChange={(e) => setNotificationPrefs({...notificationPrefs, email_employee_invited: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#316bfe]"></div>
            </label>
          </div>
          <button
            onClick={updateNotifications}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 mt-6"
            style={{ backgroundColor: '#316bfe' }}
          >
            <Save size={20} />
            {saving ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
