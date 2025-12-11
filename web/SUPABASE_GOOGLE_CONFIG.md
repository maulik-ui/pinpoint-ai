# How to Configure Google OAuth in Supabase

This guide walks you through configuring Google OAuth in your Supabase Dashboard.

## Prerequisites

Before starting, make sure you have:
- ✅ Your Google OAuth **Client ID** (from Google Cloud Console)
- ✅ Your Google OAuth **Client Secret** (from Google Cloud Console)
- ✅ Access to your Supabase Dashboard

---

## Step-by-Step Instructions

### Step 1: Access Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in with your Supabase account
3. Select your project (or create a new one if you don't have one)

### Step 2: Navigate to Authentication Settings

1. In the left sidebar, click on **"Authentication"**
2. You'll see a submenu appear
3. Click on **"Providers"** (it's usually the second option)

### Step 3: Find Google Provider

1. You'll see a list of authentication providers (Email, Google, Apple, GitHub, etc.)
2. Scroll down or look for **"Google"** in the list
3. You'll see a toggle switch next to it (currently OFF/gray)

### Step 4: Enable Google Provider

1. Click the **toggle switch** next to "Google" to turn it ON
   - The switch should turn green/blue when enabled
2. A form will appear below with fields to fill in

### Step 5: Enter Google OAuth Credentials

You'll see two fields:

#### Field 1: Client ID (for Google)
- **Label**: "Client ID (for Google)" or "Client ID"
- **What to enter**: Paste your Google OAuth Client ID here
  - This is the long string you copied from Google Cloud Console
  - Example format: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

#### Field 2: Client Secret (for Google)
- **Label**: "Client Secret (for Google)" or "Client Secret"
- **What to enter**: Paste your Google OAuth Client Secret here
  - This is the secret string you copied from Google Cloud Console
  - Example format: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

### Step 6: Save Configuration

1. After entering both credentials, look for a **"Save"** button
   - Usually at the bottom of the form
   - Or in the top-right corner of the provider card
2. Click **"Save"**
3. You should see a success message or the form will close

### Step 7: Verify Configuration

1. The Google provider toggle should remain **ON** (green/blue)
2. You should see your Client ID displayed (partially masked for security)
3. The status should show as "Enabled" or "Active"

---

## Visual Guide (What You'll See)

```
Supabase Dashboard
├── Left Sidebar
│   ├── Authentication ← Click here
│   │   ├── Users
│   │   ├── Providers ← Click here
│   │   ├── Policies
│   │   └── ...
│
└── Main Content Area
    └── Providers List
        ├── Email (Enabled)
        ├── Google ← Find this one
        │   ├── Toggle: [OFF] ← Turn ON
        │   └── Form appears:
        │       ├── Client ID: [paste here]
        │       ├── Client Secret: [paste here]
        │       └── [Save] button
        ├── Apple
        └── ...
```

---

## Common Issues & Solutions

### Issue: "Toggle won't turn on"
**Solution**: Make sure you've entered both Client ID and Client Secret before trying to save.

### Issue: "Invalid credentials" error
**Solution**: 
- Double-check that you copied the Client ID and Client Secret correctly
- Make sure there are no extra spaces before/after
- Verify the credentials are from the correct Google Cloud project

### Issue: "Can't find Providers section"
**Solution**:
- Make sure you're in the correct project
- Check that you have admin/owner permissions
- Try refreshing the page

### Issue: "Save button doesn't work"
**Solution**:
- Make sure both fields are filled
- Check your internet connection
- Try refreshing and re-entering the credentials

---

## What Happens After Configuration

Once configured:
1. ✅ Users can sign in with Google
2. ✅ The OAuth flow redirects through Supabase
3. ✅ User sessions are managed by Supabase
4. ✅ User data is stored in Supabase's `auth.users` table

---

## Testing Your Configuration

After saving:

1. Go to your app (e.g., `http://localhost:3000`)
2. Click "Sign In"
3. Select "Google"
4. You should be redirected to Google's sign-in page
5. After signing in, you'll be redirected back to your app
6. You should see your profile/email displayed

If this works, your configuration is successful! 🎉

---

## Security Notes

- ✅ Never share your Client Secret publicly
- ✅ Keep your Supabase dashboard credentials secure
- ✅ Regularly rotate your OAuth credentials
- ✅ Monitor authentication logs in Supabase Dashboard → Authentication → Logs

---

## Need Help?

If you're stuck:
1. Check that your Google OAuth redirect URI matches: `https://your-project-ref.supabase.co/auth/v1/callback`
2. Verify your Google Cloud Console credentials are correct
3. Check Supabase Dashboard → Authentication → Logs for error messages
4. Make sure your environment variables are set correctly

---

## Quick Checklist

- [ ] Logged into Supabase Dashboard
- [ ] Navigated to Authentication → Providers
- [ ] Found Google provider
- [ ] Toggled Google provider ON
- [ ] Entered Client ID
- [ ] Entered Client Secret
- [ ] Clicked Save
- [ ] Verified toggle is still ON
- [ ] Tested sign-in flow

---

**That's it!** Your Google OAuth is now configured in Supabase. Users can now sign in with their Google accounts.


