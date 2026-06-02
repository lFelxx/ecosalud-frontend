import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent, Button,
  Grid, Avatar, Stack, Link, IconButton, Chip,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import StarIcon from '@mui/icons-material/Star';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import doctorImage from '../../../assets/doctor-hero.jpg';
import { useAdminData } from '../../context/AdminDataContext';

// ── Testimonios ───────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { quote: 'Después de meses de dolor lumbar, la terapia neural con la Dra. Angélica me devolvió la movilidad. Su enfoque es humano y profundamente profesional.', name: 'Ricardo Mendoza', type: 'Paciente de Biopuntura' },
  { quote: 'La farmacología vegetal fue la clave para regular mi metabolismo de forma orgánica. Ecosalud es un lugar de verdadera sanación.', name: 'Elena Vargas', type: 'Control Metabólico' },
  { quote: 'Excelente atención. Se nota el respaldo académico de la Universidad Corpas en cada diagnóstico. Muy recomendada.', name: 'Javier Solano', type: 'Paciente Crónico' },
  { quote: 'La sueroterapia transformó mi energía. Me siento como nueva después de cada sesión con el equipo de Ecosalud.', name: 'Claudia Restrepo', type: 'Paciente de Sueroterapia' },
  { quote: 'La ozonoterapia fue clave para mi recuperación post-viral. Resultados sorprendentes en pocas sesiones.', name: 'Andrés Torres', type: 'Recuperación Viral' },
];

