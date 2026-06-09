import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Button, Grid, Avatar, Stack, Link, Chip,
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
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorder';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import doctorImage from '../../../assets/doctor-hero.jpg';
import { useAdminData } from '../../context/AdminDataContext';

// ── Datos ────────────────────────────────────────────────────────────────────

const SERVICES_PREVIEW = [
  { icon: <AccessibilityNewOutlinedIcon />, name: 'Acupuntura',            description: 'Balance energético y alivio del dolor crónico.',        tags: ['BALANCE', 'DOLOR'] },
  { icon: <AirOutlinedIcon />,             name: 'Oxivenaciones',          description: 'Oxigenación celular para regenerar tejidos internos.',    tags: ['OXÍGENO', 'VITALIDAD'] },
  { icon: <WaterDropOutlinedIcon />,       name: 'Sueroterapia dirigida',  description: 'Micronutrientes intravenosos de absorción inmediata.',    tags: ['NUTRICIÓN', 'INMUNE'] },
  { icon: <CloudOutlinedIcon />,           name: 'Ozonoterapia',           description: 'Propiedades antiinflamatorias mediante ozono médico.',    tags: ['ANTI-INFLAM'] },
  { icon: <PsychologyOutlinedIcon />,      name: 'Terapia neural',         description: 'Repolarización celular para el sistema nervioso.',        tags: ['SISTEMA NERVIOSO'] },
  { icon: <MedicalServicesOutlinedIcon />, name: 'Biopuntura',             description: 'Bioterápicos para activar la biorregulación natural.',   tags: ['BIORREGULACIÓN'] },
];

const BENEFITS = [
  { icon: <VerifiedOutlinedIcon sx={{ fontSize: 32, color: '#3DAA96' }} />,       title: 'Atención Certificada', desc: 'Tratamientos respaldados por ciencia y medicina biológica.' },
  { icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 32, color: '#3DAA96' }} />,  title: 'Agenda Flexible',      desc: 'Reserva y gestiona tus citas en cualquier momento.' },
  { icon: <FavoriteBorderOutlinedIcon sx={{ fontSize: 32, color: '#3DAA96' }} />, title: 'Enfoque Integral',     desc: 'Tratamos la causa raíz, no solo los síntomas.' },
];

// ── Componentes reutilizables ────────────────────────────────────────────────

