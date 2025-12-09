import { Navigate } from 'react-router-dom';
import { apiClient, setUnauthorizedHandler } from '@/services/api';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      apiClient.setToken(token);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    // Set up unauthorized handler
    setUnauthorizedHandler(() => {
      setIsAuthenticated(false);
    });
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

