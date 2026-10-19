import { Box, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fonts, tokens } from '../../theme';
import PageContainer from './PageContainer';

const COLUMNS = [
  { title: 'Shop', links: [['Men', '/men'], ['Women', '/women'], ['Unisex', '/unisex'], ['Compare products', '/compare']] },
  { title: 'Help', links: [['FAQ', '/faq'], ['Contact support', '/support'], ['Return policy', '/returnPolicy'], ['Privacy policy', '/privacyPolicy']] },
  { title: 'Astoné', links: [['About us', '/about'], ['Sell on Astoné', '/sell'], ['Seller Centre login', '/loginSeller']] },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: tokens.ink, color: '#EDE9F2', mt: 12, pt: 8, pb: 5 }}>
      <PageContainer>
        <Box sx={{ display: 'grid', gap: 5, gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1fr 1fr 1fr' } }}>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', lineHeight: 1 }}>Astoné</Typography>
            <Typography sx={{ mt: 2, color: '#B8B0C4', maxWidth: 300 }}>
              Everyday clothing from independent Malaysian labels, delivered nationwide.
            </Typography>
          </Box>
          {COLUMNS.map((col) => (
            <Box key={col.title} component="nav" aria-label={col.title}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{col.title}</Typography>
              {col.links.map(([label, to]) => (
                <Link key={to} component={RouterLink} to={to} color="inherit" display="block" sx={{ color: '#B8B0C4', fontWeight: 500, py: 0.5, '&:hover': { color: '#fff' } }}>
                  {label}
                </Link>
              ))}
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 8, pt: 3, borderTop: '1px solid rgba(237,233,242,0.15)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, color: '#8E859C', fontSize: 14 }}>
          <span>© {new Date().getFullYear()} Astoné Malaysia</span>
          <span>Malaysia, English, prices in RM</span>
        </Box>
      </PageContainer>
    </Box>
  );
}
