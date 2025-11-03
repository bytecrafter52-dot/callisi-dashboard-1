// Notification Service for Callisi Dashboard
// Handles email and Slack notifications for missed calls and tasks

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email notification for missed calls
export async function sendMissedCallNotification(params: {
  to: string;
  callerName?: string;
  callerPhone?: string;
  timestamp: string;
  duration?: number;
  organizationName: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Callisi <noreply@callisi.com>',
      to: params.to,
      subject: `Verpasster Anruf von ${params.callerName || params.callerPhone || 'Unbekannt'}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #316bfe; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .call-info { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .info-row:last-child { border-bottom: none; }
              .label { font-weight: bold; color: #666; }
              .value { color: #333; }
              .button { display: inline-block; padding: 12px 24px; background-color: #316bfe; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📞 Verpasster Anruf</h1>
              </div>
              <div class="content">
                <p>Hallo,</p>
                <p>Sie haben einen Anruf verpasst:</p>
                
                <div class="call-info">
                  <div class="info-row">
                    <span class="label">Anrufer:</span>
                    <span class="value">${params.callerName || 'Unbekannt'}</span>
                  </div>
                  ${params.callerPhone ? `
                  <div class="info-row">
                    <span class="label">Telefon:</span>
                    <span class="value">${params.callerPhone}</span>
                  </div>
                  ` : ''}
                  <div class="info-row">
                    <span class="label">Zeitpunkt:</span>
                    <span class="value">${new Date(params.timestamp).toLocaleString('de-DE')}</span>
                  </div>
                  ${params.duration ? `
                  <div class="info-row">
                    <span class="label">Dauer:</span>
                    <span class="value">${params.duration} Sekunden</span>
                  </div>
                  ` : ''}
                  <div class="info-row">
                    <span class="label">Organisation:</span>
                    <span class="value">${params.organizationName}</span>
                  </div>
                </div>

                <p>
                  <a href="https://callisi-dashboard3.vercel.app/dashboard/anrufe" class="button">
                    Anruf im Dashboard ansehen
                  </a>
                </p>

                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                  Tipp: Sie können in den Einstellungen konfigurieren, wann Sie Benachrichtigungen erhalten möchten.
                </p>
              </div>
              <div class="footer">
                <p>© 2024 Callisi. Alle Rechte vorbehalten.</p>
                <p>
                  <a href="https://callisi-dashboard3.vercel.app/dashboard/einstellungen" style="color: #316bfe;">
                    Benachrichtigungseinstellungen
                  </a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send missed call notification:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending missed call notification:', error);
    return { success: false, error };
  }
}

// Email notification for new tasks
export async function sendNewTaskNotification(params: {
  to: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: string;
  assignedBy: string;
  organizationName: string;
  taskId: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Callisi <noreply@callisi.com>',
      to: params.to,
      subject: `Neue Aufgabe: ${params.taskTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #316bfe; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .task-info { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .task-title { font-size: 18px; font-weight: bold; color: #316bfe; margin-bottom: 10px; }
              .task-description { color: #666; margin-bottom: 15px; line-height: 1.5; }
              .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .info-row:last-child { border-bottom: none; }
              .label { font-weight: bold; color: #666; }
              .value { color: #333; }
              .button { display: inline-block; padding: 12px 24px; background-color: #316bfe; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              .priority-high { color: #dc2626; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Neue Aufgabe zugewiesen</h1>
              </div>
              <div class="content">
                <p>Hallo,</p>
                <p>Ihnen wurde eine neue Aufgabe zugewiesen:</p>
                
                <div class="task-info">
                  <div class="task-title">${params.taskTitle}</div>
                  ${params.taskDescription ? `
                  <div class="task-description">${params.taskDescription}</div>
                  ` : ''}
                  
                  <div class="info-row">
                    <span class="label">Zugewiesen von:</span>
                    <span class="value">${params.assignedBy}</span>
                  </div>
                  ${params.dueDate ? `
                  <div class="info-row">
                    <span class="label">Fälligkeitsdatum:</span>
                    <span class="value">${new Date(params.dueDate).toLocaleDateString('de-DE')}</span>
                  </div>
                  ` : ''}
                  <div class="info-row">
                    <span class="label">Organisation:</span>
                    <span class="value">${params.organizationName}</span>
                  </div>
                </div>

                <p>
                  <a href="https://callisi-dashboard3.vercel.app/dashboard/aufgaben" class="button">
                    Aufgabe ansehen
                  </a>
                </p>
              </div>
              <div class="footer">
                <p>© 2024 Callisi. Alle Rechte vorbehalten.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send task notification:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending task notification:', error);
    return { success: false, error };
  }
}

// Slack notification for missed calls
export async function sendSlackNotification(params: {
  webhookUrl: string;
  callerName?: string;
  callerPhone?: string;
  timestamp: string;
  organizationName: string;
}) {
  try {
    const message = {
      text: `📞 Verpasster Anruf`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📞 Verpasster Anruf',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Anrufer:*\n${params.callerName || 'Unbekannt'}`
            },
            {
              type: 'mrkdwn',
              text: `*Telefon:*\n${params.callerPhone || 'Nicht verfügbar'}`
            },
            {
              type: 'mrkdwn',
              text: `*Zeitpunkt:*\n${new Date(params.timestamp).toLocaleString('de-DE')}`
            },
            {
              type: 'mrkdwn',
              text: `*Organisation:*\n${params.organizationName}`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Im Dashboard ansehen',
                emoji: true
              },
              url: 'https://callisi-dashboard3.vercel.app/dashboard/anrufe',
              style: 'primary'
            }
          ]
        }
      ]
    };

    const response = await fetch(params.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Slack notification failed:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return { success: false, error };
  }
}

// Helper to check if notifications are enabled for an organization
export async function shouldSendNotification(orgId: string, notificationType: 'missed_call' | 'new_task') {
  // This would check organization settings in database
  // For now, return true (send all notifications)
  // TODO: Add organization settings table with notification preferences
  return true;
}
