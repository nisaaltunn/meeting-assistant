
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from 'react';
  
  import * as SecureStore from 'expo-secure-store';
  
  import {
    login as loginRequest,
    register as registerRequest,
    LoginData,
    RegisterData,
    AuthResponse,
  } from '../services/authService';
  
  interface AuthContextType {
    user: AuthResponse | null;
    isLoading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    // Uygulama açıldığında kayıtlı oturumu kontrol et
    useEffect(() => {
      restoreSession();
    }, []);
  
    const restoreSession = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync('user');
  
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Oturum yükleme hatası:', error);
        await SecureStore.deleteItemAsync('user');
      } finally {
        setIsLoading(false);
      }
    };
  
    // Giriş yap
    const login = async (data: LoginData) => {
      const response = await loginRequest(data);
  
      await SecureStore.setItemAsync('user', JSON.stringify(response));
      setUser(response);
    };
  
    // Kayıt ol
    const register = async (data: RegisterData) => {
      const response = await registerRequest(data);
  
      await SecureStore.setItemAsync('user', JSON.stringify(response));
      setUser(response);
    };
  
    // Çıkış yap
    const logout = async () => {
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    };
  
    return (
      <AuthContext.Provider
        value={{
          user,
          isLoading,
          login,
          register,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error('useAuth, AuthProvider içerisinde kullanılmalıdır.');
    }
  
    return context;
  }
  