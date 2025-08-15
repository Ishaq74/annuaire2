import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;
    
    // Validate email
    if (!email) {
      return new Response(JSON.stringify({ 
        error: 'Email is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email format' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if email already exists in newsletter
    const { data: existingSubscription, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Database check error:', checkError);
      return new Response(JSON.stringify({ 
        error: 'Failed to check subscription status' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (existingSubscription) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Email already subscribed',
        data: { already_subscribed: true }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert new newsletter subscription
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email: email.trim().toLowerCase(),
        status: 'active',
        subscribed_at: new Date().toISOString(),
        source: 'website'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to subscribe to newsletter' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Successfully subscribed to newsletter',
      data 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};