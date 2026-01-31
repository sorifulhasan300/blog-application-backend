import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  trustedOrigins: [process.env.TRUSTED_URL || "http://localhost:3000"],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const info = await transporter.sendMail({
        from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
        to: user.email,
        subject: "Hello how are you",
        text: "Hello world?", // Plain-text version of the message
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            padding: 20px;
          }
          .card {
            background: #ffffff;
            padding: 20px;
            border-radius: 6px;
          }
          h1 {
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Hello ${user.name}</h1>
          <p>Thanks for signing up.</p>
          <p><strong>We’re glad you’re here.</strong></p>
        </div>
      </body>
      </html>
    `, // HTML version of the message
      });

      console.log("Message sent:", info.messageId, user, token, url);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
