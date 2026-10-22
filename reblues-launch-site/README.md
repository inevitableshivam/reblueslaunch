# Reblues Launch — reblueslaunch.com

The marketing site for Reblues Launch, a launch-film and distribution studio by Reblues Media.

## What's here
- `index.html` contains the main site and hash routes `#/work`, `#/case/<slug>`, `#/playbook` and `#/journal`.
- `assets/refinement.css` contains the shared surface, component and responsive refinements.
- `assets/plans-footer.css` contains the final plans and footer layout refinements.
- `assets/showcase-playbook.css` styles the playbook feature and reader link.
- `assets/process-stack.css` and `assets/process-slide.js` run the four-stage launch process. Desktop scroll slides the cards through one sticky frame; the frame releases as the last card fully covers the stack. Smaller viewports and reduced-motion preferences show all four cards in normal reading order.
- `assets/films/` holds the six locally served showcase films and their posters. The 10x Web film is the cut associated with Evan Yadegari's linked launch post.
- `assets/playbook/` holds the source PDF, card cover, and 38 optimized page previews. The hero CTA, homepage feature, and case-study viewer open one in-page reader with previous/next navigation; no download control is shown.
- Deploy the entire folder, including `assets/`.
- Other illustration and case-study assets remain in the public Supabase bucket `launch-films` (project `ocoqzvxhrwnqsrifcraw`); `ASSETS.md` records those remote references.

## External dependencies
- Fonts: Inter, Inter Tight, Manrope and IBM Plex Mono (Google Fonts)
- GSAP 3.12.5 + ScrollTrigger, and Lenis 1.1.13 (unpkg)

## Run locally
Open `index.html` in a browser, or serve it: `npx serve .`

## Deploy
For Vercel, import the GitHub repository `inevitableshivam/reblueslaunch` with the repository root as the Root Directory. The root `vercel.json` selects the Other framework, skips a build, and publishes `reblues-launch-site/` as the Output Directory. Do not change the Root Directory to the site folder unless you also change or remove that configuration. The existing hash routes work without server rewrites.

The site can also be deployed to Netlify or Cloudflare Pages as a static folder with no build step.

## Open items
- Hero H1 uses a `--hero-font` placeholder until the final font is supplied.
- `LAUNCH_DATE` is a placeholder (2026-11-16).
- Final case-study copy and PDFs are pending.
- The 10x case title mentions a view count. Review it against the no-view-counts rule.
- Add SRI hashes for the GSAP and Lenis scripts, or self-host them.
- A `Content-Security-Policy` meta tag is in `<head>`. Widen it if you add analytics or new hosts.
