import { useState, useEffect } from 'react';
import { xApiService } from '../services/xApi';

export const useXAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(xApiService.isAuthenticated());
  }, []);

  const login = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting OAuth 2.0 login process...');
      
      const authData = await xApiService.getAuthUrl();
      console.log('Authorization URL generated successfully');
      
      sessionStorage.setItem('oauth_state', authData.state);
      console.log('State stored in session storage:', authData.state);
      
      window.location.href = authData.auth_url;
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      let errorMessage = 'Failed to initiate X authentication';
      
      if (err.message.includes('Failed to get authorization URL')) {
        errorMessage = 'Unable to generate authorization URL. Please check your X API credentials.';
      } else if (err.response?.data?.details) {
        errorMessage = err.response.data.details;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Handling OAuth 2.0 callback...');
      console.log('Authorization code received:', code.substring(0, 20) + '...');
      console.log('State from URL:', state);
      
      const storedState = sessionStorage.getItem('oauth_state');
      console.log('Stored state:', storedState);
      
      if (!storedState || storedState !== state) {
        throw new Error('Invalid state parameter. Please try logging in again.');
      }
      
      console.log('State validation successful');

      const tokenData = await xApiService.exchangeCodeForToken(code, state);
      console.log('Token exchange successful');
      
      sessionStorage.removeItem('oauth_state');
      
      console.log('OAuth 2.0 flow completed successfully');
      setIsAuthenticated(true);
      
    } catch (err: any) {
      console.error('Callback error:', err);
      let errorMessage = 'Failed to complete X authentication';
      
      if (err.response?.data?.details) {
        errorMessage = err.response.data.details;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    xApiService.logout();
    sessionStorage.removeItem('oauth_state');
    setIsAuthenticated(false);
    setError(null);
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    handleCallback,
  };
};