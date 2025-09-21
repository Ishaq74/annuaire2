import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: import.meta.env.SMTP_HOST,
  port: parseInt(import.meta.env.SMTP_PORT),
  secure: import.meta.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: import.meta.env.SMTP_USER,
    pass: import.meta.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${import.meta.env.SMTP_FROM_NAME}" <${import.meta.env.SMTP_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    })

    console.log('Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendOTP(email: string, otp: string) {
  return sendEmail({
    to: email,
    subject: 'Code de vérification - Annuaire2',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Code de vérification</h2>
        <p>Votre code de vérification est :</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; padding: 15px 30px; background-color: #f8f9fa; border: 2px dashed #007bff; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff;">${otp}</span>
        </div>
        <p>Ce code expire dans ${import.meta.env.OTP_EXPIRES_IN ? Math.floor(parseInt(import.meta.env.OTP_EXPIRES_IN) / 60) : 5} minutes.</p>
        <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
      </div>
    `
  })
}