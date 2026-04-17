import AuthForm from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return <AuthForm mode={mode === "register" ? "register" : "sign-in"} />;
}
