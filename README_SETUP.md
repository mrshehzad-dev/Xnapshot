# X (Twitter) OAuth 2.0 Setup Instructions

## Setting Up Your X Application for OAuth 2.0

Follow these steps to configure your X application to work with this analytics dashboard:

### 1. Get Your X OAuth 2.0 Credentials

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your X (Twitter) account
3. Create a new app or select your existing app
4. Navigate to the "Keys and Tokens" tab
5. Under "OAuth 2.0 Client ID and Client Secret", copy:
   - **Client ID**
   - **Client Secret**

### 2. Configure Your .env File

Create a `.env` file in the root directory and add your credentials:

```env
X_CLIENT_ID=NGJsYXdkNDVjanV4ZEhOM05IUWY6MTpjaQ
X_CLIENT_SECRET=Fxgqyc3K-M7R9J6kL4nCyYV3RYnLP6jsKErkp33B5dcrrCAC5y
X_CALLBACK_URL=http://localhost:5173/callback
NODE_ENV=development
```

### 3. Configure Your X Application Settings

In your X Developer Portal, ensure:

1. **App Type**: Set to "Web App, Automated App or Bot"
2. **App Permissions**: Set to "Read" (minimum required)
3. **Callback URLs**: Add exactly `http://localhost:5173/callback`
4. **Website URL**: Can be `http://localhost:5173`
5. **OAuth 2.0 Settings**: 
   - Enable "OAuth 2.0" in your app settings
   - Set "Type of App" to "Web App"

### 4. OAuth 2.0 Scopes

This application requests the following scopes:
- `tweet.read` - Read tweets
- `users.read` - Read user profile information
- `offline.access` - Maintain access when user is offline

### 5. Testing the Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:5173`
3. Click "Connect with X"
4. You should be redirected to X for authorization
5. After authorizing, you'll be redirected back to your app

### 6. Common Issues and Solutions

**Authorization Error:**
- Double-check your Client ID and Client Secret
- Ensure callback URL matches exactly: `http://localhost:5173/callback`
- Verify your app has OAuth 2.0 enabled

**Scope Errors:**
- Make sure your app has the required permissions
- Check that you've enabled the necessary scopes in your app settings

**Callback Issues:**
- Callback URL must match exactly (no trailing slashes)
- Ensure your app is configured as a "Web App"

### 7. Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret secure
- Use environment variables in production
- Regularly rotate your credentials for security

### 8. Differences from OAuth 1.0a

This application now uses OAuth 2.0 instead of OAuth 1.0a:
- Uses Client ID/Secret instead of API Key/Secret
- Implements PKCE (Proof Key for Code Exchange) for security
- Uses Bearer tokens instead of signed requests
- Simpler authentication flow

If you continue to experience issues after following these steps, check the server console for detailed error messages and ensure your X Developer account is in good standing.