import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AuthForm from '@/components/auth-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await getSession(await headers());
  if (session) redirect('/dashboard');

  const { mode } = await searchParams;
  return <AuthForm mode={mode === 'register' ? 'register' : 'sign-in'} />;
}
