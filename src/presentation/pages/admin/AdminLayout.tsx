import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, Tooltip, IconButton, Divider, Drawer,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useAuthContext } from '../../context/AuthContext';

const SIDEBAR_W = 240;

const ALL_NAV = [
  { label: 'Dashboard',     icon: <DashboardOutlinedIcon />,       to: '/admin',              exact: true,  adminOnly: false },
  { label: 'Publicaciones', icon: <ArticleOutlinedIcon />,         to: '/admin/posts',        exact: false, adminOnly: false },
  { label: 'Citas',         icon: <CalendarMonthOutlinedIcon />,   to: '/admin/appointments', exact: false, adminOnly: false },
  { label: 'Terapias',      icon: <SpaOutlinedIcon />,             to: '/admin/catalog',      exact: false, adminOnly: true  },
  { label: 'Especialista',  icon: <PersonOutlinedIcon />,          to: '/admin/specialist',   exact: false, adminOnly: true  },
  { label: 'Medios',        icon: <ImageOutlinedIcon />,           to: '/admin/media',        exact: false, adminOnly: true  },
  { label: 'Usuarios',      icon: <PeopleOutlinedIcon />,          to: '/admin/users',        exact: false, adminOnly: true  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = ALL_NAV.filter((n) => !n.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box
      sx={{
        width: SIDEBAR_W,
        height: '100%',
        bgcolor: '#1A2E2A',
        display: 'flex',
        flexDirection: 'column',
        py: 2,
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 22 }} />
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
            Ecosalud Admin
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'inline-flex',
            px: 1,
            py: 0.25,
            bgcolor: 'rgba(61,170,150,0.20)',
            border: '1px solid rgba(61,170,150,0.40)',
            borderRadius: '999px',
          }}
        >
          <Typography sx={{ color: '#3DAA96', fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1 }}>
            PANEL DE CONTROL
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 1.5 }} />

      {/* Navegación */}
      <Box sx={{ flex: 1, px: 1.5 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onNavigate}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.1,
                  borderRadius: 2,
                  mb: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  bgcolor: isActive ? 'rgba(61,170,150,0.18)' : 'transparent',
                  borderLeft: isActive ? '3px solid #3DAA96' : '3px solid transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                  '& svg': {
                    fontSize: 20,
                    color: isActive ? '#3DAA96' : 'rgba(255,255,255,0.55)',
                  },
                }}
              >
                {item.icon}
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            )}
          </NavLink>
        ))}

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', my: 1.5 }} />

        {/* Ver sitio público */}
        <NavLink to="/" style={{ textDecoration: 'none' }} onClick={onNavigate}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1.1,
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
              '& svg': { fontSize: 18, color: 'rgba(255,255,255,0.40)' },
            }}
          >
            <OpenInNewIcon />
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.40)' }}>
              Ver sitio público
            </Typography>
          </Box>
        </NavLink>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2 }} />

      {/* Usuario activo */}
      <Box sx={{ px: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#3DAA96',
            fontSize: '0.85rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {user?.name?.charAt(0) ?? 'A'}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              px: 0.8,
              py: 0.15,
              bgcolor: user?.role === 'ADMIN' ? 'rgba(61,170,150,0.25)' : 'rgba(255,200,100,0.20)',
              borderRadius: 1,
            }}
          >
            <Typography sx={{ color: user?.role === 'ADMIN' ? '#3DAA96' : '#F5C842', fontSize: '0.6rem', fontWeight: 700, letterSpacing: 0.8 }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Cerrar sesión" placement="top">
          <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.35)', '&:hover': { color: '#C0392B', bgcolor: 'rgba(192,57,43,0.12)' } }}>
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F0F6F4' }}>

      {/* Sidebar escritorio */}
      <Box
        sx={{
          width: SIDEBAR_W,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1200,
        }}
      >
        <SidebarContent />
      </Box>

      {/* Sidebar móvil (Drawer) */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_W, bgcolor: 'transparent', border: 'none' } }}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      {/* Contenido principal */}
      <Box
        sx={{
          flex: 1,
          ml: { xs: 0, md: `${SIDEBAR_W}px` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Topbar móvil */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            bgcolor: '#1A2E2A',
          }}
        >
          <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#fff' }}>
            <MenuIcon />
          </IconButton>
          <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 20 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
            Ecosalud Admin
          </Typography>
        </Box>

        {/* Página actual */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
