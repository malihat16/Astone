import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Badge, Box, Button, Checkbox, Drawer, FormControlLabel, FormGroup, IconButton, InputAdornment, MenuItem, Slider, Switch, TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { getProducts } from '../services/products';
import { useAsync } from '../lib/useAsync';
import { GENDERS, formatMoney } from '../lib/product';
import { SORTS, activeFilterCount, applyFilters, emptyFilters, filterOptions } from '../lib/filters';
import { tokens } from '../theme';
import PageContainer from '../components/layout/PageContainer';
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid';
import ErrorState from '../components/states/ErrorState';
import EmptyState from '../components/states/EmptyState';

const INTROS = {
  M: 'Tees and basics cut for men.',
  F: 'Tees and basics cut for women.',
  U: 'Pieces cut to fit anyone.',
};

function CheckList({ legend, options, selected, onChange }) {
  if (!options.length) return null;
  const toggle = (value) => onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  return (
    <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, mb: 3 }}>
      <Typography component="legend" sx={{ fontWeight: 700, mb: 0.5 }}>{legend}</Typography>
      <FormGroup>
        {options.map((option) => (
          <FormControlLabel
            key={option}
            control={<Checkbox size="small" checked={selected.includes(option)} onChange={() => toggle(option)} />}
            label={option}
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.95rem' } }}
          />
        ))}
      </FormGroup>
    </Box>
  );
}

function Filters({ filters, setFilters, options, onClear }) {
  const price = filters.price || [0, options.maxPrice];
  return (
    <Box>
      <TextField
        size="small"
        fullWidth
        placeholder="Search"
        value={filters.q}
        onChange={(e) => setFilters({ q: e.target.value })}
        inputProps={{ 'aria-label': 'Search this category' }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 3 }}
      />
      <FormControlLabel
        control={<Switch checked={filters.saleOnly} onChange={(e) => setFilters({ saleOnly: e.target.checked })} />}
        label="On sale only"
        sx={{ mb: 2.5 }}
      />
      <CheckList legend="Type" options={options.types} selected={filters.types} onChange={(types) => setFilters({ types })} />
      <CheckList legend="Brand" options={options.brands} selected={filters.brands} onChange={(brands) => setFilters({ brands })} />
      <Box sx={{ mb: 3, pr: 1 }}>
        <Typography id="price-label" sx={{ fontWeight: 700 }}>Price</Typography>
        <Typography variant="body2" color="text.secondary">
          {formatMoney(price[0])} to {formatMoney(price[1])}
        </Typography>
        <Slider
          aria-labelledby="price-label"
          value={price}
          min={0}
          max={options.maxPrice}
          step={5}
          onChange={(_, value) => setFilters({ price: value })}
          getAriaValueText={(v) => formatMoney(v)}
          sx={{ ml: 1, width: 'calc(100% - 8px)' }}
        />
      </Box>
      {activeFilterCount(filters) > 0 && (
        <Button variant="outlined" size="small" onClick={onClear}>Clear filters</Button>
      )}
    </Box>
  );
}

/** One page for /men, /women, /unisex and /shop (everything, with ?q= search and ?sale=1). */
export default function Shop({ gender }) {
  const [params, setParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterState, setFilterState] = useState(() => ({ ...emptyFilters, q: params.get('q') || '', saleOnly: params.get('sale') === '1' }));
  const [lastQuery, setLastQuery] = useState(params.get('q') || '');

  // Keep the search box in step when the header search changes ?q=.
  const urlQuery = params.get('q') || '';
  if (urlQuery !== lastQuery) {
    setLastQuery(urlQuery);
    setFilterState((f) => ({ ...f, q: urlQuery }));
  }

  const load = useCallback(() => getProducts({ gender }), [gender]);
  const { data, loading, error, reload } = useAsync(load);
  const products = useMemo(() => data || [], [data]);
  const options = useMemo(() => filterOptions(products), [products]);
  const visible = useMemo(() => applyFilters(products, filterState), [products, filterState]);

  const setFilters = (patch) => {
    setFilterState((f) => ({ ...f, ...patch }));
    if ('q' in patch) {
      setLastQuery(patch.q);
      setParams((p) => {
        const next = new URLSearchParams(p);
        if (patch.q) next.set('q', patch.q);
        else next.delete('q');
        return next;
      }, { replace: true });
    }
  };
  const clear = () => setFilters({ ...emptyFilters, sort: filterState.sort });
  const count = activeFilterCount(filterState);

  const title = gender ? GENDERS[gender].label : urlQuery ? `Results for “${urlQuery}”` : 'Shop everything';
  const filters = <Filters filters={filterState} setFilters={setFilters} options={options} onClear={clear} />;

  return (
    <PageContainer sx={{ pt: { xs: 4, md: 6 } }}>
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h1">{title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {gender ? `${INTROS[gender]} ` : ''}
          {!loading && !error && `${visible.length} of ${products.length} ${products.length === 1 ? 'piece' : 'pieces'}`}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '230px 1fr' }, gap: { md: 5 } }}>
        <Box component="aside" aria-label="Filters" sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 92, alignSelf: 'start' }}>
          {filters}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3, pb: 2, borderBottom: `1px solid ${tokens.line}` }}>
            <Badge badgeContent={count} color="primary" sx={{ display: { md: 'none' } }}>
              <Button variant="outlined" size="small" startIcon={<TuneIcon />} onClick={() => setDrawerOpen(true)}>
                Filters
              </Button>
            </Badge>
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
            <TextField
              select
              size="small"
              label="Sort by"
              value={filterState.sort}
              onChange={(e) => setFilters({ sort: e.target.value })}
              sx={{ minWidth: 200 }}
            >
              {Object.entries(SORTS).map(([key, s]) => (
                <MenuItem key={key} value={key}>{s.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          {loading ? (
            <ProductGridSkeleton count={6} columns={{ xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }} />
          ) : error ? (
            <ErrorState error={error} title="Products didn't load" onRetry={reload} />
          ) : products.length === 0 ? (
            <EmptyState title="Nothing here yet">Sellers haven&apos;t listed anything in this category yet.</EmptyState>
          ) : visible.length === 0 ? (
            <EmptyState icon={<SearchOffIcon />} title="Nothing matches these filters" action={<Button variant="contained" onClick={clear}>Clear filters</Button>}>
              Try a different search or widen the price range.
            </EmptyState>
          ) : (
            <ProductGrid products={visible} columns={{ xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }} />
          )}
        </Box>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 320, p: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h2">Filters</Typography>
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close filters"><CloseIcon /></IconButton>
        </Box>
        {filters}
        <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => setDrawerOpen(false)}>
          Show {visible.length} {visible.length === 1 ? 'piece' : 'pieces'}
        </Button>
      </Drawer>
    </PageContainer>
  );
}
