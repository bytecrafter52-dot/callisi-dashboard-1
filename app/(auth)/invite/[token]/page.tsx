'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

export default function InvitePage() {
  const params = useParams()
  const token = params?.token as string
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [employee, setEmployee] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (token) {
      validateToken()
    }
  }, [token])

  const validateToken = async () => {
    try {
      // Find employee by invitation token
      const { data: employeeData, error: empError } = await supabase
        .from('employees')
        .select('*, organizations(name)')
        .eq('invitation_token', token)
        .single()

      if (empError || !employeeData) {
        setError('Einladungslink ist ungültig oder abgelaufen.')
        setLoading(false)
        return
      }

      // Check if token expired
      if (employeeData.invitation_expires_at) {
        const expiryDate = new Date(employeeData.invitation_expires_at)
        if (expiryDate < new Date()) {
          setError('Diese Einladung ist abgelaufen. Bitte kontaktieren Sie Ihren Administrator.')
          setLoading(false)
          return
        }
      }

      // Check if already accepted
      if (employeeData.user_id) {
        setError('Diese Einladung wurde bereits akzeptiert.')
        setLoading(false)
        return
      }

      setEmployee(employeeData)
      setOrganization((employeeData.organizations as any))
      setLoading(false)
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.')
      return
    }

    setCreating(true)

    try {
      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: employee.email,
        password: password,
        options: {
          data: {
            full_name: employee.full_name
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setCreating(false)
        return
      }

      if (!authData.user) {
        setError('Konto konnte nicht erstellt werden.')
        setCreating(false)
        return
      }

      // Update employee with user_id and joined_at
      await supabase
        .from('employees')
        .update({
          user_id: authData.user.id,
          joined_at: new Date().toISOString(),
          invitation_token: null // Clear token after use
        })
        .eq('id', employee.id)

      // Create user record
      await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: employee.email,
          full_name: employee.full_name
        })

      // Create membership
      await supabase
        .from('memberships')
        .insert({
          org_id: employee.org_id,
          user_id: authData.user.id,
          role: employee.role
        })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Error creating account:', err)
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#316bfe]/5 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#316bfe' }}></div>
      </div>
    )
  }

  if (error && !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#316bfe]/5 to-white px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ungültige Einladung</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/anmelden"
              className="inline-block px-6 py-3 rounded-lg font-medium text-white transition"
              style={{ backgroundColor: '#316bfe' }}
            >
              Zur Anmeldung
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#316bfe]/5 to-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#316bfe' }}>Willkommen!</h1>
            <p className="text-gray-600 mt-2">Richten Sie Ihr Callisi-Konto ein</p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>{employee?.full_name}</strong>
              <br />
              Sie wurden zu <strong>{organization?.name}</strong> eingeladen
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={employee?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort erstellen
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none transition"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316bfe] focus:border-transparent outline-none transition"
                placeholder="Passwort wiederholen"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-lg font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#316bfe' }}
            >
              {creating ? 'Konto wird erstellt...' : 'Konto erstellen'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Haben Sie bereits ein Konto?{' '}
              <a href="/anmelden" className="text-[#316bfe] font-medium hover:underline">
                Anmelden
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 Callisi. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  )
}
