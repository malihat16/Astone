import { useCallback, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../lib/contexts';
import { session } from '../../lib/session';
import { SESSION_EXPIRED_EVENT } from '../../lib/api';
import * as customerApi from '../../services/customer';
import * as sellerApi from '../../services/seller';

function sellerIdFromToken(token) {
  try {
    return jwtDecode(token).seller_id ?? null;
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [role, setRole] = useState(() => (session.access ? session.role : null));
  const [customer, setCustomer] = useState(null);

  const refreshCustomer = useCallback(async () => {
    const me = await customerApi.getMe();
    setCustomer(me);
    return me;
  }, []);

  useEffect(() => {
    if (role === 'customer') refreshCustomer().catch(() => {});
  }, [role, refreshCustomer]);

  useEffect(() => {
    const onExpired = () => {
      setRole(null);
      setCustomer(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const startSession = useCallback((tokens, newRole) => {
    session.clear();
    session.save({ access: tokens.access, refresh: tokens.refresh, role: newRole });
    setRole(newRole);
  }, []);

  const loginCustomer = useCallback(
    async (email, password) => {
      const data = await customerApi.login(email, password);
      startSession(data, 'customer');
      setCustomer(data.user);
      return data.user;
    },
    [startSession],
  );

  const registerCustomer = useCallback(
    async (details) => {
      const data = await customerApi.register(details);
      startSession(data, 'customer');
      setCustomer(data.user);
      return data.user;
    },
    [startSession],
  );

  const loginSeller = useCallback(
    async (email, password) => {
      const data = await sellerApi.loginSeller(email, password);
      startSession(data, 'seller');
    },
    [startSession],
  );

  const logout = useCallback(() => {
    session.clear();
    setRole(null);
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({
      role,
      isCustomer: role === 'customer',
      isSeller: role === 'seller',
      customer,
      sellerId: role === 'seller' ? sellerIdFromToken(session.access) : null,
      setCustomer,
      refreshCustomer,
      loginCustomer,
      registerCustomer,
      loginSeller,
      logout,
    }),
    [role, customer, refreshCustomer, loginCustomer, registerCustomer, loginSeller, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
