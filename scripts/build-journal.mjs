import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { join } from "node:path";

const siteDir = new URL("../reblues-launch-site/", import.meta.url);
const source = readFileSync(new URL("index.html", siteDir), "utf8");
const start = source.indexOf("var POSTS = [");
const end = source.indexOf("        ];", start);
if (start < 0 || end < 0) throw new Error("Journal posts not found");
const existing = runInNewContext(source.slice(start, end + 10).replace("var POSTS =", ""));
const added = [
  {
    slug: "funding-announcement-video-launch-checklist",
    cat: "Launch planning",
    date: "Nov 2026",
    title: "A funding announcement video launch checklist",
    dek: "Plan the story, film and distribution around the announcement without turning the round into the whole message.",
    body: `A funding announcement film should explain what the round makes possible. The amount may earn a moment of attention, but customers and future teammates need to understand the mission, product and next step.

### Start with the audience
Decide who should care about the announcement: customers, candidates, partners, investors or a specific professional community. Write down what each group already knows and what they need to learn. One primary audience should lead the film; other audiences can receive tailored cutdowns and post copy.

### Find the story behind the number
Ask what the company can build or change because of the funding. What progress made this moment possible? What proof can you show today? A clear answer gives the film more substance than a funding graphic alone.

### Choose a format that fits the proof
Motion graphics can explain a complex product or future vision. A founder-led film can make the decision and mission personal. Cinematic footage can show the people or world the company serves. The format should come from the story and the assets available, not from a trend.

### Prepare the whole launch surface
Before the release, approve the film, opening frame, captions, landing page, founder post and follow-up cuts. Make the call to action explicit. Prepare different suggested messages for the people who may want to share the news; they should be free to write in their own voice.

### Plan distribution without promising a result
Identify customers, team members, investors, partners and relevant creators who already have a reason to care. Give them context early, agree on timing and remain available to answer questions when the announcement goes live. Reposts and views cannot be guaranteed.

The useful test is whether someone unfamiliar with the company can explain what changes next after watching. If they can, the film has done more than celebrate a number.`
  },
  {
    slug: "launch-day-video-distribution-plan",
    cat: "Distribution",
    date: "Nov 2026",
    title: "How to plan launch-day distribution for a video",
    dek: "A practical plan for the founder post, supporting network and follow-up content on X and LinkedIn.",
    body: `A finished film is an asset. Distribution is the plan for getting that asset in front of the right people and giving them a reason to act. Start with the buyer and the launch goal before deciding when or where to post.

### Define the one action
Choose what success means for this release: visits to a product page, signups, demo requests, or simply a clear introduction to a new category. The video, post and landing page should point to the same next step.

### Prepare the founder post
Write the opening line in plain language. Explain what changed, show the film, and give one useful call to action. Make a version for X and another for LinkedIn rather than assuming the same phrasing fits both audiences. Check that the first frame works without sound.

### Build a relevant sharing list
Start with people who know the company or serve the intended buyers: customers, partners, team members, investors and creators with a genuine connection to the topic. Give them the film and context in advance. A short personal note is better than a mass request for identical reposts.

### Keep the first day responsive
Make sure someone can reply to questions, thank people who share the launch, and direct interested viewers to the right page. Watch which questions recur. They may reveal what the next demo or tutorial should explain.

### Use the film after launch day
The film can lead the website, support sales conversations and become shorter follow-up cuts. The launch post is one moment in a longer content system. Keep the source files, captions and product claims organised so the material can be updated as the product changes.

No posting schedule guarantees views. A useful launch plan improves clarity, coordination and the chance that the right audience sees the work.`
  }
];
const posts = [...existing, ...added];
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const renderBody = (body) => body.split(/\n\s*\n/).map((block) => {
  if (block.startsWith("### ")) return `<h2>${escape(block.slice(4))}</h2>`;
  if (block.startsWith("- ")) return `<ul>${block.split("\n").map(line => `<li>${escape(line.replace(/^- /, ""))}</li>`).join("")}</ul>`;
  return `<p>${escape(block.replace(/\n/g, " "))}</p>`;
}).join("\n");
const layout = (title, description, canonical, body, schema = "") => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} | Reblues Launch</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Reblues Launch"><meta property="og:title" content="${escape(title)} | Reblues Launch"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(title)} | Reblues Launch"><meta name="twitter:description" content="${escape(description)}">
<link rel="icon" href="/assets/reblues-mark-orange.svg" type="image/svg+xml"><style>
*{box-sizing:border-box}body{margin:0;background:#f5f5f2;color:#252927;font-family:Inter,Arial,sans-serif}a{color:inherit}header{border-bottom:1px solid #d9dcd7;padding:20px max(24px,5vw);display:flex;justify-content:space-between;gap:20px}header a{text-decoration:none;font-weight:600}header a:first-child{color:#f36a22}main{max-width:1120px;margin:auto;padding:70px 24px 110px}h1{font-size:clamp(2.2rem,5vw,4rem);line-height:1.08;letter-spacing:-.05em;max-width:850px;margin:12px 0 24px}h2{font-size:1.65rem;letter-spacing:-.03em;margin:46px 0 14px}p,li{font-size:1.05rem;line-height:1.75;color:#494f4b}.intro{max-width:720px;font-size:1.25rem}.meta{font-size:.78rem;color:#ae4a16;text-transform:uppercase;letter-spacing:.1em}.body{max-width:730px;margin-top:55px}.body p{margin:0 0 22px}.body ul{padding-left:24px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;margin-top:45px}.card{display:block;text-decoration:none;border:1px solid #d9dcd7;border-radius:8px;padding:26px;background:#fff}.card:hover{border-color:#f36a22}.card h2{font-size:1.35rem;margin:12px 0}.card p{font-size:.95rem}.back{display:inline-block;margin-top:65px;color:#b64e1b}footer{border-top:1px solid #d9dcd7;padding:24px max(24px,5vw);font-size:.9rem;color:#696e6a}
</style>${schema && `<script type="application/ld+json">${schema}</script>`}</head><body><header><a href="/">Reblues Launch</a><a href="/journal">Journal</a></header>${body}<footer>Reblues Launch · Launch films and distribution for tech companies</footer></body></html>`;

const origin = "https://www.reblueslaunch.com";
const cards = posts.map(post => `<a class="card" href="/journal/${escape(post.slug)}"><span class="meta">${escape(post.cat)} · ${escape(post.date)}</span><h2>${escape(post.title)}</h2><p>${escape(post.dek)}</p></a>`).join("\n");
const journalDir = new URL("journal/", siteDir);
mkdirSync(journalDir, { recursive: true });
writeFileSync(new URL("index.html", journalDir), layout("Journal", "Original case studies and practical launch strategy from Reblues Launch.", `${origin}/journal`, `<main><span class="meta">Journal</span><h1>Notes from the work.</h1><p class="intro">Launch films, case studies and practical guidance for bringing a product into the world.</p><div class="grid">${cards}</div></main>`));
for (const post of posts) {
  const url = `${origin}/journal/${post.slug}`;
  const folder = new URL(`${post.slug}/`, journalDir);
  mkdirSync(folder, { recursive: true });
  const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.dek, mainEntityOfPage: url, publisher: { "@type": "Organization", name: "Reblues Launch", url: origin } });
  writeFileSync(new URL("index.html", folder), layout(post.title, post.dek, url, `<main><a href="/journal" class="meta">← Journal</a><h1>${escape(post.title)}</h1><p class="intro">${escape(post.dek)}</p><span class="meta">${escape(post.cat)} · ${escape(post.date)}</span><article class="body">${renderBody(post.body)}</article><a href="/journal" class="back">← More from the Journal</a></main>`, schema));
}
const urls = [`${origin}/`, `${origin}/journal`, ...posts.map(post => `${origin}/journal/${post.slug}`)];
writeFileSync(new URL("sitemap.xml", siteDir), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`);
