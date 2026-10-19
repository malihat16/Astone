import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, TextField } from '@mui/material';
import { useAuth } from '../lib/contexts';
import { errorMessage } from '../lib/api';
import AuthShell from '../components/layout/AuthShell';
import PasswordField from '../components/PasswordField';

export default function Login() {
  const { loginCustomer } = useAuth();
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
      await loginCustomer(email, password);
      navigate(state?.from || '/', { replace: true });
    } catch (err) {
      setProblem(errorMessage(err, 'Wrong email or password.'));
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back. Your bag and points are waiting."
      footer={<>New to Astoné? <Link component={RouterLink} to="/signup" state={state}>Create an account</Link></>}
    >
      {state?.reason && <Alert severity="info" sx={{ mb: 2 }}>{state.reason}</Alert>}
      {state?.message && <Alert severity="success" sx={{ mb: 2 }}>{state.message}</Alert>}
      <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
        <TextField label="Email" type="email" required autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="Password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {problem && <Alert severity="error">{problem}</Alert>}
        <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</Button>
        <Link component={RouterLink} to="/ForgotPassword" state={{ email }} sx={{ justifySelf: 'start' }}>Forgot password?</Link>
      </Box>
    </AuthShell>
  );
}
