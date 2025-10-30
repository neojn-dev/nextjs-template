import nodemailer from "nodemailer"
import { config } from "@/lib/config"

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${config.app.url}/verify?token=${token}`
  
  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: `Verify your email for ${config.app.name}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Verify your email address</h2>
        <p>Thank you for signing up for ${config.app.name}! Please click the link below to verify your email address:</p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${verifyUrl}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${config.app.url}/reset-password?token=${token}`
  
  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: `Reset your password for ${config.app.name}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Reset your password</h2>
        <p>You requested a password reset for your ${config.app.name} account. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
      </div>
    `,
  })
}

export async function sendAdminCreatedAccountVerificationEmail(email: string, token: string, firstName: string) {
  const verifyUrl = `${config.app.url}/verify?token=${token}`
  
  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: `Account Created - Verify Your Email for ${config.app.name}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${config.app.name}!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName},</h2>
          
          <p>An administrator has created an account for you on ${config.app.name}. To get started, you need to verify your email address first.</p>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #92400e;">⚠️ Important Instructions:</p>
            <ul style="margin: 8px 0 0 0; color: #92400e;">
              <li><strong>First:</strong> Click the verification link below to activate your account</li>
              <li><strong>Second:</strong> Check your email for a separate message containing your temporary password</li>
              <li><strong>Third:</strong> You must change your password on first login for security</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              ✓ Verify Email Address
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280; background-color: #f3f4f6; padding: 12px; border-radius: 4px; font-family: monospace;">${verifyUrl}</p>
          
          <div style="background-color: #e5f3ff; border: 1px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #1e40af;"><strong>🔐 Security Note:</strong> This link will expire in 24 hours. You will receive your temporary password in a separate email for security purposes.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            If you didn't expect this account creation, please contact your administrator immediately.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendTemporaryPasswordEmail(email: string, password: string, firstName: string) {
  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: `🔑 Your Temporary Password for ${config.app.name}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔑 Your Temporary Password</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName},</h2>
          
          <p>Here is your temporary password for ${config.app.name}:</p>
          
          <div style="background-color: #1f2937; color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px;">
            ${password}
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #dc2626;">🚨 Critical Security Requirements:</p>
            <ul style="margin: 8px 0 0 0; color: #dc2626;">
              <li><strong>You MUST verify your email first</strong> before you can log in</li>
              <li><strong>You MUST change this password</strong> on your first login</li>
              <li><strong>Do not share this password</strong> with anyone</li>
              <li><strong>Delete this email</strong> after changing your password</li>
            </ul>
          </div>
          
          <div style="background-color: #e0f2fe; border: 1px solid #0284c7; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #0c4a6e;"><strong>📋 Next Steps:</strong></p>
            <ol style="margin: 8px 0 0 0; color: #0c4a6e;">
              <li>Check your email for the verification link and click it</li>
              <li>Go to the login page: <a href="${config.app.url}/signin" style="color: #0284c7;">${config.app.url}/signin</a></li>
              <li>Use your username/email and this temporary password</li>
              <li>You'll be prompted to set a new secure password</li>
            </ol>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            <strong>Security Notice:</strong> This is an automatically generated password. For your security, you will be required to change it immediately upon first login.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendWorkflowNotification(toEmail: string, subject: string, html: string) {
  await transporter.sendMail({
    from: config.email.from,
    to: toEmail,
    subject,
    html,
  })
}
