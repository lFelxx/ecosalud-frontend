import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent,
  Button, Grid, Avatar, Stack, Link,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import doctorImage from '../../../assets/doctor-hero.jpg';

const SERVICES = [
  { icon: <AccessibilityNewOutlinedIcon />, name: 'Acupuntura', description: 'Balance energético y alivio del dolor crónico.', tags: ['BALANCE', 'DOLOR'] },
  { icon: <AirOutlinedIcon />, name: 'Oxivenaciones', description: 'Oxigenación celular para regenerar tejidos internos.', tags: ['OXÍGENO', 'VITALIDAD'] },
  { icon: <WaterDropOutlinedIcon />, name: 'Sueroterapia dirigida', description: 'Micronutrientes intravenosos de absorción inmediata.', tags: ['NUTRICIÓN', 'INMUNE'] },
  { icon: <CloudOutlinedIcon />, name: 'Ozonoterapia', description: 'Propiedades antiinflamatorias mediante ozono médico.', tags: ['ANTI-INFLAM'] },
  { icon: <PsychologyOutlinedIcon />, name: 'Terapia neural', description: 'Repolarización celular para el sistema nervioso.', tags: ['SISTEMA NERVIOSO'] },
  { icon: <MedicalServicesOutlinedIcon />, name: 'Biopuntura', description: 'Bioterápicos para activar la biorregulación natural.', tags: ['BIORREGULACIÓN'] },
];

const BENEFITS = [
  { icon: <VerifiedOutlinedIcon sx={{ fontSize: 32, color: '#3DAA96' }} />, title: 'Atención Certificada', desc: 'Tratamientos respaldados por ciencia y medicina biológica.' },
  { icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 32, color: '#3DAA96' }} />, title: 'Agenda Flexible', desc: 'Reserva y gestiona tus citas en cualquier momento.' },
  { icon: <FavoriteOutlinedIcon sx={{ fontSize: 32, color: '#3DAA96' }} />, title: 'Enfoque Integral', desc: 'Tratamos la causa raíz, no solo los síntomas.' },
];

