# Rent vs. Buy Calculator (lead-max copy)

Interactive Denver Metro rent-vs-buy calculator. This **branch is a copy of the production app** with lead-max UX changes. It is meant to ship as a **separate Vercel URL** so the live embed keeps working until Nick swaps the Squarespace iframe `src`.

| | URL |
|---|---|
| **Production (keep)** | https://rent-vs-buy-template.vercel.app |
| **Squarespace page** | https://www.youranthemhome.com/rent-vs-own-calculator |
| **This copy (new project)** | `https://rent-vs-buy-anthem-v2.vercel.app` *(create in Vercel — see below)* |

`main` / the existing Vercel project should stay on the current production deploy.

## Local dev

```bash
pnpm install
pnpm dev
```

```bash
pnpm check    # tsc --noEmit
pnpm test     # vitest (includes the 7.5% compound helper)
pnpm build
```

## What changed vs production

| Before | After |
|---|---|
| Header then sliders; no above-fold promise inside the embed | Hero line: **Adjust the numbers. Get a personal breakdown.** |
| Monthly difference was the first big result (“renting costs less by $X”) | **Owner equity at 1/3/5/10 years** is the headline; monthly gap is second, with a note that buy includes tax / HOA / maintenance / insurance |
| Renter housing net worth = **$0** everywhere | Still $0 housing equity; plus an **invest-the-gap** illustration: when buy > rent, the monthly difference is compounded at **7.5%/yr** (S&P 500-like, labeled estimate, not advice). If rent > buy, invested gap = $0 |
| Deep-dive sections (savings race, lease break) sat above any lead CTA | Short core calc → results → **Send me my breakdown** → advanced expanders |
| No parent-page integration | Debounced `postMessage` + querystring sync; sticky CTA after the first slider touch; secondary **I'm just watching** path (`intent: watching`) |

## Iframe snippet (Squarespace)

After the new Vercel project is live, replace the current embed (`https://rent-vs-buy-template.vercel.app`) with:

```html
<iframe
  src="https://rent-vs-buy-anthem-v2.vercel.app"
  title="Rent vs. Buy Calculator"
  style="width: 100%; min-height: 1400px; height: 85vh; border: 0;"
  loading="lazy"
></iframe>
```

Optional: append UTMs on the iframe `src` so they flow into `postMessage` and the querystring:

`https://rent-vs-buy-anthem-v2.vercel.app?utm_source=manychat&utm_medium=sms&utm_campaign=rent`

Keep the **old** URL in place until this copy is verified. Parent-page work (hero HTML above the iframe, sticky bar, form field mapping) is documented in [`docs/squarespace-parent.md`](docs/squarespace-parent.md).

## Deploy a *copy* URL (do not overwrite production)

The GitHub repo **is** the production app (`rent-vs-buy-template.vercel.app` on `main`). To keep that URL working:

1. In [Vercel](https://vercel.com) click **Add New… → Project**.
2. Import `nickahrensrealestate/rent-vs-buy-template` again.
3. Name the new project **`rent-vs-buy-anthem-v2`** (or similar).
4. Set **Production Branch** to this branch (`cursor/rvo-lead-max-copy-f17f` or a follow-up `rvo-lead-max-copy` you keep merged).
5. Framework preset: **Vite**. Build command: `pnpm build`. Output: Vercel will use the `start` script (`node dist/index.js`) which serves `dist/public`.
6. Do **not** change the existing `rent-vs-buy-template` project’s production branch (`main`).
7. Copy the new `*.vercel.app` URL into the Squarespace iframe when ready.

Root directory: repository root. Install: `pnpm install`.

## postMessage schema

The embed posts to `window.parent` (and `window.top` if different). Target origin is `document.referrer`’s origin when available, otherwise `*`.

### `rvo:state` — calculator snapshot

Sent:

- on **debounced input change** (~400ms) with `intent: "sync"`
- on **CTA click** with `intent: "breakdown"` or `intent: "watching"`

```ts
{
  source: "rent-vs-buy",
  type: "rvo:state",
  intent: "sync" | "breakdown" | "watching",
  payload: {
    homePrice: number,
    downPaymentPct: number,
    downPaymentAmount: number,
    rate: number,              // interest rate %
    rent: number,              // monthly rent
    hoa: number,
    taxRate: number,           // property tax % / yr
    appreciation: number,      // home appreciation % / yr
    monthlyBuy: number,
    monthlyRent: number,
    difference: number,        // monthlyBuy − monthlyRent (positive = buy costs more)
    equity1: number,
    equity3: number,
    equity5: number,
    equity10: number,
    renterInvested1: number,   // invest-the-gap illustration
    renterInvested3: number,
    renterInvested5: number,
    renterInvested10: number,
    utm: {
      utm_source?: string,
      utm_medium?: string,
      utm_campaign?: string,
      utm_content?: string,
      utm_term?: string
    }
  }
}
```

### `rvo:focus-form` — scroll the parent form

Sent from the sticky bar and both CTA buttons. Also posts a matching `rvo:state`. Includes `protocol: "?focus=form"` so the parent can sticky-scroll or honor a `?focus=form` / `#lead-form` convention on the Squarespace URL.

```ts
{
  source: "rent-vs-buy",
  type: "rvo:focus-form",
  intent: "breakdown" | "watching",
  protocol: "?focus=form",
  payload: { /* same as rvo:state payload */ }
}
```

In-embed, CTAs also scroll to `#lead-form`.

## Querystring sync

The iframe `replaceState`s these params as inputs change (UTMs are preserved):

`homePrice`, `downPaymentPct`, `rate`, `rent`, `hoa`, `taxRate`, `appreciation`, `monthlyBuy`, `monthlyRent`, `difference`, `equity1`, `equity3`, `equity5`, `equity10`

On load, the matching **input** params hydrate the sliders. If `rate` is present, the live FRED fetch will not overwrite it.

## 7.5% assumption

`ILLUSTRATIVE_SP500_ANNUAL_RETURN_PCT = 7.5` in `client/src/lib/compound.ts`. Labeled in the UI as an estimate/illustration, not advice. Used only for the renter invest-the-gap path.
