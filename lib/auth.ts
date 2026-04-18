import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()],
});

export async function getSession(requestHeaders: Headers) {
  return auth.api.getSession({ headers: requestHeaders });
}

export async function requireAuth() {
  const session = await getSession(await headers());
  if (!session) redirect("/login");
  return session;
}
