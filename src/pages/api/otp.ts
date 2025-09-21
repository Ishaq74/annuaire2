import type { APIRoute } from 'astro';
import { sendOTPEmail, verifyOTP } from '../../lib/otp';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { action, email, otp } = await request.json();

    if (action === 'send') {
      if (!email || typeof email !== 'string') {
        return new Response(JSON.stringify({ error: 'Email requis' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await sendOTPEmail(email);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Code OTP envoyé par email' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'verify') {
      if (!email || !otp || typeof email !== 'string' || typeof otp !== 'string') {
        return new Response(JSON.stringify({ error: 'Email et code OTP requis' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const isValid = await verifyOTP(email, otp);
      
      if (isValid) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Code OTP valide' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ 
          error: 'Code OTP invalide ou expiré' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Action non reconnue' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur API OTP:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur interne du serveur' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};