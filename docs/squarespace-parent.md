# Squarespace parent page (out of embed scope)

The calculator copy in this repo only changes **inside the iframe**. These items stay on https://www.youranthemhome.com/rent-vs-own-calculator and are for Nick (or Squarespace) to wire up.

Current production embed (keep until swap):

`https://rent-vs-buy-template.vercel.app`

## 1. Page hero above the iframe

Do **not** remove the existing page heading. Suggested copy already on the page:

> Get your rent-vs-buy breakdown  
> A few quick taps so Nick can send numbers that match your situation — not a generic chart.

The iframe now repeats a matching promise at the top of the embed so ManyChat / RENT traffic is not staring at blank space if the parent hero is scrolled off-screen.

## 2. Swap the iframe `src` (when the copy URL is live)

In Squarespace → the Rent vs Own Calculator page → embed / code block, replace the `src` only:

```html
<iframe
  src="https://rent-vs-buy-anthem-v2.vercel.app"
  title="Rent vs. Buy Calculator"
  style="width: 100%; min-height: 1400px; height: 85vh; border: 0;"
  loading="lazy"
></iframe>
```

Use the real `*.vercel.app` (or custom domain) from the **new** Vercel project. Leave the old project on `main` so the previous URL keeps working if you need to roll back.

Optional UTMs on the iframe URL:

```
https://rent-vs-buy-anthem-v2.vercel.app?utm_source=manychat&utm_medium=sms&utm_campaign=rent
```

## 3. Parent listener (sticky scroll + form mapping)

Add this as a Squarespace **Code Injection** (page footer or site footer). Give the lead form a stable id, e.g. `rvo-lead-form`.

```html
<script>
(function () {
  var FORM_ID = 'rvo-lead-form';
  var ALLOWED_ORIGINS = [
    'https://rent-vs-buy-anthem-v2.vercel.app',
    'https://rent-vs-buy-template.vercel.app' // rollback
  ];

  function scrollToForm() {
    var el = document.getElementById(FORM_ID);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function applyStateToForm(payload) {
    if (!payload) return;
    // Map calculator fields onto hidden Squarespace inputs if/when they exist.
    // Example: document.querySelector('[name="homePrice"]').value = payload.homePrice;
    window.__rvoCalculatorState = payload;
  }

  window.addEventListener('message', function (event) {
    if (ALLOWED_ORIGINS.indexOf(event.origin) === -1) return;
    var data = event.data || {};
    if (data.source !== 'rent-vs-buy') return;

    if (data.type === 'rvo:focus-form') {
      scrollToForm();
      applyStateToForm(data.payload);
      if (data.intent) window.__rvoIntent = data.intent; // "breakdown" | "watching"
    }

    if (data.type === 'rvo:state') {
      applyStateToForm(data.payload);
      if (data.intent) window.__rvoIntent = data.intent;
    }
  });

  // Honor ?focus=form on the parent URL (e.g. after a redirect).
  var params = new URLSearchParams(window.location.search);
  if (params.get('focus') === 'form' || window.location.hash === '#lead-form' || window.location.hash === '#rvo-lead-form') {
    window.addEventListener('load', scrollToForm);
  }
})();
</script>
```

### Optional parent sticky bar

The embed already shows a sticky **Send me my breakdown** bar after the first slider touch, and posts `rvo:focus-form`. If you also want a bar on the Squarespace chrome:

```html
<div id="rvo-parent-sticky" style="display:none; position:fixed; bottom:0; left:0; right:0; z-index:9999; background:#1d4ed8; color:#fff; padding:12px 16px; font-family:inherit;">
  <span>Want numbers that match your situation?</span>
  <a href="#rvo-lead-form" style="margin-left:12px; color:#fff; font-weight:700;">Send me my breakdown</a>
</div>
<script>
window.addEventListener('message', function (event) {
  if (!event.data || event.data.type !== 'rvo:state') return;
  var bar = document.getElementById('rvo-parent-sticky');
  if (bar) bar.style.display = 'block';
});
</script>
```

## 4. Mapping `postMessage` into the Squarespace form / webhook

Payload fields (see README for the full schema):

| Field | Use |
|---|---|
| `homePrice` | Home price |
| `downPaymentPct` / `downPaymentAmount` | Down payment |
| `rate` | Interest rate % |
| `rent` | Monthly rent |
| `hoa` | HOA monthly |
| `taxRate` | Property tax % / yr |
| `appreciation` | Appreciation % / yr |
| `monthlyBuy` / `monthlyRent` / `difference` | Monthly comparison (`difference` = buy − rent) |
| `equity1` / `equity3` / `equity5` / `equity10` | Owner equity milestones |
| `renterInvested1` / `3` / `5` / `10` | Invest-the-gap illustration |
| `utm.*` | Campaign tags from the iframe src |
| `intent` | `breakdown` (primary CTA) or `watching` (softer path) |

Squarespace forms cannot natively bind `postMessage` without custom JS or a hidden HTML form that submits to the same webhook. Practical options:

1. Hidden inputs on the form; the listener writes `payload` into them before submit.
2. Zapier / Make / a small worker that reads `window.__rvoCalculatorState` on submit (or posts alongside the form).
3. Append a JSON blob to the form’s comments field.

The embed does not collect email itself — that’s the parent form’s job.

## 5. Rollback

Point the iframe `src` back to `https://rent-vs-buy-template.vercel.app`. No `main` deploy is required for this copy.
