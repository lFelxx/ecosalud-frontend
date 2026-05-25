import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent,
  Button, Grid, Avatar, Stack, Divider, Link,
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import doctorImage from '../../../assets/doctor-hero.jpg';

const SERVICES = [
  {
    icon: <AccessibilityNewOutlinedIcon />,
    name: 'Acupuntura',
    description: 'Balance energético y alivio del dolor crónico a través de técnicas milenarias con estándares clínicos modernos.',
    tags: ['BALANCE', 'DOLOR'],
  },
  {
    icon: <AirOutlinedIcon />,
    name: 'Oxivenaciones',
    description: 'Incremento de la oxigenación celular para potenciar el metabolismo y la regeneración de tejidos internos.',
    tags: ['OXÍGENO', 'VITALIDAD'],
  },
  {
    icon: <WaterDropOutlinedIcon />,
    name: 'Sueroterapia dirigida',
    description: 'Cócteles de micronutrientes administrados vía intravenosa para una absorción inmediata y efectiva.',
    tags: ['NUTRICIÓN', 'INMUNE'],
  },
  {
    icon: <CloudOutlinedIcon />,
    name: 'Ozonoterapia',
    description: 'Propiedades antiinflamatorias y moduladoras del sistema inmune mediante el uso médico del ozono.',
    tags: ['ANTI-INFLAM'],
  },
  {
    icon: <PsychologyOutlinedIcon />,
    name: 'Terapia neural',
    description: 'Repolarización de membranas celulares para tratar campos de interferencia en el sistema nervioso.',
    tags: ['SISTEMA NERVIOSO'],
  },
  {
    icon: <MedicalServicesOutlinedIcon />,
    name: 'Biopuntura',
    description: 'Inyecciones de bajas dosis de bioterápicos en puntos específicos para activar la biorregulación.',
    tags: ['BIORREGULACIÓN'],
  },
];

