import type { APIRoute } from 'astro';
import { auth } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get session from headers
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { bio, website, twitter, linkedin, github } = await request.json();

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        bio,
        website,
        twitter,
        linkedin,
        github,
      },
      create: {
        userId: session.user.id,
        bio,
        website,
        twitter,
        linkedin,
        github,
      },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      profile 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur interne du serveur' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};