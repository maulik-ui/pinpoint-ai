# Authentication Setup Guide

This guide explains how to set up Google and Apple OAuth authentication for Pinpoint AI.

## Prerequisites

1. Supabase project with authentication enabled
2. Google OAuth credentials
3. Apple OAuth credentials (for Apple Sign-In)

## Environment Variables

Add these to your `.env.local` file:

```env
# Supabase (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Public Supabase variables (required for client-side auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Configuration

### 1. Enable OAuth Providers in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** and **Apple** providers

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
5. Configure:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`
6. Copy the **Client ID** and **Client Secret**
7. Paste them into Supabase Dashboard under Google provider settings

### 3. Configure Apple OAuth

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a new App ID and Service ID
3. Configure Sign in with Apple:
   - Add your domain and return URLs
   - Return URL: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Create a Key for Sign in with Apple
5. Copy the **Service ID**, **Team ID**, **Key ID**, and **Private Key**
6. Paste them into Supabase Dashboard under Apple provider settings

## How It Works

1. **Sign In Flow**:
   - User clicks "Sign In" button
   - Selects Google or Apple
   - Redirected to OAuth provider
   - After authentication, redirected back to `/api/auth/callback`
   - Session is created and user is logged in

2. **Components**:
   - `AuthButton`: Main component that shows sign-in button or user profile
   - `SignInButton`: Dropdown with Google and Apple sign-in options
   - `UserProfile`: Shows user info and sign-out option when logged in

3. **API Routes**:
   - `/api/auth/callback`: Handles OAuth callback
   - `/api/auth/signout`: Handles user sign-out
   - `/api/auth/user`: Gets current user session

## Testing

1. Start your development server: `npm run dev`
2. Click "Sign In" in the navigation
3. Select Google or Apple
4. Complete the OAuth flow
5. You should be redirected back and see your profile

## Troubleshooting

- **"Invalid redirect URI"**: Make sure the redirect URI in your OAuth provider matches exactly what's configured in Supabase
- **"Provider not enabled"**: Check that Google/Apple providers are enabled in Supabase Dashboard
- **Session not persisting**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly

