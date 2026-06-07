/**
 * LandingPage — Página de marketing de la plataforma Ecosalud Market.
 *
 * Audiencia objetivo: Profesionales de salud (médicos, terapeutas, psicólogos,
 * nutricionistas, fisioterapeutas, etc.) que buscan digitalizar su práctica clínica.
 *
 * Objetivo: Convertir visitantes en registros para el trial de 14 días.
 */

import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Container, Button, Grid, Avatar, Stack, Chip,
  IconButton,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import PlatformNavbar from '../../components/common/PlatformNavbar';
import Footer from '../../components/common/Footer';
import { useSeo } from '../../hooks/useSeo';
import axiosClient from '../../../infrastructure/http/axiosClient';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface FeaturedClinic {
  ownerName:  string;
  specialty:  string;
  clinicName: string;
  city:       string | null;
  logoUrl:    string | null;
  plan:       string;
}

interface PlatformData {
  totalClinics:    number;
  trialClinics:    number;
  featuredClinics: FeaturedClinic[];
}

// ── Datos estáticos ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon:  <CalendarMonthOutlinedIcon sx={{ fontSize: 28 }} />,
    color: '#3DAA96',
    bg:    '#E8F5F0',
    title: 'Agenda online 24/7',
    desc:  'Tus pacientes agendan desde cualquier dispositivo, en cualquier momento. Tú decides tu disponibilidad.',
  },
  {
    icon:  <MedicalServicesOutlinedIcon sx={{ fontSize: 28 }} />,
    color: '#5A5FC8',
    bg:    '#EEEEF8',
    title: 'Historia Clínica Electrónica',
    desc:  'Cumple la Res. 1995/1999 del MinSalud. Registros inmutables, firma de bloqueo y hash SHA-256.',
  },
  {
    icon:  <NotificationsActiveOutlinedIcon sx={{ fontSize: 28 }} />,
    color: '#E67E22',
    bg:    '#FFF3E8',
    title: 'Recordatorios automáticos',
    desc:  'Email, SMS y WhatsApp 24h antes de cada cita. Reduce las inasistencias hasta un 40%.',
  },
  {
    icon:  <CreditCardOutlinedIcon sx={{ fontSize: 28 }} />,
    color: '#27AE60',
    bg:    '#EAF7EE',
    title: 'Pagos con PayU Colombia',
    desc:  'Acepta tarjeta, PSE, Efecty y Nequi. Recibe pagos antes de la consulta sin fricción.',
  },
  {
    icon:  <GavelOutlinedIcon sx={{ fontSize: 28 }} />,
    color: '#C0392B',
    bg:    '#FDE8E8',
    title: 'Consentimientos digitales',
    desc:  'Firma electrónica inmutable del paciente. Almacenamiento seguro con trazabilidad legal.',
  },
  {
    icon:  <IntegrationInstructionsOutlinedIcon sx={{ fontSize: 28 }} />,
    color: '#9B59B6',
    bg:    '#F4EEF8',
    title: 'Interoperabilidad FHIR R4',
    desc:  'Compatible con SISPRO (Res. 2654/2019). Exporta Patient y Encounter en estándar internacional.',
  },
];

const PROBLEMS = [
  { pain: '¿Agenda de papel o WhatsApp?',      fix: 'Agenda digital con confirmación automática' },
  { pain: '¿Historia clínica en carpetas?',    fix: 'HCE electrónica que cumple la ley' },
  { pain: '¿Llamando a confirmar citas?',      fix: 'Recordatorios automáticos SMS y WhatsApp' },
  { pain: '¿Cobrando por transferencia?',      fix: 'Pasarela de pago integrada con PayU' },
];

const STEPS = [
  { n: '01', title: 'Regístrate en 5 min', desc: 'Crea tu clínica digital con tu nombre, especialidad y configuración inicial. Sin tarjeta.' },
  { n: '02', title: 'Configura tu espacio', desc: 'Agrega tus servicios, personaliza tu agenda, sube tu logo y vincula tu especialista.' },
  { n: '03', title: 'Recibe pacientes', desc: 'Comparte tu link de agendamiento, activa los recordatorios y gestiona todo desde el panel.' },
];

const PLAN_PREVIEW = [
  { name: 'Starter', price: '$29', cop: '~$120.000 COP', period: '/mes USD', limit: '1 especialista · 50 citas/mes', color: '#5A7A74', popular: false },
  { name: 'Pro',     price: '$79', cop: '~$330.000 COP', period: '/mes USD', limit: '3 especialistas · 300 citas/mes', color: '#3DAA96', popular: true  },
  { name: 'Clínica', price: '$199', cop: '~$820.000 COP', period: '/mes USD', limit: 'Ilimitado · Multi-especialista', color: '#1A4A3E', popular: false },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function planColor(plan: string) {
  const map: Record<string, string> = { STARTER: '#5A7A74', PRO: '#3DAA96', CLINIC: '#1A4A3E', FOUNDER: '#8B4513' };
  return map[plan] ?? '#9DBFBA';
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<PlatformData | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useSeo(
    'Ecosalud Market — Plataforma digital para profesionales de salud en Colombia',
    'Digitaliza tu clínica en minutos. Agenda online, historia clínica electrónica, recordatorios automáticos y pagos integrados. 14 días gratis.',
  );

  useEffect(() => {
    axiosClient.get<PlatformData>('/public/platform')
      .then(r => setPlatform(r.data))
      .catch(() => { /* silencioso */ });
  }, []);

  // Auto-scroll del carrusel
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 280, behavior: 'smooth' });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [platform]);

  const scrollCarousel = useCallback((dir: 'left' | 'right') => {
    carouselRef.current?.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
  }, []);

  const clinics = platform?.featuredClinics ?? [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFCFB', display: 'flex', flexDirection: 'column' }}>
      <PlatformNavbar />

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{
        background: 'linear-gradient(160deg, #0E1F1C 0%, #1A3E38 50%, #0F2A25 100%)',
        pt: { xs: 10, md: 14 }, pb: { xs: 8, md: 12 },
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decoración de fondo */}
        <Box sx={{
          position: 'absolute', top: -80, right: -80, width: 500, height: 500,
          borderRadius: '50%', bgcolor: '#3DAA96', opacity: 0.06,
        }} />
        <Box sx={{
          position: 'absolute', bottom: -60, left: -60, width: 350, height: 350,
          borderRadius: '50%', bgcolor: '#3DAA96', opacity: 0.05,
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              {/* Eyebrow */}
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.8,
                bgcolor: 'rgba(61,170,150,0.15)', border: '1px solid rgba(61,170,150,0.35)',
                borderRadius: '999px', px: 2, py: 0.7, mb: 3,
              }}>
                <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 15 }} />
                <Typography variant="caption" sx={{ color: '#3DAA96', fontWeight: 700, letterSpacing: 0.5 }}>
                  Plataforma para profesionales de salud en Colombia
                </Typography>
              </Box>

              {/* Headline */}
              <Typography sx={{
                color: '#fff', fontWeight: 900, lineHeight: 1.08,
                fontSize: { xs: '2.4rem', md: '3.6rem', lg: '4rem' },
                mb: 3, letterSpacing: -1,
              }}>
                Tu clínica digital,{' '}
                <Box component="span" sx={{
                  background: 'linear-gradient(90deg, #3DAA96, #5DCFB8)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  en minutos.
                </Box>
              </Typography>

              {/* Subtitle */}
              <Typography sx={{
                color: 'rgba(255,255,255,0.72)', fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.75, mb: 5, maxWidth: 560,
              }}>
                Agenda online, historia clínica electrónica, recordatorios automáticos
                y pagos integrados. Deja de administrar manualmente y enfócate en lo que importa:
                <Box component="span" sx={{ color: '#5DCFB8', fontWeight: 700 }}> sanar a tus pacientes.</Box>
              </Typography>

              {/* CTAs */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={RouterLink} to="/onboarding"
                  variant="contained" size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#3DAA96', borderRadius: 2.5, px: 4, py: 1.6,
                    fontWeight: 800, fontSize: '1rem',
                    boxShadow: '0 8px 32px rgba(61,170,150,0.45)',
                    '&:hover': { bgcolor: '#2B8A78', transform: 'translateY(-2px)', boxShadow: '0 12px 40px rgba(61,170,150,0.5)' },
                    transition: 'all 0.2s',
                  }}
                >
                  Empieza 14 días gratis
                </Button>
                <Button
                  component={RouterLink} to="/precios"
                  variant="outlined" size="large"
                  startIcon={<PlayArrowOutlinedIcon />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)',
                    borderRadius: 2.5, px: 4, py: 1.6, fontWeight: 700, fontSize: '1rem',
                    '&:hover': { borderColor: '#3DAA96', color: '#3DAA96', bgcolor: 'rgba(61,170,150,0.08)' },
                  }}
                >
                  Ver planes
                </Button>
              </Stack>

              {/* Trust signals */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 4, flexWrap: 'wrap' }}>
                {['Sin tarjeta de crédito', 'Cancela cuando quieras', 'Soporte en español'].map(t => (
                  <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <CheckCircleOutlinedIcon sx={{ color: '#3DAA96', fontSize: 15 }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.78rem' }}>
                      {t}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Panel visual derecho — "mini dashboard" */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 4, p: 3, backdropFilter: 'blur(12px)',
              }}>
                {/* Header del mini-panel */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#3DAA96', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SpaOutlinedIcon sx={{ color: '#fff', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>Panel Admin — Ecosalud</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>clinica.ecosalud.com</Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                    {['#FF5F56', '#FFBD2E', '#27C93F'].map(c => (
                      <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
                    ))}
                  </Box>
                </Box>

                {/* Stats mini */}
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {[
                    { label: 'Citas hoy', value: '8', color: '#3DAA96' },
                    { label: 'Pacientes', value: '142', color: '#5A5FC8' },
                    { label: 'Ingresos mes', value: '$4.2M', color: '#27AE60' },
                  ].map(s => (
                    <Grid key={s.label} size={4}>
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 2, p: 1.5, textAlign: 'center' }}>
                        <Typography sx={{ color: s.color, fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>{s.value}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem' }}>{s.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Citas del día */}
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Próximas citas
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { hora: '9:00', nombre: 'Laura M.', servicio: 'Terapia Neural', color: '#3DAA96' },
                    { hora: '10:30', nombre: 'Carlos R.', servicio: 'Acupuntura', color: '#5A5FC8' },
                    { hora: '11:00', nombre: 'Andrea V.', servicio: 'Ozonoterapia', color: '#E67E22' },
                  ].map(c => (
                    <Box key={c.hora} sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1.5, px: 1.5, py: 1,
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                      <Typography sx={{ color: c.color, fontWeight: 800, fontSize: '0.75rem', minWidth: 36 }}>{c.hora}</Typography>
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: `${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ color: c.color, fontSize: '0.6rem', fontWeight: 800 }}>{c.nombre[0]}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, lineHeight: 1 }}>{c.nombre}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>{c.servicio}</Typography>
                      </Box>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: c.color }} />
                    </Box>
                  ))}
                </Box>

                {/* Recordatorio badge */}
                <Box sx={{
                  mt: 2, bgcolor: 'rgba(61,170,150,0.15)', border: '1px solid rgba(61,170,150,0.3)',
                  borderRadius: 1.5, px: 1.5, py: 1,
                  display: 'flex', alignItems: 'center', gap: 1,
                }}>
                  <NotificationsActiveOutlinedIcon sx={{ color: '#3DAA96', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: '#3DAA96', fontWeight: 700, fontSize: '0.72rem' }}>
                    3 recordatorios enviados hoy · 0 inasistencias
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          SOCIAL PROOF BAR
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E4F0ED', py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 3, md: 6 }, flexWrap: 'wrap' }}>
            {[
              { icon: <StorefrontOutlinedIcon sx={{ fontSize: 20, color: '#3DAA96' }} />, value: platform ? `${platform.totalClinics}+` : '—', label: 'Clínicas activas' },
              { icon: <PeopleOutlinedIcon sx={{ fontSize: 20, color: '#5A5FC8' }} />,     value: '500+',  label: 'Pacientes gestionados' },
              { icon: <TrendingUpOutlinedIcon sx={{ fontSize: 20, color: '#27AE60' }} />,  value: '98%',   label: 'Satisfacción de clientes' },
              { icon: <LocationOnOutlinedIcon sx={{ fontSize: 20, color: '#E67E22' }} />,  value: 'COL 🇨🇴', label: 'Cumplimiento MinSalud' },
            ].map(s => (
              <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {s.icon}
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1.1rem', lineHeight: 1 }}>{s.value}</Typography>
                  <Typography variant="caption" sx={{ color: '#9DBFBA', fontWeight: 600 }}>{s.label}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          PROBLEMA → SOLUCIÓN
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F4FAF8' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: { xs: '1.7rem', md: '2.4rem' }, mb: 1.5 }}>
              Menos administración. Más atención.
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
              Cada hora que pasas organizando tu agenda manualmente es una hora menos para tus pacientes.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {PROBLEMS.map(p => (
              <Grid key={p.pain} size={{ xs: 12, sm: 6 }}>
                <Box sx={{
                  bgcolor: '#fff', borderRadius: 3, p: 3,
                  border: '1px solid #E4F0ED',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 0.8, bgcolor: '#FDE8E8', borderRadius: 1.5 }}>
                      <Typography sx={{ fontSize: '1.1rem' }}>😩</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: '#C0392B', fontSize: '0.9rem' }}>
                      {p.pain}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.8,
                    bgcolor: '#E8F5F0', borderRadius: 1.5, px: 1.5, py: 1,
                  }}>
                    <CheckCircleOutlinedIcon sx={{ color: '#27AE60', fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.88rem' }}>
                      {p.fix}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="Herramientas" size="small"
              sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, mb: 2, fontSize: '0.72rem' }} />
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: { xs: '1.7rem', md: '2.4rem' }, mb: 1.5 }}>
              Todo lo que tu clínica necesita
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}>
              Una plataforma completa, diseñada exclusivamente para el sistema de salud colombiano.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {FEATURES.map(f => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{
                  p: 3, borderRadius: 3, border: '1px solid #E4F0ED',
                  height: '100%', transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: `0 8px 32px ${f.color}18`,
                    borderColor: `${f.color}50`,
                    transform: 'translateY(-4px)',
                  },
                }}>
                  <Box sx={{
                    width: 52, height: 52, borderRadius: 2.5,
                    bgcolor: f.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', mb: 2,
                    '& svg': { color: f.color },
                  }}>
                    {f.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: '#1A2E2A', mb: 1, fontSize: '1rem' }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {f.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          CÓMO FUNCIONA — 3 pasos
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F4FAF8' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="Proceso" size="small"
              sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, mb: 2, fontSize: '0.72rem' }} />
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: { xs: '1.7rem', md: '2.4rem' } }}>
              Empieza en tres pasos
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {STEPS.map((step, i) => (
              <Grid key={step.n} size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center', px: 2 }}>
                  <Box sx={{
                    width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 3,
                    background: i === 1
                      ? 'linear-gradient(135deg, #3DAA96, #1A7A5E)'
                      : 'linear-gradient(135deg, #E8F5F0, #C8EDE5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: i === 1 ? '0 8px 24px rgba(61,170,150,0.35)' : 'none',
                  }}>
                    <Typography sx={{
                      fontWeight: 900, fontSize: '1.5rem',
                      color: i === 1 ? '#fff' : '#3DAA96',
                    }}>
                      {step.n}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1.1rem', mb: 1.5 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 280, mx: 'auto' }}>
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          CARRUSEL DE ESPECIALISTAS / CLÍNICAS
      ══════════════════════════════════════════════════════════════ */}
      {clinics.length > 0 && (
        <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#fff', overflow: 'hidden' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Chip label="Comunidad" size="small"
                  sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, mb: 2, fontSize: '0.72rem' }} />
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: { xs: '1.7rem', md: '2.4rem' } }}>
                  Profesionales que ya confían en Ecosalud
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Clínicas reales usando la plataforma en Colombia.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => scrollCarousel('left')}
                  sx={{ bgcolor: '#F4FAF8', border: '1px solid #E4F0ED', '&:hover': { bgcolor: '#E8F5F0' } }}>
                  <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton onClick={() => scrollCarousel('right')}
                  sx={{ bgcolor: '#F4FAF8', border: '1px solid #E4F0ED', '&:hover': { bgcolor: '#E8F5F0' } }}>
                  <ArrowForwardIosOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          </Container>

          {/* Carrusel sin padding lateral para ir de borde a borde */}
          <Box
            ref={carouselRef}
            sx={{
              display: 'flex', gap: 2.5, px: { xs: 2, md: 6 },
              overflowX: 'auto', scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
              pb: 1,
            }}
          >
            {clinics.map((clinic, i) => (
              <Box
                key={i}
                sx={{
                  minWidth: 260, scrollSnapAlign: 'start',
                  bgcolor: '#F4FAF8', borderRadius: 3,
                  border: '1.5px solid #E4F0ED',
                  p: 3, flexShrink: 0,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#3DAA96', boxShadow: '0 8px 24px rgba(61,170,150,0.12)', transform: 'translateY(-3px)' },
                }}
              >
                {/* Avatar + badge de plan */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar
                    src={clinic.logoUrl ?? undefined}
                    sx={{
                      width: 56, height: 56,
                      bgcolor: planColor(clinic.plan),
                      fontSize: '1.1rem', fontWeight: 800,
                      border: '3px solid #fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                    }}
                  >
                    {initials(clinic.ownerName)}
                  </Avatar>
                  <Chip
                    label={clinic.plan}
                    size="small"
                    sx={{
                      bgcolor: `${planColor(clinic.plan)}18`,
                      color: planColor(clinic.plan),
                      fontWeight: 800, fontSize: '0.62rem',
                      border: `1px solid ${planColor(clinic.plan)}30`,
                    }}
                  />
                </Box>

                <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.95rem', lineHeight: 1.3, mb: 0.5 }}>
                  {clinic.ownerName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#3DAA96', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  {clinic.specialty}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  {clinic.clinicName}
                </Typography>

                {clinic.city && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 13, color: '#9DBFBA' }} />
                    <Typography variant="caption" sx={{ color: '#9DBFBA', fontWeight: 600 }}>
                      {clinic.city}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PLANES — preview
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F4FAF8' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="Precios" size="small"
              sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, mb: 2, fontSize: '0.72rem' }} />
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: { xs: '1.7rem', md: '2.4rem' }, mb: 1.5 }}>
              Planes diseñados para crecer contigo
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
              Empieza gratis. Escala cuando tu práctica lo requiera.
            </Typography>
          </Box>

          <Grid container spacing={2.5} justifyContent="center">
            {PLAN_PREVIEW.map(plan => (
              <Grid key={plan.name} size={{ xs: 12, sm: 4 }}>
                <Box sx={{
                  bgcolor: '#fff', borderRadius: 3, p: 3, textAlign: 'center',
                  border: plan.popular ? `2px solid ${plan.color}` : '1px solid #E4F0ED',
                  boxShadow: plan.popular ? `0 12px 40px ${plan.color}20` : '0 2px 12px rgba(0,0,0,0.04)',
                  transform: plan.popular ? 'scale(1.03)' : 'none',
                  position: 'relative',
                }}>
                  {plan.popular && (
                    <Box sx={{
                      position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                      bgcolor: plan.color, color: '#fff',
                      px: 2.5, py: 0.4, borderRadius: '999px',
                      fontSize: '0.68rem', fontWeight: 800, whiteSpace: 'nowrap',
                    }}>
                      Más popular
                    </Box>
                  )}
                  <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1.1rem', mb: 1 }}>
                    {plan.name}
                  </Typography>
                  <Typography sx={{ fontWeight: 900, color: plan.color, fontSize: '1.9rem', lineHeight: 1 }}>
                    {plan.price}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9DBFBA', display: 'block' }}>
                    {plan.period}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#C0D8D4', display: 'block', mb: 1.5, fontSize: '0.65rem' }}>
                    {plan.cop}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5A7A74', fontWeight: 600 }}>
                    {plan.limit}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={RouterLink} to="/precios"
              variant="outlined" endIcon={<ArrowForwardIcon />}
              sx={{ borderColor: '#3DAA96', color: '#3DAA96', borderRadius: 2, fontWeight: 700, px: 4, py: 1.2 }}
            >
              Ver todos los detalles de planes
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1A3E38 0%, #3DAA96 100%)',
        py: { xs: 8, md: 12 },
        textAlign: 'center',
      }}>
        <Container maxWidth="md">
          <Typography sx={{
            color: '#fff', fontWeight: 900,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            mb: 2, lineHeight: 1.15,
          }}>
            Empieza tu práctica digital hoy.
          </Typography>
          <Typography sx={{
            color: 'rgba(255,255,255,0.75)', fontSize: { xs: '0.95rem', md: '1.15rem' },
            mb: { xs: 4, md: 5 }, maxWidth: 480, mx: 'auto', lineHeight: 1.7,
          }}>
            14 días de prueba gratuita · Sin cobros durante el trial.
            Configuración en menos de 5 minutos.
          </Typography>

          {/* ── Botones CTA: 3 opciones equilibradas y centradas ── */}
          {/* Desktop: fila de 3 con igual ancho mínimo — Mobile: apilados full-width */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 4, md: 5 },
            px: { xs: 2, sm: 0 },
          }}>
            {/* Primario */}
            <Button
              onClick={() => navigate('/onboarding')}
              variant="contained" size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#fff', color: '#1A3E38', borderRadius: 2.5,
                px: 3.5, py: 1.7,
                fontWeight: 900, fontSize: { xs: '0.95rem', md: '1rem' },
                minWidth: { sm: 210 },
                width: { xs: '100%', sm: 'auto' },
                boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#E8F5F0', transform: 'translateY(-2px)', boxShadow: '0 12px 36px rgba(0,0,0,0.28)' },
                transition: 'all 0.2s',
              }}
            >
              Crear mi clínica gratis
            </Button>

            {/* Secundario */}
            <Button
              component={RouterLink} to="/login"
              variant="outlined" size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)', color: '#fff',
                borderRadius: 2.5,
                px: 3.5, py: 1.7,
                fontWeight: 700, fontSize: { xs: '0.95rem', md: '1rem' },
                minWidth: { sm: 210 },
                width: { xs: '100%', sm: 'auto' },
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Ya tengo cuenta
            </Button>

            {/* Terciario — Soporte */}
            <Button
              component={RouterLink} to="/contacto"
              variant="text" size="large"
              sx={{
                color: 'rgba(255,255,255,0.65)',
                borderRadius: 2.5,
                px: 3.5, py: 1.7,
                fontWeight: 600, fontSize: { xs: '0.9rem', md: '0.95rem' },
                minWidth: { sm: 210 },
                width: { xs: '100%', sm: 'auto' },
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255,255,255,0.18)',
                '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.35)' },
              }}
            >
              💬 Hablar con soporte
            </Button>
          </Box>

          {/* Trust final */}
          <Box sx={{
            display: 'flex', justifyContent: 'center',
            gap: { xs: 2, md: 4 }, flexWrap: 'wrap',
            px: { xs: 1, sm: 0 },
          }}>
            {[
              '✅ Cumple normativa MinSalud',
              '🔒 Datos encriptados',
              '🇨🇴 Hecho para Colombia',
              '📞 Soporte en español',
            ].map(t => (
              <Typography key={t} variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: { xs: '0.72rem', md: '0.8rem' } }}>
                {t}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
