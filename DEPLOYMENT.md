# Deployment Guide — Garima Fashion Hub

## Architecture

```
GitHub Repository
      │
      ├── / (frontend)  ──→  Vercel       (free, always-on CDN)
      └── /backend      ──→  Render       (free tier + UptimeRobot keep-alive)
                                 │
                           MongoDB Atlas  (existing, free M0)
                           Cloudinary     (existing, free tier)
```

---

## Step 1 — Push to GitHub

If not already on GitHub:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/garima-fashion.git
git push -u origin main
```

> **Never commit `.env` files.** They are already in `.gitignore`.

---

## Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub account and select the repo
3. Set the following:

   | Setting | Value |
   |---|---|
   | **Name** | `garima-fashion-backend` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | `Free` |

4. Under **Environment Variables**, add every key from `backend/.env.example`:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | your JWT secret |
   | `ADMIN_USERNAME` | your admin username |
   | `ADMIN_PASSWORD` | your admin password |
   | `CLOUDINARY_CLOUD_NAME` | `awfguexx` |
   | `CLOUDINARY_API_KEY` | your Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | your Cloudinary API secret |
   | `RAZORPAY_KEY_ID` | your Razorpay key |
   | `RAZORPAY_KEY_SECRET` | your Razorpay secret |
   | `CORS_ORIGIN` | *(leave blank for now — fill in after Step 3)* |

5. Click **Create Web Service** — Render will build and deploy automatically.

6. Once deployed, your backend URL will be:
   ```
   https://garima-fashion-backend.onrender.com
   ```

7. Verify it works by opening in browser:
   ```
   https://garima-fashion-backend.onrender.com/health
   ```
   You should see: `{ "status": "OK" }`

---

## Step 3 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set the following:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `.` (repo root) |
   | **Framework Preset** | `Other` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `.output/public` |

4. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://garima-fashion-backend.onrender.com/api` |
   | `VITE_CLOUDINARY_CLOUD_NAME` | `awfguexx` |

5. Click **Deploy**.

6. Once deployed, your frontend URL will be something like:
   ```
   https://garima-fashion.vercel.app
   ```

---

## Step 4 — Update CORS on Render

Now that you have your Vercel URL, go back to Render:

1. Open your backend service → **Environment**
2. Add/update:
   ```
   CORS_ORIGIN=https://garima-fashion.vercel.app
   ```
3. Render will automatically redeploy.

---

## Step 5 — Keep-Alive with UptimeRobot

Render's free tier sleeps after 15 minutes of inactivity. UptimeRobot pings your `/health` endpoint every 5 minutes to keep it awake.

1. Go to [uptimerobot.com](https://uptimerobot.com) → **Sign up free**

2. Click **Add New Monitor**

3. Set:

   | Field | Value |
   |---|---|
   | **Monitor Type** | `HTTP(s)` |
   | **Friendly Name** | `Garima Fashion Backend` |
   | **URL** | `https://garima-fashion-backend.onrender.com/health` |
   | **Monitoring Interval** | `5 minutes` |

4. Click **Create Monitor**

UptimeRobot will now ping your backend every 5 minutes — keeping it alive 24/7. You'll also get an email alert if it ever goes down.

---

## Step 6 — Verify Everything

Test these URLs after deployment:

| Check | URL | Expected |
|---|---|---|
| Backend health | `https://garima-fashion-backend.onrender.com/health` | `{"status":"OK"}` |
| Backend root | `https://garima-fashion-backend.onrender.com/` | `Garima Fashion Backend is Running!` |
| Products API | `https://garima-fashion-backend.onrender.com/api/products` | JSON with products |
| Frontend | `https://garima-fashion.vercel.app` | Your store homepage |
| Admin panel | `https://garima-fashion.vercel.app/admin` | Admin login screen |

---

## Environment Variable Reference

### Backend (Render)

| Variable | Description |
|---|---|
| `NODE_ENV` | Set to `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random string for JWT signing |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (`awfguexx`) |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `CORS_ORIGIN` | Your Vercel frontend URL |

### Frontend (Vercel)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full backend API URL ending in `/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (`awfguexx`) |

---

## Cost Summary

| Service | Plan | Cost |
|---|---|---|
| Vercel (frontend) | Free | $0/month |
| Render (backend) | Free | $0/month |
| MongoDB Atlas | M0 Free | $0/month |
| Cloudinary | Free | $0/month |
| UptimeRobot | Free | $0/month |
| **Total** | | **$0/month** |

---

## Troubleshooting

**CORS errors in browser console**
→ Make sure `CORS_ORIGIN` on Render matches your exact Vercel URL (no trailing slash).

**Backend returns 401 on image upload**
→ Make sure you are logged into the admin panel before uploading. The admin JWT token must be present.

**Backend sleeps despite UptimeRobot**
→ Check UptimeRobot dashboard — the monitor should show green. If Render still sleeps, reduce interval to `5 minutes`.

**Vercel build fails**
→ Check that `VITE_API_URL` is set correctly in Vercel environment variables before deploying.
