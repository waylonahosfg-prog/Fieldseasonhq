# Field Season HQ

A fast, static Astro website for official-source hunting season dates, license steps, hunter education and draw/application deadlines. It contains finished statewide guides for **Colorado, Texas, Pennsylvania, Michigan and Wisconsin**, in that order.

## Run and build

Use Node.js 22.12 or later (Vercel’s current Node 24 default is suitable).

```bash
npm ci
npm run dev
```

```bash
npm run check
npm run build
npm audit
```

The build validates content, regenerates `sources.md` and `unverified-items.md`, outputs static HTML to `dist/`, then audits the production HTML. The exact `/sitemap.xml` and `/robots.txt` endpoints are generated from the same state data. There is no database, server adapter, external font request, analytics code or client-side rendering. The decorative homepage landscape is CSS, not a large image.

## Deploy on Vercel

1. Unzip this repository and push it to your own GitHub repository.
2. Import that repository into Vercel. Astro is detected automatically; keep the standard `npm run build` command and `dist` output.
3. Assign `fieldseasonhq.com` to the Vercel project and follow Vercel’s DNS instructions.
4. Confirm the production domain, then submit `https://fieldseasonhq.com/sitemap.xml` in Google Search Console.

No environment variables or custom Vercel configuration are required. This handoff is a source ZIP; it does **not** push a GitHub repository, deploy production or change DNS. GitHub-to-Vercel automatic deployments begin after you connect the repository.

## Add a state in one file

Copy an existing file to `src/data/states/<slug>.json`. The homepage cards, navigation, related guides, `/<slug>/` page and sitemap all discover JSON files automatically. No state registry or template edit is needed.

The JSON fields are:

- Identity/SEO: `slug`, `name`, `sortOrder`, `year`, `verifiedOn`, `metaDescription`, `homepageSummary`, `intro`, `zoneNote`.
- Agency: `agency.name` and `agency.url`.
- `seasonFacts`: separate species/method/season rows, with `dates`, `status`, `scopeAndExceptions`, optional `additionalRule`, `sourceUrl` and `verifiedOn`.
- `licenseAndEducation`: `topic`, `fact`, `sourceUrl`, `verifiedOn`. Topics containing education, mentored or youth are rendered in the separate education section.
- `deadlines`: `applicationOrDeadline`, `dateOrStatus`, `relevantYear`, `sourceUrl`, `verifiedOn`.
- `sources`: official source catalog entries (`category`, `title`, `url`, `verifiedOn`).
- `unverifiedItems`: every unresolved detail or important summary limitation.
- `gear`: verified product details, or an empty array. Follow the schema of an existing entry.

Run `npm run build` after editing. Metadata must be unique, include the state and 2026, and contain 140–155 characters. State titles are generated in the requested format and checked to remain under 60 characters.

For later species pages such as `/colorado/elk/`, add a nested Astro route backed by the same state/species records. Digital-product pages and paid deadline alerts can be separate route types; no payment or email collection is implemented in this initial release.

## Accuracy rules

Use only official wildlife-agency pages, official regulations publications and official license/draw portals for hunting facts. Summarize in original plain language, never fill gaps from memory, and record an official source URL and ISO verification date for each fact. Dates were reviewed against the November 3, 2026 reference date; status labels are not a live closure feed.

This release uses the owner-approved **statewide-summary** scope. Unit, zone, county, land-type and hunt-code exceptions are identified beside the relevant dates; exact maps, inventories, quotas, bag-limit subrules and special property hunts remain with the agency. The pages do not replace current regulations or a license.

Before publishing updates, open the exact agency table/PDF, check its year and corrections, then update the record and verification date. If a fact cannot be confirmed, show `Not yet published - check [agency name]` and record the issue in `unverifiedItems`. Do not turn a proposal, expected date or prior-year date into a confirmed date.

## Affiliate links

The owner-provided tag is `fieldseasonhq-20`. One product listing—the Vortex blaze-orange vest and hat combo, ASIN `B0DW3MXC12`—was directly verified and is used as a general visibility-clothing recommendation. `affiliate-verification.md` records the evidence and the omitted, unverified headlamp candidate. No prices, review counts, stock claims or delivery promises are published.

Every affiliate URL uses `https://www.amazon.com/dp/<ASIN>?tag=fieldseasonhq-20`, has `rel="sponsored nofollow noopener"`, and has the required Associate disclosure nearby and in the footer. Never add firearms, ammunition or restricted goods. Reverify the exact Amazon listing before adding or replacing a product. Clothing is not represented as a certification of legal color/coverage compliance.

## Review before launch

- Read `unverified-items.md`, especially Wisconsin’s apparent spring 2027 turkey Period E/F overlap, the Pennsylvania extended-deer year typo, and Texas’s late-youth deer table discrepancy. Unresolved details are flagged rather than silently corrected.
- Check the live agency page for your specific hunt and any emergency change after the verification date.
- Confirm the Amazon Associates account/tag and the single published product choice.
- Connect your GitHub/Vercel project and production DNS. Search ranking and affiliate revenue are goals, not guarantees.
- Run a mobile Lighthouse test on the deployed production URL; local test results, if included in the handoff, are not a production guarantee.

## Project structure

```text
src/data/states/     One JSON record per state
src/layouts/        Shared SEO metadata, header, footer and disclosures
src/pages/          Homepage, About, state template, sitemap and robots endpoints
src/styles/         Small mobile-first stylesheet
scripts/            Content validation, research indexes and production HTML audit
sources.md          Every state fact category, official URL and verification date
unverified-items.md  Open questions and material scope limitations
affiliate-verification.md  Product/ASIN verification evidence
```

## Checks completed for this handoff

- Clean `npm ci`, production build and content validation passed.
- Astro diagnostics: 0 errors, 0 warnings, 0 hints.
- Dependency audit: 0 vulnerabilities reported.
- Production HTML audit: seven pages, correct metadata/schema, source links, internal links, affiliate attributes, sitemap and robots directives passed.
- Static preview routes returned HTTP 200; the homepage and Colorado table structure were inspected in the browser.
- The generated site is about 292 KB before transfer compression and has no client JavaScript bundle. Mobile-first CSS and horizontally scrollable tables are implemented, but a mobile Lighthouse run was not performed and no 95+ score is claimed.
