import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Crear el Proveedor del Contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Efecto para cargar el usuario si ya existe un token al iniciar la app
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        setUser(decodedUser);
        setToken(storedToken);
      } catch (error) {
        // Si el token es inválido, lo limpiamos
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Función para iniciar sesión
  const login = (newToken) => {
    const decodedUser = jwtDecode(newToken);
    localStorage.setItem('token', newToken);
    setUser(decodedUser);
    setToken(newToken);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };
  
  // Valor que se compartirá con los componentes hijos
  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token, // Un booleano para saber si está autenticado
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};