# ArshMind — Firebase Hosting Deployment Guide

## Architecture Reality Check

> [!IMPORTANT]
> Your app is **NOT a pure static SPA**. It has an Express server (`server.ts`) that:
> - Proxies the **Gemini API key** securely (so it never leaks to the browser)
> - Handles `/api/analyze` and `/api/replan-path` routes with rate limiting
>
> This means you need **two deployment targets**:
> 1. **Firebase Hosting** → serves the Vite-built React frontend (static files in `dist/`)
> 2. **Cloud Run** or **Cloud Functions** → runs the Express backend (`server.ts`)
>
> The good news: both connect to your existing Firestore + Auth project seamlessly.

---

## Free Tier Summary (Spark Plan)

| Service | Free Limit | Your Usage |
|---|---|---|
| Firebase Hosting | 10 GB storage, 360 MB/day transfer | ✅ Fine for MVP |
| Cloud Run | 2M requests/month, 360K GB-s compute | ✅ Fine for MVP |
| Firestore | 1 GB storage, 50K reads/20K writes/day | ✅ Fine for MVP |
| Firebase Auth | 10K/month (phone), unlimited email | ✅ Fine for MVP |

> [!NOTE]
> Cloud Functions (Gen 2) requires the **Blaze (pay-as-you-go)** plan. **Cloud Run** is the better free option here — it has a generous always-free tier and does NOT require billing to be enabled for the free quota.

---

## Prerequisites

Run these once if you haven't already:

```powershell
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify your project
firebase projects:list
```

---

## Part 1 — Initialize Firebase in Your Project

```powershell
# In your project root
cd c:\Users\Adars\Downloads\arshmind

firebase init
```

When prompted, select:
- ✅ **Hosting**: Configure files for Firebase Hosting
- ✅ **Firestore**: Deploy rules and indexes

### Hosting setup answers:
```
? What do you want to use as your public directory? dist
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? Set up automatic builds and deploys with GitHub? No   ← we'll do this manually first
? File dist/index.html already exists. Overwrite? No
```

This creates `firebase.json` and `.firebaserc` in your project root.

---

## Part 2 — Update `firebase.json`

Your `firebase.json` should look like this. The key part is the **rewrite** that sends API calls to your Cloud Run backend:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "arshmind-backend",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

> [!NOTE]
> The `run` rewrite proxies `/api/**` traffic from your Firebase Hosting domain to your Cloud Run service — no CORS issues, the frontend thinks it's calling the same origin.

---

## Part 3 — Prepare the Backend for Cloud Run

### 3a. Create a `Dockerfile` in your project root

```dockerfile
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built server bundle (built via `npm run build`)
COPY dist/server.cjs ./dist/server.cjs

# Expose Cloud Run's expected port
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/server.cjs"]
```

### 3b. Update `server.ts` to use `PORT` env var

Find this line in `server.ts`:
```typescript
const PORT = 3000;
```
Change it to:
```typescript
const PORT = parseInt(process.env.PORT || "3000");
```
And update the `.listen()` call:
```typescript
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3c. Add `.dockerignore`

```
node_modules/
.env
.git/
src/
*.md
dist/client/
```

---

## Part 4 — Set Up Google Cloud CLI & Deploy Backend

```powershell
# Install gcloud CLI (if not already installed)
# Download from: https://cloud.google.com/sdk/docs/install
# Then restart PowerShell

# Initialize and link to your Firebase project
gcloud init
# Select your Firebase project (same Project ID)

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Build your app first
npm run build

# Build and deploy to Cloud Run
gcloud run deploy arshmind-backend `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars "GEMINI_API_KEY=your_actual_key_here,NODE_ENV=production"
```

> [!CAUTION]
> Never put your `.env` file contents in the command above in plaintext for production. Use Secret Manager instead:
> ```powershell
> # Better: use Secret Manager (still free tier)
> gcloud secrets create GEMINI_API_KEY --data-file=- <<< "your_key_here"
> gcloud run deploy arshmind-backend --source . --region us-central1 --platform managed --allow-unauthenticated --update-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
> ```

After deploy, Cloud Run gives you a URL like:
```
https://arshmind-backend-xxxx-uc.a.run.app
```
Copy this URL — you'll need it.

