import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { getEmployeeInviteEmailTemplate } from '@/lib/email/templates'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { employeeId, orgId, invitedBy } = await request.json()

    if (!employeeId || !orgId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*, organizations(name)')
      .eq('id', employeeId)
      .eq('org_id', orgId)
      .single()

    if (employeeError || !employee || !employee.email) {
      return NextResponse.json({ error: 'Employee not found or no email' }, { status: 404 })
    }

    // Check if already invited/registered
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', employee.email)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        success: false,
        message: 'User already has an account' 
      })
    }

    // Generate invitation token
    const inviteToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Store invitation token in employees table (we'll add these fields)
    await supabase
      .from('employees')
      .update({ 
        invitation_token: inviteToken,
        invitation_sent_at: new Date().toISOString(),
        invitation_expires_at: expiresAt.toISOString()
      })
      .eq('id', employeeId)

    // Get inviter name
    const { data: inviter } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', invitedBy)
      .single()

    const orgData = employee.organizations as any

    const emailContent = getEmployeeInviteEmailTemplate({
      employeeName: employee.full_name,
      organizationName: orgData?.name || 'Ihre Organisation',
      invitedBy: inviter?.full_name || 'Ihr Administrator',
      inviteUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://callisi-dashboard1.vercel.app'}/invite/${inviteToken}`
    })

    await sendEmail({
      to: employee.email,
      ...emailContent
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully' 
    })
  } catch (error) {
    console.error('Error sending employee invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
