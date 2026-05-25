import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Grid,
  Radio,
  Avatar,
} from '@mui/material';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useRegister } from '../../hooks/useRegister';
import doctorImage from '../../../assets/doctor-hero.jpg';
import Footer from '../../components/common/Footer';

const THERAPIES = ['Acupuntura', 'Sueroterapia', 'Farmacología', 'Ozonoterapia'];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [therapy, setTherapy] = useState('');
  const [healthGoal, setHealthGoal] = useState('');
  const { handleRegister, loading, error } = useRegister();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister({ name, lastName, email, therapy, healthGoal });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#EEF7F4', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1000,
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
            display: 'flex',
            minHeight: 680,
          }}
        >
          {/* ── Panel izquierdo teal ── */}
          <Box
            sx={{
              flex: '0 0 42%',
              bgcolor: '#3DAA96',
              p: 4,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpaOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                Ecosalud Market
              </Typography>
            </Box>

            {/* Headline */}
            <Box>
              <Typography
                variant="h3"
                sx={{ color: '#FFFFFF', lineHeight: 1.2, mb: 2.5, fontWeight: 800 }}
              >
                Tu camino hacia el bienestar integral.
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                Un espacio diseñado para reconectar con tu salud a través de la ciencia y la sabiduría natural.
              </Typography>
            </Box>

            {/* Tarjeta de testimonio */}
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 3,
                p: 2.5,
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar
                  src={doctorImage}
                  alt="Angélica Camacho"
                  sx={{ width: 44, height: 44, border: '2px solid rgba(255,255,255,0.5)' }}
                />
                <Box>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                    Angelica Camacho
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    Especialista Corpista
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <FormatQuoteIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, mt: 0.3, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.90)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  En Ecosalud Market, combinamos rigor científico con terapias alternativas para restaurar tu equilibrio vital.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ── Panel derecho — formulario ── */}
          <Box
            sx={{
              flex: 1,
              bgcolor: '#FFFFFF',
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Flecha de regreso al home */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                mb: 2.5,
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

            <Typography variant="h4" sx={{ color: '#3DAA96', mb: 0.5, fontWeight: 700 }}>
              Crear cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
              Comencemos tu viaje de sanación personalizada.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={onSubmit} noValidate>
              {/* Nombre y Apellido */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Nombre
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej. Juan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    size="small"
                  />
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Apellido
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej. Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Correo */}
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                Correo Electrónico
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="small"
                sx={{ mb: 2.5 }}
              />

              {/* Terapias */}
              <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
                ¿Has probado alguna de estas terapias antes?
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                {THERAPIES.map((t) => (
                  <Grid size={6} key={t}>
                    <Box
                      onClick={() => setTherapy(t === therapy ? '' : t)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1.5px solid',
                        borderColor: therapy === t ? '#3DAA96' : '#D8E8E4',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        bgcolor: therapy === t ? 'rgba(61,170,150,0.06)' : 'transparent',
                        '&:hover': { borderColor: '#3DAA96' },
                      }}
                    >
                      <Typography variant="body2">{t}</Typography>
                      <Radio
                        checked={therapy === t}
                        size="small"
                        sx={{
                          p: 0,
                          color: '#D8E8E4',
                          '&.Mui-checked': { color: '#3DAA96' },
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Objetivo de salud */}
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                ¿Qué buscas mejorar en tu salud?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Breve descripción..."
                value={healthGoal}
                onChange={(e) => setHealthGoal(e.target.value)}
                size="small"
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  bgcolor: '#3DAA96',
                  borderRadius: 2,
                  mb: 2,
                  '&:hover': { bgcolor: '#2B8A78' },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Completar Registro'}
              </Button>

              <Typography variant="body2" align="center" color="text.secondary">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{ color: '#3DAA96', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Inicia sesión
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
