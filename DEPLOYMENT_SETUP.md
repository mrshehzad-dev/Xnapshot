# Deployment Setup Instructions

## 1. Set up Supabase Environment Variables

Your X OAuth is failing because the environment variables are not configured in Supabase. You need to set these in your Supabase project:

### Go to your Supabase Dashboard:
1. Visit [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Go to **Settings** → **Edge Functions**
4. Add the following environment variables:

```
X_CLIENT_ID=your_x_client_id_here
X_CLIENT_SECRET=your_x_client_secret_here
```

### Get your X API credentials:
1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your X account
3. Create a new app or select your existing app
4. Navigate to the "Keys and Tokens" tab
5. Under "OAuth 2.0 Client ID and Client Secret", copy:
   - **Client ID** → Use as `X_CLIENT_ID`
   - **Client Secret** → Use as `X_CLIENT_SECRET`

### Configure your X App settings:
1. In your X Developer Portal, go to your app settings
2. Set **App Type** to "Web App, Automated App or Bot"
3. Set **App Permissions** to "Read" (minimum required)
4. Add callback URL: `https://bejewelled-cobbler-4b37c8.netlify.app/callback`
5. Set **Website URL** to: `https://bejewelled-cobbler-4b37c8.netlify.app`
6. Enable "OAuth 2.0" in your app settings
7. Set "Type of App" to "Web App"

## 2. Update Supabase Environment Variables

After getting your X API credentials:

1. In Supabase Dashboard → Settings → Edge Functions
2. Add these environment variables:
   ```
   X_CLIENT_ID=your_actual_client_id_from_x_developer_portal
   X_CLIENT_SECRET=your_actual_client_secret_from_x_developer_portal
   ```

## 3. Test the OAuth Flow

After setting the environment variables:
1. Wait a few minutes for the changes to propagate
2. Try the X connection flow again
3. The authorization URL should now include your client_id

## Common Issues:

- **Empty client_id**: Environment variables not set in Supabase
- **Invalid redirect_uri**: Callback URL doesn't match X app settings
- **App not approved**: X app needs to be approved for OAuth 2.0

## Verification:

You can verify the setup is working by checking that the authorization URL includes your client_id:
```
https://twitter.com/i/oauth2/authorize?response_type=code&client_id=YOUR_ACTUAL_CLIENT_ID&redirect_uri=...
```

The client_id should not be empty.