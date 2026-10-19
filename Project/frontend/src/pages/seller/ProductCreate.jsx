import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert, Autocomplete, Box, Button, Chip, IconButton, InputAdornment, MenuItem, TextField, Tooltip, Typography,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { createProduct } from '../../services/seller';
import { useToast } from '../../lib/contexts';
import { errorMessage } from '../../lib/api';
import { CATEGORY_OPTIONS, GENDER_OPTIONS, SIZE_OPTIONS } from '../../lib/catalogue';
import { tokens } from '../../theme';
import SellerPageHeader from '../../components/layout/SellerPageHeader';
import ColorDot from '../../components/ColorDot';
import { cssColorToHex } from '../../lib/color';

function Section({ title, hint, children }) {
  return (
    <Box component="section" sx={{ display: 'grid', gridTemplateColumns: { md: '240px 1fr' }, gap: { xs: 1.5, md: 4 }, py: 4, borderTop: `1px solid ${tokens.line}` }}>
      <Box>
        <Typography variant="h4" component="h2">{title}</Typography>
        {hint && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{hint}</Typography>}
      </Box>
      <Box sx={{ display: 'grid', gap: 2, alignContent: 'start' }}>{children}</Box>
    </Box>
  );
}

function PhotoPicker({ files, onChange }) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 1.5 }}>
      {previews.map((src, i) => (
        <Box key={src} sx={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 2, overflow: 'hidden', bgcolor: tokens.tile }}>
          <img src={src} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {i === 0 && <Chip label="Cover" size="small" sx={{ position: 'absolute', left: 6, bottom: 6, bgcolor: 'background.paper' }} />}
          <IconButton size="small" aria-label={`Remove photo ${i + 1}`} onClick={() => onChange(files.filter((_, j) => j !== i))} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Box component="label" sx={{ aspectRatio: '4 / 5', borderRadius: 2, border: `1.5px dashed ${tokens.line}`, display: 'grid', placeItems: 'center', textAlign: 'center', cursor: 'pointer', color: 'text.secondary', p: 1, '&:hover': { borderColor: tokens.plum, color: tokens.plum }, '&:focus-within': { outline: `2px solid ${tokens.plum}` } }}>
        <Box>
          <AddPhotoAlternateOutlinedIcon />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Add photos</Typography>
        </Box>
        <input
          type="file"
          accept="image/*"
          multiple
          className="visually-hidden"
          onChange={(e) => {
            onChange([...files, ...Array.from(e.target.files || [])]);
            e.target.value = '';
          }}
        />
      </Box>
    </Box>
  );
}

function ColourEditor({ colors, onChange }) {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#1D1726');
  const [pickedByHand, setPickedByHand] = useState(false);
  const changeName = (value) => {
    setName(value);
    // Guess the shade from names browsers know ("navy", "forest green", "sky blue").
    const guess = !pickedByHand && cssColorToHex(value);
    if (guess) setHex(guess);
  };
  const add = () => {
    if (!name.trim()) return;
    onChange([...colors.filter((c) => c.name.toLowerCase() !== name.trim().toLowerCase()), { name: name.trim(), hex: hex.toUpperCase() }]);
    setName('');
    setPickedByHand(false);
  };
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          label="Colour name"
          placeholder="e.g. Forest green"
          value={name}
          onChange={(e) => changeName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Tooltip title="Pick the shade">
                  <Box component="label" sx={{ display: 'inline-flex', cursor: 'pointer', position: 'relative' }}>
                    <ColorDot hex={hex} size={24} />
                    <input type="color" value={hex} onChange={(e) => { setHex(e.target.value); setPickedByHand(true); }} aria-label="Colour shade" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  </Box>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
        <Button variant="outlined" onClick={add} sx={{ height: 56 }}>Add colour</Button>
      </Box>
      {colors.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
          {colors.map((c) => (
            <Chip key={c.name} icon={<Box sx={{ pl: 0.75, display: 'flex' }}><ColorDot hex={c.hex} size={14} /></Box>} label={c.name} onDelete={() => onChange(colors.filter((x) => x !== c))} variant="outlined" />
          ))}
        </Box>
      )}
    </Box>
  );
}

const EMPTY = { name: '', description: '', brand: '', gender: 'U', categories: [], sizes: [], colors: [], price: '', stock: '', images: [] };

