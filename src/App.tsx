import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './presentation/theme/theme';
import { AuthProvider } from './presentation/context/AuthContext';
import AppRouter from './presentation/router/AppRouter';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
