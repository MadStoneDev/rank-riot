import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-neutral-900">
              RankRiot
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <Link
              href={`/auth`}
              className={`text-neutral-600 hover:text-neutral-900`}
            >
              Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`py-20 grid place-content-center min-h-[600px]`}>
        <div className="container mx-auto px-4 text-center">
          <h1
            className={`font-display text-5xl font-bold text-neutral-900 mb-6`}
          >
            Comprehensive SEO Analysis for Your Website
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-10">
            Monitor, analyze and optimize your website's SEO performance with
            our powerful platform. Find broken links, track keywords, and stay
            ahead of your competition.
          </p>
          <Link
            href="/auth"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-md text-lg font-medium"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 mb-4">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Broken Link Detection
              </h3>
              <p className="text-neutral-600">
                Automatically find and fix broken links (404s) on your website
                to improve user experience and SEO.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 mb-4">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Comprehensive Analysis
              </h3>
              <p className="text-neutral-600">
                Get detailed insights into your website's structure, content,
                and technical SEO performance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 mb-4">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Regular Monitoring</h3>
              <p className="text-neutral-600">
                Schedule automatic scans to monitor your website's SEO health
                and detect issues before they impact your rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to improve your website's SEO?
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Join thousands of businesses that use our platform to boost their
            search engine rankings.
          </p>
          <Link
            href="/auth"
            className="bg-white text-primary-600 hover:bg-neutral-100 px-8 py-4 rounded-md text-lg font-medium"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">RankRiot</h3>
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
                <li>Documentation</li>
                <li>Blog</li>
                <li>Support</li>
                <li>FAQ</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-neutral-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
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
    </div>
  );
}
