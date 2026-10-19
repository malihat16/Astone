import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Link } from '@mui/material';
import { errorMessage } from '../lib/api';
import { resetPassword } from '../services/customer';
import { resetSellerPassword } from '../services/seller';
import AuthShell from '../components/layout/AuthShell';
import PasswordField from '../components/PasswordField';

/** Landing page for the emailed reset link: /ChangePassword/:token or /SellerChangePassword/:token */
export default function ResetPassword({ seller = false }) {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setProblem('Use at least 8 characters.');
    if (password !== confirm) return setProblem("The two passwords don't match.");
    setBusy(true);
    setProblem('');
    try {
      const res = await (seller ? resetSellerPassword : resetPassword)(token, password);
      navigate(seller ? '/loginSeller' : '/login', { replace: true, state: { message: res.detail } });
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <AuthShell
      title="Choose a new password"
      footer={<Link component={RouterLink} to={seller ? '/SellerForgotPassword' : '/ForgotPassword'}>Need a new link?</Link>}
    >
      <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
        <PasswordField label="New password" required autoFocus autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} helperText="At least 8 characters." />
        <PasswordField label="Confirm new password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {problem && <Alert severity="error">{problem}</Alert>}
        <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</Button>
      </Box>
    </AuthShell>
  );
}
