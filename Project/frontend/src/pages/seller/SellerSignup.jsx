import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, MenuItem, TextField, Typography } from '@mui/material';
import { errorMessage } from '../../lib/api';
import { isEmail, isPhone } from '../../lib/validation';
import { registerSeller } from '../../services/seller';
import AuthShell from '../../components/layout/AuthShell';
import PasswordField from '../../components/PasswordField';

export default function SellerSignup() {
  const navigate = useNavigate();
  const [v, setV] = useState({ firstName: '', lastName: '', email: '', shopName: '', gender: '', phone: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setV({ ...v, [key]: e.target.value });

  const validate = () => {
    const e = {};
    if (!v.firstName.trim()) e.firstName = 'Enter your first name.';
    if (!v.lastName.trim()) e.lastName = 'Enter your last name.';
    if (!isEmail(v.email)) e.email = 'Enter an email address like name@example.com.';
    if (!v.shopName.trim()) e.shopName = 'Give your shop a name.';
    if (!isPhone(v.phone)) e.phone = 'Enter a phone number with 7 to 15 digits.';
    if (v.password.length < 8) e.password = 'Use at least 8 characters.';
    return e;
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setProblem('');
    try {
      await registerSeller({
        user: { username: v.email, email: v.email, first_name: v.firstName, last_name: v.lastName, password: v.password },
        gender: v.gender || 'other',
        phone_number: v.phone.replace(/\D/g, ''),
        address: v.address,
        shop_name: v.shopName,
      });
      navigate('/loginSeller', { state: { message: 'Your seller account is ready. Log in to add your first product.' } });
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (key, label, props = {}) => (
    <TextField label={label} value={v[key]} onChange={set(key)} error={Boolean(errors[key])} helperText={errors[key] || props.helperText} {...props} />
  );

  return (
    <AuthShell
      title="Open your shop"
      subtitle="Create a seller account to list products on Astoné."
      width={560}
      footer={<>Already selling? <Link component={RouterLink} to="/loginSeller">Log in</Link></>}
    >
      <Box component="form" onSubmit={submit} noValidate sx={{ display: 'grid', gap: 2 }}>
        {field('shopName', 'Shop name', { required: true, helperText: 'Shown to shoppers. You can change it later.' })}
        <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
          {field('firstName', 'First name', { required: true, autoComplete: 'given-name' })}
          {field('lastName', 'Last name', { required: true, autoComplete: 'family-name' })}
        </Box>
        {field('email', 'Email', { required: true, type: 'email', autoComplete: 'email', helperText: 'You will log in with this.' })}
        {field('phone', 'Phone number', { required: true, autoComplete: 'tel', inputMode: 'tel' })}
        <TextField select label="Gender" value={v.gender} onChange={set('gender')}>
          <MenuItem value="">Prefer not to say</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>
        {field('address', 'Business address', { multiline: true, minRows: 2, autoComplete: 'street-address' })}
        <PasswordField label="Password" required autoComplete="new-password" value={v.password} onChange={set('password')} error={Boolean(errors.password)} helperText={errors.password || 'At least 8 characters.'} />
        {problem && <Alert severity="error">{problem}</Alert>}
        <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Creating shop…' : 'Create seller account'}</Button>
        <Typography variant="body2" color="text.secondary">
          By creating an account you agree to our <Link component={RouterLink} to="/privacyPolicy">privacy policy</Link>.
        </Typography>
      </Box>
    </AuthShell>
  );
}
