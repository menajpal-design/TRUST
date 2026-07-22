# 🚀 Deploying to Vercel Guide

The project is fully configured for seamless, 1-click deployment on **Vercel** as a unified Serverless MERN Platform.

---

## 📁 Key Vercel Configuration Files Added

1. **`vercel.json` (Root)**:
   - Configures `@vercel/node` for the serverless Express backend API (`api/index.js`).
   - Configures `@vercel/vite` for the React frontend client (`client/package.json`).
   - Handles route rewrites forwarding `/api/*` to the serverless function and static assets to the Vite bundle.

2. **`api/index.js` (Serverless Function Entrypoint)**:
   - Wraps the Express application (`server/src/app.js`) and manages MongoDB connection caching across warm serverless invocations.

3. **`client/vercel.json` (SPA Rewrites)**:
   - Manages HTML5 Single Page Application client-side routing rewrites (`/(.*)` -> `/index.html`).

---

## 🛠️ Environment Variables for Vercel

When deploying on Vercel, set the following environment variables in your Vercel Project Settings (`Settings -> Environment Variables`):

```env
# Server & Database
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/saas_org_db?retryWrites=true&w=majority
PORT=5000

# Security Tokens
JWT_ACCESS_SECRET=your_super_secret_access_token_key_here_2026
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_here_2026

# URL Configuration
CLIENT_URL=https://your-vercel-domain.vercel.app

# SMTP Email Setup (Optional for credentials email dispatch)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
EMAIL_FROM="SaaS Org ERP Platform <noreply@saasorg.com>"
```

---

## 🌐 Deploying Options

### Option A: Deploying via Vercel CLI (Fastest)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Preview**:
   ```bash
   vercel
   ```

3. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

### Option B: Deploying via GitHub / GitLab Integration

1. Push your repository to GitHub / GitLab.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Vercel will automatically detect `vercel.json` and build both the Vite frontend and Express serverless API function.
4. Add your Environment Variables in the Vercel Dashboard.
5. Click **Deploy**.

---

## ✅ Post-Deployment Verification

- **API Health Check**: `https://<your-app-domain>.vercel.app/health`
- **Frontend SPA**: `https://<your-app-domain>.vercel.app/login`
- **Primary Super Admin**: Automatically initialized upon first database connection (`superadmin@saasorg.com` / `SuperAdmin@123456`).
