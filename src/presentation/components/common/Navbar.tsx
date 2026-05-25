import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Link, Button, Tooltip } from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useAuthContext } from '../../context/AuthContext';

const PUBLIC_NAV = [
  { label: 'Inicio', to: '/' },
  { label: 'Servicios', to: '/services' },
];

const PRIVATE_NAV = [
  { label: 'Inicio', to: '/' },
  { label: 'Reservar Cita', to: '/appointments/book' },
  { label: 'Mis Terapias', to: '/appointments' },
  { label: 'Servicios', to: '/services' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { logout, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const navLinks = isAuthenticated ? PRIVATE_NAV : PUBLIC_NAV;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E8F0EE' }}>
      <Toolbar sx={{ position: 'relative', minHeight: 64, px: { xs: 2, md: 4 } }}>

        {/* Logo */}
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.8, textDecoration: 'none', zIndex: 1 }}
        >
          <SpaIcon sx={{ color: '#3DAA96', fontSize: 22 }} />
          <Typography variant="subtitle1" sx={{ color: '#3DAA96', whiteSpace: 'nowrap', fontWeight: 700 }}>
            Ecosalud Market
          </Typography>
        </Box>

        {/* Nav links — siempre centrados */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: { xs: 'none', md: 'flex' },
            gap: { md: 3, lg: 5 },
            alignItems: 'center',
          }}
        >
          {navLinks.map(({ label, to }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                component={RouterLink}
                to={to}
                underline="none"
                sx={{
                  fontSize: '0.92rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#3DAA96' : '#4A6B60',
                  borderBottom: active ? '2px solid #3DAA96' : '2px solid transparent',
                  pb: 0.3,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#3DAA96' },
                }}
              >
                {label}
              </Link>
            );
          })}
        </Box>

        {/* Botón derecha — según estado de sesión */}
        <Box sx={{ ml: 'auto', zIndex: 1 }}>
          {isAuthenticated ? (
            <Tooltip title="Cerrar sesión" arrow>
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                size="small"
                sx={{
                  color: '#C0392B',
                  bgcolor: '#FDF0EE',
                  border: '1.5px solid #F5C6C0',
                  borderRadius: 2,
                  px: 1.8,
                  py: 0.7,
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#C0392B', color: '#fff', borderColor: '#C0392B' },
                }}
              >
                Cerrar sesión
              </Button>
            </Tooltip>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              startIcon={<LoginIcon sx={{ fontSize: 18 }} />}
              size="small"
              sx={{
                color: '#fff',
                bgcolor: '#3DAA96',
                border: '1.5px solid #3DAA96',
                borderRadius: 2,
                px: 2,
                py: 0.7,
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(61,170,150,0.30)',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#2B8A78', borderColor: '#2B8A78', boxShadow: '0 4px 14px rgba(61,170,150,0.40)' },
              }}
            >
              Iniciar Sesión
            </Button>
          )}
        </Box>

      </Toolbar>
    </AppBar>
  );
}
