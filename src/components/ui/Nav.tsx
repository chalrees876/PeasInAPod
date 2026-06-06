"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones, Compass, BookOpen, LogIn, LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/shelf", label: "My Shelf", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-purple-700 text-lg">
          <Headphones className="w-5 h-5" />
          PeasInAPod
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-600 hover:text-purple-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          {session ? (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/profile" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-700">
                <User className="w-4 h-4" />
                {session.user?.name?.split(" ")[0] ?? "Profile"}
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
