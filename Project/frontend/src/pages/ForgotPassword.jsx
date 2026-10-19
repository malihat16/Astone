import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Alert, Box, Button, Link, TextField } from '@mui/material';
import { errorMessage } from '../lib/api';
import { requestPasswordReset } from '../services/customer';
import { requestSellerPasswordReset } from '../services/seller';
import AuthShell from '../components/layout/AuthShell';

/** Used for both shoppers and sellers; `seller` switches which account type gets the email. */
export default function ForgotPassword({ seller = false }) {
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || '');
  const [sent, setSent] = useState('');
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setProblem('');
    try {
      const res = await (seller ? requestSellerPasswordReset : requestPasswordReset)(email);
      setSent(res.detail || 'Check your inbox for a reset link.');
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle={`Enter the email you use for your ${seller ? 'seller' : 'Astoné'} account and we'll send you a link to choose a new password.`}
      footer={<Link component={RouterLink} to={seller ? '/loginSeller' : '/login'}>Back to log in</Link>}
    >
      {sent ? (
        <Alert severity="success">{sent} The link works for 24 hours.</Alert>
      ) : (
        <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Email" type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {problem && <Alert severity="error">{problem}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</Button>
        </Box>
      )}
    </AuthShell>
  );
}
