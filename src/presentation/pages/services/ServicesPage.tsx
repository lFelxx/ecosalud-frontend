import { useState, useMemo } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';
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
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import CheckIcon from '@mui/icons-material/Check';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ServiceDetailModal from './ServiceDetailModal';
import type { ServiceDetail } from './ServiceDetailModal';
import { useAdminData } from '../../context/AdminDataContext';
import type { ServiceData } from '../../context/AdminDataContext';
import { useSeo } from '../../hooks/useSeo';

const FILTERS = ['Todas', 'Desintoxicación', 'Energía', 'Inmunidad', 'Dolor Crónico'];

// ── Ícono principal por ID de servicio ────────────────────────────────────────
const SERVICE_ICONS: Record<string, ReactNode> = {
  'acupuntura':          <AccessibilityNewOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />,
  'oxivenaciones':       <AirOutlinedIcon             sx={{ fontSize: 48, color: '#3DAA96' }} />,
  'sueroterapia-dirigida': <WaterDropOutlinedIcon     sx={{ fontSize: 48, color: '#3DAA96' }} />,
  'ozonoterapia':        <CloudOutlinedIcon           sx={{ fontSize: 48, color: '#3DAA96' }} />,
  'terapia-neural':      <PsychologyOutlinedIcon      sx={{ fontSize: 48, color: '#3DAA96' }} />,
  'biopuntura':          <MedicalServicesOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />,
  'farmacologia-vegetal':<LocalPharmacyOutlinedIcon   sx={{ fontSize: 48, color: '#3DAA96' }} />,
  'homeopatia':          <SpaOutlinedIcon             sx={{ fontSize: 48, color: '#3DAA96' }} />,
};

// Íconos que rotan para los beneficios (cuando no hay ícono específico)
const BENEFIT_ICONS: ReactNode[] = [
  <SpaOutlinedIcon />,
  <BoltOutlinedIcon />,
  <HealingOutlinedIcon />,
  <ShieldOutlinedIcon />,
  <FavoriteBorderIcon />,
  <NatureOutlinedIcon />,
  <CheckIcon />,
];

const DEFAULT_ICON = <SpaOutlinedIcon sx={{ fontSize: 48, color: '#3DAA96' }} />;

// ── Convierte ServiceData (admin) → ServiceDetail (modal/tarjeta) ─────────────
function toServiceDetail(s: ServiceData): ServiceDetail {
  return {
    name: s.name,
    category: s.category,
    description: s.description,
    // Si el admin subió una imagen (base64) la usamos directamente;
    // si no, intentamos cargar la imagen estática por convención de nombre.
    image: s.imageBase64 ?? `/assets/services/${s.id}.jpg`,
    icon: SERVICE_ICONS[s.id] ?? DEFAULT_ICON,
    benefits: s.benefitsText.map((text, i) => ({
      icon: BENEFIT_ICONS[i % BENEFIT_ICONS.length],
      text,
    })),
    duration: s.duration,
    price: s.price,
  };
}

// ── Placeholder cuando la imagen no está disponible ──────────────────────────
function ImagePlaceholder({ icon }: { icon: ReactNode }) {
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

function ServiceImage({ src, icon }: { src: string; icon: ReactNode }) {
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
  const { services, specialist } = useAdminData();
  const [activeFilter, setActiveFilter] = useState('Todas');

  useSeo(
    `Servicios | ${specialist.name} — Ecosalud`,
    services.length > 0
      ? `Descubre nuestros ${services.length} servicios especializados: ${services.slice(0, 3).map(s => s.name).join(', ')} y más.`
      : `Terapias especializadas de ${specialist.specialty}. Agenda tu cita en línea con ${specialist.name}.`,
  );
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  // Se recalcula solo cuando el array de servicios cambia en el contexto
  const serviceDetails = useMemo(() => services.map(toServiceDetail), [services]);

  const filtered = activeFilter === 'Todas'
    ? serviceDetails
    : serviceDetails.filter((s) => s.category === activeFilter);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 6 } }}>

        {/* ── Hero ── */}
        <Grid container spacing={4} sx={{ mb: 5, alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              variant="h3"
              sx={{ color: '#1A2E2A', lineHeight: 1.15, mb: 2, fontSize: { xs: '2rem', md: '2.6rem' }, fontWeight: 800 }}
            >
              Nuestro Catálogo de Terapias Integrales
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Descubre soluciones naturales diseñadas para restaurar tu equilibrio y bienestar vital.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
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
              <Box
                component="img"
                src="/assets/services/clinic-hero.jpg"
                alt="Consultorio Ecosalud"
                onError={(e: SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none';
                }}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
              <Stack sx={{ alignItems: 'center', zIndex: 1, opacity: 0.5 }} spacing={1}>
                <SpaOutlinedIcon sx={{ fontSize: 64, color: '#2B8A78' }} />
                <Typography variant="body2" color="#2B8A78" sx={{ fontWeight: 600 }}>
                  Imagen del consultorio
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* ── Filtros ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 4 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.secondary">
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={service.name}>
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
                <ServiceImage src={service.image} icon={service.icon} />

                <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ mb: 0.8, fontSize: '1rem', fontWeight: 700 }}>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, flex: 1, mb: 2 }}>
                    {service.description.slice(0, 90)}…
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#3DAA96', fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>
                    {service.price} · {service.duration}
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
                    component="button"
                    underline="none"
                    onClick={() => setSelectedService(service)}
                    sx={{
                      display: 'block',
                      textAlign: 'center',
                      color: '#3DAA96',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      p: 0,
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

      {/* ── Modal de detalle ── */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </Box>
  );
}
