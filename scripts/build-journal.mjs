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
const origin = "https://www.reblueslaunch.com";
// A readable path must use the same Journal components and fonts as the approved site.
// The extra articles are inserted into the existing POSTS collection before its router runs.
const withPosts = source.slice(0, end) + "\n" + added.map(post => JSON.stringify(post)).join(",\n") + "\n" + source.slice(end);
const setMeta = (html, key, value, attr = "name") => html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*("\\s*\\/>)`), `$1${escape(value)}$2`);
function page(post) {
  const slug = post?.slug;
  const path = slug ? `/journal/${slug}` : "/journal";
  const title = slug ? `${post.title} | Reblues Launch` : "Journal | Reblues Launch";
  const description = slug ? post.dek : "Original case studies and practical launch strategy from Reblues Launch.";
  let html = withPosts.replace(/((?:href|src)=")assets\//g, "$1/assets/");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*("\s*\/>)/, `$1${origin}${path}$2`);
  for (const key of ["description", "twitter:title", "twitter:description"]) html = setMeta(html, key, key.endsWith("title") ? title : description);
  for (const key of ["og:title", "og:description", "og:url", "og:type"]) html = setMeta(html, key, key === "og:title" ? title : key === "og:description" ? description : key === "og:url" ? `${origin}${path}` : slug ? "article" : "website", "property");
  // Preserve the path in the address bar while the site's existing router selects its Journal view.
  html = html.replace("</head>", `<script>if(!location.hash)history.replaceState(null,"",location.pathname+location.search+"#/journal${slug ? `/${slug}` : ""}");</script></head>`);
  html = html.replace(/href="#\/journal\//g, 'href="/journal/').replace(/href="#\/journal"/g, 'href="/journal"');
  if (slug) {
    const schema = JSON.stringify({"@context":"https://schema.org","@type":"Article",headline:post.title,description:post.dek,mainEntityOfPage:`${origin}${path}`,publisher:{"@type":"Organization",name:"Reblues Launch",url:origin}});
    html = html.replace("</head>", `<script type="application/ld+json">${schema}</script></head>`);
  }
  // Text fallback for crawlers without JavaScript; the app replaces x-view on load.
  const fallback = slug ? `<article><h1>${escape(post.title)}</h1><p>${escape(post.dek)}</p>${renderBody(post.body)}</article>` : `<article><h1>From the launch room.</h1>${posts.map(p => `<p><a href="/journal/${p.slug}">${escape(p.title)}</a></p>`).join("")}</article>`;
  html = html.replace('<main id="x-view" class="x-view x-railed"></main>', `<main id="x-view" class="x-view x-railed"><noscript>${fallback}</noscript></main>`);
  return html;
}
const journalDir = new URL("journal/", siteDir);
mkdirSync(journalDir, { recursive: true });
writeFileSync(new URL("index.html", journalDir), page(null));
for (const post of posts) {
  const folder = new URL(`${post.slug}/`, journalDir);
  mkdirSync(folder, { recursive: true });
  writeFileSync(new URL("index.html", folder), page(post));
}
const urls = [`${origin}/`, `${origin}/journal`, ...posts.map(post => `${origin}/journal/${post.slug}`)];
writeFileSync(new URL("sitemap.xml", siteDir), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`);
