# FlexiRates — SEO / AEO / GEO

This document records the search-visibility work done on the FlexiRates site, plus the
off-page and measurement actions the team should complete. It targets **Australian councils
(B2B lead-gen)** first, **Australia-wide**.

- **SEO** — rank in Google/Bing organic results.
- **AEO** (Answer Engine Optimization) — win featured snippets, People-Also-Ask, and voice
  answers via concise, structured answers.
- **GEO** (Generative Engine Optimization) — get FlexiRates cited by name inside ChatGPT,
  Claude, Perplexity, Gemini, and Google AI Overviews.

Production domain assumed throughout: **https://www.flexirates.com.au**

---

## 1. What was implemented in code

**Per-page `<head>` (all pages incl. new FAQ + blog):**
- `rel="canonical"`, `og:url/og:image/og:site_name/og:locale`, Twitter Card tags, `theme-color`.
- `lang="en-AU"`; copyright year refreshed to 2026.

**Structured data (JSON-LD):**
- Home: `Organization` (with ABN, Bill Buddy parent) + `WebSite` + `SoftwareApplication`.
- For Councils: `Service` + `BreadcrumbList`.
- FAQ page: `FAQPage` (13 Q&As) + `BreadcrumbList`.
- For Ratepayers: `FAQPage` (7 Q&As).
- Blog: `Blog` (index) and `BlogPosting` + `BreadcrumbList` on each article.

**New pages/files:**
- `faq.html` — council-focused FAQ (AEO).
- `blog/` — resources hub + 5 articles (GEO/SEO).
- `robots.txt` — allows all + explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended, OAI-SearchBot, CCBot, Applebot-Extended, etc.); references the sitemap.
- `sitemap.xml` — all indexable URLs.

---

## 2. Keyword map (councils-first)

| Page | Primary keyword | Secondary |
|---|---|---|
| Home | council rates payment software | rate payment platform Australia, Bill Buddy |
| For Councils | council rates payment platform | council revenue collection software, rates admin portal |
| For Ratepayers | pay council rates online | rates instalment plan, direct debit council rates |
| Security | PCI DSS council payments | secure rates payment, ratepayer data security |
| FAQ | how does FlexiRates work | council rates software FAQ |
| Blog: buyer's guide | council rates payment software | rates software buyer's guide |
| Blog: arrears | improve rates collection | reduce rates arrears |
| Blog: payment methods | direct debit vs BPAY vs card | council rates payment options |
| Blog: e-notices | rates e-notices Australia | electronic rates notices |
| Blog: PCI DSS | PCI DSS council payments | tokenisation card security |

Long-tail/question targets (AEO): "what is council rates payment software", "how do I pay my
council rates by instalments", "is direct debit safe for council rates", "how do councils
reduce rates arrears".

---

## 3. Off-page / authority (team actions)

1. **Google Business Profile** — create/claim for FlexiRates (or Bill Buddy) with consistent NAP.
2. **LinkedIn** — optimise the FlexiRates company page: same one-line description used in the
   `Organization` schema; link to www.flexirates.com.au. Add the page URL to the site's
   `Organization` `sameAs` (see §6 to-dos).
3. **Citations / directories** — list on relevant Australian local-government and govtech
   directories with identical name, URL, and description.
4. **Backlinks** — target: Municipal Association of Victoria (MAV), LG Professionals, local-gov
   procurement portals, govtech press, and a cross-link from the Bill Buddy website.
5. **Case study** — publish the Cardinia Shire Council story as a referenceable page/quote; it is
   the strongest E-E-A-T and GEO signal you have (a named, real customer).

---

## 4. Measurement

**Search performance**
- **Google Search Console** — verify the domain, submit `sitemap.xml`, monitor impressions,
  clicks, average position, and Core Web Vitals. Watch the target keywords in §2.
- **Bing Webmaster Tools** — verify + submit sitemap (also feeds Copilot).
- **Rank tracking** — track the primary keywords weekly (any rank tracker).

**Web analytics — Plausible (cookieless, implemented)**
The site uses Plausible Cloud (site: `flexirates.com.au`). It is cookieless and needs no consent
banner. The script (`pa-…js` bundle) is in every page `<head>`; custom events fire from
`js/main.js` via `window.plausible(name, { props })`. No PII is sent.

