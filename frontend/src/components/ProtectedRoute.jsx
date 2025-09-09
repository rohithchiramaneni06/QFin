import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import authService from '../services/authService';

/**
 * A wrapper component that redirects to the login page if the user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      
      // Check if token is expired
      if (authenticated) {
        try {
          // Get token expiration time
          const token = localStorage.getItem('token');
          if (token) {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
            
            if (Date.now() >= expirationTime) {
              console.log('Token expired, redirecting to login');
              setIsExpired(true);
              setIsAuthenticated(false);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            } else {
              setIsAuthenticated(true);
            }
          }
        } catch (error) {
          console.error('Error checking token expiration:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a8a]"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated with session=expired parameter if token expired
    return <Navigate to={isExpired ? "/login?session=expired" : "/login"} replace />;
  }
  
  // Render the protected component if authenticated
  return children;
};

export default ProtectedRoute;