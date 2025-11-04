// Email sending utility using Resend

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text: string
}

export async function sendEmail(options: EmailOptions) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  
  // If no API key, log and return (for development)
  if (!RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY not configured. Email would have been sent to:', options.to)
    console.log('Subject:', options.subject)
    return { success: false, message: 'Email API not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Callisi <notifications@callisi.com>',
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Email send failed:', data)
      return { success: false, message: data.message || 'Failed to send email' }
    }

    console.log('✅ Email sent successfully:', data.id)
    return { success: true, id: data.id }
  } catch (error) {
    console.error('❌ Email send error:', error)
    return { success: false, message: 'Email send error' }
  }
}
