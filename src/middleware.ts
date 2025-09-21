import { defineMiddleware } from 'astro:middleware';
import { auth } from './lib/auth';
import { getUserWithRoles } from './lib/permissions';

export const onRequest = defineMiddleware(async (context, next) => {
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: context.request.headers
  });

  // Add session to context
  context.locals.session = session;
  context.locals.user = session?.user || null;

  // If user is authenticated, get their roles and permissions
  if (session?.user) {
    try {
      const userWithRoles = await getUserWithRoles(session.user.id);
      context.locals.userWithRoles = userWithRoles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      context.locals.userWithRoles = null;
    }
  }

  // Handle language detection and validation
  const url = new URL(context.request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const supportedLocales = ['fr', 'en', 'es'];
  
  let lang = 'fr'; // default language
  
  if (segments.length > 0 && supportedLocales.includes(segments[0])) {
    lang = segments[0];
  }
  
  context.locals.lang = lang;

  return next();
});