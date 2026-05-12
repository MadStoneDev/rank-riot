import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Header (client component for mobile menu toggle) */}
      <PublicNavbar />

      {/* Main Content */}
      <main className="pt-16 min-h-screen bg-[var(--color-surface-base)]">{children}</main>

      {/* Footer */}
      <footer className="bg-[var(--color-surface-raised)] border-t border-[var(--color-border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-xl font-semibold text-[var(--color-text-primary)]">
                  RankRiot
                </span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs text-[var(--color-text-muted)]">
                Professional SEO analysis and site auditing tools for developers
                and marketing teams who demand precision.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-[var(--color-text-primary)] font-medium mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/pricing" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/documentation" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <span className="text-[var(--color-text-muted)]/50">API (Coming Soon)</span>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-[var(--color-text-primary)] font-medium mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/about" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-[var(--color-text-primary)] font-medium mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/privacy" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-[var(--color-border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              &copy; {new Date().getFullYear()} RankRiot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
