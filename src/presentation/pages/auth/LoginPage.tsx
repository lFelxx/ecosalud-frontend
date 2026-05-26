import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useLogin } from '../../hooks/useLogin';
import doctorImage from '../../../assets/doctor-hero.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('prueba@ecosalud.com');
  const [password, setPassword] = useState('ecosalud123');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const { handleLogin, loading, error } = useLogin();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Panel izquierdo ── */}
      <Box
        sx={{
          flex: '0 0 55%',
          position: 'relative',
          overflow: 'hidden',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 5,
        }}
      >
        <Box
          component="img"
          src={doctorImage}
          alt="Dra. Angélica Camacho"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background:
              'linear-gradient(to bottom, rgba(184,230,218,0.55) 0%, rgba(184,230,218,0.30) 40%, rgba(150,210,195,0.70) 75%, rgba(130,195,178,0.88) 100%)',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#3DAA96', mb: 1, letterSpacing: 0.5, fontWeight: 600 }}>
            Ecosalud Market
          </Typography>
          <Typography variant="h3" sx={{ color: '#1A2E2A', lineHeight: 1.2, mb: 2, fontWeight: 800 }}>
            Tu camino hacia el<br />bienestar integral.
          </Typography>
          <Typography variant="body1" sx={{ color: '#2D4A44', maxWidth: 380 }}>
            Accede a tus terapias, agenda citas y gestiona tu historial de salud
            en un entorno seguro y profesional.
          </Typography>
        </Box>
      </Box>

      {/* ── Panel derecho ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#F4FAF8',
          p: { xs: 3, md: 5 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420, my: 'auto' }}>
          {/* Flecha de regreso al home */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              mb: 2,
              textDecoration: 'none',
              color: '#5A7A74',
              fontWeight: 500,
              fontSize: '0.875rem',
              transition: 'color 0.2s',
              '&:hover': { color: '#3DAA96' },
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
            Volver al inicio
          </Box>

          <Box sx={{ bgcolor: 'white', borderRadius: 4, p: { xs: 3, md: 5 }, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
              Bienvenido de nuevo
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Ingresa tus credenciales para acceder a tu cuenta.
            </Typography>

            {/* Banner modo demo */}
            <Box
              sx={{
                bgcolor: '#E8F5F0',
                border: '1px solid #B2DDD4',
                borderRadius: 2,
                p: 1.5,
                mb: 2.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 18, color: '#3DAA96', mt: 0.1, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1A2E2A', lineHeight: 1.3 }}>
                  Modo demo — credenciales precargadas
                </Typography>
                <Typography sx={{ fontSize: '0.73rem', color: '#5A7A74', mt: 0.3, lineHeight: 1.4 }}>
                  Haz clic en <strong>Iniciar Sesión</strong> para explorar como paciente, o usa{' '}
                  <Box
                    component="span"
                    onClick={() => { setEmail('admin@ecosalud.com'); setPassword('admin123'); }}
                    sx={{ color: '#3DAA96', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                  >
                    admin@ecosalud.com
                  </Box>
                  {' '}para el panel de administración.
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8, mt: 0.8, flexWrap: 'wrap' }}>
                  <Chip
                    label="Paciente"
                    size="small"
                    onClick={() => { setEmail('prueba@ecosalud.com'); setPassword('ecosalud123'); }}
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#D4EDE7', color: '#2B8A78', cursor: 'pointer', '&:hover': { bgcolor: '#B2DDD4' } }}
                  />
                  <Chip
                    label="Editor"
                    size="small"
                    onClick={() => { setEmail('editor@ecosalud.com'); setPassword('editor123'); }}
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#FFF3E0', color: '#F39C12', cursor: 'pointer', '&:hover': { bgcolor: '#FFE0B2' } }}
                  />
                  <Chip
                    label="Admin"
                    size="small"
                    onClick={() => { setEmail('admin@ecosalud.com'); setPassword('admin123'); }}
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#E8F5F0', color: '#3DAA96', cursor: 'pointer', '&:hover': { bgcolor: '#B2DDD4' } }}
                  />
                </Box>
              </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={onSubmit} noValidate>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                Correo Electrónico
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="medium"
                sx={{ mb: 2.5 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: '#9DBFBA', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                Contraseña
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="medium"
                sx={{ mb: 1 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#9DBFBA', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#9DBFBA', '&:hover': { color: '#3DAA96' } }}
                        >
                          {showPassword
                            ? <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                            : <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                          }
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" />
                  }
                  label={<Typography variant="body2">Recordarme</Typography>}
                />
                <Typography
                  variant="body2"
                  sx={{ color: '#A0BDB8', fontWeight: 600, cursor: 'not-allowed', userSelect: 'none' }}
                  title="Próximamente disponible"
                >
                  ¿Olvidaste tu contraseña?
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, bgcolor: '#3DAA96', borderRadius: 2, mb: 2.5, '&:hover': { bgcolor: '#2B8A78' } }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Iniciar Sesión'}
              </Button>

              <Divider sx={{ mb: 2.5 }}>
                <Typography variant="body2" color="text.secondary">o</Typography>
              </Divider>

              <Typography variant="body2" align="center" color="text.secondary">
                ¿Nuevo paciente?{' '}
                <Link component={RouterLink} to="/register" sx={{ color: '#3DAA96', fontWeight: 600, textDecoration: 'none' }}>
                  Registrarse
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          © 2026 Ecosalud Market. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
}
