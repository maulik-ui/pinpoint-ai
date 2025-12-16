# Vercel + GitHub Integration Guide

## Quick Setup Steps

### 1. Connect GitHub Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (or create an account)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository: `maulik-ui/pinpoint-ai`
5. If prompted, authorize Vercel to access your GitHub repositories

### 2. Configure Project Settings

Since your Next.js app is in the `web` subdirectory:

1. In the **"Configure Project"** screen:
   - **Framework Preset**: Should auto-detect as "Next.js"
   - **Root Directory**: Set to `web` (click "Edit" and select `web` folder)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### 3. Set Environment Variables

Add all your environment variables from `.env.local`:

1. In the project settings, go to **"Environment Variables"**
2. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (if used)
   - Any other environment variables your app needs

**Important**: Make sure to add them for all environments:
- Production
- Preview
- Development

### 4. Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build your Next.js app
   - Deploy it to a production URL

### 5. Automatic Deployments

Once connected, Vercel will automatically:
- **Deploy to Production**: When you push to `main` or `master` branch
- **Create Preview Deployments**: For every pull request
- **Redeploy**: On every push to any branch

## Project Structure

Your project structure:
```
Pinpoint/
├── web/              ← Next.js app (this is the root directory for Vercel)
│   ├── app/
│   ├── src/
│   ├── package.json
│   └── vercel.json
└── ...
```

## Environment Variables Checklist

Make sure to add these in Vercel dashboard:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_URL` (if different from public)
- [ ] `SUPABASE_ANON_KEY` (if different from public)
- [ ] `OPENAI_API_KEY` (if using AI features)
- [ ] Any other API keys or secrets

## Troubleshooting

### Build Fails
- Check that **Root Directory** is set to `web`
- Verify all environment variables are set
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Make sure variables are added for the correct environment (Production/Preview/Development)
- Restart deployment after adding new variables
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser

### Database Connection Issues
- Verify Supabase URLs and keys are correct
- Check Supabase project settings for allowed origins
- Add your Vercel domain to Supabase allowed origins

## Next Steps After Deployment

1. **Custom Domain**: Add your custom domain in Vercel project settings
2. **Analytics**: Enable Vercel Analytics if needed
3. **Monitoring**: Set up error tracking and monitoring
4. **CI/CD**: Your GitHub integration is now complete - every push will deploy!

## Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

