import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { getTaskAssignedEmailTemplate } from '@/lib/email/templates'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { taskId, assigneeEmployeeId, orgId } = await request.json()

    if (!taskId || !assigneeEmployeeId || !orgId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, employees(email, full_name)')
      .eq('id', taskId)
      .eq('org_id', orgId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Get assignee details
    const { data: assignee } = await supabase
      .from('employees')
      .select('email, full_name, org_id')
      .eq('id', assigneeEmployeeId)
      .eq('org_id', orgId)
      .single()

    if (!assignee || !assignee.email) {
      return NextResponse.json({ error: 'Assignee not found or no email' }, { status: 404 })
    }

    // Get creator name
    const { data: creator } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', task.created_by)
      .single()

    // Check if assignee has notifications enabled
    // First, find if employee is also a user
    const { data: employeeUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', assignee.email)
      .single()

    let shouldSendEmail = true

    if (employeeUser) {
      const { data: prefs } = await supabase
        .from('user_notification_preferences')
        .select('email_task_assigned')
        .eq('user_id', employeeUser.id)
        .single()

      shouldSendEmail = !prefs || prefs.email_task_assigned
    }

    if (shouldSendEmail) {
      const emailContent = getTaskAssignedEmailTemplate({
        taskTitle: task.title,
        taskDescription: task.description || 'Keine Beschreibung',
        assignedBy: creator?.full_name || 'Administrator',
        dueDate: task.due_at ? new Date(task.due_at).toLocaleDateString('de-DE') : undefined,
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://callisi-dashboard1.vercel.app'}/dashboard/aufgaben`
      })

      await sendEmail({
        to: assignee.email,
        ...emailContent
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Task assignment notification sent' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification disabled for this user' 
    })
  } catch (error) {
    console.error('Error sending task assignment notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