function ServiceTag({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1.2, py: 0.4, bgcolor: '#E8F5F0', border: '1px solid #C0DED7', borderRadius: 1, color: '#2B7A6A', fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.6, whiteSpace: 'nowrap' }}>
      {label}
    </Box>
  );
}

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Hero ── */}
      <Box sx={{ bgcolor: '#F4FAF8', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, bgcolor: '#E8F5F0', border: '1px solid #B2DDD4', borderRadius: '999px', px: 1.8, py: 0.6, mb: 3 }}>
                <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 16 }} />
                <Typography variant="caption" fontWeight={700} sx={{ color: '#3DAA96', fontSize: '0.75rem' }}>
                  Terapias Alternativas Certificadas
                </Typography>
              </Box>
              <Typography variant="h2" fontWeight={800} sx={{ color: '#1A2E2A', lineHeight: 1.1, mb: 2.5, fontSize: { xs: '2rem', md: '3rem' } }}>
                Tu camino hacia el bienestar integral
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 4, maxWidth: 480 }}>
                Accede a terapias especializadas, agenda citas con la Dra. Angélica Camacho y gestiona tu historial de salud en un entorno seguro y profesional.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ bgcolor: '#3DAA96', borderRadius: 2, px: 3, fontWeight: 700, boxShadow: '0 4px 16px rgba(61,170,150,0.35)', '&:hover': { bgcolor: '#2B8A78' } }}
                >
                  Crear cuenta gratis
                </Button>
                <Button
                  component={RouterLink}
                  to="/services"
                  variant="outlined"
                  size="large"
                  sx={{ borderColor: '#3DAA96', color: '#3DAA96', borderRadius: 2, px: 3, fontWeight: 600, '&:hover': { bgcolor: '#E8F5F0', borderColor: '#2B8A78' } }}
                >
                  Ver servicios
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative', width: { xs: 260, md: 340 }, height: { xs: 260, md: 340 } }}>
                <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: '#C8EDE5', opacity: 0.6 }} />
                <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, borderRadius: '50%', border: '3px dashed #3DAA96', opacity: 0.35 }} />
                <Avatar
                  src={doctorImage}
                  alt="Dra. Angélica Camacho"
                  sx={{ width: '100%', height: '100%', border: '5px solid #fff', boxShadow: '0 8px 32px rgba(61,170,150,0.20)', position: 'relative', zIndex: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Beneficios ── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {BENEFITS.map((b) => (
              <Grid item xs={12} md={4} key={b.title}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ bgcolor: '#E8F5F0', borderRadius: 2, p: 1.2, flexShrink: 0 }}>{b.icon}</Box>
                  <Box>
                    <Typography fontWeight={700} sx={{ mb: 0.5 }}>{b.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{b.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Servicios ── */}
      <Box sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#1A2E2A', fontSize: { xs: '1.4rem', md: '2rem' } }}>
                Nuestros Servicios
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Terapias diseñadas para reactivar tu capacidad natural de sanación.
              </Typography>
            </Box>
            <Link component={RouterLink} to="/register" underline="none" sx={{ color: '#3DAA96', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Agendar cita <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Link>
          </Box>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: '1fr' } }}>
            {SERVICES.map((service) => (
              <Box
                key={service.name}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'row', sm: 'column', md: 'column', lg: 'row' },
                  alignItems: { xs: 'flex-start', lg: 'center' },
                  gap: { xs: 2, lg: 3 },
                  bgcolor: '#fff',
                  border: '1.5px solid #D8EDE8',
                  borderRadius: 3,
                  p: 2.5,
                  boxShadow: '0 2px 8px rgba(61,170,150,0.07)',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#3DAA96', boxShadow: '0 6px 20px rgba(61,170,150,0.16)', transform: 'translateY(-2px)' },
                }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#3DAA96', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {service.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} sx={{ mb: 0.4 }}>{service.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1 }}>{service.description}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {service.tags.map((tag) => <ServiceTag key={tag} label={tag} />)}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── CTA final ── */}
      <Box sx={{ bgcolor: '#3DAA96', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', mb: 1.5 }}>
            Comienza tu viaje de sanación hoy
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4 }}>
            Crea tu cuenta, agenda tu primera sesión y descubre un enfoque de salud diferente.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{ bgcolor: '#fff', color: '#3DAA96', fontWeight: 700, borderRadius: 2, px: 4, minWidth: 180, '&:hover': { bgcolor: '#E8F5F0' } }}
            >
              Registrarse gratis
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              size="large"
              sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', fontWeight: 600, borderRadius: 2, px: 4, minWidth: 180, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Ya tengo cuenta
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Dra. Camacho ── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Card sx={{ borderRadius: 4, bgcolor: '#E8F5F1', boxShadow: 'none' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ position: 'relative', width: 200, height: 200 }}>
                    <Box sx={{ position: 'absolute', bottom: -8, left: -8, width: 200, height: 200, borderRadius: '50%', border: '3px solid #3DAA96', opacity: 0.35 }} />
                    <Avatar src={doctorImage} alt="Dra. Angélica Camacho" sx={{ width: 200, height: 200, border: '4px solid #fff', boxShadow: '0 4px 20px rgba(0,0,0,0.14)', position: 'relative', zIndex: 1 }} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#1A2E2A', mb: 0.5 }}>
                    Dra. Angelica Camacho
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#3DAA96', fontWeight: 600, mb: 2 }}>
                    Especialista en Terapias Alternativas y Farmacología Vegetal
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                    Con más de 15 años de experiencia integrando la ciencia moderna con terapias naturales, la Dra. Camacho guía cada tratamiento en Ecosalud Market. Su enfoque se centra en tratar la causa raíz, no solo los síntomas.
                  </Typography>
                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#1A2E2A' }}>2.5k+</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: 1 }}>PACIENTES</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#1A2E2A' }}>15+</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: 1 }}>AÑOS EXP.</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
