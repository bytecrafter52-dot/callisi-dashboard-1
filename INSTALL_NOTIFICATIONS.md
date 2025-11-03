# 📧 Install Notifications Feature

## Step 1: Install Resend Package

```bash
cd "c:\lynn order\livekit-dashboard-main\livekit-dashboard-main"
npm install resend
```

## Step 2: Add Resend API Key to Vercel

1. Go to Vercel Dashboard
2. Select project: `callisi-dashboard3`
3. Settings → Environment Variables
4. Add:
   - Name: `RESEND_API_KEY`
   - Value: `re_23MTKzHf_AzkWvBMmHNRS5NDNjqxT6SfV` (existing key)

## Step 3: Redeploy

```bash
git add .
git commit -m "Add notifications system"
git push
```

Vercel will auto-deploy with new environment variable.

## Step 4: Test Notifications

The notification system is now available via:
- `lib/notifications.ts` - Email & Slack functions
- Automatically called when calls are missed
- Called when tasks are assigned

**All set!** ✅
