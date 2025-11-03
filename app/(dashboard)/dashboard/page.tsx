import React from 'react'
import { createClient } from '@/lib/supabase/server'
import DashboardHome from '@/components/DashboardHome'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user's organization
  const { data: membership } = await supabase
    .from('memberships')
    .select('org_id, organizations(name)')
    .eq('user_id', user?.id)
    .single()

  const orgId = membership?.org_id

  // Get statistics
  const { count: totalCalls } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)

  const { count: todayCalls } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .gte('started_at', new Date(new Date().setHours(0,0,0,0)).toISOString())

  const { count: pendingTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('status', 'pending')

  const { data: recentCalls } = await supabase
    .from('calls')
    .select('*, agents(name)')
    .eq('org_id', orgId)
    .order('started_at', { ascending: false })
    .limit(5)

  // Calculate average duration
  const { data: callsWithDuration } = await supabase
    .from('calls')
    .select('duration_seconds')
    .eq('org_id', orgId)
    .not('duration_seconds', 'is', null)

  const avgDuration = callsWithDuration?.length 
    ? Math.round(callsWithDuration.reduce((acc, c) => acc + (c.duration_seconds || 0), 0) / callsWithDuration.length)
    : 0

  const stats = {
    totalCalls: totalCalls || 0,
    todayCalls: todayCalls || 0,
    avgDuration: avgDuration,
    pendingTasks: pendingTasks || 0
  }

  return <DashboardHome stats={stats} recentCalls={recentCalls || []} />
}
