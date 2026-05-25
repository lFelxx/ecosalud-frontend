import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D5E',
      light: '#4CAF84',
      dark: '#1B5E42',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#A5D6A7',
      light: '#C8E6C9',
      dark: '#66BB6A',
      contrastText: '#1B5E42',
    },
    background: {
      default: '#F5F9F6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C2B22',
      secondary: '#4A6B57',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 12px rgba(0,0,0,0.08)',
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
