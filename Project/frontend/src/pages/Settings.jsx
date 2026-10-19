import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, MenuItem, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useAuth, useToast } from '../lib/contexts';
import { errorMessage } from '../lib/api';
import { updateMe } from '../services/customer';
import PageContainer from '../components/layout/PageContainer';
import PageLoader from '../components/states/PageLoader';

const FIELDS = ['first_name', 'last_name', 'gender', 'phone_number', 'address'];

function ProfileForm({ customer, onSaved }) {
  const [values, setValues] = useState(() => Object.fromEntries(FIELDS.map((f) => [f, customer[f] || ''])));
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState('');
  const set = (key) => (e) => setValues({ ...values, [key]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProblem('');
    try {
      onSaved(await updateMe(values));
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={save} sx={{ display: 'grid', gap: 2, maxWidth: 560 }}>
      <TextField label="Email" value={customer.email} disabled helperText="Contact support to change your email." />
      <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
        <TextField label="First name" value={values.first_name} onChange={set('first_name')} autoComplete="given-name" />
        <TextField label="Last name" value={values.last_name} onChange={set('last_name')} autoComplete="family-name" />
      </Box>
      <TextField select label="Gender" value={values.gender} onChange={set('gender')}>
        <MenuItem value="">Prefer not to say</MenuItem>
        <MenuItem value="female">Female</MenuItem>
        <MenuItem value="male">Male</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </TextField>
      <TextField label="Phone number" value={values.phone_number} onChange={set('phone_number')} autoComplete="tel" />
      <TextField label="Delivery address" multiline minRows={3} value={values.address} onChange={set('address')} helperText="Used to fill in checkout." autoComplete="street-address" />
      {problem && <Alert severity="error">{problem}</Alert>}
      <Box><Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button></Box>
    </Box>
  );
}

export default function Settings() {
  const { customer, setCustomer } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('profile');

  if (!customer) return <PageLoader />;

  return (
    <PageContainer narrow sx={{ pt: { xs: 4, md: 6 } }}>
      <Typography variant="h1">Account settings</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        You have <strong>{customer.points}</strong> points, worth RM {customer.points} off your next order.
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="profile" label="Profile" />
        <Tab value="security" label="Password & privacy" />
      </Tabs>

      {tab === 'profile' && (
        <ProfileForm
          customer={customer}
          onSaved={(updated) => {
            setCustomer(updated);
            toast.success('Profile saved');
          }}
        />
      )}

      {tab === 'security' && (
        <Box sx={{ display: 'grid', gap: 4, maxWidth: 560 }}>
          <div>
            <Typography variant="h4" component="h2" gutterBottom>Change your password</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>We&apos;ll email you a secure link to set a new password.</Typography>
            <Button component={RouterLink} to="/ForgotPassword" state={{ email: customer.email }} variant="outlined">Send reset link</Button>
          </div>
          <div>
            <Typography variant="h4" component="h2" gutterBottom>Delete your account</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Under Malaysia&apos;s PDPA you can ask us to delete your personal data. Email us from your account address and we&apos;ll confirm within 7 days.
            </Typography>
            <Button href={`mailto:support@astone.com?subject=${encodeURIComponent('Account deletion request')}&body=${encodeURIComponent(`Please delete the account for ${customer.email}.`)}`} variant="outlined" color="error">
              Email a deletion request
            </Button>
          </div>
        </Box>
      )}
    </PageContainer>
  );
}
