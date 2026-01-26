import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | RankRiot",
  description:
    "Learn how RankRiot collects, uses, and protects your personal information and website data.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 27, 2025";

  return (
    <div className="bg-white">
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Privacy Policy
            </h1>
            <p className="mt-4 text-neutral-500">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="prose prose-neutral max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Introduction
              </h2>
              <p className="text-neutral-700 mb-4">
                RankRiot ("we", "our", or "us") is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our SEO
                analysis and website auditing service.
              </p>
              <p className="text-neutral-700">
                By using RankRiot, you agree to the collection and use of
                information in accordance with this policy. If you do not agree
                with our policies and practices, please do not use our service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-neutral-900 mb-3">
                Account Information
              </h3>
              <p className="text-neutral-700 mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 mb-6 space-y-2">
                <li>Email address</li>
                <li>Name (if provided)</li>
                <li>Password (stored securely using industry-standard encryption)</li>
                <li>Billing information (processed securely through our payment provider, Paddle)</li>
              </ul>

              <h3 className="text-xl font-medium text-neutral-900 mb-3">
                Website Data You Share With Us
              </h3>
              <p className="text-neutral-700 mb-4">
                To provide our SEO analysis and auditing services, we collect
                and analyse information from the websites you submit to us,
                including:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 mb-6 space-y-2">
                <li>Website URLs and page content</li>
                <li>Meta tags, titles, and descriptions</li>
                <li>Internal and external link structures</li>
                <li>Image data and alt text</li>
                <li>Technical SEO elements (headers, schema markup, etc.)</li>
                <li>Page performance metrics</li>
              </ul>
              <p className="text-neutral-700 mb-4">
                <strong>Important:</strong> We only analyse websites that you
                explicitly submit to our service. We do not crawl or collect
                data from websites without your direct request.
              </p>

              <h3 className="text-xl font-medium text-neutral-900 mb-3">
                Usage and Analytics Data
              </h3>
              <p className="text-neutral-700 mb-4">
                We collect information about how you interact with RankRiot
                through analytics platforms to better understand user behaviour
                and improve our service. This may include:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Pages visited and features used</li>
                <li>Time spent on the platform</li>
                <li>Device type, browser, and operating system</li>
                <li>General geographic location (country/region level)</li>
                <li>Referring websites</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                How We Use Your Information
              </h2>
              <p className="text-neutral-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Provide, maintain, and improve our SEO analysis services</li>
                <li>Generate reports and insights about the websites you submit</li>
                <li>Process transactions and manage your subscription</li>
                <li>Send you service-related notifications and updates</li>
                <li>Respond to your enquiries and provide customer support</li>
                <li>Analyse usage patterns to enhance and tailor RankRiot to our users' needs</li>
                <li>Detect, prevent, and address technical issues or security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Information Sharing and Disclosure
              </h2>
              <p className="text-neutral-700 mb-4">
                <strong>
                  We do not sell your personal information or website data.
                </strong>
              </p>
              <p className="text-neutral-700 mb-4">
                <strong>
                  We do not share your information with third-party companies
                  for their marketing purposes.
                </strong>
              </p>
              <p className="text-neutral-700 mb-4">
                We may share limited information only in the following
                circumstances:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>
                  <strong>Service Providers:</strong> We work with trusted
                  service providers who assist in operating our platform (e.g.,
                  hosting, payment processing). These providers are
                  contractually obligated to protect your data and may only use
                  it to provide services to us.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose
                  information if required by law, court order, or government
                  request, or if we believe disclosure is necessary to protect
                  our rights, your safety, or the safety of others.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger,
                  acquisition, or sale of assets, your information may be
                  transferred as part of that transaction. We will notify you of
                  any such change.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Data Security
              </h2>
              <p className="text-neutral-700 mb-4">
                We implement appropriate technical and organisational security
                measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure data centres with industry-standard protections</li>
              </ul>
              <p className="text-neutral-700 mt-4">
                While we strive to protect your information, no method of
                transmission over the internet or electronic storage is 100%
                secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Data Retention
              </h2>
              <p className="text-neutral-700 mb-4">
                We retain your information for as long as your account is active
                or as needed to provide you services. Historical scan data is
                retained according to your subscription plan's data history
                limits.
              </p>
              <p className="text-neutral-700">
                If you close your account, we will delete or anonymise your
                personal information within 90 days, except where we are
                required to retain it for legal, accounting, or security
                purposes.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Your Rights and Choices
              </h2>
              <p className="text-neutral-700 mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>
                  <strong>Access:</strong> Request a copy of the personal
                  information we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Data Portability:</strong> Request a copy of your data
                  in a portable format
                </li>
                <li>
                  <strong>Opt-out:</strong> Opt out of marketing communications
                  at any time
                </li>
              </ul>
              <p className="text-neutral-700 mt-4">
                To exercise any of these rights, please contact us at the
                details provided below.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Cookies and Tracking Technologies
              </h2>
              <p className="text-neutral-700 mb-4">
                We use cookies and similar tracking technologies to collect
                usage data and improve your experience. These include:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>
                  <strong>Essential Cookies:</strong> Required for the platform
                  to function (e.g., authentication)
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how
                  users interact with RankRiot
                </li>
              </ul>
              <p className="text-neutral-700 mt-4">
                You can control cookies through your browser settings. However,
                disabling certain cookies may affect the functionality of our
                service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                International Data Transfers
              </h2>
              <p className="text-neutral-700">
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place to protect your information in compliance with
                applicable data protection laws.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Children's Privacy
              </h2>
              <p className="text-neutral-700">
                RankRiot is not intended for use by individuals under the age of
                18. We do not knowingly collect personal information from
                children. If we become aware that we have collected information
                from a child, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Changes to This Privacy Policy
              </h2>
              <p className="text-neutral-700">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new policy on
                this page and updating the "Last updated" date. We encourage you
                to review this policy periodically.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Contact Us
              </h2>
              <p className="text-neutral-700 mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <p className="text-neutral-700">
                <Link
                  href="/contact"
                  className="text-secondary hover:underline"
                >
                  Contact Form
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
