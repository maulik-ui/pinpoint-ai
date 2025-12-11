# Google OAuth Setup Guide for Pinpoint AI

This is a step-by-step guide to set up Google Sign-In for your Pinpoint AI application.

## Prerequisites

- A Supabase project (if you don't have one, create one at [supabase.com](https://supabase.com))
- A Google Cloud account (free tier is sufficient)

---

## Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## Step 2: Set Up Environment Variables

1. In your project root (`/web` directory), create or edit `.env.local`:

```env
# Supabase Server-side (for API routes)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Client-side (required for browser auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace `your-project-ref` and `your_anon_key_here` with your actual values from Step 1
3. **Important**: Restart your development server after adding these variables

---

## Step 3: Create Google OAuth Credentials

### 3.1. Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 3.2. Create or Select a Project

1. Click the project dropdown at the top
2. Click **"New Project"**
3. Enter a project name (e.g., "Pinpoint AI")
4. Click **"Create"**
5. Wait for the project to be created, then select it

### 3.3. Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**
   - Note: Google+ API is being deprecated, but it's still needed for OAuth. Alternatively, you can use "Google Identity Services" but Supabase uses Google+ API.

### 3.4. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: Pinpoint AI (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Save and Continue"** (no need to add scopes)
7. On the **Test users** page (if in testing mode), you can add test users or skip
8. Click **"Save and Continue"**
9. Review and click **"Back to Dashboard"**

### 3.5. Create OAuth Client ID

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Give it a name (e.g., "Pinpoint AI Web Client")
5. **Authorized JavaScript origins**:
   - Add: `http://localhost:3000` (for local development)
   - Add: `https://your-project-ref.supabase.co` (your Supabase project URL)
   - Add your production domain if you have one (e.g., `https://yourdomain.com`)
6. **Authorized redirect URIs**:
   - Add: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Replace `your-project-ref` with your actual Supabase project reference
   - **Important**: This must match exactly, including `https://` and no trailing slash
7. Click **"Create"**
8. **Copy the Client ID and Client Secret** (you'll need these in the next step)
   - ⚠️ Keep these secure! Don't commit them to version control.

---

## Step 4: Configure Google Provider in Supabase

1. Go back to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **"Google"** in the list
5. Click the toggle to **Enable** it
6. Enter your credentials:
   - **Client ID (for Google)**: Paste the Client ID from Step 3.5
   - **Client Secret (for Google)**: Paste the Client Secret from Step 3.5
7. Click **"Save"**

---

## Step 5: Test the Setup

1. Make sure your `.env.local` file has the correct values
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Open your app in the browser (usually `http://localhost:3000`)
4. Click the **"Sign In"** button in the navigation
5. Select **"Google"**
6. You should be redirected to Google's sign-in page
7. After signing in, you should be redirected back to your app
8. You should see your profile/email displayed

---

## Troubleshooting

### Issue: "Invalid redirect URI"

**Solution:**
- Check that the redirect URI in Google Cloud Console exactly matches: `https://your-project-ref.supabase.co/auth/v1/callback`
- Make sure there's no trailing slash
- Make sure you're using `https://` not `http://`
- Wait a few minutes after making changes (Google can take time to propagate)

### Issue: "Provider not enabled"

**Solution:**
- Go to Supabase Dashboard → Authentication → Providers
- Make sure Google is toggled **ON** (green)
- Make sure you've saved the Client ID and Client Secret

### Issue: "Session not persisting"

**Solution:**
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`
- Make sure you restarted your dev server after adding environment variables
- Check browser console for any errors

### Issue: "OAuth consent screen not configured"

**Solution:**
- Go back to Google Cloud Console → OAuth consent screen
- Make sure you've completed all required steps
- If you're in "Testing" mode, add your email as a test user

### Issue: "Redirect URI mismatch"

**Solution:**
- In Google Cloud Console → Credentials → Your OAuth Client
- Check "Authorized redirect URIs" includes: `https://your-project-ref.supabase.co/auth/v1/callback`
- Make sure it matches exactly (case-sensitive, no trailing slash)

---

## Production Deployment

When deploying to production:

1. **Add your production domain** to Google Cloud Console:
   - Go to Credentials → Your OAuth Client
   - Add your production domain to "Authorized JavaScript origins"
   - Example: `https://pinpointai.com`

2. **Update Supabase Site URL**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Set "Site URL" to your production domain
   - Add your production domain to "Redirect URLs"

3. **Environment Variables**:
   - Make sure your production environment has the same `.env.local` variables
   - Use your hosting provider's environment variable settings (Vercel, Netlify, etc.)

---

## Security Best Practices

1. ✅ Never commit `.env.local` to version control (it's already in `.gitignore`)
2. ✅ Keep your Client Secret secure
3. ✅ Use environment variables for all sensitive data
4. ✅ Regularly rotate your OAuth credentials
5. ✅ Monitor OAuth usage in Google Cloud Console

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Dashboard](https://app.supabase.com)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Quick Checklist

- [ ] Supabase project created
- [ ] Environment variables set in `.env.local`
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth Client ID created
- [ ] Redirect URI added: `https://your-project-ref.supabase.co/auth/v1/callback`
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] Tested sign-in flow locally
- [ ] Production domain configured (if deploying)

---

**Need Help?** Check the troubleshooting section above or refer to the Supabase and Google Cloud documentation.


