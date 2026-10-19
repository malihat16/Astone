import { Box, Typography } from '@mui/material';
import PageContainer from '../../components/layout/PageContainer';
import { fonts, tokens } from '../../theme';

/** Long-form text pages (policies, about). Readable measure, quiet styling. */
export default function InfoPage({ title, intro, children }) {
  return (
    <PageContainer narrow sx={{ pt: { xs: 5, md: 8 } }}>
      <Typography variant="h1" sx={{ mb: intro ? 2 : 5 }}>
        {title}
      </Typography>
      {intro && (
        <Typography sx={{ fontSize: '1.15rem', color: 'text.secondary', mb: 5, maxWidth: 620 }}>{intro}</Typography>
      )}
      <Box
        sx={{
          maxWidth: 680,
          lineHeight: 1.7,
          '& h2': { fontFamily: fonts.display, fontSize: '1.3rem', mt: 5, mb: 1.5 },
          '& h3': { fontSize: '1.05rem', mt: 3.5, mb: 1 },
          '& p': { my: 1.5 },
          '& ul, & ol': { pl: 3 },
          '& li': { my: 0.75 },
          '& a': { color: tokens.plum, fontWeight: 600 },
        }}
      >
        {children}
      </Box>
    </PageContainer>
  );
}
