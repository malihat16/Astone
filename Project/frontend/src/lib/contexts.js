import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);
export const CartContext = createContext(null);
export const ToastContext = createContext(null);

function useRequired(context, name) {
  const value = useContext(context);
  if (!value) throw new Error(`${name} must be used inside its provider`);
  return value;
}

export const useAuth = () => useRequired(AuthContext, 'useAuth');
export const useCart = () => useRequired(CartContext, 'useCart');
export const useToast = () => useRequired(ToastContext, 'useToast');
