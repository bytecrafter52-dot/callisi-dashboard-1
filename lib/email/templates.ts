// Email templates for notifications

export const getNewCallEmailTemplate = (callData: {
  callerName: string
  callerPhone: string
  duration: string
  summary?: string
  dashboardUrl: string
}) => {
  return {
    subject: `Neuer Anruf von ${callData.callerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #316bfe; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
            .info-row { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #316bfe; }
            .button { display: inline-block; background-color: #316bfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📞 Neuer Anruf eingegangen</h1>
            </div>
            <div class="content">
              <p>Hallo,</p>
              <p>Sie haben einen neuen Anruf erhalten:</p>
              
              <div class="info-row">
                <span class="label">Anrufer:</span> ${callData.callerName}
              </div>
              <div class="info-row">
                <span class="label">Telefon:</span> ${callData.callerPhone}
              </div>
              <div class="info-row">
                <span class="label">Dauer:</span> ${callData.duration}
              </div>
              ${callData.summary ? `
              <div class="info-row">
                <span class="label">Zusammenfassung:</span><br/>
                ${callData.summary}
              </div>
              ` : ''}
              
              <a href="${callData.dashboardUrl}" class="button">Anruf im Dashboard ansehen</a>
            </div>
            <div class="footer">
              <p>© 2024 Callisi. Alle Rechte vorbehalten.</p>
              <p>Sie erhalten diese E-Mail, weil Sie Benachrichtigungen für neue Anrufe aktiviert haben.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Neuer Anruf von ${callData.callerName}

Anrufer: ${callData.callerName}
Telefon: ${callData.callerPhone}
Dauer: ${callData.duration}
${callData.summary ? `Zusammenfassung: ${callData.summary}` : ''}

Anruf im Dashboard ansehen: ${callData.dashboardUrl}

© 2024 Callisi
    `
  }
}

export const getTaskAssignedEmailTemplate = (taskData: {
  taskTitle: string
  taskDescription: string
  assignedBy: string
  dueDate?: string
  dashboardUrl: string
}) => {
  return {
    subject: `Neue Aufgabe zugewiesen: ${taskData.taskTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #316bfe; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
            .info-row { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #316bfe; }
            .button { display: inline-block; background-color: #316bfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Neue Aufgabe zugewiesen</h1>
            </div>
            <div class="content">
              <p>Hallo,</p>
              <p>Ihnen wurde eine neue Aufgabe zugewiesen:</p>
              
              <div class="info-row">
                <span class="label">Aufgabe:</span> ${taskData.taskTitle}
              </div>
              <div class="info-row">
                <span class="label">Beschreibung:</span><br/>
                ${taskData.taskDescription}
              </div>
              <div class="info-row">
                <span class="label">Zugewiesen von:</span> ${taskData.assignedBy}
              </div>
              ${taskData.dueDate ? `
              <div class="info-row">
                <span class="label">Fälligkeitsdatum:</span> ${taskData.dueDate}
              </div>
              ` : ''}
              
              <a href="${taskData.dashboardUrl}" class="button">Aufgabe im Dashboard ansehen</a>
            </div>
            <div class="footer">
              <p>© 2024 Callisi. Alle Rechte vorbehalten.</p>
              <p>Sie erhalten diese E-Mail, weil Sie Benachrichtigungen für Aufgabenzuweisungen aktiviert haben.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Neue Aufgabe zugewiesen: ${taskData.taskTitle}

Aufgabe: ${taskData.taskTitle}
Beschreibung: ${taskData.taskDescription}
Zugewiesen von: ${taskData.assignedBy}
${taskData.dueDate ? `Fälligkeitsdatum: ${taskData.dueDate}` : ''}

Aufgabe im Dashboard ansehen: ${taskData.dashboardUrl}

© 2024 Callisi
    `
  }
}

export const getEmployeeInviteEmailTemplate = (inviteData: {
  employeeName: string
  organizationName: string
  invitedBy: string
  inviteUrl: string
}) => {
  return {
    subject: `Einladung zu Callisi Dashboard - ${inviteData.organizationName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #316bfe; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
            .info-row { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #316bfe; }
            .button { display: inline-block; background-color: #316bfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Willkommen bei Callisi!</h1>
            </div>
            <div class="content">
              <p>Hallo ${inviteData.employeeName},</p>
              <p>Sie wurden von <strong>${inviteData.invitedBy}</strong> eingeladen, dem Callisi Dashboard für <strong>${inviteData.organizationName}</strong> beizutreten.</p>
              
              <p>Callisi ist Ihre Voice AI Plattform zur Verwaltung von Anrufen, Aufgaben und Ihrem Team.</p>
              
              <div class="info-row">
                <span class="label">Was können Sie tun?</span><br/>
                • Anrufe und Transkripte einsehen<br/>
                • Aufgaben verwalten und zuweisen<br/>
                • Mit Ihrem Team zusammenarbeiten<br/>
                • Statistiken und Analysen ansehen
              </div>
              
              <p><strong>Klicken Sie auf den Button unten, um Ihr Konto einzurichten:</strong></p>
              
              <a href="${inviteData.inviteUrl}" class="button">Konto einrichten</a>
              
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                Dieser Link ist 7 Tage gültig. Falls Sie Probleme haben, kontaktieren Sie bitte Ihren Administrator.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Callisi. Alle Rechte vorbehalten.</p>
              <p>www.callisi.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Willkommen bei Callisi!

Hallo ${inviteData.employeeName},

Sie wurden von ${inviteData.invitedBy} eingeladen, dem Callisi Dashboard für ${inviteData.organizationName} beizutreten.

Klicken Sie auf den Link, um Ihr Konto einzurichten:
${inviteData.inviteUrl}

Dieser Link ist 7 Tage gültig.

© 2024 Callisi
www.callisi.com
    `
  }
}
