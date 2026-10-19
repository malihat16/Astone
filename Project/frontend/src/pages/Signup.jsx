import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material';
import { useAuth } from '../lib/contexts';
import { errorMessage } from '../lib/api';
import { validateSignup } from '../lib/validation';
import AuthShell from '../components/layout/AuthShell';
import PasswordField from '../components/PasswordField';

export default function Signup() {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [values, setValues] = useState({ first_name: '', last_name: '', email: '', phone_number: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setValues({ ...values, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = validateSignup(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setProblem('');
    try {
      await registerCustomer(values);
      navigate(state?.from || '/', { replace: true });
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (key, label, props = {}) => (
    <TextField label={label} value={values[key]} onChange={set(key)} error={Boolean(errors[key])} helperText={errors[key] || props.helperText} {...props} />
  );

  return (
    <AuthShell
      title="Create an account"
      subtitle="Track orders, save your bag across devices, and earn 10% back in points."
      width={520}
      footer={<>Already have an account? <Link component={RouterLink} to="/login" state={state}>Log in</Link></>}
    >
      <Box component="form" onSubmit={submit} noValidate sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
          {field('first_name', 'First name', { required: true, autoComplete: 'given-name' })}
          {field('last_name', 'Last name', { required: true, autoComplete: 'family-name' })}
        </Box>
        {field('email', 'Email', { required: true, type: 'email', autoComplete: 'email' })}
        <PasswordField
          label="Password"
          required
          autoComplete="new-password"
          value={values.password}
          onChange={set('password')}
          error={Boolean(errors.password)}
          helperText={errors.password || 'At least 8 characters.'}
        />
        <Typography sx={{ fontWeight: 700, mt: 1 }}>Optional</Typography>
        {field('phone_number', 'Phone number', { autoComplete: 'tel', inputMode: 'tel' })}
        {field('address', 'Delivery address', { multiline: true, minRows: 2, autoComplete: 'street-address', helperText: 'Saves time at checkout.' })}
        {problem && <Alert severity="error">{problem}</Alert>}
        <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button>
      </Box>
    </AuthShell>
  );
}
