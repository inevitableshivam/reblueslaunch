// Playbook gate: saves name + work email as an inbound lead on the GTM board (gtm.reblueslaunch.com), tagged "playbook".
const INGEST = process.env.GTM_INGEST_URL || "https://gtm.reblueslaunch.com/api/ingest";
const KEY = process.env.GTM_INGEST_KEY;
const send = (res, code, obj) => { res.statusCode = code; res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(obj)); };
async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  let s = ""; for await (const c of req) s += c; return s ? JSON.parse(s) : {};
}
module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  try {
    const b = await readBody(req);
    if (b.website_hp) return send(res, 200, { ok: true }); // bots fill the hidden field
    const name = String(b.name || "").trim().slice(0, 120);
    const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return send(res, 400, { error: "Please add your name and a valid email." });
    if (!KEY) return send(res, 200, { ok: true, stored: false });
    const domain = email.split("@")[1];
    const company = domain.split(".")[0].replace(/^\w/, (c) => c.toUpperCase());
    const r = await fetch(INGEST, {
      method: "POST",
      headers: { apikey: KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ leads: [{
        company, website: domain, person: name, email, niche: "other", stage: "new",
        tags: ["playbook", "inbound"],
        signal_note: "Opened the Launch Playbook on reblueslaunch.com",
        signal_url: "https://www.reblueslaunch.com/#/playbook",
        signal_date: new Date().toISOString().slice(0, 10),
        dedupe_key: "playbook:" + email,
      }] }),
    });
    if (!r.ok) console.error("ingest", r.status, (await r.text()).slice(0, 300));
    send(res, 200, { ok: true });
  } catch (e) { console.error(e); send(res, 200, { ok: true, stored: false }); }
};
