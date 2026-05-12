/**
 * Remediation advice for every issue type the scanner detects.
 * Used by issue display components to show actionable fix instructions.
 */

export interface IssueAdvice {
  title: string;
  description: string;
  impact: "critical" | "high" | "medium" | "low";
  howToFix: string;
  codeExample?: string;
  estimatedEffort: string;
}

const adviceDatabase: Record<string, IssueAdvice> = {
  // ── CRITICAL ──────────────────────────────────────────
  server_error: {
    title: "Server Error (5xx)",
    description:
      "This page is returning a server error, meaning visitors and search engines cannot access it. Server errors indicate a problem on the web server, such as a misconfigured route, a database issue, or an unhandled exception.",
    impact: "critical",
    howToFix:
      "1. Check your server logs for the specific error causing the 5xx response.\n2. If it's a specific page, verify the route handler and any database queries it depends on.\n3. Test the page locally in development mode to reproduce the error.\n4. If using a CMS, check for plugin conflicts or corrupted data.\n5. Ensure your server has sufficient memory and resources.\n6. After fixing, verify the page returns a 200 status.",
    estimatedEffort: "30 minutes - 2 hours",
  },
  not_found: {
    title: "Page Not Found (404)",
    description:
      "This URL returns a 404 status, meaning the content no longer exists at this address. Internal links pointing to this URL create a broken user experience and waste crawl budget.",
    impact: "critical",
    howToFix:
      "1. Determine if the page was moved — if so, set up a 301 redirect to the new URL.\n2. If the page was intentionally removed, update all internal links pointing to it.\n3. If the URL should exist, create the page or fix the routing.\n4. Check for typos in internal links referencing this URL.\n5. Submit updated sitemap to search engines after fixing.",
    estimatedEffort: "10 - 30 minutes",
  },

  // ── HIGH ──────────────────────────────────────────────
  missing_title: {
    title: "Missing Page Title",
    description:
      "This page has no <title> tag. The title tag is one of the most important on-page SEO elements — it appears in search results, browser tabs, and social shares. Pages without titles are poorly represented in search results.",
    impact: "high",
    howToFix:
      "Add a unique, descriptive <title> tag in the <head> section of the page. The title should be 30-60 characters, include the primary keyword, and clearly describe the page content.",
    codeExample: '<title>Your Primary Keyword - Brand Name</title>',
    estimatedEffort: "5 minutes",
  },
  missing_meta_description: {
    title: "Missing Meta Description",
    description:
      "This page has no meta description. While not a direct ranking factor, meta descriptions appear as the snippet in search results and significantly impact click-through rates.",
    impact: "high",
    howToFix:
      "Add a <meta name=\"description\"> tag in the <head> section. Write a compelling 120-155 character summary that includes your target keyword and a call to action.",
    codeExample:
      '<meta name="description" content="Learn how to optimize your website for search engines. Our comprehensive guide covers technical SEO, content strategy, and more. Get started today.">',
    estimatedEffort: "5 minutes",
  },
  missing_h1: {
    title: "Missing H1 Heading",
    description:
      "This page has no H1 heading tag. The H1 is the primary heading that tells both users and search engines what the page is about. Every page should have exactly one H1.",
    impact: "high",
    howToFix:
      "Add a single <h1> tag containing the main topic of the page. It should include the primary keyword and be clearly visible to users. Place it near the top of the main content area.",
    codeExample: "<h1>Your Primary Topic and Keyword</h1>",
    estimatedEffort: "5 minutes",
  },
  multiple_h1: {
    title: "Multiple H1 Headings",
    description:
      "This page has more than one H1 tag. While technically valid in HTML5, multiple H1s dilute the semantic signal about what the page is primarily about.",
    impact: "high",
    howToFix:
      "Keep one H1 as the primary heading and change the others to H2 or the appropriate heading level. The remaining H1 should be the most important heading on the page.",
    estimatedEffort: "10 minutes",
  },
  broken_internal_link: {
    title: "Broken Internal Link",
    description:
      "This page contains a link to another page on your site that returns a 4xx or 5xx error. Broken internal links hurt user experience, waste crawl budget, and leak link equity.",
    impact: "high",
    howToFix:
      "1. Update the link to point to the correct URL.\n2. If the destination page was moved, update the href to the new URL.\n3. If the destination page was removed, either remove the link or point it to a relevant alternative.\n4. Consider adding a 301 redirect from the old URL if other external sites may link to it.",
    estimatedEffort: "5 - 15 minutes per link",
  },

  // ── MEDIUM ────────────────────────────────────────────
  title_too_long: {
    title: "Title Tag Too Long",
    description:
      "This page's title exceeds 60 characters. Google typically displays the first 50-60 characters. Longer titles get truncated with ellipsis in search results, potentially cutting off important information.",
    impact: "medium",
    howToFix:
      "Shorten the title to 50-60 characters while keeping the primary keyword near the beginning. Move secondary information to the meta description instead.",
    estimatedEffort: "5 minutes",
  },
  title_too_short: {
    title: "Title Tag Too Short",
    description:
      "This page's title is under 10 characters. Very short titles miss an opportunity to include keywords and provide meaningful context in search results.",
    impact: "medium",
    howToFix:
      "Expand the title to 30-60 characters. Include the primary keyword, a brief description of the page content, and optionally your brand name.",
    estimatedEffort: "5 minutes",
  },
  meta_description_too_long: {
    title: "Meta Description Too Long",
    description:
      "This page's meta description exceeds 160 characters. Google typically shows 150-160 characters in desktop results and fewer on mobile. Longer descriptions get truncated.",
    impact: "medium",
    howToFix:
      "Trim the meta description to 120-155 characters. Keep the most compelling and keyword-rich content at the beginning. End with a call to action.",
    estimatedEffort: "5 minutes",
  },
  meta_description_too_short: {
    title: "Meta Description Too Short",
    description:
      "This page's meta description is under 50 characters. Short descriptions miss an opportunity to persuade searchers to click and may cause Google to generate its own snippet.",
    impact: "medium",
    howToFix:
      "Expand the meta description to 120-155 characters. Include the primary keyword, a value proposition, and a clear call to action.",
    estimatedEffort: "5 minutes",
  },
  thin_content: {
    title: "Thin Content",
    description:
      "This page has fewer than 300 words. Thin content pages tend to rank poorly because they don't provide enough information to satisfy search intent. Google may also flag thin content as low-quality.",
    impact: "medium",
    howToFix:
      "1. Determine the search intent for this page — what are visitors looking for?\n2. Expand the content to thoroughly address that intent (aim for 500+ words for informational pages).\n3. Add relevant sections: FAQs, how-to steps, examples, comparisons.\n4. If this page doesn't warrant long content (e.g., a contact page), that's acceptable — not every page needs to be content-rich.\n5. Consider consolidating very thin pages into a more comprehensive single page.",
    estimatedEffort: "30 minutes - 1 hour",
  },
  missing_canonical: {
    title: "Missing Canonical URL",
    description:
      "This page has no canonical tag. Canonical tags tell search engines which version of a page is the primary one, preventing duplicate content issues.",
    impact: "medium",
    howToFix:
      "Add a self-referencing canonical tag in the <head> section pointing to the page's own URL. This confirms to search engines that this is the definitive version.",
    codeExample:
      '<link rel="canonical" href="https://yoursite.com/this-page-url">',
    estimatedEffort: "5 minutes",
  },
  noindex: {
    title: "Page Set to Noindex",
    description:
      "This page has a robots noindex directive, which prevents search engines from including it in search results. If this page should be findable via search, the noindex needs to be removed.",
    impact: "medium",
    howToFix:
      "If this page should be indexed: remove the noindex directive from either the <meta name=\"robots\"> tag or the X-Robots-Tag HTTP header.\n\nIf the noindex is intentional (e.g., thank-you pages, admin pages), no action is needed.",
    estimatedEffort: "5 minutes",
  },
  missing_open_graph: {
    title: "Missing Open Graph Tags",
    description:
      "This page has no Open Graph meta tags. When shared on social media (Facebook, LinkedIn, etc.), the link preview will look generic or pull incorrect information.",
    impact: "medium",
    howToFix:
      "Add Open Graph meta tags to the <head> section: og:title, og:description, og:image, og:url, and og:type.",
    codeExample:
      '<meta property="og:title" content="Page Title">\n<meta property="og:description" content="Page description">\n<meta property="og:image" content="https://yoursite.com/image.jpg">\n<meta property="og:url" content="https://yoursite.com/page">\n<meta property="og:type" content="website">',
    estimatedEffort: "10 minutes",
  },
  duplicate_title: {
    title: "Duplicate Title Tag",
    description:
      "Multiple pages share the same title tag. This makes it hard for search engines to differentiate between pages and can lead to keyword cannibalization — your own pages competing against each other.",
    impact: "medium",
    howToFix:
      "Write a unique title for each page that reflects its specific content. Include the primary keyword for each page's target query. If pages have similar content, consider consolidating them.",
    estimatedEffort: "10 - 30 minutes",
  },
  duplicate_meta_description: {
    title: "Duplicate Meta Description",
    description:
      "Multiple pages share the same meta description. This is a missed opportunity — each page should have a unique description tailored to its content and target keywords.",
    impact: "medium",
    howToFix:
      "Write a unique meta description for each page. Each description should reflect the specific content, include relevant keywords, and provide a compelling reason to click.",
    estimatedEffort: "10 - 30 minutes",
  },

  // ── LOW ───────────────────────────────────────────────
  missing_twitter_card: {
    title: "Missing Twitter Card Tags",
    description:
      "This page has no Twitter Card meta tags. When shared on X (Twitter), the link will appear as a plain URL without a rich preview image or description.",
    impact: "low",
    howToFix:
      "Add Twitter Card meta tags to the <head> section. Use summary_large_image for the best visual impact.",
    codeExample:
      '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="Page Title">\n<meta name="twitter:description" content="Page description">\n<meta name="twitter:image" content="https://yoursite.com/image.jpg">',
    estimatedEffort: "5 minutes",
  },
  missing_structured_data: {
    title: "Missing Structured Data",
    description:
      "This page has no JSON-LD structured data. Structured data helps search engines understand the content type and can enable rich results (stars, FAQs, how-to steps, etc.).",
    impact: "low",
    howToFix:
      "Add JSON-LD structured data relevant to the page content. Common types: Organization (homepage), Article (blog posts), Product (products), FAQPage (FAQ sections), LocalBusiness (local businesses).",
    codeExample:
      '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Business",\n  "url": "https://yoursite.com",\n  "logo": "https://yoursite.com/logo.png"\n}\n</script>',
    estimatedEffort: "15 - 30 minutes",
  },
  large_page_size: {
    title: "Large Page Size",
    description:
      "This page exceeds 3MB in size. Large pages load slowly, especially on mobile devices and slower connections. This hurts user experience and can negatively impact Core Web Vitals.",
    impact: "low",
    howToFix:
      "1. Compress and optimize images (use WebP/AVIF formats).\n2. Minify CSS and JavaScript files.\n3. Remove unused CSS and JavaScript.\n4. Defer non-critical JavaScript.\n5. Use lazy loading for images below the fold.\n6. Enable gzip/brotli compression on your server.",
    estimatedEffort: "1 - 2 hours",
  },
  slow_page: {
    title: "Slow Page Load",
    description:
      "This page takes longer than 3 seconds to load. Slow pages lead to higher bounce rates and lower search rankings. Google uses page speed as a ranking factor.",
    impact: "low",
    howToFix:
      "1. Optimize images (compress, use modern formats, lazy-load below-fold images).\n2. Minimize render-blocking resources (defer non-critical CSS/JS).\n3. Enable server-side caching and CDN.\n4. Reduce the number of HTTP requests.\n5. Preload critical resources (fonts, hero images).\n6. Check server response time (TTFB) — if >600ms, investigate server performance.",
    estimatedEffort: "1 - 3 hours",
  },
  missing_image_alt: {
    title: "Images Missing Alt Text",
    description:
      "One or more images on this page are missing alt text. Alt text is essential for accessibility (screen readers) and helps search engines understand image content. Images with good alt text can also appear in Google Image search.",
    impact: "low",
    howToFix:
      "Add descriptive alt text to each image. The alt text should briefly describe what the image shows. Include relevant keywords naturally, but avoid keyword stuffing. Decorative images that don't convey content should use an empty alt attribute (alt=\"\").",
    codeExample:
      '<!-- Descriptive alt for content images -->\n<img src="photo.jpg" alt="Team meeting in modern office space">\n\n<!-- Empty alt for decorative images -->\n<img src="decorative-line.svg" alt="">',
    estimatedEffort: "5 minutes per image",
  },

  // ── NEW ISSUE TYPES ──────────────────────────────────

  heading_hierarchy_invalid: {
    title: "Invalid Heading Hierarchy",
    description:
      "The heading structure on this page skips levels or is otherwise invalid (e.g., jumping from H1 to H3 without an H2). A proper heading hierarchy helps both users and search engines understand the content structure, and is important for accessibility.",
    impact: "medium",
    howToFix:
      "1. Ensure headings follow a logical nesting order: H1 > H2 > H3 > H4, etc.\n2. Never skip a level (e.g., don't jump from H1 directly to H3).\n3. Use only one H1 per page as the main title.\n4. Treat headings as an outline — each sub-heading should logically belong under its parent.\n5. Don't use heading tags for styling purposes; use CSS instead.",
    codeExample:
      '<h1>Main Page Title</h1>\n  <h2>Section One</h2>\n    <h3>Subsection of Section One</h3>\n  <h2>Section Two</h2>\n    <h3>Subsection of Section Two</h3>',
    estimatedEffort: "15 - 30 minutes",
  },
  missing_viewport_meta: {
    title: "Missing Viewport Meta Tag",
    description:
      "This page is missing a viewport meta tag. Without it, mobile browsers will render the page at a desktop width and then scale it down, resulting in tiny, unreadable text. Google uses mobile-first indexing, so a missing viewport tag directly hurts mobile rankings.",
    impact: "medium",
    howToFix:
      "Add a viewport meta tag to the <head> section. The standard tag below works for the vast majority of responsive sites.",
    codeExample:
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
    estimatedEffort: "2 minutes",
  },
  mixed_content: {
    title: "Mixed Content",
    description:
      "This HTTPS page loads some resources (images, scripts, stylesheets, etc.) over insecure HTTP. Modern browsers block or warn about mixed content, which can break functionality and erode user trust. Search engines may also penalize sites with mixed content warnings.",
    impact: "high",
    howToFix:
      "1. Identify all HTTP resources being loaded (use browser DevTools Console for mixed content warnings).\n2. Update each resource URL from http:// to https://.\n3. If a third-party resource doesn't support HTTPS, find an alternative that does.\n4. Use protocol-relative URLs (//example.com/resource) or, preferably, explicit https:// URLs.\n5. Add a Content-Security-Policy header with upgrade-insecure-requests as a safety net.",
    codeExample:
      '<!-- Before (mixed content) -->\n<img src="http://example.com/image.jpg">\n\n<!-- After (secure) -->\n<img src="https://example.com/image.jpg">\n\n<!-- CSP header to auto-upgrade -->\nContent-Security-Policy: upgrade-insecure-requests',
    estimatedEffort: "15 - 45 minutes",
  },
  url_structure_issues: {
    title: "URL Structure Issues",
    description:
      "This page's URL has structural problems such as uppercase characters, underscores instead of hyphens, excessive parameters, double slashes, or overly long paths. Clean, descriptive URLs are easier for users to read and share, and search engines prefer them.",
    impact: "low",
    howToFix:
      "1. Use lowercase letters only in URLs.\n2. Separate words with hyphens (-) instead of underscores (_).\n3. Keep URLs short and descriptive (3-5 words in the path).\n4. Avoid unnecessary query parameters — use clean URL paths instead.\n5. Remove double slashes, trailing slashes inconsistency, and special characters.\n6. Set up 301 redirects from old URLs to the cleaned-up versions.",
    codeExample:
      '<!-- Bad URLs -->\nhttps://example.com/Blog/My_First_Post?id=123&ref=home\nhttps://example.com//products///widget\n\n<!-- Good URLs -->\nhttps://example.com/blog/my-first-post\nhttps://example.com/products/widget',
    estimatedEffort: "15 - 30 minutes per URL",
  },
  canonical_mismatch: {
    title: "Canonical URL Mismatch",
    description:
      "This page has a canonical tag that points to a different URL instead of itself. This tells search engines to treat another page as the primary version, which means this page may be excluded from search results. If this is unintentional, it could be suppressing a page that should be indexed.",
    impact: "medium",
    howToFix:
      "1. If this page should be indexed on its own, update the canonical tag to point to the page's own URL (self-referencing canonical).\n2. If this page is a genuine duplicate, the canonical pointing elsewhere is correct — no action needed.\n3. Check for CMS plugins or server configurations that may be setting incorrect canonicals automatically.\n4. Verify the canonical URL is accessible and returns a 200 status.",
    codeExample:
      '<!-- Self-referencing canonical (most common) -->\n<link rel="canonical" href="https://yoursite.com/this-page-url">\n\n<!-- Cross-domain canonical (only if intentional) -->\n<link rel="canonical" href="https://othersite.com/original-content">',
    estimatedEffort: "5 - 10 minutes",
  },
  missing_image_lazy_loading: {
    title: "Images Missing Lazy Loading",
    description:
      "This page has multiple images but none of them use the loading=\"lazy\" attribute. Without lazy loading, the browser downloads all images immediately on page load, even those far below the visible area. This wastes bandwidth and slows down initial page rendering.",
    impact: "low",
    howToFix:
      "1. Add loading=\"lazy\" to all images that are below the fold (not visible on initial page load).\n2. Do NOT lazy-load images that are above the fold (hero images, logos, etc.) — these should load immediately.\n3. For critical above-fold images, consider using fetchpriority=\"high\" instead.\n4. If using a JavaScript framework, check if it has built-in lazy loading (e.g., Next.js Image component).",
    codeExample:
      '<!-- Above-the-fold hero image — load immediately -->\n<img src="hero.jpg" alt="Hero banner" fetchpriority="high">\n\n<!-- Below-the-fold images — lazy load -->\n<img src="feature-1.jpg" alt="Feature one" loading="lazy">\n<img src="feature-2.jpg" alt="Feature two" loading="lazy">',
    estimatedEffort: "10 - 20 minutes",
  },
  non_modern_image_format: {
    title: "Non-Modern Image Formats",
    description:
      "The majority of images on this page use legacy formats (JPEG, PNG, GIF) instead of modern formats like WebP or AVIF. Modern formats provide significantly better compression (25-50% smaller files) with the same visual quality, leading to faster page loads.",
    impact: "low",
    howToFix:
      "1. Convert images to WebP format (supported by 97%+ of browsers) or AVIF (better compression but slightly less support).\n2. Use the <picture> element to serve modern formats with JPEG/PNG fallbacks.\n3. If using a CMS or CDN, enable automatic format conversion (most modern CDNs support this).\n4. For SVG-suitable images (icons, logos, illustrations), use SVG instead of raster formats.\n5. Use build tools like sharp, imagemin, or squoosh for batch conversion.",
    codeExample:
      '<!-- Using <picture> for format fallback -->\n<picture>\n  <source srcset="image.avif" type="image/avif">\n  <source srcset="image.webp" type="image/webp">\n  <img src="image.jpg" alt="Description">\n</picture>\n\n<!-- Or let the CDN handle it -->\n<img src="https://cdn.example.com/image.jpg?format=auto" alt="Description">',
    estimatedEffort: "30 minutes - 1 hour",
  },
  missing_hreflang: {
    title: "Missing Hreflang Tags",
    description:
      "This page has no hreflang annotations. Hreflang tags tell search engines which language and regional version of a page to show to users in different locales. Without them, search engines may show the wrong language version in results, or flag pages as duplicate content.",
    impact: "low",
    howToFix:
      "1. Add hreflang link tags in the <head> section for each language/region version of the page.\n2. Always include a self-referencing hreflang for the current page.\n3. Add an x-default hreflang for the fallback version.\n4. Ensure hreflang annotations are reciprocal — each page must reference all other versions, including itself.\n5. Use proper ISO 639-1 language codes and optional ISO 3166-1 region codes.",
    codeExample:
      '<!-- On the English page -->\n<link rel="alternate" hreflang="en" href="https://example.com/page">\n<link rel="alternate" hreflang="es" href="https://example.com/es/page">\n<link rel="alternate" hreflang="fr" href="https://example.com/fr/page">\n<link rel="alternate" hreflang="x-default" href="https://example.com/page">',
    estimatedEffort: "15 - 30 minutes",
  },
  missing_security_headers: {
    title: "Missing Security Headers",
    description:
      "This page is missing important HTTP security headers. While not a direct SEO ranking factor, missing security headers can leave your site vulnerable to attacks (XSS, clickjacking, MIME sniffing). Browsers and security scanners flag these issues, which can erode user trust.",
    impact: "low",
    howToFix:
      "1. Add Strict-Transport-Security (HSTS) to enforce HTTPS connections.\n2. Add X-Content-Type-Options: nosniff to prevent MIME type sniffing.\n3. Configure these headers at the server or CDN level so they apply to all responses.\n4. If using a reverse proxy (nginx, Apache), add the headers in the server configuration.\n5. Test your headers using securityheaders.com after deployment.",
    codeExample:
      '# Nginx configuration\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\nadd_header X-Content-Type-Options "nosniff" always;\n\n# Apache .htaccess\nHeader always set Strict-Transport-Security "max-age=31536000; includeSubDomains"\nHeader always set X-Content-Type-Options "nosniff"\n\n# Vercel (vercel.json)\n{\n  "headers": [\n    {\n      "source": "/(.*)",\n      "headers": [\n        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },\n        { "key": "X-Content-Type-Options", "value": "nosniff" }\n      ]\n    }\n  ]\n}',
    estimatedEffort: "15 - 30 minutes",
  },
  redirect_chain: {
    title: "Redirect Chain",
    description:
      "This URL passes through 3 or more redirects before reaching the final destination. Each redirect hop adds latency (typically 100-500ms per hop), wastes search engine crawl budget, and dilutes link equity. Long redirect chains can also cause some bots to give up entirely.",
    impact: "high",
    howToFix:
      "1. Identify every hop in the chain (check the issue details for the full chain).\n2. Update each redirect to point directly to the final destination URL, eliminating intermediate hops.\n3. Update all internal links to point directly to the final URL.\n4. If redirects are caused by HTTP-to-HTTPS and non-www-to-www separately, combine them into a single redirect rule.\n5. After fixing, test with curl -L -v or a redirect checker tool to confirm only 1 hop remains.",
    estimatedEffort: "10 - 30 minutes",
  },
  keyword_not_in_title: {
    title: "Top Keyword Not in Title",
    description:
      "The most frequently used keyword on this page does not appear in the page title. The title tag is one of the strongest on-page ranking signals, and including your target keyword in it significantly improves the page's chances of ranking for that term.",
    impact: "low",
    howToFix:
      "1. Identify the primary keyword for this page (shown in the issue details).\n2. Naturally incorporate it into the title tag, ideally near the beginning.\n3. Keep the title under 60 characters and make it compelling for users.\n4. Don't force it — the keyword should read naturally in the title.\n5. If the detected top keyword isn't actually the target keyword, consider whether your content is well-focused on the intended topic.",
    estimatedEffort: "5 minutes",
  },

  // ── SITE-LEVEL ISSUES ────────────────────────────────

  missing_llms_txt: {
    title: "Missing llms.txt File",
    description:
      "Your site does not have an llms.txt file. This is a standardized file (similar to robots.txt) that helps AI language models understand your site's content, structure, and preferred interaction patterns. As AI-powered search becomes more prevalent, having an llms.txt can improve how AI systems represent your content.",
    impact: "low",
    howToFix:
      "1. Create a plain text file named llms.txt in your site's root directory.\n2. Include key fields: name, description, url, and any content guidelines.\n3. Specify which content AI models should prioritize or avoid.\n4. Deploy it so it's accessible at https://yoursite.com/llms.txt.\n5. Keep it updated as your site content evolves.",
    codeExample:
      '# llms.txt\nname: Your Business Name\ndescription: Brief description of your business and what your site covers\nurl: https://yoursite.com\ncontent: https://yoursite.com/llms-full.txt',
    estimatedEffort: "15 - 30 minutes",
  },
  missing_robots_txt: {
    title: "Missing robots.txt File",
    description:
      "Your site does not have a robots.txt file. This file tells search engine crawlers which pages they can and cannot access. Without it, crawlers will attempt to access all pages, which may include admin areas, duplicate content, or pages you don't want indexed.",
    impact: "medium",
    howToFix:
      "1. Create a robots.txt file in your site's root directory.\n2. Add rules for which paths crawlers should avoid (admin, API, search results, etc.).\n3. Include a Sitemap directive pointing to your XML sitemap.\n4. Test it with Google Search Console's robots.txt tester.\n5. Be careful not to accidentally block important pages.",
    codeExample:
      'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /search?\n\nSitemap: https://yoursite.com/sitemap.xml',
    estimatedEffort: "10 - 20 minutes",
  },
  ai_bots_blocked: {
    title: "AI Bots Blocked in robots.txt",
    description:
      "Your robots.txt file blocks one or more AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.). While this is a valid choice for content protection, it means AI-powered search engines and assistants cannot access your content to include in their responses. This may reduce your visibility in AI-generated answers and recommendations.",
    impact: "low",
    howToFix:
      "1. Review which AI bots are blocked in your robots.txt (listed in the issue details).\n2. Decide which AI bots you want to allow — consider the trade-off between content protection and visibility.\n3. To allow specific bots, remove their Disallow rules or add explicit Allow rules.\n4. You can selectively allow some bots while blocking others.\n5. Consider using llms.txt to provide AI models with guidance on how to use your content even if you allow crawling.",
    codeExample:
      '# Allow AI bots (recommended for visibility)\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\n# Block if you prefer content protection\nUser-agent: GPTBot\nDisallow: /',
    estimatedEffort: "5 - 10 minutes",
  },
  missing_sitemap: {
    title: "Missing XML Sitemap",
    description:
      "No XML sitemap was found at /sitemap.xml. An XML sitemap helps search engines discover all the pages on your site, understand the site structure, and know when content was last updated. Without one, search engines rely solely on crawling links, which may miss important pages.",
    impact: "medium",
    howToFix:
      "1. Generate an XML sitemap containing all indexable pages on your site.\n2. Include <lastmod> dates to tell search engines when each page was last updated.\n3. Place the sitemap at https://yoursite.com/sitemap.xml.\n4. Reference the sitemap in your robots.txt file.\n5. Submit the sitemap to Google Search Console and Bing Webmaster Tools.\n6. If you have many pages, use a sitemap index file with multiple child sitemaps.",
    codeExample:
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://yoursite.com/</loc>\n    <lastmod>2024-01-15</lastmod>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://yoursite.com/about</loc>\n    <lastmod>2024-01-10</lastmod>\n  </url>\n</urlset>',
    estimatedEffort: "15 - 30 minutes",
  },
  invalid_sitemap: {
    title: "Invalid XML Sitemap",
    description:
      "Your XML sitemap exists but contains errors. An invalid sitemap may be partially or completely ignored by search engines, meaning some of your pages won't be discovered through the sitemap.",
    impact: "medium",
    howToFix:
      "1. Check the specific errors listed in the issue details.\n2. Validate your sitemap XML against the sitemaps.org protocol specification.\n3. Ensure all URLs in the sitemap are absolute (include https://).\n4. Remove any URLs that return 4xx or 5xx errors.\n5. Regenerate the sitemap using your CMS or a sitemap generator tool.\n6. Test with Google Search Console's sitemap report.",
    estimatedEffort: "15 - 30 minutes",
  },
  sitemap_missing_lastmod: {
    title: "Sitemap Missing Last Modified Dates",
    description:
      "Your XML sitemap does not include <lastmod> dates. These dates tell search engines when each page was last updated, helping them prioritize which pages to re-crawl. Without them, search engines must guess which pages have changed.",
    impact: "low",
    howToFix:
      "1. Add <lastmod> elements to each <url> entry in your sitemap.\n2. Use the actual last modification date of each page's content (not the current date).\n3. Use ISO 8601 date format (YYYY-MM-DD or full datetime).\n4. If using a CMS, configure it to automatically include last modified dates.\n5. Only update the lastmod when the page content actually changes — don't update it on every sitemap regeneration.",
    codeExample:
      '<url>\n  <loc>https://yoursite.com/blog/post</loc>\n  <lastmod>2024-03-15T10:30:00+00:00</lastmod>\n</url>',
    estimatedEffort: "10 - 20 minutes",
  },
  pages_not_in_sitemap: {
    title: "Pages Missing from Sitemap",
    description:
      "Several crawled pages are not listed in your XML sitemap. These pages may be harder for search engines to discover and may receive less frequent crawling. All important, indexable pages should be included in the sitemap.",
    impact: "low",
    howToFix:
      "1. Review the list of missing pages (shown in the issue details).\n2. Add any important, indexable pages to your sitemap.\n3. Exclude pages that shouldn't be indexed (admin, search results, paginated archives, etc.).\n4. If using a CMS, check if the sitemap plugin needs to be reconfigured to include these page types.\n5. Regenerate and resubmit your sitemap to search engines.",
    estimatedEffort: "10 - 15 minutes",
  },
};

export function getIssueAdvice(issueType: string): IssueAdvice | null {
  return adviceDatabase[issueType] ?? null;
}

export function getAllIssueAdvice(): Record<string, IssueAdvice> {
  return adviceDatabase;
}

export default adviceDatabase;
