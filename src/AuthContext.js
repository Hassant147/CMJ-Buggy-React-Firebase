// In AuthContext.js or wherever your AuthProvider is defined

import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth } from './firebase'; // Adjust this path as needed

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        // console.log(`Logged in as: ${user.email}`);
      }
      setLoading(false);
    });
  
    return unsubscribe;
  }, []);
  

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
