import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent, CardMedia,
  Button, Grid, Link, Chip, Stack,
} from '@mui/material';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const FILTERS = ['Todas', 'Desintoxicación', 'Energía', 'Inmunidad', 'Dolor Crónico'];

const SERVICES = [
  {
    icon: <AccessibilityNewOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />,
    name: 'Acupuntura',
    description: 'Balance energético y alivio del dolor mediante técnicas milenarias integradas.',
    category: 'Dolor Crónico',
    image: '/assets/services/acupuntura.jpg',
  },
  {
    icon: <AirOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />,
    name: 'Oxivenaciones',
    description: 'Incremento de la oxigenación celular para potenciar el metabolismo.',
    category: 'Energía',
    image: '/assets/services/oxivenaciones.jpg',
  },
  {
    icon: <WaterDropOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />,
    name: 'Sueroterapia dirigida',
    description: 'Cócteles de micronutrientes para absorción inmediata y efectiva.',
    category: 'Inmunidad',
    image: '/assets/services/sueroterapia.jpg',
  },
  {
    icon: <CloudOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />,
    name: 'Ozonoterapia',
    description: 'Propiedades antiinflamatorias y moduladoras del sistema inmune.',
    category: 'Desintoxicación',
    image: '/assets/services/ozonoterapia.jpg',
  },
  {
    icon: <PsychologyOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />,
    name: 'Terapia Neural',
    description: 'Repolarización de membranas celulares para el sistema nervioso.',
    category: 'Dolor Crónico',
    image: '/assets/services/terapia-neural.jpg',
  },
  {
    icon: <MedicalServicesOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />,
    name: 'Biopuntura',
    description: 'Inyecciones de bajas dosis de bioterápicos para bioregulación natural.',
    category: 'Desintoxicación',
    image: '/assets/services/biopuntura.jpg',
  },
  {
    icon: <LocalPharmacyOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />,
    name: 'Farmacología Vegetal',
    description: 'Fórmulas personalizadas basadas en botánica médica avanzada.',
    category: 'Inmunidad',
    image: '/assets/services/farmacologia.jpg',
  },
  {
    icon: <SpaOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />,
    name: 'Homeopatia',
    description: 'Restauración de electrolitos y vitalidad para el máximo rendimiento.',
    category: 'Energía',
    image: '/assets/services/homeopatia.jpg',
  },
];

// Placeholder cuando la imagen no está disponible
function ImagePlaceholder({ icon }: { icon: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: '16/9',
        bgcolor: '#E8F5F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #D4EDE7',
      }}
    >
      {icon}
    </Box>
  );
}

function ServiceImage({ src, icon }: { src: string; icon: React.ReactNode }) {
  const [errored, setErrored] = useState(false);
  if (errored) return <ImagePlaceholder icon={icon} />;
  return (
    <CardMedia
      component="img"
      image={src}
      onError={() => setErrored(true)}
      sx={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
    />
  );
}

export default function ServicesPage() {
  const [activeFilter, setActiveFilter] = useState('Todas');

  const filtered = activeFilter === 'Todas'
    ? SERVICES
    : SERVICES.filter((s) => s.category === activeFilter);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 6 } }}>

        {/* ── Hero ── */}
        <Grid container spacing={4} alignItems="center" sx={{ mb: 5 }}>
          <Grid item xs={12} md={5}>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{ color: '#1A2E2A', lineHeight: 1.15, mb: 2, fontSize: { xs: '2rem', md: '2.6rem' } }}
            >
              Nuestro Catálogo de Terapias Integrales
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Descubre soluciones naturales diseñadas para restaurar tu equilibrio y bienestar vital.
            </Typography>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                height: { xs: 200, md: 280 },
                bgcolor: '#C8EDE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Reemplaza con la imagen del consultorio cuando la tengas */}
              <Box
                component="img"
                src="/assets/services/clinic-hero.jpg"
                alt="Consultorio Ecosalud"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none';
                }}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
              <Stack alignItems="center" spacing={1} sx={{ zIndex: 1, opacity: 0.5 }}>
                <SpaOutlinedIcon sx={{ fontSize: 64, color: '#2B8A78' }} />
                <Typography variant="body2" color="#2B8A78" fontWeight={600}>
                  Imagen del consultorio
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* ── Filtros ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 4 }}>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            Filtrar por:
          </Typography>
          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={f}
              onClick={() => setActiveFilter(f)}
              sx={{
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                bgcolor: activeFilter === f ? '#3DAA96' : 'transparent',
                color: activeFilter === f ? '#fff' : '#4A6B60',
                border: '1.5px solid',
                borderColor: activeFilter === f ? '#3DAA96' : '#C5DDD8',
                '&:hover': {
                  bgcolor: activeFilter === f ? '#2B8A78' : '#E8F5F0',
                  borderColor: '#3DAA96',
                },
              }}
            />
          ))}
        </Box>

        {/* ── Grid de servicios ── */}
        <Grid container spacing={2.5}>
          {filtered.map((service) => (
            <Grid item xs={12} sm={6} md={3} key={service.name}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  border: '1px solid #E4F0ED',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(61,170,150,0.18)',
                    transform: 'translateY(-3px)',
                    borderColor: '#3DAA96',
                  },
                }}
              >
                {/* Imagen */}
                <ServiceImage src={service.image} icon={service.icon} />

                <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.8, fontSize: '1rem' }}>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, flex: 1, mb: 2 }}>
                    {service.description}
                  </Typography>

                  <Button
                    component={RouterLink}
                    to="/appointments/book"
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: '#3DAA96',
                      borderRadius: 2,
                      fontWeight: 700,
                      mb: 1,
                      '&:hover': { bgcolor: '#2B8A78' },
                    }}
                  >
                    Agendar
                  </Button>
                  <Link
                    component={RouterLink}
                    to={`/services/${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                    underline="none"
                    sx={{
                      display: 'block',
                      textAlign: 'center',
                      color: '#3DAA96',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Ver detalles
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Container>

      <Footer />
    </Box>
  );
}
