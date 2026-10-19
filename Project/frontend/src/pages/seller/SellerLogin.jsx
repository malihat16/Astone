import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, TextField } from '@mui/material';
import { useAuth } from '../../lib/contexts';
import { errorMessage } from '../../lib/api';
import AuthShell from '../../components/layout/AuthShell';
import PasswordField from '../../components/PasswordField';

export default function SellerLogin() {
  const { loginSeller } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setProblem('');
    try {
      await loginSeller(email, password);
      navigate(state?.from || '/sellerDashboard', { replace: true });
    } catch (err) {
      setProblem(err.response?.status === 401 ? 'Wrong email or password for a seller account.' : errorMessage(err));
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Seller Centre"
      subtitle="Log in to manage your products and orders."
      footer={<>New seller? <Link component={RouterLink} to="/signupSeller">Create a seller account</Link></>}
    >
      {state?.message && <Alert severity="success" sx={{ mb: 2 }}>{state.message}</Alert>}
      <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
        <TextField label="Email" type="email" required autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="Password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {problem && <Alert severity="error">{problem}</Alert>}
        <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</Button>
        <Link component={RouterLink} to="/SellerForgotPassword" state={{ email }} sx={{ justifySelf: 'start' }}>Forgot password?</Link>
      </Box>
    </AuthShell>
  );
}
