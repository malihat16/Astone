import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/contexts';

/** Sends people to the right login page, then back to where they were going. */
export default function RequireAuth({ role, children }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.role !== role) {
    const login = role === 'seller' ? '/loginSeller' : '/login';
    return <Navigate to={login} replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}
