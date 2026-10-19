import { createTheme } from '@mui/material/styles';

// Astoné design tokens. Plum is the brand colour carried over from the original site;
// orchid is reserved for sale prices and discounts so it always means "cheaper".
export const tokens = {
  paper: '#F6F5F8',
  surface: '#FFFFFF',
  tile: '#ECE9F0',
  ink: '#1D1726',
  muted: '#6B6478',
  line: '#DCD7E3',
  plum: '#5B2A86',
  plumDark: '#431D64',
  plumSoft: '#EFE8F6',
  orchid: '#C42C6E',
  success: '#2E7D4F',
};

export const fonts = {
  display: '"Syne", "Manrope", system-ui, sans-serif',
  body: '"Manrope", system-ui, -apple-system, "Segoe UI", sans-serif',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.plum, dark: tokens.plumDark, light: '#7B4BA8', contrastText: '#fff' },
    secondary: { main: tokens.ink, contrastText: '#fff' },
    error: { main: '#B3261E' },
    success: { main: tokens.success },
    info: { main: tokens.plum },
    sale: { main: tokens.orchid },
    background: { default: tokens.paper, paper: tokens.surface },
    text: { primary: tokens.ink, secondary: tokens.muted },
    divider: tokens.line,
  },
  // Base unit for sx radius values: 2 = 8px (images), 3 = 12px, 4 = 16px (panels).
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: fonts.body,
    // A modest scale (roughly 1.25) for body UI, with Syne reserved for headings.
    h1: { fontFamily: fonts.display, fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', lineHeight: 1.02, letterSpacing: '-0.02em' },
    h2: { fontFamily: fonts.display, fontWeight: 700, fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', lineHeight: 1.08, letterSpacing: '-0.015em' },
    h3: { fontFamily: fonts.display, fontWeight: 700, fontSize: '1.6rem', lineHeight: 1.15 },
    h4: { fontFamily: fonts.display, fontWeight: 700, fontSize: '1.3rem', lineHeight: 1.2 },
    h5: { fontWeight: 700, fontSize: '1.1rem' },
    h6: { fontWeight: 700, fontSize: '1rem' },
    subtitle1: { fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.9rem', lineHeight: 1.55 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
    caption: { color: tokens.muted },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: tokens.paper },
        '::selection': { background: tokens.plumSoft },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 22, minHeight: 44 },
        sizeSmall: { minHeight: 34, paddingInline: 14 },
        outlined: { borderColor: tokens.line, '&:hover': { borderColor: tokens.ink, background: 'transparent' } },
      },
    },
    MuiIconButton: { styleOverrides: { root: { '&:focus-visible': { outline: `2px solid ${tokens.plum}` } } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: tokens.surface, borderRadius: 10 },
        notchedOutline: { borderColor: tokens.line },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { rounded: { borderRadius: 16 }, outlined: { borderColor: tokens.line } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 600 } } },
    MuiDrawer: { styleOverrides: { paper: { backgroundColor: tokens.paper } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
    MuiLink: { defaultProps: { underline: 'hover' }, styleOverrides: { root: { fontWeight: 600 } } },
    MuiAlert: { styleOverrides: { standardInfo: { backgroundColor: tokens.plumSoft, color: tokens.plumDark } } },
    MuiSkeleton: { styleOverrides: { root: { backgroundColor: tokens.tile } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: tokens.ink, fontSize: 13 } } },
  },
});

export default theme;
