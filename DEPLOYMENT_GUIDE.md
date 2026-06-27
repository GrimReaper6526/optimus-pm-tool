# Step-by-Step Vercel Deployment Guide for Modus

This guide outlines the exact, foolproof steps to deploy both the **Modus Backend** (Express Server) and **Modus Frontend** (Vite Client) on Vercel's Free Hobby Tier.

---

## Prerequisites (MongoDB Atlas Configuration)
Because Vercel serverless functions run on dynamic IP addresses, you must allow incoming connections from any IP:
1. Log in to your **[MongoDB Atlas Dashboard](https://cloud.mongodb.com/)**.
2. Click on **`Network Access`** (under the *Security* section in the left sidebar).
3. Check if **`0.0.0.0/0`** is listed.
4. If not, click **`Add IP Address`**, select **`Allow Access from Anywhere`**, and click **`Confirm`**.

---

## Step 1: Deploy the Backend (Server)
1. Log in to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click the **`Add New...`** dropdown in the top-right corner and select **`Project`**.
3. Locate your `optimus-pm-tool` repository and click **`Import`**.
4. In the project setup form, configure the following:
   * **Project Name:** `modus-backend`
   * **Framework Preset:** Leave it as **`Other`**
   * **Root Directory:** Click **`Edit`**, select the **`server`** folder, and click **`Continue`**.
5. Expand the **`Environment Variables`** section and add the following 5 key-value pairs:
   * `NODE_ENV` ➔ `production`
   * `MONGO_URI` ➔ *(Paste your MongoDB Atlas connection string)*
   * `JWT_SECRET` ➔ *(Any random secret string, e.g. `secretkeysuper123`)*
   * `JWT_REFRESH_SECRET` ➔ *(Another random secret string)*
   * `CLIENT_URL` ➔ `http://localhost:5173` *(Placeholder)*
6. Click **`Deploy`**.
7. Once deployment completes, copy the backend URL (e.g. `https://modus-backend.vercel.app`).

### Verify Backend is Online:
Open your browser and navigate to `<your-backend-url>/api/health`. It should return:
```json
{
  "status": "ok",
  "timestamp": "2026-06-28T...",
  "env": "production"
}
```

---

## Step 2: Deploy the Frontend (Client)
1. Go back to the **Vercel Dashboard**.
2. Click **`Add New...`** and select **`Project`**.
3. Import the same `optimus-pm-tool` repository.
4. Configure the project:
   * **Project Name:** `modus-app`
   * **Framework Preset:** Vercel will automatically detect **`Vite`**.
   * **Root Directory:** Click **`Edit`**, select the **`client`** folder, and click **`Continue`**.
5. Expand the **`Environment Variables`** section and add:
   * `VITE_API_URL` ➔ `<Your Backend URL from Step 1>/api` (e.g. `https://modus-backend.vercel.app/api`)
6. Click **`Deploy`**.
7. Once finished, copy the frontend URL (e.g. `https://modus-app.vercel.app`).

---

## Step 3: Link Frontend to Backend (CORS Configuration)
1. Open your `modus-backend` project in Vercel.
2. Go to the **`Settings`** tab at the top.
3. Click on **`Environment Variables`** from the left-hand sidebar.
4. Find the `CLIENT_URL` variable, click **`Edit`**, update its value to your live frontend URL (e.g. `https://modus-app.vercel.app`), and click **`Save`**.
5. Go to the **`Deployments`** tab at the top, click the three dots (`...`) next to the latest deployment, and select **`Redeploy`** to restart the server with the updated configuration.

---

## Troubleshooting Vercel Logs
If you encounter a `500 Internal Server Error`:
1. Click the **`Logs`** tab in the Vercel dashboard for your project.
2. Verify you are looking at the logs for the **latest deployment**.
3. Look for red warning lines indicating database connection failures or missing parameters.
