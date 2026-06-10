# PrioritAI — Internal Process Prioritization Assistant

PrioritAI is a plug-and-play MVP for the Mind the Product / World Product Day hackathon. It helps digital transformation, operations and product teams evaluate internal process requests across business value, feasibility, data readiness, strategic alignment, urgency and user impact.

## What is included

- Static web app: no backend and no database required
- Request intake form
- Weighted prioritization engine
- Eligibility gate and missing-information flags
- AI-style recommendation summary
- Ranked dashboard
- Sample internal requests
- JSON export
- Novus/Pendo-ready tracking adapter
- Vercel and Netlify config files

## Run locally

Because this is a static app, you can open it directly:

```bash
open index.html
```

Or serve it locally:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deploy

### Option 1 — Netlify drag-and-drop

1. Zip or upload the `prioritai-novus` folder to Netlify.
2. Netlify will publish it as a static site.
3. Use the public URL in your Devpost submission.

### Option 2 — Vercel

1. Create a GitHub repo.
2. Push this folder.
3. Import the repo in Vercel.
4. Framework preset: `Other` or `Static`.
5. Build command: leave empty.
6. Output directory: `.`

## Novus.ai integration

The hackathon requires Novus.ai to be installed on the deployed project. The exact install snippet/project key is generated inside your Novus dashboard, so it cannot be hard-coded here without your account details.

This project is already prepared for Novus integration:

- `index.html` has a dedicated Novus install area in the `<head>`.
- `assets/novus-adapter.js` detects common SDK objects such as `window.Novus`, `window.novus`, `window.pendo`, and `window.Pendo`.
- The app emits product events such as:
  - `app_loaded`
  - `score_calculated`
  - `request_selected`
  - `dashboard_filtered`
  - `sample_requests_loaded`
  - `requests_exported`
- Important UI buttons have `data-novus-event` attributes.

### Steps

1. Create or open your Novus project.
2. Copy the official installation snippet from Novus.
3. Paste it in `index.html` above this line:

```html
<script src="./assets/novus-adapter.js"></script>
```

4. Deploy the app.
5. Open the public deployed URL and use the product.
6. Go to Novus dashboard and confirm events/sessions are visible.
7. Take the required Novus dashboard screenshot for Devpost.

If Novus asks you to connect a GitHub repository instead of pasting a script, connect the deployed repo and keep this tracking adapter in the codebase. The semantic DOM attributes and custom events make the product easier to instrument.

## Scoring formula

Each request is scored from 0 to 100 using this weighted model:

```text
Priority Score =
Business Value × 35%
+ Strategic Alignment × 15%
+ Feasibility × 20%
+ Data Readiness × 15%
+ Urgency & Risk × 10%
+ User Impact × 5%
```

Priority levels:

```text
80–100 = High Priority
60–79  = Medium Priority
40–59  = Low Priority
0–39   = Not Recommended
```

## Suggested Devpost positioning

PrioritAI is for product, operations and digital transformation teams that receive many internal AI, RPA, dashboard and process-improvement requests but lack a transparent way to decide what should be implemented first. It converts scattered internal requests into a ranked, explainable backlog that helps teams focus limited resources on the highest-value opportunities.

## Demo flow

1. Open the product.
2. Click `Load samples`.
3. Show the dashboard ranking.
4. Click a high-priority request and explain the score breakdown.
5. Add a new request manually.
6. Show generated recommendation, next step and badges.
7. Open Novus dashboard and show usage/session evidence.
