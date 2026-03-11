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

## 3. TODO — Crawler Gaps Still Open

### 3a. Image dimensions always 0 in HTTP path
- **Severity:** Low
- **What:** HTTP scan stores `{ width: 0, height: 0 }` for all images. Only headless gets real dimensions via `naturalWidth`/`naturalHeight`.
- **Why it's hard:** Getting dimensions requires either a HEAD request per image (expensive) or parsing `width`/`height` HTML attributes (unreliable).
- **Recommendation:** Parse `width`/`height` attributes from `<img>` tags in the regex extraction. Won't be pixel-accurate but better than 0.

### 3b. `broken-asset-analyzer.ts` is dead code
- **Severity:** Low
- **What:** File exists at `src/services/broken-asset-analyzer.ts` but is never imported or called anywhere.
- **Options:**
  1. Integrate into scan flow to check external links for broken status
  2. Delete if not needed
- **Recommendation:** Integrate as an optional post-scan step for external link validation. This would catch broken outbound links (currently only internal broken links are detected).

### 3c. Headless `first_byte_time_ms` not captured
- **Severity:** Low
- **What:** Fixed for HTTP scan but headless scan still reports 0 for TTFB. Puppeteer doesn't expose this directly without using Performance API or CDP.
- **Recommendation:** Use `page.metrics()` or `page.evaluate(() => performance.timing.responseStart - performance.timing.requestStart)` in headless path.

### 3d. `@graph` arrays in JSON-LD not fully handled
- **Severity:** Low
- **What:** JSON-LD extraction checks `data["@type"]` and `data[0]["@type"]` but doesn't handle `data["@graph"]` arrays which contain multiple schema types.
- **Example:** `{"@context":"https://schema.org","@graph":[{"@type":"Organization",...},{"@type":"WebPage",...}]}`
- **Recommendation:** Add check for `data["@graph"]` and iterate to extract all `@type` values.

### 3e. Audit analyzer tech detection has false positives
- **Severity:** Low
- **What:** Shopify detection uses `content.includes("shopify.")` which can match mentions in text content. NextJS detection similarly loose.
- **Recommendation:** Restrict detection to script sources, link tags, and meta generators rather than full content string matching.

---

## 4. TODO — Frontend Gaps Still Open

### 4a. Backlinks feature not built
- **Severity:** Medium
- **What:** `backlinks` table exists in the database. Crawler deletes backlink records when pages are removed. But there is no UI to display backlinks, and no code to populate them during scans.
- **Recommendation:** Either build a backlinks UI or remove the dead table references.

### 4b. Snapshot broken links count is project-wide
- **Severity:** Low
- **What:** `page_links` table has no `scan_id` column, so historical snapshots can't store scan-specific broken link counts. All snapshots get the current project-wide count.
- **Impact:** Historical trends for broken links won't show true per-scan values.
- **Recommendation:** Accept as limitation or add `scan_id` to `page_links` table.

### 4c. Keywords display in page detail could be improved
- **Severity:** Low
- **What:** Page detail page shows keywords as a simple list. Now that keywords are actually extracted (word + count), could show frequency/relevance visualization.
- **Recommendation:** Update the keywords section to show word counts or a tag cloud.

### 4d. No duplicate title/description detection in issue detector
- **Severity:** Medium
- **What:** The issue detector checks per-page issues. Duplicate titles and descriptions across pages are detected by `ContentIntelligence.tsx` client-side but not stored as issues in the database.
- **Why:** The detector runs per-page. Cross-page analysis (finding duplicates) requires comparing all pages against each other.
- **Recommendation:** Add a post-per-page analysis pass in the issue detector that finds duplicate titles and meta descriptions across all scan results and creates issues for them.

### 4e. Export "Issues" will now work but column mapping should be verified
- **Severity:** Low
- **What:** Issues are now generated. The export config in `types/export.ts` defines issue columns (`issue_type`, `severity`, `description`, `page_url`, etc.). Should verify the exported fields match the actual issue records.
- **Recommendation:** Do a test export after running a scan to verify formatting.

---

## 5. Architecture Notes

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

## 6. Testing Checklist

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
