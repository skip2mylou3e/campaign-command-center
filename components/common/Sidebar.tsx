'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Rocket,
  FolderOpen,
  BookOpen,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/quick-ask', label: 'Quick Ask', icon: MessageSquare },
  { href: '/plan', label: 'Plan a Campaign', icon: Rocket },
  { href: '/campaigns', label: 'My Campaigns', icon: FolderOpen },
  { href: '/glossary', label: 'Glossary', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [logoExists, setLogoExists] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setLogoExists(true);
    img.onerror = () => setLogoExists(false);
    img.src = '/images/dd-logo.png';
  }, []);

  return (
    <aside className="w-64 bg-dd-navy flex flex-col shrink-0 h-screen">
      {/* Logo area */}
      <div className="p-5 border-b border-dd-navy-light">
        <Link href="/" className="block">
          {logoExists ? (
            <Image
              src="/images/dd-logo.png"
              alt="Dye & Durham"
              width={140}
              height={40}
              className="mb-2"
            />
          ) : (
            <div className="text-white font-bold text-lg mb-1">
              Dye & Durham
            </div>
          )}
          <div className="text-dd-teal text-xs font-medium tracking-wide">
            Campaign Command Center
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-all ${
                isActive
                  ? 'text-white bg-dd-navy-light border-l-2 border-dd-teal'
                  : 'text-gray-300 hover:text-white hover:bg-dd-navy-light border-l-2 border-transparent'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dd-navy-light">
        <p className="text-xs text-gray-500">
          Built for the D&D Marketing Team
        </p>
      </div>
    </aside>
  );
}
