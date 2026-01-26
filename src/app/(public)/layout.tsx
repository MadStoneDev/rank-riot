import Link from "next/link";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header
        className={`fixed top-0 w-full bg-neutral-50 dark:bg-primary-dark shadow-lg shadow-neutral-900/10 z-50`}
      >
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div
            className={`group py-1 px-2 relative flex items-center space-x-2 overflow-hidden z-10`}
          >
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 group-hover:w-[110%] aspect-square bg-primary dark:bg-neutral-50 transition-all duration-300 ease-in-out -z-[1]`}
            ></div>

            <Link
              href={`/`}
              className={`text-2xl font-bold text-primary group-hover:text-neutral-50 dark:text-neutral-50 dark:group-hover:text-primary transition-all duration-300 ease-in-out z-50`}
            >
              RankRiot
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <Link
              href={`/auth`}
              className={`py-1 px-2 hover:bg-primary dark:hover:bg-white text-primary hover:text-white dark:text-neutral-50 dark:hover:text-primary-dark transition-all duration-300 ease-in-out`}
            >
              Free Account
            </Link>
          </div>
        </div>
      </header>

      <main className={`pt-20 min-h-screen bg-white`}>{children}</main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href={`/`} className={`inline-flex hover:text-primary`}>
                <h3 className="text-lg font-semibold mb-4">RankRiot</h3>
              </Link>
              <p className="text-neutral-400">
                Comprehensive SEO analysis and monitoring platform for websites
                of all sizes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-neutral-400">
                <li>Broken Link Detection</li>
                <li>SEO Analysis</li>
                <li>Keyword Tracking</li>
                <li>Competitor Analysis</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <Link
                    href={`/pricing`}
                    className={`hover:text-white transition-all duration-300 ease-in-out`}
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/documentation`}
                    className={`hover:text-white transition-all duration-300 ease-in-out`}
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <Link
                    href={`/about`}
                    className={`hover:text-white transition-all duration-300 ease-in-out`}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/contact`}
                    className={`hover:text-white transition-all duration-300 ease-in-out`}
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/privacy`}
                    className={`hover:text-white transition-all duration-300 ease-in-out`}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/terms`}
                    className={`hover:text-white transition-all duration-300 ease-in-out`}
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-700 mt-12 pt-8 text-center text-neutral-400">
            <p>
              &copy; {new Date().getFullYear()} RankRiot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
