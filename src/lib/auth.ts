import { betterAuth } from "better-auth"
import { organization, admin, multiSession } from "better-auth/plugins"
import { prisma } from "./prisma"
import { sendEmail } from "./email"

export const auth = betterAuth({
  database: {
    provider: "prisma",
    client: prisma,
  },
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        html: `
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
          <p>Ce lien expire dans 1 heure.</p>
        `
      })
    }
  },

  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Vérification de votre adresse email",
        html: `
          <h2>Bienvenue sur Annuaire2 !</h2>
          <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
          <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Vérifier mon email</a>
          <p>Ce lien expire dans 24 heures.</p>
        `
      })
    }
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      sendInvitationEmail: async ({ email, organization, inviteLink }) => {
        await sendEmail({
          to: email,
          subject: `Invitation à rejoindre ${organization.name}`,
          html: `
            <h2>Vous êtes invité à rejoindre ${organization.name}</h2>
            <p>Cliquez sur le lien ci-dessous pour accepter l'invitation :</p>
            <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Accepter l'invitation</a>
          `
        })
      }
    }),
    admin({
      admins: [import.meta.env.ADMIN_EMAIL]
    }),
    multiSession()
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // update session every day
  },

  user: {
    additionalFields: {
      organizationId: {
        type: "string",
        required: false
      }
    }
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: false
    }
  },

  socialProviders: {
    // Add social providers here if needed
  }
})