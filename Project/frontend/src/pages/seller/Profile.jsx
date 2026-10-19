import { useCallback, useState } from 'react';
import { Alert, Box, Button, Skeleton, TextField, Typography } from '@mui/material';
import { getSellerProfile, updateSellerProfile } from '../../services/seller';
import { useAsync } from '../../lib/useAsync';
import { useToast } from '../../lib/contexts';
import { errorMessage } from '../../lib/api';
import { tokens } from '../../theme';
import SellerPageHeader from '../../components/layout/SellerPageHeader';
import ErrorState from '../../components/states/ErrorState';

function ProfileForm({ profile, onSaved }) {
  const [v, setV] = useState({
    shop_name: profile.shop_name,
    first_name: profile.user.first_name,
    last_name: profile.user.last_name,
    phone_number: String(profile.phone_number || ''),
    address: profile.address,
  });
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setV({ ...v, [key]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (!v.shop_name.trim()) return setProblem('Your shop needs a name.');
    setBusy(true);
    setProblem('');
    try {
      onSaved(await updateSellerProfile({
        shop_name: v.shop_name.trim(),
        phone_number: v.phone_number.replace(/\D/g, '') || 0,
        address: v.address,
        user: { first_name: v.first_name, last_name: v.last_name },
      }));
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <Box component="form" onSubmit={save} sx={{ display: 'grid', gap: 2, maxWidth: 560 }}>
      <TextField label="Shop name" value={v.shop_name} onChange={set('shop_name')} helperText="Must be unique on Astoné." />
      <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
        <TextField label="First name" value={v.first_name} onChange={set('first_name')} />
        <TextField label="Last name" value={v.last_name} onChange={set('last_name')} />
      </Box>
      <TextField label="Login email" value={profile.user.email} disabled />
      <TextField label="Phone number" value={v.phone_number} onChange={set('phone_number')} inputMode="tel" />
      <TextField label="Business address" multiline minRows={2} value={v.address} onChange={set('address')} />
      {problem && <Alert severity="error">{problem}</Alert>}
      <Box><Button type="submit" variant="contained" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button></Box>
    </Box>
  );
}

export default function Profile() {
  const load = useCallback(() => getSellerProfile(), []);
  const { data: profile, loading, error, reload, setData } = useAsync(load);
  const toast = useToast();

  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      <SellerPageHeader
        title="Shop profile"
        subtitle={profile ? `Selling on Astoné since ${new Date(profile.user.date_joined).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}` : 'Your shop details'}
      />
      <Box sx={{ bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, p: { xs: 2.5, md: 4 } }}>
        {loading ? (
          <Box sx={{ maxWidth: 560 }}>{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 2 }} />)}</Box>
        ) : (
          <ProfileForm
            profile={profile}
            onSaved={(updated) => {
              setData(updated);
              toast.success('Shop profile saved');
            }}
          />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        To change your login email, contact support@astone.com.
      </Typography>
    </>
  );
}
