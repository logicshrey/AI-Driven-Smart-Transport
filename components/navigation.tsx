"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className="bg-blue-900 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 mr-2"
          >
            <path d="M8 6v6"></path>
            <path d="M16 6v6"></path>
            <path d="M2 12h20"></path>
            <path d="M18 18h2a2 2 0 0 0 2-2v-6a8 8 0 0 0-16 0v6a2 2 0 0 0 2 2h2"></path>
            <path d="M9 18h6"></path>
            <path d="M5 18v2"></path>
            <path d="M19 18v2"></path>
            <rect x="5" y="18" width="14" height="2" rx="1"></rect>
          </svg>
          <span className="text-xl font-bold">Smart Transport</span>
        </div>
        
        <div className="flex space-x-6">
          <NavLink href="/" label="Home" current={pathname === "/"} />
          <NavLink href="/admin" label="Admin Portal" current={pathname.startsWith("/admin")} />
          <NavLink href="/passenger" label="Passenger Portal" current={pathname.startsWith("/passenger")} />
          <NavLink href="/analytics" label="Analytics" current={pathname === "/analytics"} />
          <NavLink href="/about" label="About" current={pathname === "/about"} />
        </div>
      </div>
    </nav>
  )
}

interface NavLinkProps {
  href: string
  label: string
  current: boolean
}

function NavLink({ href, label, current }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        current
          ? "bg-blue-800 text-white"
          : "text-gray-300 hover:bg-blue-700 hover:text-white"
      }`}
    >
      {label}
    </Link>
  )
} 