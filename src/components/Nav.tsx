'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import { Profile } from '@/lib/types';

const links = [
  { href: '/', label: 'Dashboard', mobileLabel: 'Home' },
  { href: '/log', label: 'Log' },
  { href: '/history', label: 'History' },
  { href: '/settings', label: 'Settings' },
];

const PROFILES: { value: Profile; name: string }[] = [
  { value: 'bill', name: 'Bill' },
  { value: 'mel', name: 'Mel' },
];

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileDropdown() {
  const { profile, setProfile } = useProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const name = PROFILES.find((p) => p.value === profile)?.name ?? 'Bill';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-gray-100 text-xs sm:text-sm font-medium transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {name}
        <span className="hidden sm:flex text-gray-500">
          <ChevronDown />
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-gray-800 border border-gray-700 rounded-lg py-1 z-30 shadow-xl min-w-[80px]">
          {PROFILES.map((p) => (
            <button
              key={p.value}
              role="option"
              aria-selected={profile === p.value}
              onClick={() => { setProfile(p.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-700 ${
                profile === p.value
                  ? 'text-blue-400 font-semibold'
                  : 'text-gray-300'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: brand + profile switcher */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-blue-400 font-bold text-lg tracking-tight">bodyrec</span>
          <ProfileDropdown />
        </div>

        {/* Right: nav links */}
        <div className="flex gap-0.5 sm:gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === link.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}
            >
              {link.mobileLabel ? (
                <>
                  <span className="sm:hidden">{link.mobileLabel}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </>
              ) : (
                link.label
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
