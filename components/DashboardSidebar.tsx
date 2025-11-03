'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { 
  Home, 
  Phone, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut,
  BarChart3
} from 'lucide-react'

interface DashboardSidebarProps {
  user: any
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  let t: any
  try {
    const lang = useLanguage()
    t = lang.t
  } catch {
    // Fallback if context not available
    t = (key: string) => {
      const fallback: any = {
        nav_dashboard: 'Dashboard',
        nav_calls: 'Anrufe',
        nav_tasks: 'Aufgaben',
        nav_employees: 'Mitarbeiter',
        nav_statistics: 'Statistiken',
        nav_settings: 'Einstellungen',
        nav_logout: 'Abmelden'
      }
      return fallback[key] || key
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/anmelden')
  }

  const navItems = [
    { href: '/dashboard', icon: Home, label: t('nav_dashboard') },
    { href: '/dashboard/anrufe', icon: Phone, label: t('nav_calls') },
    { href: '/dashboard/aufgaben', icon: CheckSquare, label: t('nav_tasks') },
    { href: '/dashboard/mitarbeiter', icon: Users, label: t('nav_employees') },
    { href: '/dashboard/statistiken', icon: BarChart3, label: t('nav_statistics') },
    { href: '/dashboard/einstellungen', icon: Settings, label: t('nav_settings') },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold" style={{ color: '#316bfe' }}>
          Callisi
        </h1>
        <p className="text-sm text-gray-500 mt-1">Voice AI Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={isActive ? { backgroundColor: '#316bfe' } : {}}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#316bfe' }}>
            {user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.user_metadata?.full_name || user.email}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <div className="px-2">
          <LanguageSwitcher />
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">{t('nav_logout')}</span>
        </button>
      </div>
    </aside>
  )
}
