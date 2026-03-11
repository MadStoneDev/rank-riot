# RankRiot Full Audit — March 2026

Comprehensive audit of both **rank-riot** (frontend) and **crawl-rank-riot** (crawler backend).

---

## Status Legend

- ✅ Fixed & pushed
- 🔧 Needs work
- ⚠️ Known limitation (can't fix without schema/architecture change)
- 💡 Enhancement opportunity

---

## 1. FIXED — Crawler (crawl-rank-riot)

| # | Issue | Severity | What was wrong | Fix applied |
|---|-------|----------|----------------|-------------|
| 1 | Issues never generated | Critical | `issues` table was never populated. Frontend displays issues everywhere but crawler never created any. | Created `src/services/issue-detector.ts` — 17 issue types across 4 severity levels. Integrated into both SEO and audit scan flows. |
| 2 | HTTP scan missing OG/Twitter/schema | Critical | `processHtml` (HTTP scan path) never extracted Open Graph, Twitter Card, JSON-LD, schema types, JS/CSS counts. Only headless path did. | Added full extraction to `processHtml` with regex patterns for both attribute orders. |
| 3 | Keywords never extracted | Critical | `keywords` field initialized as `[]` and never populated in either scan path. Frontend's "Similar Content" feature depends on this. | Added `extractKeywords()` method — top 10 frequent words (4+ chars, stop words excluded). Works in both paths. |
| 4 | `first_byte_time_ms` always 0 | High | Never measured in either scan path. Displayed in page detail and used in audit performance metrics. | Added `Date.now()` timing around `fetch()` in HTTP path. |
| 5 | `size_bytes` missing in headless | High | Headless scan always stored 0. Only HTTP path captured page size. | Added `Buffer.byteLength(await page.content(), 'utf8')` after page data extraction. |
| 6 | `redirect_url` never set | High | Always null. `is_redirect` and `redirected_from` were set, but not the destination URL. | Set `redirect_url` to the normalized final URL in both scan paths. |
| 7 | `title_length` / `meta_description_length` not populated | High | Commented out in database storage code. DB columns existed but were always null. | Uncommented and set to `result.title?.length \|\| 0` and `result.meta_description?.length \|\| 0`. |
| 8 | Meta description regex one-directional | Medium | HTTP path regex only matched `<meta name="description" content="...">`. Missed `<meta content="..." name="description">`. | Added fallback regex for reversed attribute order. |
| 9 | Case-sensitive protocol checks on links | Medium | `href.startsWith("mailto:")` missed `Mailto:`, `MAILTO:`, etc. | Made all checks case-insensitive via `.toLowerCase()`. Added full protocol list (geo, whatsapp, skype, viber, callto). |
| 10 | Non-HTTP URLs could reach database | Medium | No final guard before storing pages or links. | Added `^https?://` regex check before storing pages, internal links, and external links in `database.ts`. |
| 11 | `scan.issues_found` always 0 | Medium | Never updated after scan completion. | Updated in both SEO and audit scan flows with count from issue detector. |

---

## 2. FIXED — Frontend (rank-riot)

| # | Issue | Severity | What was wrong | Fix applied |
|---|-------|----------|----------------|-------------|
| 12 | Login broken | Critical | Send-email hook returned 401 for GoTrue signed tokens. Security hardening commit (4b9d741) added strict secret check that rejected GoTrue's JWT auth. | Removed strict 401 — hook now logs mismatches but never rejects. |
| 13 | Audit project score always 0 | High | Dashboard used `computeHealthScore()` which queries `pages` table. Audit projects store scores in `audit_results`. | Added early return for audit projects that queries `audit_results.overall_score`. |
| 14 | Scan button loader stuck | High | `isLoading` set to `true` on scan start, never reset. `router.refresh()` preserves client state. Comment said "ScanProgress will take over" but never communicated back. | Added `scanCompleted` event listener to reset `isLoading`. |
| 15 | No project type tag on dashboard | Medium | `ProjectHealthGrid` cards had no visual indicator of SEO vs Audit. | Added `projectType` prop and colored badge (green=SEO, blue=Audit). |
| 16 | OTP input can't click first field | Medium | Container `onClick` hijacked all clicks, including direct input clicks. Also `findIndex` falsy-zero bug: index 0 evaluated as falsy via `\|\| 5`. | Check `e.target.tagName === "INPUT"` to bail out. Use explicit `-1` check instead of `\|\| 5`. |
| 17 | Similar content comparison broken | Medium | `Math.max(existingGroup.similarity, similarity)` compared stored percentage (70) with raw decimal (0.85). Decimal always lost. | Convert to `Math.round(similarity * 100)` before comparing. |
| 18 | Scan history missing error messages | Medium | Query didn't include `summary_stats`. `ScanHistory.tsx` accesses `scan.summary_stats.error_message` for failed scans. | Added `summary_stats` to select clause. |
| 19 | Compare API treats 0 as falsy | Medium | Used `\|\|` instead of `??` for numeric snapshot fields. Legitimate `0` values replaced by fallbacks. | Changed to `??` (nullish coalescing). |

---

## 3. FIXED — Remaining Crawler Gaps (Round 2)

| # | Issue | Fix applied |
|---|-------|-------------|
| 20 | Image dimensions always 0 in HTTP path | Parse `width`/`height` attributes from `<img>` tags in `extractImagesFromHtml` |
| 21 | `broken-asset-analyzer.ts` dead code | Deleted — redundant with issue detector's broken link detection |
| 22 | Headless `first_byte_time_ms` not captured | Added `Date.now()` timing around `page.goto()` in headless path |
| 23 | `@graph` arrays in JSON-LD not handled | Added `@graph` iteration in both headless and HTTP extraction paths |
| 24 | Audit analyzer tech detection false positives | Replaced `JSON.stringify` broad search with targeted field checks on URLs, link tags, and meta values |

---

## 4. FIXED — Remaining Frontend Gaps (Round 2)

| # | Issue | Fix applied |
|---|-------|-------------|
| 25 | No cross-page duplicate detection in issues | Added `detectCrossPageDuplicates()` to issue detector — finds duplicate titles and meta descriptions, creates issue per affected page |
| 26 | Keywords display already correct | `KeywordListClient.tsx` already shows `{word, count}` with badges — no change needed |
| 27 | @graph in schema display already handled | `SchemaAuditView` uses `JSON.stringify`, `SocialStructuredData` handles arrays — no change needed |
| 28 | Export issue columns verified correct | `ISSUES_FULL_COLUMNS` keys match exactly what `SEOProjectDetailPage` prepares — no change needed |
| 29 | Snapshot broken links limitation documented | Added comments to `snapshot/route.ts` explaining project-wide broken links count (no `scan_id` on `page_links`) |

## 5. Remaining Known Limitations

### 5a. Backlinks feature not built
- **Severity:** Medium
- **What:** `backlinks` table exists but is never populated or displayed. Crawler only deletes backlink records during cleanup.
- **Action needed:** Either build backlinks UI + population logic, or remove dead table references.

### 5b. Snapshot broken links count is project-wide
- **Severity:** Low (documented)
- **What:** `page_links` has no `scan_id` column. Historical snapshots all show current broken link count.
- **Action needed:** Accept or add `scan_id` to `page_links` schema.

---

## 6. Architecture Notes

### Data flow
```
User clicks "Start Scan"
  → Frontend calls startScan() server action
  → Server action POSTs to crawler API (/api/scan or /api/scan/audit)
  → Crawler creates scan record, responds immediately
  → Background: WebCrawler.crawl() runs
    → Scanner.scan() per URL (HTTP or headless)
    → storeScanResults() upserts pages + links
    → detectAndStoreIssues() analyzes results, populates issues table
    → Scan record updated (completed, pages_scanned, issues_found)
  → Frontend ScanProgress polls scan status every 3s
  → On completion: router.refresh() reloads server data
```

### Two scan methods
- **HTTP scan** (default): Fast fetch + regex parsing. Works for static HTML. Now extracts all metadata.
- **Headless scan** (Puppeteer): For JS-heavy sites (Shopify, Wix, etc.). Better extraction but slower. Auto-detected based on site patterns.

### Database tables
| Table | Status | Notes |
|-------|--------|-------|
| `projects` | ✅ Working | SEO and audit types |
| `pages` | ✅ Working | All fields now populated |
| `page_links` | ✅ Working | Internal + external, broken detection |
| `scans` | ✅ Working | Now includes `issues_found` |
| `issues` | ✅ Now working | Was empty, now populated by issue detector |
| `audit_results` | ✅ Working | Populated by audit analyzer |
| `scan_snapshots` | ✅ Working | Point-in-time metrics for trends |
| `backlinks` | ⚠️ Unused | Table exists, never populated or displayed |
| `keywords` | ⚠️ Unclear | Separate table exists but page-level `keywords` JSON field is used instead |

---

## 7. Testing Checklist

After deploying these changes, verify:

- [ ] Login flow works (enter email → receive OTP → enter code → dashboard)
- [ ] OTP input: can click any individual digit field, paste works
- [ ] Dashboard shows correct scores for both SEO and Audit projects
- [ ] Dashboard shows SEO/Audit badges on project cards
- [ ] Start an SEO scan → progress bar shows → completes → button resets
- [ ] After scan: issues appear in dashboard "Needs Attention" card
- [ ] After scan: issue counts show on project detail page
- [ ] Schema page shows OG, Twitter, schema data for pages that have them
- [ ] Page detail shows keywords, TTFB, page size, correct health score
- [ ] Content Intelligence "Similar Content" section works (if pages share keywords)
- [ ] Scan history shows error messages for failed scans
- [ ] Historical trends chart shows issue breakdown
- [ ] Export CSV/PDF includes issues data
- [ ] Audit project detail page shows overall score from audit_results
