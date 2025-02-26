// feelio/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { fetchUserData } from "../api/users";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await fetchUserData();
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login: (userData) => setUser(userData),
    logout: () => {
      localStorage.removeItem("token");
      setUser(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
