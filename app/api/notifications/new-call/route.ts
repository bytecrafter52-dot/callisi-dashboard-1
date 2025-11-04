import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { getNewCallEmailTemplate } from '@/lib/email/templates'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { callId, orgId } = await request.json()

    if (!callId || !orgId) {
      return NextResponse.json({ error: 'Missing callId or orgId' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get call details
    const { data: call, error: callError } = await supabase
      .from('calls')
      .select('*, agents(name)')
      .eq('id', callId)
      .eq('org_id', orgId)
      .single()

    if (callError || !call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 })
    }

    // Get users with email notification enabled for new calls
    const { data: memberships } = await supabase
      .from('memberships')
      .select('user_id, users(email, full_name)')
      .eq('org_id', orgId)

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ message: 'No users to notify' })
    }

    const emailPromises = []

    for (const membership of memberships) {
      // Check if user has notifications enabled
      const { data: prefs } = await supabase
        .from('user_notification_preferences')
        .select('email_new_call')
        .eq('user_id', membership.user_id)
        .single()

      // Send email if enabled (or true by default if no preference set)
      if (!prefs || prefs.email_new_call) {
        const user = membership.users as any
        const userEmail = user?.email
        if (userEmail) {
          const duration = call.duration_seconds 
            ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')} min`
            : 'N/A'

          const emailContent = getNewCallEmailTemplate({
            callerName: call.caller_name || 'Unbekannt',
            callerPhone: call.caller_phone || 'N/A',
            duration,
            summary: call.summary,
            dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://callisi-dashboard1.vercel.app'}/dashboard/anrufe/${callId}`
          })

          emailPromises.push(
            sendEmail({
              to: userEmail,
              ...emailContent
            })
          )
        }
      }
    }

    await Promise.all(emailPromises)

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${emailPromises.length} notification(s)` 
    })
  } catch (error) {
    console.error('Error sending new call notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
