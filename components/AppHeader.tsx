import Link from 'next/link';
import { headers } from 'next/headers';
import { getSession } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default async function AppHeader() {
  const session = await getSession(await headers());

  return (
    <header className='border-b border-gray-100 bg-white'>
      <nav
        aria-label='Main navigation'
        className='mx-auto flex max-w-3xl items-center justify-between px-4 py-3'
      >
        <Link
          href={session ? '/dashboard' : '/'}
          className='text-base font-bold tracking-tight text-gray-900 hover:text-gray-600 focus-visible:outline-none focus-visible:underline transition-colors'
        >
          NextNotes
        </Link>

        {session ? (
          <div className='flex items-center gap-4'>
            <span className='hidden text-xs text-gray-400 sm:block'>{session.user.email}</span>
            <LogoutButton />
          </div>
        ) : (
          <Link
            href='/login'
            className='text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:underline transition-colors'
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
