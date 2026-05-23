'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard', mobileLabel: 'Home' },
  { href: '/log', label: 'Log' },
  { href: '/history', label: 'History' },
  { href: '/settings', label: 'Settings' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3 sm:gap-4">
        <span className="text-blue-400 font-bold text-lg tracking-tight flex-shrink-0">bodyrec</span>
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
