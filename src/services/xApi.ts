// X API Service for OAuth 2.0
export interface XUser {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
}

export interface XTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
}

class XApiService {
  private baseUrl = '/api';
  private readonly ACCESS_TOKEN_KEY = 'x_access_token';
  private readonly REFRESH_TOKEN_KEY = 'x_refresh_token';
  private readonly TOKEN_EXPIRES_KEY = 'x_token_expires';
  private readonly USER_ID_KEY = 'x_user_id';

  // Check if user is authenticated by verifying stored tokens
  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    
    if (!accessToken) return false;
    
    // Check if token is expired
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      this.logout(); // Clear expired tokens
      return false;
    }
    
    return true;
  }

  // Store authentication tokens
  private storeTokens(data: { 
    access_token: string; 
    refresh_token?: string; 
    expires_in?: number;
    user_id?: string;
  }): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, data.access_token);
    
    if (data.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refresh_token);
    }
    
    if (data.expires_in) {
      const expiresAt = Date.now() + (data.expires_in * 1000);
      localStorage.setItem(this.TOKEN_EXPIRES_KEY, expiresAt.toString());
    }
    
    if (data.user_id) {
      localStorage.setItem(this.USER_ID_KEY, data.user_id);
    }
  }

  // Get stored access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Clear all stored authentication data
  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
  }

  // Get authorization URL
  async getAuthUrl(): Promise<{ auth_url: string; state: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/twitter/auth-url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Auth URL Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        throw new Error(
          errorData.error || 
          `Failed to get authorization URL with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to get authorization URL')) {
        throw error;
      }
      
      console.error('Network or unexpected error:', error);
      throw new Error('Unable to connect to authentication service. Please check your internet connection and try again.');
    }
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, state: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/twitter/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Token exchange error:', errorData);
        throw new Error(errorData.error || 'Failed to exchange authorization code');
      }

      const tokenData = await response.json();
      
      // Store the tokens for future use
      this.storeTokens(tokenData);
      
      return tokenData;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to exchange authorization code')) {
        throw error;
      }
      console.error('Token exchange network error:', error);
      throw new Error('Unable to complete authentication. Please try again.');
    }
  }

  // Get current user data
  async getCurrentUser(): Promise<XUser> {
    try {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${this.baseUrl}/twitter/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('User data error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch user data');
      }

      const userData = await response.json();
      return userData.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch user data')) {
        throw error;
      }
      console.error('User data network error:', error);
      throw new Error('Unable to fetch user profile. Please try again.');
    }
  }

  // Get today's tweets for a user
  async getTodaysTweets(userId: string): Promise<{ tweets: XTweet[]; users: XUser[] }> {
    try {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const params = new URLSearchParams({
        user_id: userId,
        start_time: startOfDay.toISOString(),
        end_time: endOfDay.toISOString(),
        max_results: '10'
      });

      const response = await fetch(`${this.baseUrl}/twitter/tweets?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Tweets error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch tweets');
      }

      const tweetsData = await response.json();
      return {
        tweets: tweetsData.data || [],
        users: tweetsData.includes?.users || []
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch tweets')) {
        throw error;
      }
      console.error('Tweets network error:', error);
      throw new Error('Unable to fetch tweets. Please try again.');
    }
  }
}

export const xApiService = new XApiService();