import { useCallback, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Skeleton, Typography } from '@mui/material';
import { getProducts } from '../services/products';
import { useAsync } from '../lib/useAsync';
import { GENDERS } from '../lib/product';
import { fonts, tokens } from '../theme';
import PageContainer from '../components/layout/PageContainer';
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid';
import ProductImage from '../components/ProductImage';
import Price from '../components/Price';
import ErrorState from '../components/states/ErrorState';
import EmptyState from '../components/states/EmptyState';

const pieces = (n) => `${n} ${n === 1 ? 'piece' : 'pieces'}`;

/* The hero is the category picker itself: three huge words, each a link. */
function CategoryHero({ products, loading }) {
  const counts = useMemo(() => {
    const c = { M: 0, F: 0, U: 0 };
    (products || []).forEach((p) => p.gender && (c[p.gender] += 1));
    return c;
  }, [products]);
  const featured = useMemo(
    () => (products || []).find((p) => p.images.length > 1) || (products || []).find((p) => p.images.length) || null,
    [products],
  );

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.7fr) minmax(280px, 1fr)' }, gap: { xs: 4, md: 6 }, alignItems: 'center', pt: { xs: 4, md: 7 }, pb: { xs: 6, md: 10 } }}>
      <Box>
        <h1 className="visually-hidden">Astoné: clothing from independent Malaysian labels</h1>
        <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem', maxWidth: 440, mb: { xs: 2, md: 3 } }}>
          Everyday clothing from independent Malaysian labels. Pick where to start.
        </Typography>
        <Box component="nav" aria-label="Shop by category">
          {Object.entries(GENDERS).map(([code, g]) => (
            <Box
              key={code}
              component={RouterLink}
              to={g.path}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                columnGap: 2,
                textDecoration: 'none',
                color: 'text.primary',
                fontFamily: fonts.display,
                fontWeight: 800,
                fontSize: 'clamp(2.9rem, 7vw, 6.6rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.045em',
                transition: 'color 160ms ease',
                '&:hover, &:focus-visible': { color: tokens.plum },
                '&:hover .count, &:focus-visible .count': { color: tokens.plum },
              }}
            >
              {g.label}
              <Box component="span" className="count" sx={{ fontFamily: fonts.body, fontWeight: 600, fontSize: '0.95rem', letterSpacing: 0, color: 'text.secondary', transition: 'color 160ms ease', whiteSpace: 'nowrap', display: { xs: 'none', sm: 'inline' } }}>
                {loading ? '…' : pieces(counts[code])}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ maxWidth: { xs: 420, md: 'none' } }}>
        {loading ? (
          <Skeleton variant="rounded" sx={{ aspectRatio: '4 / 5', height: 'auto', borderRadius: 3 }} />
        ) : featured ? (
          <Box component={RouterLink} to={`/buyer_products/${featured.id}`} sx={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <ProductImage src={featured.images[0]} alt={featured.name} sx={{ borderRadius: 3, aspectRatio: { xs: '1 / 1', md: '4 / 5' } }} />
            <Typography sx={{ fontWeight: 600, mt: 1.5 }}>{featured.name}</Typography>
            <Price product={featured} />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

function SectionHeading({ title, link }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2, mb: 3 }}>
      <Typography variant="h2">{title}</Typography>
      {link && (
        <Link component={RouterLink} to={link.to} sx={{ color: 'text.primary', whiteSpace: 'nowrap' }}>
          {link.label}
        </Link>
      )}
    </Box>
  );
}

export default function Home() {
  const load = useCallback(() => getProducts(), []);
  const { data: products, loading, error, reload } = useAsync(load);
  const onSale = useMemo(() => (products || []).filter((p) => p.onSale).slice(0, 4), [products]);

  return (
    <PageContainer>
      <CategoryHero products={products} loading={loading} />

      <Box component="section" aria-labelledby="new-in" sx={{ borderTop: `1px solid ${tokens.line}`, pt: 5 }}>
        <SectionHeading title={<span id="new-in">New in</span>} link={{ to: '/shop', label: 'Shop everything' }} />
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <ErrorState error={error} title="The shop didn't load" onRetry={reload} compact />
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" compact>
            Sellers haven&apos;t listed anything yet. Check back soon.
          </EmptyState>
        ) : (
          <ProductGrid products={products.slice(0, 8)} />
        )}
      </Box>

      {onSale.length > 0 && (
        <Box component="section" aria-labelledby="on-sale" sx={{ mt: 10 }}>
          <SectionHeading title={<span id="on-sale">On sale now</span>} link={{ to: '/shop?sale=1', label: 'See all offers' }} />
          <ProductGrid products={onSale} />
        </Box>
      )}

      <Box
        component="section"
        sx={{ mt: 10, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}
      >
        <Box sx={{ bgcolor: tokens.plumSoft, borderRadius: 4, p: { xs: 3, md: 5 } }}>
          <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>Every order pays you back</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, maxWidth: 420 }}>
            Earn 10% of what you spend as points. Each point takes RM 1 off a future order.
          </Typography>
          <Button component={RouterLink} to="/signup" variant="contained">Create an account</Button>
        </Box>
        <Box sx={{ border: `1px solid ${tokens.line}`, borderRadius: 4, p: { xs: 3, md: 5 } }}>
          <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>Run a clothing label?</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, maxWidth: 420 }}>
            List your pieces, run promotions and ship orders from one Seller Centre.
          </Typography>
          <Button component={RouterLink} to="/sell" variant="outlined">Sell on Astoné</Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