Events and properties tracked:

| Event | Properties | Trigger |
|---|---|---|
| pageview + outbound links | (automatic) | all pages (enable outbound links in Plausible settings) |
| `Demo Submit` (key conversion) | `page` | valid contact-form submission |
| `CTA: Request Demo` | `location` (nav / hero / final-cta / footer / mobile-nav), `page` | any "Request a Demo" link |
| `FAQ Open` | `question`, `page` | FAQ accordion opened |
| `Scroll Depth` | `percent` (25/50/75/90), `page` | scroll thresholds |
| `Video Play` / `Video Complete` | `page` | Vimeo embeds (home, case study) |

Extra elements can be tagged declaratively with `data-analytics="Event Name"` +
`data-prop-*="value"` (handled in `initAnalytics()` in `js/main.js`).

**Activation checklist (Plausible dashboard):**
1. Confirm the site `flexirates.com.au` exists; analytics only records on that production domain
   (the github.io preview won't register — optionally add it as a second site to test).
2. Settings → enable **Outbound links** (and File downloads if wanted).
3. Add **Goals** for the custom events above — at minimum `Demo Submit`.
4. Add the **custom properties** (`location`, `question`, `percent`, `page`) so they appear in
   breakdowns (Growth/Business plan).
5. Build a funnel: pageview → `CTA: Request Demo` → `Demo Submit`.

> **Testing note (temporary):** the live snippet currently uses Plausible's legacy
> multi-domain script with `data-domain="flexirates.com.au,chandan-gopinath.github.io"` so the
> github.io preview can be tested (add `chandan-gopinath.github.io` as a Plausible site to see its
> data separately). **Before go-live on `www.flexirates.com.au`, revert to the single production
> snippet** (the `pa-…js` bundle from the Plausible dashboard) so preview/test traffic does not mix
> into production stats.

---

## 5. GEO citation monitoring (run monthly)

Ask each assistant (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) these prompts and
record whether **FlexiRates is named and linked**:

1. "What software can Australian councils use to let ratepayers pay rates by instalments?"
2. "Best council rates payment platforms in Australia."
3. "How can a council reduce rates arrears?"
4. "Is there a rates payment portal that supports direct debit and card for councils?"
5. "What is FlexiRates?" (brand check — confirm the description matches the site.)

Track in a simple sheet: date · engine · prompt · cited? (Y/N) · linked? (Y/N) · notes. Rising
"cited" counts over time indicate GEO is working. If descriptions are wrong, tighten the
on-page entity statements and the `Organization`/`SoftwareApplication` schema.

---

## 6. Follow-up to-dos

Done:
- [x] **Dedicated social share image** — `assets/og-image.png` (1200×630) added and wired to
      `og:image`/`twitter:image` sitewide.
- [x] **LinkedIn `sameAs`** — FlexiRates (`/company/flexirates`) on the Organization; Bill Buddy
      (`/company/billbuddy-au`) on `parentOrganization`.
- [x] **Cardinia video** — Vimeo embed + `VideoObject` schema on the case study (and homepage).
- [x] **Cookieless analytics** — Plausible implemented (see §4).

Open:
- [ ] **Bill Buddy website URL** — add as a `url`/`sameAs` on the `parentOrganization` node if wanted.
- [ ] **Asset filenames with spaces** (e.g. `FR 1 no bg.png`, `PCI DSS.png`) — consider renaming
      to hyphenated, lowercase files; cleaner URLs and fewer encoding issues.
- [ ] **Homepage testimonial video** — add a poster image for faster first paint (optional).

---

## 7. Post-deploy checklist

1. Deploy the branch to **www.flexirates.com.au** (confirm the domain serves these files, not Wix).
2. Confirm the domain canonicalises to one host (www vs non-www) via a 301.
3. In GSC: submit `sitemap.xml`; URL-Inspect + Request Indexing for home, for-councils, faq, and
   each blog article.
4. Validate structured data on the live URLs with Google's Rich Results Test and the Schema.org
   validator.
5. Check `robots.txt` resolves and allows the AI crawlers.
6. At 2–4 weeks: review GSC impressions/positions and run the §5 GEO prompts.
