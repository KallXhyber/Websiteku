// context/AuthContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Data dari Firebase Auth
  const [userData, setUserData] = useState(null); // Data dari Firestore (termasuk role & status)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = { user, userData, loading };

  return React.createElement(AuthContext.Provider, { value: value },
    !loading && children
  );
};

// Hook custom untuk mempermudah pemanggilan
export const useAuth = () => {
  return useContext(AuthContext);
};