import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext(null);

const TOKEN_KEY = '@exitcheck_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then((stored) => {
      if (stored) setToken(stored);
      setLoading(false);
    });
  }, []);

  const saveToken = async (newToken) => {
    setToken(newToken);
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    await saveToken(res.data.token);
    return res.data;
  };

  const register = async (email, password, name) => {
    const res = await axios.post(`${API_URL}/auth/register`, { email, password, name });
    await saveToken(res.data.token);
    return res.data;
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
