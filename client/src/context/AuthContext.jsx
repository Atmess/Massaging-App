import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:8080'; // Adjust to your backend URL

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate session on page refresh by verifying the session cookie with the backend
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/current-user`, {
          method: 'GET',
          credentials: 'include', // Crucial: tells the browser to send cookies along!
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user || data); // Adjust based on what your backend returns
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = (userData) => {
    // Session cookie is already set by the backend response header
    setUser(userData);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const logout = async () => {
    try {
      // Call backend to destroy the session/clear the cookie
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook for clean imports in components
export const useAuth = () => useContext(AuthContext);