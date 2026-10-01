import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { articles, getArticle } from "../articles";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/documentation/${article.slug}` },
  };
}

export default async function DocumentationArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--color-border-default)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-raised)] to-[var(--color-surface-base)]" />
        <div className="relative max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-12">
          <Link
            href="/documentation"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-6"
          >
            <IconArrowLeft className="w-4 h-4" />
            All documentation
          </Link>
          <p className="text-sm font-medium text-primary mb-2">{article.category}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)] leading-relaxed">
            {article.description}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <article className="prose max-w-none prose-headings:text-[var(--color-text-primary)] prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-h3:font-medium prose-p:text-[var(--color-text-secondary)] prose-li:text-[var(--color-text-secondary)] prose-strong:text-[var(--color-text-primary)] prose-a:text-primary hover:prose-a:underline prose-code:text-[var(--color-text-primary)]">
            {article.body}
          </article>

          <div className="mt-16 pt-8 border-t border-[var(--color-border-subtle)]">
            <p className="text-[var(--color-text-secondary)] mb-4">
              Still have questions? We&apos;re happy to help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
