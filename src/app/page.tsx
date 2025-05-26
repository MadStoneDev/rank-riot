import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

export const metadata = {
  title: "RankRiot - SEO for small businesses by a small business",
  description:
    "RankRiot is a free SEO analysis tool that helps small businesses improve their website's SEO performance.",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      {/* Hero Section */}
      <section
        className={`py-20 grid place-content-center min-h-[600px] bg-white`}
      >
        <div
          className={`flex flex-col items-center max-w-2xl px-4 text-center`}
        >
          <h1
            className={`mb-6 max-w-xl font-display text-5xl font-bold text-primary`}
          >
            SEO for small businesses by a small business
          </h1>

          <p className="text-xl text-primary/60 max-w-3xl mx-auto mb-10">
            Monitor, analyze and optimize your website's SEO performance with
            our powerful platform. Find broken links, track keywords, and stay
            ahead of your competition.
          </p>

          <div
            className={`group relative flex items-center space-x-2 bg-primary overflow-hidden z-10`}
          >
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 group-hover:w-[110%] aspect-square bg-primary-dark transition-all duration-300 ease-in-out -z-[1]`}
            ></div>

            <Link
              href={`/auth`}
              className={`py-4 px-8 text-white text-lg font-bold transition-all duration-300 ease-in-out z-50`}
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-16 bg-neutral-100 dark:bg-primary-dark`}>
        <div className={`mx-auto px-4`}>
          <h2
            className={`text-primary dark:text-white/70 text-3xl font-bold text-center mb-12`}
          >
            Key Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 shadow-md">
              <div className="text-primary mb-4">
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
              <h3 className="text-primary text-xl font-bold mb-2">
                Broken Link Detection
              </h3>
              <p className="text-primary/50">
                Automatically find and fix broken links (404s) on your website
                to improve user experience and SEO.
              </p>
            </div>

            <div className="bg-white p-6 shadow-md">
              <div className="text-primary mb-4">
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
              <h3 className="text-primary text-xl font-bold mb-2">
                Comprehensive Analysis
              </h3>
              <p className="text-primary/50">
                Get detailed insights into your website's structure, content,
                and technical SEO performance.
              </p>
            </div>

            <div className="bg-white p-6 shadow-md">
              <div className="text-primary mb-4">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </div>
              <h3 className="text-primary text-xl font-bold mb-2">
                Regular Monitoring
              </h3>
              <p className="text-primary/50">
                Schedule automatic scans to monitor your website's SEO health
                and detect issues before they impact your rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to improve your website's SEO?
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Join thousands of businesses that use our platform to boost their
            search engine rankings.
          </p>

          <div
            className={`group relative inline-flex items-center space-x-2 bg-primary-dark overflow-hidden z-10`}
          >
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 group-hover:w-[110%] aspect-square bg-white transition-all duration-300 ease-in-out -z-[1]`}
            ></div>

            <Link
              href={`/auth`}
              className={`py-4 px-8 text-white group-hover:text-primary text-lg font-bold transition-all duration-300 ease-in-out z-50`}
            >
              Start Your Free Account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
