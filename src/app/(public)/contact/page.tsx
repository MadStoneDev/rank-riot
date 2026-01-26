import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | RankRiot",
  description:
    "Get in touch with the RankRiot team. We're here to help with your SEO questions and support needs.",
};

export default function ContactPage() {
  return (
    <>
      <section className="py-20 grid place-content-center min-h-[600px] bg-white">
        <div className="flex flex-col items-center max-w-2xl px-4 text-center">
          <h1 className="mb-6 max-w-xl font-display text-5xl font-bold text-primary">
            Contact Us
          </h1>
          <p className="text-xl text-primary/60 max-w-3xl mx-auto mb-10">
            Coming soon
          </p>
        </div>
      </section>
    </>
  );
}
