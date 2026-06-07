/**
 * PlatformNavbar — Barra de navegación de la plataforma de marketing Ecosalud Market.
 *
 * Usada en: LandingPage, PricingPage, OnboardingPage, NovedadesPage, FuncionalidadesPage.
 * Orientada a visitantes B2B (profesionales de salud) que no están logueados.
 *
 * Diferencia con Navbar.tsx:
 * - Links apuntan a secciones de la plataforma (Funcionalidades, Novedades, Precios)
 * - CTA "Empieza gratis" siempre visible y prominente
 * - Si el usuario está autenticado, muestra acceso directo al panel
 */

import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Button, IconButton, Tooltip,
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider,
} from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';

const NAV_LINKS = [
  { label: 'Inicio',          to: '/'                },
  { label: 'Funcionalidades', to: '/funcionalidades' },
  { label: 'Novedades',       to: '/novedades'       },
  { label: 'Precios',         to: '/precios'         },
];

export default function PlatformNavbar() {
  const { pathname } = useLocation();
  const { isAuthenticated, user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const isAdminOrEditor = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const dashboardPath = user?.role === 'ADMIN' && !user?.tenantSchema
    ? '/superadmin'
    : '/admin';

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E8F0EE',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar sx={{ position: 'relative', minHeight: 64, px: { xs: 2, md: 4 } }}>

          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.8, textDecoration: 'none', zIndex: 1 }}
          >
            <SpaIcon sx={{ color: '#3DAA96', fontSize: 22 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#3DAA96', fontWeight: 800, lineHeight: 1, fontSize: '0.95rem' }}>
                Ecosalud
              </Typography>
              <Typography variant="caption" sx={{ color: '#9DBFBA', fontSize: '0.6rem', lineHeight: 1, display: 'block', letterSpacing: 0.5 }}>
                Market
              </Typography>
            </Box>
          </Box>

          {/* Nav links — centrados (desktop) */}
          <Box sx={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center',
          }}>
            {NAV_LINKS.map(({ label, to }) => {
              const active = pathname === to || pathname.startsWith(to + '/');
              return (
                <Box
                  key={to}
                  component={RouterLink}
                  to={to}
                  sx={{
                    fontSize: '0.875rem', fontWeight: active ? 700 : 500,
                    color: active ? '#3DAA96' : '#4A6B60',
                    textDecoration: 'none',
                    borderBottom: active ? '2px solid #3DAA96' : '2px solid transparent',
                    pb: 0.3, whiteSpace: 'nowrap',
                    transition: 'color 0.2s, border-color 0.2s',
                    '&:hover': { color: '#3DAA96', borderColor: '#3DAA96' },
                  }}
                >
                  {label}
                </Box>
              );
            })}
          </Box>

          {/* Acciones derecha */}
          <Box sx={{ ml: 'auto', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>

            {/* Acceso rápido al panel (si autenticado) */}
            {isAuthenticated && isAdminOrEditor && (
              <Tooltip title="Ir al panel">
                <IconButton
                  component={RouterLink} to={dashboardPath}
                  size="small"
                  sx={{ color: '#5A7A74', '&:hover': { color: '#3DAA96', bgcolor: '#F0F8F5' } }}
                >
                  <DashboardOutlinedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Cerrar sesión si autenticado */}
            {isAuthenticated ? (
              <Tooltip title="Cerrar sesión">
                <Button
                  onClick={handleLogout}
                  startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
                  size="small"
                  sx={{
                    color: '#9DBFBA', fontWeight: 600, fontSize: '0.8rem',
                    textTransform: 'none', display: { xs: 'none', md: 'flex' },
                    '&:hover': { color: '#C0392B' },
                  }}
                >
                  Salir
                </Button>
              </Tooltip>
            ) : (
              <>
                {/* Iniciar sesión — solo texto */}
                <Box
                  component={RouterLink} to="/login"
                  sx={{
                    fontSize: '0.85rem', fontWeight: 600, color: '#4A6B60',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    display: { xs: 'none', md: 'block' },
                    '&:hover': { color: '#3DAA96' },
                  }}
                >
                  Iniciar sesión
                </Box>

                {/* CTA primario */}
                <Button
                  component={RouterLink} to="/onboarding"
                  size="small"
                  sx={{
                    bgcolor: '#3DAA96', color: '#fff', borderRadius: 2,
                    px: { xs: 1.5, md: 2.5 }, py: 0.9,
                    fontWeight: 800, fontSize: '0.82rem', textTransform: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(61,170,150,0.30)',
                    '&:hover': { bgcolor: '#2B8A78' },
                  }}
                >
                  Empieza gratis
                </Button>
              </>
            )}

            {/* Menú hamburguesa (móvil) */}
            <IconButton
              size="small"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#4A6B60' }}
            >
              <MenuOutlinedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer móvil */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 260, pt: 2 } }}
      >
        <Box sx={{ px: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <SpaIcon sx={{ color: '#3DAA96', fontSize: 20 }} />
            <Typography sx={{ color: '#3DAA96', fontWeight: 800, fontSize: '0.9rem' }}>Ecosalud Market</Typography>
          </Box>
          <IconButton size="small" onClick={() => setMobileOpen(false)}>
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <List dense>
          {NAV_LINKS.map(({ label, to }) => (
            <ListItem key={to} disablePadding>
              <ListItemButton
                component={RouterLink} to={to}
                onClick={() => setMobileOpen(false)}
                selected={pathname === to}
                sx={{ borderRadius: 1, mx: 1, '&.Mui-selected': { bgcolor: '#E8F5F0', color: '#3DAA96' } }}
              >
                <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ px: 2, mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            component={RouterLink} to="/onboarding"
            variant="contained" fullWidth
            onClick={() => setMobileOpen(false)}
            sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#2B8A78' } }}
          >
            Empieza gratis
          </Button>
          <Button
            component={RouterLink} to="/login"
            variant="outlined" fullWidth
            onClick={() => setMobileOpen(false)}
            sx={{ borderColor: '#C5DDD8', color: '#3DAA96', borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            Iniciar sesión
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