export default function ProductCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (patch) => {
    setV((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  };
  const set = (key) => (e) => update({ [key]: e.target.value });

  const validate = () => {
    const e = {};
    if (!v.name.trim()) e.name = 'Give the product a name.';
    if (!v.description.trim()) e.description = 'Describe the fabric and fit in a sentence.';
    if (!v.brand.trim()) e.brand = 'Add the brand or label name.';
    if (!(Number(v.price) > 0)) e.price = 'Enter a price above zero.';
    if (!(Number.isInteger(Number(v.stock)) && Number(v.stock) >= 0) || v.stock === '') e.stock = 'Enter how many you have, e.g. 20.';
    if (!v.sizes.length) e.sizes = 'Choose at least one size.';
    if (!v.colors.length) e.colors = 'Add at least one colour.';
    return e;
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      setProblem('Some details are missing. Check the highlighted fields.');
      return;
    }
    setBusy(true);
    setProblem('');
    try {
      const product = await createProduct({ ...v, price: Number(v.price).toFixed(2), stock: Number(v.stock) });
      toast.success(`${product.name} is live in your shop`);
      navigate(`/products/${product.id}`);
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <SellerPageHeader title="Add a product" subtitle="It goes live in the shop as soon as you save it." />

      <Section title="Photos" hint="The first photo is the cover. Portrait photos (4:5) look best.">
        <PhotoPicker files={v.images} onChange={(images) => update({ images })} />
      </Section>

      <Section title="Basics">
        <TextField label="Product name" required value={v.name} onChange={set('name')} error={Boolean(errors.name)} helperText={errors.name || `${v.name.length}/30`} inputProps={{ maxLength: 30 }} />
        <TextField label="Description" required multiline minRows={3} value={v.description} onChange={set('description')} error={Boolean(errors.description)} helperText={errors.description || `${v.description.length}/100`} inputProps={{ maxLength: 100 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
          <TextField label="Brand" required value={v.brand} onChange={set('brand')} error={Boolean(errors.brand)} helperText={errors.brand} />
          <TextField select label="Who it's for" value={v.gender} onChange={set('gender')}>
            {GENDER_OPTIONS.map((g) => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
          </TextField>
        </Box>
        <Autocomplete
          multiple
          freeSolo
          options={CATEGORY_OPTIONS}
          value={v.categories}
          onChange={(_, categories) => update({ categories })}
          renderInput={(params) => <TextField {...params} label="Type" helperText="Pick from the list or type your own." />}
        />
      </Section>

      <Section title="Sizes and colours" hint="Shoppers choose one of each when they add to bag.">
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Sizes</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {SIZE_OPTIONS.map((s) => {
              const on = v.sizes.some((x) => x.value === s.value);
              return (
                <Chip
                  key={s.value}
                  label={s.value === 'NA' ? 'One size' : s.value}
                  onClick={() => update({ sizes: on ? v.sizes.filter((x) => x.value !== s.value) : [...v.sizes, s] })}
                  color={on ? 'secondary' : 'default'}
                  variant={on ? 'filled' : 'outlined'}
                  aria-pressed={on}
                  sx={{ minWidth: 52 }}
                />
              );
            })}
          </Box>
          {errors.sizes && <Typography variant="body2" color="error" sx={{ mt: 1 }}>{errors.sizes}</Typography>}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Colours</Typography>
          <ColourEditor colors={v.colors} onChange={(colors) => update({ colors })} />
          {errors.colors && <Typography variant="body2" color="error" sx={{ mt: 1 }}>{errors.colors}</Typography>}
        </Box>
      </Section>

      <Section title="Price and stock">
        <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
          <TextField label="Price" required type="number" value={v.price} onChange={set('price')} error={Boolean(errors.price)} helperText={errors.price} inputProps={{ min: 0, step: '0.01' }} InputProps={{ startAdornment: <InputAdornment position="start">RM</InputAdornment> }} />
          <TextField label="Stock" required type="number" value={v.stock} onChange={set('stock')} error={Boolean(errors.stock)} helperText={errors.stock || 'How many you can ship.'} inputProps={{ min: 0, step: 1 }} />
        </Box>
      </Section>

      <Box sx={{ borderTop: `1px solid ${tokens.line}`, pt: 3, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Saving…' : 'Save and publish'}</Button>
        <Button component={RouterLink} to="/productlist" color="inherit">Cancel</Button>
        {problem && <Alert severity="error" sx={{ flexBasis: '100%' }}>{problem}</Alert>}
      </Box>
    </Box>
  );
}
