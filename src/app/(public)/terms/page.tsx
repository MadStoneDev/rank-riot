import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | RankRiot",
  description:
    "Read the terms and conditions governing your use of RankRiot's SEO analysis and website auditing services.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "January 27, 2025";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-4 text-neutral-500">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="prose prose-neutral max-w-none prose-headings:text-neutral-900 prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-h3:font-medium prose-a:text-primary hover:prose-a:underline">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                1. Agreement to Terms
              </h2>
              <p className="text-neutral-700 mb-4">
                By accessing or using RankRiot (&quot;the Service&quot;), you agree to be
                bound by these Terms of Service (&quot;Terms&quot;). If you disagree with
                any part of these terms, you may not access the Service.
              </p>
              <p className="text-neutral-700">
                These Terms apply to all visitors, users, and others who access
                or use the Service. By using the Service, you also agree to our{" "}
                <Link href="/privacy" className="text-secondary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                2. Description of Service
              </h2>
              <p className="text-neutral-700 mb-4">
                RankRiot provides SEO analysis, website auditing, and related
                digital marketing tools. Our services include:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Website crawling and technical SEO analysis</li>
                <li>On-page SEO auditing and recommendations</li>
                <li>Performance monitoring and reporting</li>
                <li>Historical data tracking and trend analysis</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                3. User Accounts
              </h2>
              <p className="text-neutral-700 mb-4">
                To access certain features of the Service, you must create an
                account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information as needed</li>
                <li>Keep your password secure and confidential</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
                <li>
                  Notify us immediately of any unauthorised access or security
                  breach
                </li>
              </ul>
              <p className="text-neutral-700 mt-4">
                We reserve the right to suspend or terminate accounts that
                violate these Terms or for any other reason at our discretion.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                4. Acceptable Use
              </h2>
              <p className="text-neutral-700 mb-4">
                You agree to use the Service only for lawful purposes and in
                accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>
                  Use the Service to analyse websites you do not own or have
                  explicit permission to analyse
                </li>
                <li>
                  Attempt to gain unauthorised access to any part of the Service
                  or its related systems
                </li>
                <li>
                  Use the Service to collect, harvest, or store personal data
                  about others without consent
                </li>
                <li>
                  Interfere with or disrupt the integrity or performance of the
                  Service
                </li>
                <li>
                  Use automated means to access the Service beyond normal usage
                  (e.g., scraping, bots)
                </li>
                <li>
                  Reverse engineer, decompile, or attempt to extract the source
                  code of the Service
                </li>
                <li>
                  Resell, redistribute, or sublicense the Service without our
                  written permission
                </li>
                <li>
                  Use the Service in violation of any applicable laws or
                  regulations
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                5. Website Scanning and Data
              </h2>
              <p className="text-neutral-700 mb-4">
                By submitting a website URL for analysis, you represent and
                warrant that:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>
                  You own the website or have authorisation from the owner to
                  analyse it
                </li>
                <li>
                  The scanning of the website does not violate any applicable
                  laws or third-party rights
                </li>
                <li>
                  You accept responsibility for any consequences arising from
                  the analysis
                </li>
              </ul>
              <p className="text-neutral-700 mt-4">
                We are not responsible for the content of websites you submit
                for analysis or any issues arising from our crawling of those
                websites.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                6. Subscriptions and Billing
              </h2>
              <h3 className="text-xl font-medium text-neutral-900 mb-3">
                Free and Paid Plans
              </h3>
              <p className="text-neutral-700 mb-4">
                RankRiot offers both free and paid subscription plans. Paid
                plans provide additional features and higher usage limits as
                described on our{" "}
                <Link href="/pricing" className="text-secondary hover:underline">
                  Pricing page
                </Link>
                .
              </p>

              <h3 className="text-xl font-medium text-neutral-900 mb-3">
                Payment Terms
              </h3>
              <p className="text-neutral-700 mb-4">
                For paid subscriptions:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>
                  Payments are processed securely through our payment provider,
                  Paddle
                </li>
                <li>
                  Subscriptions are billed in advance on a monthly or annual
                  basis
                </li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>
                  You authorise us to charge your payment method for recurring
                  fees
                </li>
              </ul>

              <h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">
                Plan Changes
              </h3>
              <p className="text-neutral-700 mb-4">
                You may upgrade or downgrade your subscription at any time.
                Changes take effect immediately:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>
                  Upgrades: You will be charged the prorated difference for the
                  remainder of your billing period
                </li>
                <li>
                  Downgrades: The new rate will apply from your next billing
                  period
                </li>
              </ul>

              <h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">
                Cancellation
              </h3>
              <p className="text-neutral-700">
                You may cancel your subscription at any time through your
                account settings. Upon cancellation, you will retain access to
                paid features until the end of your current billing period. We
                do not provide refunds for partial billing periods.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                7. Service Availability and Modifications
              </h2>
              <p className="text-neutral-700 mb-4">
                We strive to maintain high availability but do not guarantee
                uninterrupted access to the Service. We may:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>
                  Modify, suspend, or discontinue any part of the Service at any
                  time
                </li>
                <li>
                  Perform scheduled or emergency maintenance with or without
                  notice
                </li>
                <li>
                  Update features, pricing, or usage limits with reasonable
                  notice
                </li>
              </ul>
              <p className="text-neutral-700 mt-4">
                We are not liable for any loss or damage arising from service
                interruptions or modifications.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-neutral-700 mb-4">
                The Service and its original content, features, and
                functionality are owned by RankRiot and are protected by
                international copyright, trademark, and other intellectual
                property laws.
              </p>
              <p className="text-neutral-700 mb-4">
                You retain ownership of any content you submit to the Service.
                By submitting content, you grant us a limited licence to use,
                process, and display that content solely for providing the
                Service to you.
              </p>
              <p className="text-neutral-700">
                Reports and analysis generated by the Service are provided for
                your use only and may not be redistributed commercially without
                our permission.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                9. Disclaimer of Warranties
              </h2>
              <p className="text-neutral-700 mb-4">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
                NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE</li>
                <li>ACCURACY, RELIABILITY, OR COMPLETENESS OF RESULTS</li>
                <li>UNINTERRUPTED OR ERROR-FREE OPERATION</li>
                <li>COMPATIBILITY WITH YOUR SYSTEMS OR REQUIREMENTS</li>
              </ul>
              <p className="text-neutral-700 mt-4">
                SEO recommendations and analysis are provided as guidance only.
                We do not guarantee any specific search engine rankings,
                traffic, or business results from using our Service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                10. Limitation of Liability
              </h2>
              <p className="text-neutral-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RANKRIOT AND ITS
                DIRECTORS, EMPLOYEES, PARTNERS, AND AFFILIATES SHALL NOT BE
                LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>
                  Any indirect, incidental, special, consequential, or punitive
                  damages
                </li>
                <li>Loss of profits, data, use, goodwill, or other intangibles</li>
                <li>
                  Damages resulting from unauthorised access to or use of our
                  servers
                </li>
                <li>
                  Any interruption or cessation of transmission to or from the
                  Service
                </li>
              </ul>
              <p className="text-neutral-700 mt-4">
                Our total liability for any claims arising from your use of the
                Service shall not exceed the amount you paid us in the twelve
                (12) months preceding the claim.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                11. Indemnification
              </h2>
              <p className="text-neutral-700">
                You agree to indemnify and hold harmless RankRiot and its
                officers, directors, employees, and agents from any claims,
                damages, losses, liabilities, costs, or expenses (including
                legal fees) arising from your use of the Service, violation of
                these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                12. Governing Law
              </h2>
              <p className="text-neutral-700">
                These Terms shall be governed by and construed in accordance
                with the laws of Australia, without regard to its conflict of
                law provisions. Any disputes arising from these Terms or your
                use of the Service shall be subject to the exclusive
                jurisdiction of the courts in Australia.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                13. Changes to Terms
              </h2>
              <p className="text-neutral-700">
                We reserve the right to modify these Terms at any time. We will
                provide notice of material changes by posting the updated Terms
                on this page and updating the &quot;Last updated&quot; date. Your
                continued use of the Service after changes become effective
                constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                14. Severability
              </h2>
              <p className="text-neutral-700">
                If any provision of these Terms is found to be unenforceable or
                invalid, that provision shall be limited or eliminated to the
                minimum extent necessary, and the remaining provisions shall
                remain in full force and effect.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                15. Entire Agreement
              </h2>
              <p className="text-neutral-700">
                These Terms, together with our Privacy Policy, constitute the
                entire agreement between you and RankRiot regarding your use of
                the Service and supersede any prior agreements or
                understandings.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                16. Contact Us
              </h2>
              <p className="text-neutral-700 mb-4">
                If you have any questions about these Terms, please contact us:
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
      </section>
    </>
  );
}
