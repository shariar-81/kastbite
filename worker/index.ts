// KastBite live backend (Cloudflare Worker + one Durable Object).
// POST /api/sync merges what a device knows with what the server knows, so
// orders, payments, deliveries (rider position), the menu and sections are
// shared between customer, restaurant, rider and admin devices.

const ITEM_COLLECTIONS = ["orders", "deliveries", "payments"];
const DOCS = ["menu", "categories"];
const keyOf = (it: any) => it.id ?? it.orderId;

export class Hub {
  state: any;
  constructor(state: any) { this.state = state; }

  async fetch(request: Request): Promise<Response> {
    const body: any = await request.json().catch(() => ({}));
    const out: any = { items: {}, docs: {}, docT: {} };

    for (const name of ITEM_COLLECTIONS) {
      const stored: Record<string, any> = (await this.state.storage.get(name)) || {};
      let changed = false;
      for (const it of body.items?.[name] || []) {
        const k = keyOf(it);
        if (k === undefined || k === null) continue;
        if (name === "orders" && !Array.isArray(it.items)) continue; // ignore malformed orders
        const cur = stored[k];
        if (!cur || (it._t || 0) > (cur._t || 0)) {
          stored[k] = { ...it, _c: Math.min(it._c || Date.now(), cur?._c || Infinity) };
          changed = true;
        }
      }
      if (changed) await this.state.storage.put(name, stored);
      out.items[name] = Object.values(stored);
    }

    for (const name of DOCS) {
      let doc: any = await this.state.storage.get("doc:" + name);
      const incoming = body.docs?.[name];
      if (incoming && (!doc || incoming.t > doc.t)) {
        doc = { t: incoming.t, v: incoming.v };
        await this.state.storage.put("doc:" + name, doc);
      }
      if (doc) {
        out.docT[name] = doc.t;
        if (doc.t > (body.since?.[name] ?? -1)) out.docs[name] = doc;
      }
    }
    return Response.json(out);
  }
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/sync" && request.method === "POST") {
      const stub = env.HUB.get(env.HUB.idFromName("main"));
      return stub.fetch(request);
    }
    if (url.pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
