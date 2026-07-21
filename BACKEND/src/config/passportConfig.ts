import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (!user) {
          // check if email already exists (user registered normally before)
          const existingEmail = await prisma.user.findUnique({
            where: { email: profile.emails?.[0].value || "" },
          });

          if (existingEmail) {
            // link google to existing account
            user = await prisma.user.update({
              where: { email: profile.emails?.[0].value || "" },
              data: { googleId: profile.id },
            });
          } else {
            // create brand new user
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                firstName: profile.name?.givenName?.trim() || "User",
                lastName: profile.name?.familyName?.trim() || "",
                email: profile.emails?.[0].value || "no-email",
                role: "normal user",
                proExpiresAt: null,
              },
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

export default passport;