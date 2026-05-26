import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './presentation/theme/theme';
import { AuthProvider } from './presentation/context/AuthContext';
import { AdminDataProvider } from './presentation/context/AdminDataContext';
import AppRouter from './presentation/router/AppRouter';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AdminDataProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </AdminDataProvider>
    </ThemeProvider>
  );
}

export default App;