function ServiceTag({ label }: { label: string }) {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', px: 1.2, py: 0.4,
      bgcolor: '#E8F5F0', border: '1px solid #C0DED7', borderRadius: 1,
      color: '#2B7A6A', fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.6, whiteSpace: 'nowrap',
    }}>
      {label}
    </Box>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { specialist } = useAdminData();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#F4FAF8', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, bgcolor: '#E8F5F0', border: '1px solid #B2DDD4', borderRadius: '999px', px: 1.8, py: 0.6, mb: 3 }}>
                <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#3DAA96', fontSize: '0.75rem', fontWeight: 700 }}>
                  Terapias Alternativas Certificadas
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ color: '#1A2E2A', lineHeight: 1.1, mb: 2.5, fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800 }}>
                Tu camino hacia el bienestar integral
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 4, maxWidth: 480 }}>
                Accede a terapias especializadas, agenda citas con la Dra. Angélica Camacho y gestiona tu historial de salud en un entorno seguro y profesional.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/register" variant="contained" size="large" endIcon={<ArrowForwardIcon />}
                  sx={{ bgcolor: '#3DAA96', borderRadius: 2, px: 3, fontWeight: 700, boxShadow: '0 4px 16px rgba(61,170,150,0.35)', '&:hover': { bgcolor: '#2B8A78' } }}>
                  Crear cuenta gratis
                </Button>
                <Button component={RouterLink} to="/catalog" variant="outlined" size="large"
                  sx={{ borderColor: '#3DAA96', color: '#3DAA96', borderRadius: 2, px: 3, fontWeight: 600, '&:hover': { bgcolor: '#E8F5F0', borderColor: '#2B8A78' } }}>
                  Ver servicios
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative', width: { xs: 260, md: 340 }, height: { xs: 260, md: 340 } }}>
                <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: '#C8EDE5', opacity: 0.6 }} />
                <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, borderRadius: '50%', border: '3px dashed #3DAA96', opacity: 0.35 }} />
                <Avatar src={doctorImage} alt="Dra. Angélica Camacho"
                  sx={{ width: '100%', height: '100%', border: '5px solid #fff', boxShadow: '0 8px 32px rgba(61,170,150,0.20)', position: 'relative', zIndex: 1 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          BENEFICIOS
      ════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {BENEFITS.map((b) => (
              <Grid size={{ xs: 12, md: 4 }} key={b.title}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ bgcolor: '#E8F5F0', borderRadius: 2, p: 1.2, flexShrink: 0 }}>{b.icon}</Box>
                  <Box>
                    <Typography sx={{ mb: 0.5, fontWeight: 700 }}>{b.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{b.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          SERVICIOS — vista previa
      ════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#1A2E2A', fontSize: { xs: '1.4rem', md: '2rem' }, fontWeight: 700 }}>
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
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: '1fr' } }}>
            {SERVICES_PREVIEW.map((service) => (
              <Box key={service.name} sx={{
                display: 'flex', alignItems: { xs: 'flex-start', lg: 'center' },
                gap: { xs: 2, lg: 3 }, bgcolor: '#fff', border: '1.5px solid #D8EDE8', borderRadius: 3,
                p: 2.5, boxShadow: '0 2px 8px rgba(61,170,150,0.07)', transition: 'all 0.2s',
                '&:hover': { borderColor: '#3DAA96', boxShadow: '0 6px 20px rgba(61,170,150,0.16)', transform: 'translateY(-2px)' },
              }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#3DAA96', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {service.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ mb: 0.4, fontWeight: 700 }}>{service.name}</Typography>
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

      {/* ════════════════════════════════════════════════════════════
          PERFIL ESPECIALISTA — preview (contenido completo en /especialista)
      ════════════════════════════════════════════════════════════ */}
      <Box id="especialista" sx={{ bgcolor: '#EFF8F4', py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 7 }} sx={{ alignItems: 'center' }}>

            {/* Foto */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative', width: 230, height: 230 }}>
                <Box sx={{ position: 'absolute', width: 274, height: 274, top: -22, left: -22, borderRadius: '50%', border: '3px solid #3DAA96', opacity: 0.18 }} />
                <Box sx={{
                  position: 'absolute', width: 254, height: 254, top: -12, left: -12, borderRadius: '50%',
                  borderTop: '5px solid #3DAA96', borderRight: '5px solid #3DAA96',
                  borderBottom: '5px solid transparent', borderLeft: '5px solid transparent',
                  transform: 'rotate(-30deg)', opacity: 0.7,
                }} />
                <Avatar
                  src={specialist.photoBase64 ?? doctorImage}
                  alt={specialist.name}
                  sx={{ width: 230, height: 230, border: '5px solid #fff', boxShadow: '0 10px 36px rgba(61,170,150,0.22)', position: 'relative', zIndex: 1 }}
                />
              </Box>
            </Grid>

            {/* Contenido */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #9DBFBA', borderRadius: '999px', px: 1.6, py: 0.4, mb: 2 }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#5A7A74', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                  {specialist.badge}
                </Typography>
              </Box>

              {/* Nombre — clickeable */}
              <Link component={RouterLink} to="/especialista" underline="none" sx={{ display: 'block', width: 'fit-content' }}>
                <Typography variant="h3" sx={{
                  fontWeight: 800, color: '#1A2E2A', lineHeight: 1.15, mb: 0.6,
                  fontSize: { xs: '1.8rem', md: '2.2rem' },
                  transition: 'color 0.2s', cursor: 'pointer',
                  '&:hover': { color: '#3DAA96' },
                }}>
                  {specialist.name}
                </Typography>
              </Link>

              <Typography variant="body1" sx={{ color: '#5A7A74', fontWeight: 500, mb: 1.5 }}>
                {specialist.specialty}
              </Typography>
              <Box sx={{ width: 44, height: 3, bgcolor: '#3DAA96', borderRadius: 2, mb: 2.5 }} />

              {/* Bio con universidad resaltada */}
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3, maxWidth: 560 }}>
                {specialist.university
                  ? specialist.bio.split(specialist.university).flatMap((part, i, arr) =>
                      i < arr.length - 1
                        ? [<span key={`p-${i}`}>{part}</span>, <Box key={`u-${i}`} component="span" sx={{ color: '#2B8A78', fontWeight: 700 }}>{specialist.university}</Box>]
                        : [<span key={`p-${i}`}>{part}</span>]
                    )
                  : specialist.bio}
              </Typography>

              {/* Credenciales */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Chip icon={<VerifiedOutlinedIcon sx={{ fontSize: '16px !important', color: '#3DAA96 !important' }} />} label={specialist.credential1} size="small"
                  sx={{ bgcolor: '#E8F5F0', color: '#2B7A6A', fontWeight: 600, border: '1px solid #B2DDD4', borderRadius: '999px', px: 0.5 }} />
                <Chip icon={<SchoolOutlinedIcon sx={{ fontSize: '16px !important', color: '#3DAA96 !important' }} />} label={specialist.credential2} size="small"
                  sx={{ bgcolor: '#E8F5F0', color: '#2B7A6A', fontWeight: 600, border: '1px solid #B2DDD4', borderRadius: '999px', px: 0.5 }} />
              </Box>

              {/* Ver perfil completo */}
              <Box sx={{ mt: 2.5 }}>
                <Link component={RouterLink} to="/especialista" underline="none"
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#3DAA96', fontWeight: 700, fontSize: '0.88rem', '&:hover': { gap: 1, color: '#2B8A78' }, transition: 'gap 0.2s, color 0.2s' }}>
                  Ver perfil completo <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A', mb: 1.5, fontSize: { xs: '1.3rem', md: '1.7rem' } }}>
            ¿Listo para comenzar?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 4, maxWidth: 440, mx: 'auto' }}>
            Conoce en detalle el perfil de nuestra especialista y agenda una sesión personalizada.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button component={RouterLink} to="/especialista" variant="contained" size="large" endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: '#3DAA96', borderRadius: 2, px: 3.5, fontWeight: 700, boxShadow: '0 4px 16px rgba(61,170,150,0.35)', '&:hover': { bgcolor: '#2B8A78' } }}>
              Ver Perfil del Especialista
            </Button>
            <Button component={RouterLink} to="/appointments/book" variant="outlined" size="large"
              sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, px: 3.5, fontWeight: 600, '&:hover': { borderColor: '#3DAA96', color: '#3DAA96', bgcolor: '#F0F8F5' } }}>
              Agendar Cita
            </Button>
          </Stack>
        </Container>
      </Box>

      <Footer />

      {/* ════════════════════════════════════════════════════════════
          BOTÓN FLOTANTE — Maquetación / Wireframe
      ════════════════════════════════════════════════════════════ */}
      <Box
        component={RouterLink}
        to="/wireframe"
        sx={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#2B3A36',
          color: '#CCDDCA',
          borderRadius: '10px',
          px: 2.2,
          py: 1.3,
          textDecoration: 'none',
          fontSize: '0.78rem',
          fontWeight: 700,
          fontFamily: 'monospace',
          boxShadow: '0 4px 18px rgba(0,0,0,0.30)',
          letterSpacing: 0.4,
          border: '1.5px solid #4A6B60',
          '&:hover': {
            bgcolor: '#1A2E2A',
            color: '#fff',
            boxShadow: '0 6px 24px rgba(0,0,0,0.40)',
          },
          transition: 'all 0.2s',
        }}
      >
        📐 Ver Maquetación
      </Box>
    </Box>
  );
}
