import { Metadata } from "next";
import Link from "next/link";
import { IconMail, IconBrandTwitter, IconBrandGithub } from "@tabler/icons-react";
import ContactForm from "@/components/contact/ContactForm";

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
              <ContactForm />
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
                      href="mailto:hello@rankriot.app"
                      className="text-primary hover:underline mt-2 inline-block"
                    >
                      hello@rankriot.app
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
