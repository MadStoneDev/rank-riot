export default function AboutPage() {
  return (
    <>
      <section className="py-20 grid place-content-center min-h-[600px] bg-white">
        <div className="flex flex-col items-center max-w-2xl px-4 text-center">
          <h1 className="mb-6 max-w-xl font-display text-5xl font-bold text-primary">
            About <span className="text-secondary">RankRiot</span>
          </h1>
          <p className="text-xl text-primary/60 max-w-3xl mx-auto mb-10">
            Small business SEO tools, built by a small business that gets it. We
            understand your challenges because we face them too.
          </p>
        </div>
      </section>

      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-primary text-3xl font-bold text-center mb-12">
            Our Story
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 shadow-md mb-8">
              <p className="text-primary/70 text-lg leading-relaxed mb-6">
                RankRiot was born from frustration. As a small business
                ourselves, we knew the pain of trying to improve our SEO with
                tools designed for enterprise budgets and enterprise teams. We
                needed something simple, affordable, and actually useful for
                businesses like ours.
              </p>
              <p className="text-primary/70 text-lg leading-relaxed">
                So we built it. RankRiot is our SEO crawler designed
                specifically for small businesses who need real insights without
                the complexity, the bloat, or the eye-watering price tags of
                traditional SEO tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-primary text-3xl font-bold text-center mb-12">
            What We Believe
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 shadow-md">
              <div className="text-primary mb-4">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-primary text-xl font-bold mb-2">
                SEO Shouldn't Be Rocket Science
              </h3>
              <p className="text-primary/50">
                Every small business deserves clear, actionable SEO insights
                without needing a PhD in digital marketing.
              </p>
            </div>

            <div className="bg-white p-6 shadow-md">
              <div className="text-primary mb-4">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-primary text-xl font-bold mb-2">
                Small Business Budgets Matter
              </h3>
              <p className="text-primary/50">
                We price our tools for real small businesses, not Fortune 500
                companies pretending to care about SMBs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-primary text-3xl font-bold text-center mb-12">
            Our Approach
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 shadow-md">
              <p className="text-primary/70 text-lg leading-relaxed mb-4">
                We focus on the SEO fundamentals that actually move the needle
                for small businesses. Our crawler identifies the issues that
                matter most for your rankings and provides clear, prioritized
                action items you can actually implement.
              </p>
              <p className="text-primary/70 text-lg leading-relaxed">
                No fluff. No overwhelming dashboards. Just the SEO insights that
                help small businesses compete online.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-primary text-3xl font-bold text-center mb-12">
            What We Focus On
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 shadow-md">
              <div className="text-primary mb-4">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              -
              <h3 className="text-primary text-xl font-bold mb-2">
                Technical Issues That Matter
              </h3>
              <p className="text-primary/50">
                We find the broken links, missing meta tags, and technical
                problems that actually hurt your rankings.
              </p>
            </div>

            <div className="bg-white p-6 shadow-md">
              <div className="text-primary mb-4">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                </svg>
              </div>
              <h3 className="text-primary text-xl font-bold mb-2">
                Actionable Insights
              </h3>
              <p className="text-primary/50">
                Every recommendation comes with clear steps you can take, no
                matter your technical skill level.
              </p>
            </div>

            <div className="bg-white p-6 shadow-md">
              <div className="text-primary mb-4">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </div>
              <h3 className="text-primary text-xl font-bold mb-2">
                Small Business Priorities
              </h3>
              <p className="text-primary/50">
                We prioritize the improvements that give you the biggest SEO
                bang for your buck and time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Riot Against Bad SEO?
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Join other small businesses who've taken control of their SEO with
            tools that actually make sense.
          </p>

          <div className="group relative inline-flex items-center space-x-2 bg-primary-dark overflow-hidden z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 group-hover:w-[110%] aspect-square bg-white transition-all duration-300 ease-in-out -z-[1]"></div>

            <a
              href="/auth"
              className="py-4 px-8 text-white group-hover:text-primary text-lg font-bold transition-all duration-300 ease-in-out z-50"
            >
              Start Your Free Account
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
