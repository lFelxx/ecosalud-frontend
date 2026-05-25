import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3DAA96',
      light: '#5BBFAD',
      dark: '#2B8A78',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E8F5F2',
      light: '#F0FAF7',
      dark: '#B2DFDB',
      contrastText: '#2B8A78',
    },
    background: {
      default: '#F4FAF8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2E2A',
      secondary: '#5A7A74',
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
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '12px 24px', fontSize: '1rem' },
        containedPrimary: {
          background: '#3DAA96',
          '&:hover': { background: '#2B8A78' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': { borderColor: '#3DAA96' },
            '&.Mui-focused fieldset': { borderColor: '#3DAA96' },
          },
          '& label.Mui-focused': { color: '#3DAA96' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)', borderRadius: 16 },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: { color: '#3DAA96', '&.Mui-checked': { color: '#3DAA96' } },
      },
    },
  },
});

export default theme;