---

## Part 5 — Set Firebase Hosting Environment Variables

Your React frontend (Vite) needs the `VITE_*` env vars **at build time**. Do NOT put the Gemini key here — that stays in Cloud Run.

### Option A: `.env.production` file (committed without secrets)
Create `.env.production` in your project root:
```env
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> [!WARNING]
> Firebase web API keys are safe to expose in the browser — they are **not secret**. They're restricted by Firebase Security Rules and Auth domain restrictions. Your Gemini API key (in Cloud Run) is the one that must stay private.

Then build:
```powershell
npm run build
```

---

## Part 6 — Deploy Frontend to Firebase Hosting

```powershell
# Make sure you're linked to the right project
firebase use your-project-id

# Deploy only hosting (rules separately if needed)
firebase deploy --only hosting

# Or deploy everything at once
firebase deploy
```

Your app will be live at:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

---

## Part 7 — Custom Domain via Cloudflare

Since your domain's DNS is managed by Cloudflare and it's currently on Render:

### 7a. Add domain to Firebase Hosting
```powershell
firebase hosting:channel:deploy preview  # optional test first
```
Or via the Firebase Console:
1. Go to **Hosting** → **Add custom domain**
2. Enter your domain (e.g., `arshmind.yourdomain.com`)
3. Firebase will give you DNS records to add

### 7b. In Cloudflare Dashboard

1. Go to your domain → **DNS**
2. **Delete or disable** the existing Render A/CNAME records for this subdomain
3. Add the records Firebase gives you:

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `@` or subdomain | Firebase IP 1 | **DNS only** (grey cloud) ← important! |
| A | `@` or subdomain | Firebase IP 2 | **DNS only** (grey cloud) |

> [!WARNING]
> Set Cloudflare proxy to **DNS only** (grey cloud) for Firebase Hosting. Firebase Hosting does its own SSL/TLS. If you orange-cloud it, SSL verification will fail.

4. Firebase will auto-provision a free SSL certificate via Let's Encrypt (takes ~24h to propagate)

### 7c. Update Firebase Auth Authorized Domains

In Firebase Console → **Authentication** → **Settings** → **Authorized domains**:
- Add your custom domain: `yourdomain.com`

---

## Part 8 — GitHub Actions CI/CD (Optional but Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
        run: npm run build

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-project-id
```

Add secrets in GitHub → Settings → Secrets:
- All `VITE_*` vars from above
- `FIREBASE_SERVICE_ACCOUNT`: JSON key from Firebase Console → Project Settings → Service Accounts

---

## Quick Reference — Full Deployment Checklist

- [ ] `firebase init` done, `firebase.json` updated with Cloud Run rewrite
- [ ] `server.ts` uses `process.env.PORT` instead of hardcoded `3000`
- [ ] `Dockerfile` created
- [ ] `.dockerignore` created
- [ ] `npm run build` succeeds
- [ ] Cloud Run service deployed (`gcloud run deploy arshmind-backend ...`)
- [ ] `GEMINI_API_KEY` set in Cloud Run env vars (not in client bundle!)
- [ ] `firebase deploy --only hosting` succeeds
- [ ] Custom domain added in Firebase Console
- [ ] Cloudflare DNS set to **grey cloud (DNS only)** for Firebase records
- [ ] Custom domain added to Firebase Auth authorized domains
- [ ] Test: frontend loads, Auth login works, `/api/analyze` returns AI response

---

## Troubleshooting

| Problem | Fix |
|---|---|
| API calls return 404 after deploy | Check `firebase.json` rewrite points to correct Cloud Run `serviceId` and `region` |
| Auth fails on custom domain | Add domain to Firebase Console → Auth → Authorized Domains |
| SSL not working | Ensure Cloudflare is set to **DNS only** (grey cloud), not proxied |
| Cloud Run cold start slow | Set `--min-instances 1` (may cost slightly after free tier) |
| `VITE_*` vars undefined in prod | Add them to `.env.production` and rebuild before `firebase deploy` |
| Firestore permission denied | Check `firestore.rules` — you have a draft at `DRAFT_firestore.rules` |
