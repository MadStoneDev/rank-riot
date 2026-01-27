"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu2, IconX } from "@tabler/icons-react";

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/documentation", label: "Docs" },
  { href: "/contact", label: "Contact" },
];

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-neutral-200/50 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-semibold text-neutral-900">
                RankRiot
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.href
                      ? "text-primary bg-primary/5"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <IconX className="w-6 h-6" />
              ) : (
                <IconMenu2 className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg ${
                    pathname === link.href
                      ? "text-primary bg-primary/5"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <Link
                  href="/auth"
                  className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  className="block px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen bg-white">{children}</main>

      {/* Footer */}
      <footer className="bg-neutral-950 text-neutral-400">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-xl font-semibold text-white">
                  RankRiot
                </span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs">
                Professional SEO analysis and site auditing tools for developers
                and marketing teams who demand precision.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/documentation" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <span className="text-neutral-600">API (Coming Soon)</span>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} RankRiot. All rights reserved.
            </p>
            {/*<div className="flex items-center space-x-6 text-sm">*/}
            {/*  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">*/}
            {/*    GitHub*/}
            {/*  </a>*/}
            {/*  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">*/}
            {/*    Twitter*/}
            {/*  </a>*/}
            {/*</div>*/}
          </div>
        </div>
      </footer>
    </>
  );
}
