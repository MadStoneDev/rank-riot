import { Metadata } from "next";
import Link from "next/link";
import { IconMail, IconBrandTwitter, IconBrandGithub } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Contact | RankRiot",
  description:
    "Get in touch with the RankRiot team. We're here to help with your SEO questions and support needs.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              Get in touch
            </h1>
            <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
              Have a question, feedback, or need help? We&apos;d love to hear from
              you. Our team typically responds within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Send us a message
              </h2>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
                  >
                    <option value="">Select a topic</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="feedback">Feature Request / Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                    placeholder="How can we help?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Other ways to reach us
              </h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IconMail className="w-6 h-6 text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Email</h3>
                    <p className="text-neutral-600 mt-1">
                      For general inquiries and support
                    </p>
                    <a
                      href="mailto:support@rankriot.app"
                      className="text-primary hover:underline mt-2 inline-block"
                    >
                      support@rankriot.app
                    </a>
                  </div>
                </div>

                {/*<div className="flex gap-4">*/}
                {/*  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">*/}
                {/*    <IconBrandTwitter className="w-6 h-6 text-neutral-600" />*/}
                {/*  </div>*/}
                {/*  <div>*/}
                {/*    <h3 className="font-semibold text-neutral-900">Twitter</h3>*/}
                {/*    <p className="text-neutral-600 mt-1">*/}
                {/*      Follow us for updates and tips*/}
                {/*    </p>*/}
                {/*    <a*/}
                {/*      href="https://twitter.com/rankriot"*/}
                {/*      target="_blank"*/}
                {/*      rel="noopener noreferrer"*/}
                {/*      className="text-primary hover:underline mt-2 inline-block"*/}
                {/*    >*/}
                {/*      @rankriot*/}
                {/*    </a>*/}
                {/*  </div>*/}
                {/*</div>*/}

                {/*<div className="flex gap-4">*/}
                {/*  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">*/}
                {/*    <IconBrandGithub className="w-6 h-6 text-neutral-600" />*/}
                {/*  </div>*/}
                {/*  <div>*/}
                {/*    <h3 className="font-semibold text-neutral-900">GitHub</h3>*/}
                {/*    <p className="text-neutral-600 mt-1">*/}
                {/*      Report bugs or request features*/}
                {/*    </p>*/}
                {/*    <a*/}
                {/*      href="https://github.com/rankriot"*/}
                {/*      target="_blank"*/}
                {/*      rel="noopener noreferrer"*/}
                {/*      className="text-primary hover:underline mt-2 inline-block"*/}
                {/*    >*/}
                {/*      github.com/rankriot*/}
                {/*    </a>*/}
                {/*  </div>*/}
                {/*</div>*/}
              </div>

              {/* FAQ Link */}
              <div className="mt-12 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Looking for quick answers?
                </h3>
                <p className="text-neutral-600 text-sm mb-4">
                  Check our pricing FAQ or documentation for immediate help with
                  common questions.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/pricing#faq"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Pricing FAQ →
                  </Link>
                  <Link
                    href="/documentation"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Documentation →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
