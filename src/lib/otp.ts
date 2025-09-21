import { prisma } from './prisma'
import { sendOTP } from './email'
import crypto from 'crypto'

export async function generateOTP(email: string): Promise<string> {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Calculate expiration time
  const expiresAt = new Date(Date.now() + parseInt(import.meta.env.OTP_EXPIRES_IN || '300') * 1000)
  
  // Save OTP to database
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: otp,
      type: 'otp',
      expiresAt
    }
  })
  
  return otp
}

export async function sendOTPEmail(email: string): Promise<void> {
  // Delete any existing OTPs for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      type: 'otp'
    }
  })
  
  // Generate new OTP
  const otp = await generateOTP(email)
  
  // Send email
  await sendOTP(email, otp)
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const token = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token: otp,
      type: 'otp',
      expiresAt: {
        gt: new Date()
      }
    }
  })
  
  if (!token) {
    return false
  }
  
  // Delete the used token
  await prisma.verificationToken.delete({
    where: {
      id: token.id
    }
  })
  
  return true
}

export async function generatePasswordResetToken(email: string): Promise<string> {
  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex')
  
  // Calculate expiration time (1 hour)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
  
  // Delete any existing password reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      type: 'password_reset'
    }
  })
  
  // Save token to database
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      type: 'password_reset',
      expiresAt
    }
  })
  
  return token
}

export async function verifyPasswordResetToken(email: string, token: string): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token,
      type: 'password_reset',
      expiresAt: {
        gt: new Date()
      }
    }
  })
  
  if (!verificationToken) {
    return false
  }
  
  // Delete the used token
  await prisma.verificationToken.delete({
    where: {
      id: verificationToken.id
    }
  })
  
  return true
}

export async function generateEmailVerificationToken(email: string): Promise<string> {
  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex')
  
  // Calculate expiration time (24 hours)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  
  // Delete any existing email verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      type: 'email_verification'
    }
  })
  
  // Save token to database
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      type: 'email_verification',
      expiresAt
    }
  })
  
  return token
}

export async function verifyEmailVerificationToken(email: string, token: string): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token,
      type: 'email_verification',
      expiresAt: {
        gt: new Date()
      }
    }
  })
  
  if (!verificationToken) {
    return false
  }
  
  // Delete the used token
  await prisma.verificationToken.delete({
    where: {
      id: verificationToken.id
    }
  })
  
  return true
}