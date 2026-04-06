import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

const isProductionBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

const createAuth = () => {
  const authSecret =
    process.env.BETTER_AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "dev-only-better-auth-secret-change-me-please");

  if (!authSecret && !isProductionBuildPhase) {
    throw new Error("Missing BETTER_AUTH_SECRET in production environment.");
  }

  const authBaseUrl =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return betterAuth({
    // Next may evaluate route modules during build before runtime env injection.
    secret: authSecret ?? "build-time-placeholder-secret",
    baseURL: authBaseUrl,
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    user: {
      modelName: "User",
    },
    session: {
      modelName: "Session",
    },
    account: {
      modelName: "Account",
    },
    verification: {
      modelName: "Verification",
    },
    emailAndPassword: {
      enabled: true,
    },
    socialProviders:
      googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {},
    plugins: [nextCookies()],
  });
};

let authInstance: ReturnType<typeof createAuth> | undefined;

export const getAuth = () => {
  if (!authInstance) {
    authInstance = createAuth();
  }

  return authInstance;
};
