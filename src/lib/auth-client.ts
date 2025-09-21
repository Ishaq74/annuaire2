import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
  baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:4321",
})

export const signIn = authClient.signIn
export const signUp = authClient.signUp  
export const signOut = authClient.signOut
export const useSession = authClient.useSession
export const getSession = authClient.getSession
export const organization = authClient.organization

// OTP utilities
export async function sendOTP(email: string) {
  const response = await fetch('/api/otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'send', email }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erreur lors de l\'envoi du code OTP')
  }
  
  return response.json()
}

export async function verifyOTPCode(email: string, otp: string) {
  const response = await fetch('/api/otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'verify', email, otp }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erreur lors de la vérification du code OTP')
  }
  
  return response.json()
}