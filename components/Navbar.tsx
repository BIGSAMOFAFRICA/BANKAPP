import Link from 'next/link';
import { useRouter } from 'next/router';
import { Banknote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isAuthenticated, removeToken } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white">
            <Banknote className="h-4 w-4" />
          </span>
          <span className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">BIGSAMOFAFRICA BANK</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/') ? 'text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/about') ? 'text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/contact') ? 'text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Contact
          </Link>
          {authed ? (
            <>
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-md text-sm font-semibold text-slate-900 bg-amber-300 hover:bg-amber-400 transition-colors"
              >
                Get Started
              </Link>
            </>
          ) : (
            router.pathname === '/signup' ? (
              <Link
                href="/login"
                className="px-4 py-2 rounded-md text-sm font-semibold text-slate-900 bg-amber-300 hover:bg-amber-400 transition-colors"
              >
                Login
              </Link>
            ) : (
              <Link
                href="/signup"
                className="px-4 py-2 rounded-md text-sm font-semibold text-slate-900 bg-amber-300 hover:bg-amber-400 transition-colors"
              >
                Signup
              </Link>
            )
          )}
        </div>

        <div className="md:hidden" aria-hidden>
          {/* Placeholder for future mobile menu */}
        </div>
      </div>
    </nav>
  );
}
