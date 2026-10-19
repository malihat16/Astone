import { useState } from 'react';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import InfoPage from './InfoPage';
import { tokens } from '../../theme';

const SUPPORT_EMAIL = 'support@astone.com';
const TOPICS = ['Account and login', 'An order', 'Payments and refunds', 'Something else'];

export default function Support() {
  const [form, setForm] = useState({ name: '', topic: TOPICS[1], message: '' });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // There is no support inbox API yet, so the form opens the shopper's email app with everything filled in.
  const submit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[${form.topic}] Help request from ${form.name}`);
    const body = encodeURIComponent(form.message);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <InfoPage title="Contact support" intro="Tell us what's going on and we'll reply within one working day.">
      <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2, maxWidth: 520 }}>
        <TextField label="Your name" required value={form.name} onChange={set('name')} autoComplete="name" />
        <TextField select label="What do you need help with?" value={form.topic} onChange={set('topic')}>
          {TOPICS.map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
        <TextField label="Message" required multiline minRows={5} value={form.message} onChange={set('message')} helperText="Include your order number if it's about an order." />
        <Box>
          <Button type="submit" variant="contained">Write email</Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This opens your email app with your message ready to send.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 7, display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 3, borderTop: `1px solid ${tokens.line}`, pt: 4 }}>
        <div>
          <Typography sx={{ fontWeight: 700 }}>Email</Typography>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </div>
        <div>
          <Typography sx={{ fontWeight: 700 }}>Phone</Typography>
          <a href="tel:8001234567">800-123-4567</a>
          <Typography color="text.secondary">Monday to Friday, 9am–6pm</Typography>
        </div>
      </Box>
    </InfoPage>
  );
}