// ── Componentes internos ──────────────────────────────────────────────────────

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.3, mb: 1.5 }}>
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} sx={{ fontSize: 18, color: '#F4C430' }} />
      ))}
    </Box>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function SpecialistProfilePage() {
  const { specialist } = useAdminData();
  const [testimonialStart, setTestimonialStart] = useState(0);
  const N = TESTIMONIALS.length;
  const prevT = () => setTestimonialStart((s) => (s - 1 + N) % N);
  const nextT = () => setTestimonialStart((s) => (s + 1) % N);
  const visibleTestimonials = [0, 1, 2].map((off) => TESTIMONIALS[(testimonialStart + off) % N]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ════════════════════════════════════════════════════════════
          BREADCRUMB
      ════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E4F0ED', py: 1.2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link
              component={RouterLink}
              to="/"
              underline="none"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#9DBFBA', fontSize: '0.82rem', fontWeight: 600, '&:hover': { color: '#3DAA96' } }}
            >
              <ArrowBackIcon sx={{ fontSize: 15 }} /> Inicio
            </Link>
            <Typography sx={{ color: '#C5DDD8', fontSize: '0.82rem' }}>·</Typography>
            <Typography sx={{ color: '#4A6B60', fontSize: '0.82rem', fontWeight: 600 }}>
              Especialista
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          HERO — PERFIL DEL ESPECIALISTA
      ════════════════════════════════════════════════════════════ */}
      <Box id="especialista" sx={{ bgcolor: '#EFF8F4', py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 7 }} sx={{ alignItems: 'center' }}>

            {/* Foto con arco decorativo */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative', width: 240, height: 240 }}>
                <Box sx={{
                  position: 'absolute', width: 286, height: 286, top: -23, left: -23,
                  borderRadius: '50%', border: '3px solid #3DAA96', opacity: 0.18,
                }} />
                <Box sx={{
                  position: 'absolute', width: 264, height: 264, top: -12, left: -12,
                  borderRadius: '50%',
                  borderTop: '5px solid #3DAA96',
                  borderRight: '5px solid #3DAA96',
                  borderBottom: '5px solid transparent',
                  borderLeft: '5px solid transparent',
                  transform: 'rotate(-30deg)',
                  opacity: 0.75,
                }} />
                <Avatar
                  src={specialist.photoBase64 ?? doctorImage}
                  alt={specialist.name}
                  sx={{
                    width: 240, height: 240,
                    border: '5px solid #fff',
                    boxShadow: '0 12px 40px rgba(61,170,150,0.22)',
                    position: 'relative', zIndex: 1,
                  }}
                />
              </Box>
            </Grid>

            {/* Contenido */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Badge */}
              <Box sx={{
                display: 'inline-flex', alignItems: 'center',
                border: '1.5px solid #9DBFBA', borderRadius: '999px',
                px: 1.6, py: 0.4, mb: 2,
              }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#5A7A74', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                  {specialist.badge}
                </Typography>
              </Box>

              {/* Nombre */}
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1A2E2A', lineHeight: 1.15, mb: 0.6, fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
                {specialist.name}
              </Typography>

              {/* Especialidad */}
              <Typography variant="body1" sx={{ color: '#5A7A74', fontWeight: 500, mb: 1.5 }}>
                {specialist.specialty}
              </Typography>

              {/* Línea decorativa */}
              <Box sx={{ width: 44, height: 3, bgcolor: '#3DAA96', borderRadius: 2, mb: 2.5 }} />

              {/* Bio con universidad resaltada */}
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85, mb: 3, maxWidth: 580 }}>
                {specialist.university
                  ? specialist.bio.split(specialist.university).flatMap((part, i, arr) =>
                      i < arr.length - 1
                        ? [
                            <span key={`p-${i}`}>{part}</span>,
                            <Box key={`u-${i}`} component="span" sx={{ color: '#2B8A78', fontWeight: 700 }}>
                              {specialist.university}
                            </Box>,
                          ]
                        : [<span key={`p-${i}`}>{part}</span>]
                    )
                  : specialist.bio}
              </Typography>

              {/* Credenciales */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3.5 }}>
                <Chip
                  icon={<VerifiedOutlinedIcon sx={{ fontSize: '16px !important', color: '#3DAA96 !important' }} />}
                  label={specialist.credential1}
                  size="small"
                  sx={{ bgcolor: '#E8F5F0', color: '#2B7A6A', fontWeight: 600, border: '1px solid #B2DDD4', borderRadius: '999px', px: 0.5 }}
                />
                <Chip
                  icon={<SchoolOutlinedIcon sx={{ fontSize: '16px !important', color: '#3DAA96 !important' }} />}
                  label={specialist.credential2}
                  size="small"
                  sx={{ bgcolor: '#E8F5F0', color: '#2B7A6A', fontWeight: 600, border: '1px solid #B2DDD4', borderRadius: '999px', px: 0.5 }}
                />
              </Box>

              {/* Botón de agenda */}
              <Button
                component={RouterLink}
                to="/appointments/book"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#3DAA96', borderRadius: 2, px: 3.5, fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(61,170,150,0.35)',
                  '&:hover': { bgcolor: '#2B8A78' },
                }}
              >
                Agendar consulta
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          SERVICIOS CLÍNICOS — MOSAICO
      ════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2E2A', mb: 0.8, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Nuestros Servicios Clínicos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tratamientos especializados para una salud integral
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {/* Biopuntura */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{
                borderRadius: 3, height: '100%', border: '1.5px solid #E4F0ED',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.22s',
                '&:hover': { boxShadow: '0 8px 24px rgba(61,170,150,0.16)', borderColor: '#3DAA96', transform: 'translateY(-2px)' },
              }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: '#E8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: '#3DAA96' }}>
                    <MedicalServicesOutlinedIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A2E2A', mb: 1 }}>Biopuntura</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, mb: 2.5 }}>
                    Utilizamos biorreguladores inyectables en puntos específicos para estimular los procesos naturales de curación del cuerpo. Ideal para dolores crónicos e inflamación persistente.
                  </Typography>
                  <Link component={RouterLink} to="/services" underline="none"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#3DAA96', fontWeight: 700, fontSize: '0.85rem', '&:hover': { gap: 1 }, transition: 'gap 0.2s' }}>
                    MÁS INFORMACIÓN <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Link>
                </CardContent>
              </Card>
            </Grid>

            {/* Terapia Neural */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{
                borderRadius: 3, height: '100%', border: '1.5px solid #E4F0ED',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.22s',
                '&:hover': { boxShadow: '0 8px 24px rgba(61,170,150,0.16)', borderColor: '#3DAA96', transform: 'translateY(-2px)' },
              }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: '#FFF8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: '#E8A01A' }}>
                    <BoltOutlinedIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A2E2A', mb: 1 }}>Terapia Neural</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                    Tratamiento que busca neutralizar las irritaciones del sistema nervioso para facilitar la autorregulación orgánica y el alivio del dolor.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Farmacología Vegetal */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{
                borderRadius: 3, height: '100%', border: '1.5px solid #E4F0ED',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.22s',
                '&:hover': { boxShadow: '0 8px 24px rgba(61,170,150,0.16)', borderColor: '#3DAA96', transform: 'translateY(-2px)' },
              }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: '#EEF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: '#6B6FD4' }}>
                    <LocalPharmacyOutlinedIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A2E2A', mb: 1 }}>Farmacología Vegetal</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                    Prescripción experta de fitoterapéuticos con base científica para el manejo de diversas patologías.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Ozonoterapia — tarjeta destacada */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{
                borderRadius: 3, height: '100%',
                background: 'linear-gradient(135deg, #1A3E38 0%, #2B6B5C 60%, #3DAA96 100%)',
                boxShadow: '0 8px 32px rgba(26,62,56,0.35)',
                position: 'relative', overflow: 'hidden',
              }}>
                <Box sx={{
                  position: 'absolute', inset: 0, opacity: 0.06,
                  backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%), radial-gradient(circle at 20% 80%, #fff 0%, transparent 50%)',
                }} />
                <CardContent sx={{ p: 3.5, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, color: '#fff' }}>
                      <CloudOutlinedIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff', mb: 1.2, lineHeight: 1.3 }}>
                      Ozonoterapia &amp; Sueroterapia
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.80)', lineHeight: 1.75, mb: 3 }}>
                      Fortalecimiento inmunológico y revitalización celular mediante técnicas avanzadas de medicina biorreguladora de alta precisión.
                    </Typography>
                  </Box>
                  <Button
                    component={RouterLink}
                    to="/appointments/book"
                    variant="outlined"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.55)', color: '#fff', borderRadius: 2, fontWeight: 700, alignSelf: 'flex-start',
                      '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' },
                    }}
                  >
                    Agenda tu evaluación
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Ver catálogo completo */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={RouterLink}
              to="/services"
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderColor: '#C5DDD8', color: '#3DAA96', borderRadius: 2, fontWeight: 700, px: 3.5,
                '&:hover': { borderColor: '#3DAA96', bgcolor: '#E8F5F0' },
              }}
            >
              Ver catálogo completo de terapias
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          TESTIMONIOS — CARRUSEL
      ════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#F5C5B5', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: { xs: 3, md: 4 }, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#8B4A3A', fontWeight: 700, letterSpacing: 1.5, fontSize: '0.7rem' }}>
                Voces de Recuperación
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#2D1A14', mt: 0.3, mb: 0.5, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
                Historias reales de pacientes
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B3A2E' }}>
                que eligieron lo natural
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={prevT} sx={{ bgcolor: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(139,74,58,0.25)', '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' } }}>
                <ChevronLeftIcon sx={{ color: '#5A2A1E' }} />
              </IconButton>
              <IconButton onClick={nextT} sx={{ bgcolor: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(139,74,58,0.25)', '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' } }}>
                <ChevronRightIcon sx={{ color: '#5A2A1E' }} />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {visibleTestimonials.map((t, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card sx={{
                  borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: 'none', transition: 'transform 0.22s', '&:hover': { transform: 'translateY(-3px)' },
                }}>
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <StarRating />
                    <Typography variant="body2" sx={{ color: '#2D3A38', lineHeight: 1.75, flex: 1, mb: 2.5, fontStyle: 'italic', fontSize: '0.88rem' }}>
                      "{t.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 38, height: 38, bgcolor: '#D4EDE7', color: '#3DAA96', fontSize: '0.85rem', fontWeight: 700 }}>
                        {t.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2E2A', lineHeight: 1.2 }}>
                          {t.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.type}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.8, mt: 3 }}>
            {Array.from({ length: N }).map((_, i) => (
              <Box
                key={i}
                onClick={() => setTestimonialStart(i)}
                sx={{
                  width: i === testimonialStart ? 20 : 7, height: 7,
                  borderRadius: '999px',
                  bgcolor: i === testimonialStart ? '#5A2A1E' : 'rgba(90,42,30,0.3)',
                  cursor: 'pointer', transition: 'all 0.25s',
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 9 } }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 3, bgcolor: '#E8F5F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3, boxShadow: '0 4px 16px rgba(61,170,150,0.20)',
          }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 38, color: '#3DAA96' }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2E2A', mb: 1.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            Comienza tu camino al bienestar hoy
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 4, maxWidth: 440, mx: 'auto' }}>
            Agenda una cita de valoración con{' '}
            <Box component="span" sx={{ color: '#2B8A78', fontWeight: 700 }}>{specialist.name}</Box>
            {' '}y descubre el poder de la medicina alternativa.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              component={RouterLink}
              to="/appointments/book"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#3DAA96', borderRadius: 2, px: 3.5, fontWeight: 700,
                boxShadow: '0 4px 16px rgba(61,170,150,0.35)',
                '&:hover': { bgcolor: '#2B8A78' },
              }}
            >
              Agendar Cita Ahora
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PhoneOutlinedIcon />}
              sx={{
                borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, px: 3.5, fontWeight: 600,
                '&:hover': { borderColor: '#3DAA96', color: '#3DAA96', bgcolor: '#F0F8F5' },
              }}
            >
              Contactar Soporte
            </Button>
          </Stack>

          <Box sx={{ mt: 4 }}>
            <Link
              component={RouterLink}
              to="/"
              underline="none"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#9DBFBA', fontWeight: 600, fontSize: '0.85rem', '&:hover': { color: '#3DAA96' } }}
            >
              <SpaOutlinedIcon sx={{ fontSize: 16 }} /> Volver a Ecosalud
            </Link>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
