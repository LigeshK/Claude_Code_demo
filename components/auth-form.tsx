'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

type Mode = 'sign-in' | 'register';

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const callbacks = {
      onSuccess: () => router.push('/dashboard'),
      onError: (ctx: { error: { message: string } }) => setError(ctx.error.message),
    };

    if (isRegister) {
      const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      await authClient.signUp.email({ email, password, name }, callbacks);
    } else {
      await authClient.signIn.email({ email, password }, callbacks);
    }

    setIsPending(false);
  }

  return (
    <main className='min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12'>
      <div className='w-full max-w-sm'>
        <header className='mb-8 text-center'>
          <p className='text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3'>
            NoteSpace
          </p>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
            {isRegister ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className='mt-1.5 text-sm text-gray-500'>
            {isRegister ? 'Start taking notes today.' : 'Sign in to your notes.'}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className='space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-xs'
        >
          {isRegister && (
            <div className='space-y-1.5'>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                Name
              </label>
              <input
                id='name'
                name='name'
                type='text'
                required
                autoComplete='name'
                placeholder='Your name'
                className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus-visible:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900'
              />
            </div>
          )}

          <div className='space-y-1.5'>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              required
              autoComplete='email'
              placeholder='you@example.com'
              className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus-visible:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900'
            />
          </div>

          <div className='space-y-1.5'>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 8 : undefined}
              placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
              className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus-visible:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900'
            />
          </div>

          <div aria-live='polite' aria-atomic='true'>
            {error && (
              <p role='alert' className='rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'>
                {error}
              </p>
            )}
          </div>

          <button
            type='submit'
            disabled={isPending}
            aria-busy={isPending}
            className='w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending
              ? isRegister
                ? 'Creating account…'
                : 'Signing in…'
              : isRegister
                ? 'Create account'
                : 'Sign in'}
          </button>

          <p className='text-center text-sm text-gray-500'>
            {isRegister ? (
              <>
                Already have an account?{' '}
                <Link
                  href='/login'
                  className='font-medium text-gray-900 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none'
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <Link
                  href='/login?mode=register'
                  className='font-medium text-gray-900 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none'
                >
                  Sign up
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </main>
  );
}