// ── Tag rectangular reutilizable ──
function ServiceTag({ label }: { label: string }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.2,
        py: 0.4,
        bgcolor: '#E8F5F0',
        border: '1px solid #C0DED7',
        borderRadius: 1,
        color: '#2B7A6A',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: 0.6,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 4 } }}>

        {/* ── Hero ── */}
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center" sx={{ mb: { xs: 4, md: 5 } }}>
          <Grid item xs={12} md={7}>
            {/* Chip "Paciente Activo" con punto centrado */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                bgcolor: '#3DAA96',
                color: '#fff',
                borderRadius: '999px',
                px: 1.5,
                py: 0.5,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#fff',
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.75rem', lineHeight: 1 }}>
                Paciente Activo
              </Typography>
            </Box>

            <Typography
              variant="h3"
              fontWeight={800}
              sx={{ color: '#1A2E2A', lineHeight: 1.15, mb: 2, fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' } }}
            >
              Tu camino hacia el bienestar natural
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 460, lineHeight: 1.7 }}>
              Bienvenido de nuevo. Aquí puedes gestionar tu progreso clínico, agendar nuevas sesiones y revisar tus fórmulas botánicas bajo la guía de la especialista Angelica Camacho.
            </Typography>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                borderRadius: 4,
                p: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: 160, md: 220 },
                width: '100%',
              }}
            >
              <Box sx={{ textAlign: 'center', color: '#1A2E2A', opacity: 0.85 }}>
                <MedicalServicesOutlinedIcon sx={{ fontSize: { xs: 70, md: 100 } }} />
                <SpaOutlinedIcon sx={{ fontSize: { xs: 42, md: 60 }, color: '#3DAA96', display: 'block', mx: 'auto', mt: -2 }} />
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* ── Próximas Sesiones ── */}
        <Card sx={{ borderRadius: 3, mb: { xs: 4, md: 6 }, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <CalendarTodayOutlinedIcon sx={{ color: '#3DAA96', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={700}>Próximas Sesiones</Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                borderLeft: '4px solid #3DAA96',
                pl: 2,
                py: 1.5,
                borderRadius: '0 8px 8px 0',
                bgcolor: '#F8FDFB',
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#3DAA96', mb: 0.3 }}>
                  Mañana, 09:30 AM
                </Typography>
                <Typography variant="body1" fontWeight={700}>Ozonoterapia</Typography>
                <Typography variant="caption" color="text.secondary">
                  Sesión 4 de 10 — Fase de Saturación
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                component={RouterLink}
                to="/appointments"
                sx={{ borderColor: '#C5DDD8', color: '#3DAA96', borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Ver Detalles
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" fontStyle="italic">
                "La persistencia en el tratamiento es la base de la regeneración."
              </Typography>
              <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 18, flexShrink: 0 }} />
            </Box>
          </CardContent>
        </Card>

        {/* ── Servicios Destacados ── */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexWrap: 'wrap',
              gap: 1,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#1A2E2A', fontSize: { xs: '1.4rem', md: '2rem' } }}>
                Nuestros Servicios Destacados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 400 }}>
                Explora terapias especializadas diseñadas para reactivar los mecanismos de autocuración de tu organismo.
              </Typography>
            </Box>
            <Link
              component={RouterLink}
              to="/services"
              underline="none"
              sx={{ color: '#3DAA96', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}
            >
              Ver catálogo completo <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Link>
          </Box>

          {/* Grid en pantallas medianas / Lista en pantallas grandes o con zoom */}
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              mt: 0.5,
              gridTemplateColumns: {
                xs: '1fr',           // lista (1 col) en móvil
                sm: 'repeat(2, 1fr)', // 2 col en tablet
                md: 'repeat(3, 1fr)', // 3 col en desktop normal
                lg: '1fr',           // lista (1 col) en pantallas muy grandes / zoom alto
              },
            }}
          >
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
                  p: { xs: 2, md: 2.5 },
                  boxShadow: '0 2px 8px rgba(61,170,150,0.07)',
                  transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(61,170,150,0.16)',
                    borderColor: '#3DAA96',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Ícono */}
                <Box
                  sx={{
                    width: 48, height: 48,
                    borderRadius: 2,
                    bgcolor: '#3DAA96',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {service.icon}
                </Box>

                {/* Contenido */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} sx={{ mb: 0.5, fontSize: '1rem' }}>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1.2 }}>
                    {service.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {service.tags.map((tag) => (
                      <ServiceTag key={tag} label={tag} />
                    ))}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Dra. Angelica Camacho ──
            Para editar: cambia el texto en las líneas Typography de esta sección.
            - Especialidad: línea con "Especialista en Terapias Alternativas..."
            - Descripción: el párrafo debajo
            - Estadísticas: los valores 2.5k+ y 15+
        */}
        <Card sx={{ borderRadius: 4, bgcolor: '#E8F5F1', boxShadow: 'none', mb: 2, overflow: 'visible' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
              {/* Foto contenida en el círculo */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}>
                  {/* Círculo decorativo de fondo desplazado */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -8,
                      left: -8,
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      border: '3px solid #3DAA96',
                      opacity: 0.35,
                    }}
                  />
                  {/* Avatar contenido exactamente dentro del área */}
                  <Avatar
                    src={doctorImage}
                    alt="Dra. Angélica Camacho"
                    sx={{
                      width: 200,
                      height: 200,
                      border: '4px solid #fff',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#1A2E2A', mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                  Dra. Angelica Camacho
                </Typography>

                {/* ✏️ EDITA AQUÍ la especialidad */}
                <Typography variant="body2" sx={{ color: '#3DAA96', fontWeight: 600, mb: 2 }}>
                  Especialista en Terapias Alternativas y Farmacología Vegetal
                </Typography>

                {/* ✏️ EDITA AQUÍ el texto descriptivo */}
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

      <Footer />
    </Box>
  );
}
