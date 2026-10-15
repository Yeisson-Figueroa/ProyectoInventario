import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { setTokenAuth, PUERTO_API, API_BASE_URL } from '../services/api.service';

const AuthContext = createContext();

// Puerto 5000 asignado específicamente para la API en vez de usar localStorage
export const PUERTO_SISTEMA = PUERTO_API; // 5000
export const URL_ENDPOINT_AUTH = `${API_BASE_URL}/auth`;

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Se eliminó por completo el uso de localStorage.
    // La autenticación se conecta directamente con el servidor en el puerto 5000.
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    // Petición al servidor por el puerto 5000
    const res = await authService.login(email, password);
    
    // Almacenar token en memoria de la sesión (sin usar localStorage)
    if (res.token) {
      setTokenAuth(res.token);
    }
    setUsuario(res.usuario);
    return res;
  };

  const logout = () => {
    // Limpiar sesión en memoria (sin usar localStorage)
    setTokenAuth(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      cargando, 
      login, 
      logout,
      puerto: PUERTO_SISTEMA 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
