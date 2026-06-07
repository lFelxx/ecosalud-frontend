/**
 * FuncionalidadesPage — Showcase visual de las funcionalidades de la plataforma.
 *
 * Muestra cómo se ve y funciona Ecosalud Market operativamente.
 * No requiere backend — contenido 100% estático con mockups visuales en MUI.
 * Audiencia: Profesionales de salud evaluando adoptar la plataforma.
 */

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Button, Chip, Stack, Avatar,
  Tab, Tabs,
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import PlatformNavbar from '../../components/common/PlatformNavbar';
import Footer from '../../components/common/Footer';
import { useSeo } from '../../hooks/useSeo';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface Feature {
  id:       string;
  icon:     React.ReactNode;
  color:    string;
  bg:       string;
  label:    string;
  headline: string;
  desc:     string;
  bullets:  string[];
  badge?:   string;
  mockup:   React.ReactNode;
}

// ── Mockups visuales ───────────────────────────────────────────────────────────

function AgendaMockup() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  const appointments = [
    { time: '8:00',  name: 'Laura M.',   service: 'Terapia Neural', color: '#3DAA96', day: 0 },
    { time: '9:30',  name: 'Carlos R.',  service: 'Acupuntura',     color: '#5A5FC8', day: 0 },
    { time: '10:00', name: 'Andrea V.',  service: 'Ozonoterapia',   color: '#E67E22', day: 1 },
    { time: '11:30', name: 'Diego F.',   service: 'Consulta',       color: '#27AE60', day: 2 },
    { time: '14:00', name: 'María S.',   service: 'Seguimiento',    color: '#9B59B6', day: 3 },
  ];
  return (
    <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 3, p: 2.5, border: '1px solid #E4F0ED' }}>
      {/* Mini calendar header */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {days.map((d, i) => (
          <Box key={d} sx={{
            flex: 1, textAlign: 'center', py: 1, borderRadius: 1.5,
            bgcolor: i === 0 ? '#3DAA96' : '#fff',
            border: '1px solid #E4F0ED',
          }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: i === 0 ? '#fff' : '#9DBFBA' }}>{d}</Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: i === 0 ? '#fff' : '#1A2E2A' }}>{7 + i}</Typography>
          </Box>
        ))}
      </Box>
      {/* Citas */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {appointments.slice(0, 4).map((a, i) => (
          <Box key={i} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: '#fff', borderRadius: 1.5, px: 1.5, py: 1,
            border: `1px solid ${a.color}20`,
            borderLeft: `3px solid ${a.color}`,
          }}>
            <Typography sx={{ color: a.color, fontWeight: 800, fontSize: '0.72rem', minWidth: 36 }}>{a.time}</Typography>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#1A2E2A', lineHeight: 1 }}>{a.name}</Typography>
              <Typography variant="caption" sx={{ color: '#9DBFBA', fontSize: '0.65rem' }}>{a.service}</Typography>
            </Box>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: a.color }} />
          </Box>
        ))}
      </Box>
      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        {[{ v: '8', l: 'Hoy' }, { v: '23', l: 'Semana' }, { v: '0', l: 'Ausencias' }].map(s => (
          <Box key={s.l} sx={{ flex: 1, textAlign: 'center', bgcolor: '#fff', borderRadius: 1.5, py: 1, border: '1px solid #E4F0ED' }}>
            <Typography sx={{ fontWeight: 800, color: '#3DAA96', fontSize: '1rem', lineHeight: 1 }}>{s.v}</Typography>
            <Typography variant="caption" sx={{ color: '#9DBFBA', fontSize: '0.6rem' }}>{s.l}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function HceMockup() {
  return (
    <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 3, p: 2.5, border: '1px solid #E4F0ED' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Avatar sx={{ bgcolor: '#5A5FC8', width: 36, height: 36, fontSize: '0.8rem', fontWeight: 800 }}>LM</Avatar>
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.88rem', lineHeight: 1 }}>Laura Martínez</Typography>
          <Typography variant="caption" sx={{ color: '#9DBFBA' }}>C.C. 1020 394 847 · 34 años</Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Chip label="3 registros" size="small" sx={{ bgcolor: '#EEEEF8', color: '#5A5FC8', fontWeight: 700, fontSize: '0.62rem' }} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[
          { date: '2026-06-05', reason: 'Dolor lumbar crónico', locked: true  },
          { date: '2026-05-20', reason: 'Control post-terapia', locked: true  },
          { date: '2026-04-12', reason: 'Consulta inicial',     locked: false },
        ].map((r, i) => (
          <Box key={i} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: '#fff', borderRadius: 1.5, px: 1.5, py: 1,
            border: '1px solid #E4F0ED',
          }}>
            <Box sx={{
              px: 1, py: 0.3, borderRadius: 1, fontSize: '0.6rem',
              fontWeight: 700, bgcolor: '#E8F5F0', color: '#3DAA96',
            }}>{r.date}</Box>
            <Typography sx={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: '#1A2E2A' }}>{r.reason}</Typography>
            {r.locked && <LockOutlinedIcon sx={{ fontSize: 13, color: '#27AE60' }} />}
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 2, bgcolor: '#EAF7EE', borderRadius: 1.5, px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleOutlinedIcon sx={{ color: '#27AE60', fontSize: 15 }} />
        <Typography variant="caption" sx={{ color: '#27AE60', fontWeight: 700, fontSize: '0.7rem' }}>
          Cumple Res. 1995/1999 · Hash SHA-256 ✓
        </Typography>
      </Box>
    </Box>
  );
}

function RecordatoriosMockup() {
  return (
    <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 3, p: 2.5, border: '1px solid #E4F0ED' }}>
      <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.85rem', mb: 2 }}>
        Recordatorios automáticos — 9:00 AM
      </Typography>

      {/* Canales activos */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {[
          { icon: <EmailOutlinedIcon sx={{ fontSize: 14 }} />, label: 'Email', ok: true  },
          { icon: <SmsOutlinedIcon   sx={{ fontSize: 14 }} />, label: 'SMS',   ok: true  },
          { icon: <WhatsAppIcon      sx={{ fontSize: 14 }} />, label: 'WA',    ok: false },
        ].map(c => (
          <Box key={c.label} sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            px: 1.2, py: 0.5, borderRadius: 1.5,
            bgcolor: c.ok ? '#EAF7EE' : '#FDE8E8',
            border: `1px solid ${c.ok ? '#27AE6030' : '#C0392B30'}`,
          }}>
            <Box sx={{ color: c.ok ? '#27AE60' : '#C0392B' }}>{c.icon}</Box>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: c.ok ? '#27AE60' : '#C0392B' }}>{c.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Citas a recordar */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[
          { name: 'Carlos R.', hora: '10:30', email: true, sms: true  },
          { name: 'Andrea V.', hora: '11:00', email: true, sms: false },
          { name: 'Diego F.',  hora: '14:00', email: true, sms: true  },
        ].map((a, i) => (
          <Box key={i} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: '#fff', borderRadius: 1.5, px: 1.5, py: 1,
            border: '1px solid #E4F0ED',
          }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: '#3DAA96', fontSize: '0.6rem', fontWeight: 800 }}>
              {a.name[0]}
            </Avatar>
            <Typography sx={{ flex: 1, fontSize: '0.75rem', fontWeight: 700, color: '#1A2E2A' }}>{a.name}</Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#9DBFBA' }}>{a.hora}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {a.email && <EmailOutlinedIcon sx={{ fontSize: 12, color: '#27AE60' }} />}
              {a.sms   && <SmsOutlinedIcon   sx={{ fontSize: 12, color: '#3DAA96' }} />}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 2, bgcolor: '#E8F5F0', borderRadius: 1.5, px: 1.5, py: 0.8, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#3DAA96', fontWeight: 700, fontSize: '0.7rem' }}>
          3 recordatorios enviados · 0 inasistencias esta semana
        </Typography>
      </Box>
    </Box>
  );
}

function PagosMockup() {
  return (
    <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 3, p: 2.5, border: '1px solid #E4F0ED' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.88rem' }}>Pago de consulta</Typography>
        <Chip label="PayU" size="small" sx={{ bgcolor: '#EAF7EE', color: '#27AE60', fontWeight: 800, fontSize: '0.62rem' }} />
      </Box>

      <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2, border: '1px solid #E4F0ED', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#9DBFBA' }}>Servicio</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1A2E2A' }}>Consulta inicial</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#9DBFBA' }}>Médico</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1A2E2A' }}>Dra. A. Camacho</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.9rem' }}>Total</Typography>
          <Typography sx={{ fontWeight: 900, color: '#27AE60', fontSize: '1.1rem' }}>$120.000</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[
          { label: 'Tarjeta de crédito/débito', active: true  },
          { label: 'PSE — Débito bancario',     active: false },
          { label: 'Efecty / Nequi',            active: false },
        ].map(m => (
          <Box key={m.label} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: m.active ? '#E8F5F0' : '#fff', borderRadius: 1.5, px: 1.5, py: 1,
            border: `1.5px solid ${m.active ? '#3DAA96' : '#E4F0ED'}`,
            cursor: 'pointer',
          }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${m.active ? '#3DAA96' : '#E4F0ED'}`, bgcolor: m.active ? '#3DAA96' : 'transparent' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: m.active ? '#3DAA96' : '#5A7A74' }}>{m.label}</Typography>
          </Box>
        ))}
      </Box>

      <Button fullWidth sx={{
        mt: 2, bgcolor: '#27AE60', color: '#fff', borderRadius: 2,
        fontWeight: 800, textTransform: 'none',
        '&:hover': { bgcolor: '#1E8449' },
      }}>
        Pagar ahora
      </Button>
    </Box>
  );
}

function ConsentimientosMockup() {
  return (
    <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 3, p: 2.5, border: '1px solid #E4F0ED' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <GavelOutlinedIcon sx={{ color: '#C0392B', fontSize: 20 }} />
        <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.88rem' }}>
          Consentimiento informado
        </Typography>
      </Box>

      <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2, border: '1px solid #E4F0ED', mb: 2 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#5A7A74', lineHeight: 1.7 }}>
          Yo, <strong>Laura Martínez</strong>, identificada con C.C. 1020394847,
          autorizo la realización del procedimiento de <strong>Terapia Neural</strong>,
          habiendo sido informada de los riesgos y beneficios...
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ bgcolor: '#EAF7EE', borderRadius: 1.5, px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutlinedIcon sx={{ color: '#27AE60', fontSize: 16 }} />
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#1A2E2A', lineHeight: 1 }}>Firmado digitalmente</Typography>
            <Typography variant="caption" sx={{ color: '#9DBFBA', fontSize: '0.62rem' }}>Jun 5, 2026 · 09:24 AM</Typography>
          </Box>
        </Box>
        <Box sx={{ bgcolor: '#EAF7EE', borderRadius: 1.5, px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockOutlinedIcon sx={{ color: '#27AE60', fontSize: 16 }} />
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#1A2E2A', lineHeight: 1 }}>Registro inmutable</Typography>
            <Typography variant="caption" sx={{ color: '#9DBFBA', fontSize: '0.62rem' }}>Hash: a3f9...e12c</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function ReportesMockup() {
  const bars = [40, 65, 50, 80, 55, 90, 70];
  const months = ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  return (
    <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 3, p: 2.5, border: '1px solid #E4F0ED' }}>
      {/* KPIs */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {[
          { label: 'Citas mes',   value: '87', color: '#3DAA96' },
          { label: 'Pacientes',   value: '42', color: '#5A5FC8' },
          { label: 'Ingresos',    value: '$8.4M', color: '#27AE60' },
        ].map(k => (
          <Grid key={k.label} size={4}>
            <Box sx={{ bgcolor: '#fff', borderRadius: 1.5, p: 1, textAlign: 'center', border: '1px solid #E4F0ED' }}>
              <Typography sx={{ fontWeight: 900, color: k.color, fontSize: '0.95rem', lineHeight: 1 }}>{k.value}</Typography>
              <Typography variant="caption" sx={{ color: '#9DBFBA', fontSize: '0.58rem' }}>{k.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Mini bar chart */}
      <Typography variant="caption" sx={{ color: '#9DBFBA', fontWeight: 700, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Citas por mes
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'flex-end', height: 70, mt: 1 }}>
        {bars.map((h, i) => (
          <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4 }}>
            <Box sx={{
              width: '100%', height: `${h}%`,
              bgcolor: i === 6 ? '#3DAA96' : '#B2DDD4',
              borderRadius: '3px 3px 0 0',
              transition: 'all 0.3s',
            }} />
            <Typography sx={{ fontSize: '0.55rem', color: '#9DBFBA', fontWeight: 600 }}>{months[i]}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Datos de funcionalidades ───────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    id: 'agenda',
    icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 22 }} />,
    color: '#3DAA96', bg: '#E8F5F0',
    label: 'Agenda online',
    headline: 'Tu disponibilidad, siempre actualizada',
    desc: 'Los pacientes agendan desde el móvil en cualquier momento. Tú controlas horarios, servicios y tiempos de atención desde el panel.',
    bullets: [
      'Vista diaria, semanal y mensual',
      'Confirmación automática al paciente',
      'Bloqueo de horarios y feriados',
      'Multi-especialista (plan Pro/Clínica)',
    ],
    mockup: <AgendaMockup />,
  },
  {
    id: 'hce',
    icon: <MedicalServicesOutlinedIcon sx={{ fontSize: 22 }} />,
    color: '#5A5FC8', bg: '#EEEEF8',
    label: 'Historia Clínica',
    headline: 'Registros médicos que cumplen la ley',
    desc: 'Historia Clínica Electrónica con firma de bloqueo, hash SHA-256 e inmutabilidad. Cumple Res. 1995/1999 del MinSalud.',
    bullets: [
      'Bloqueo irreversible por consulta',
      'Hash SHA-256 de integridad',
      'Campos obligatorios validados',
      'Búsqueda por paciente y fecha',
    ],
    badge: 'Res. 1995/1999',
    mockup: <HceMockup />,
  },
  {
    id: 'recordatorios',
    icon: <NotificationsActiveOutlinedIcon sx={{ fontSize: 22 }} />,
    color: '#E67E22', bg: '#FFF3E8',
    label: 'Recordatorios',
    headline: 'Menos inasistencias, más citas cumplidas',
    desc: 'Envío automático de recordatorios 24h antes de cada cita por Email, SMS y WhatsApp. Configurable desde el panel.',
    bullets: [
      'Email (Resend) + SMS (Twilio)',
      'WhatsApp Business integrado',
      'Job diario a las 9 AM configurable',
      'Historial de envíos en el panel',
    ],
    mockup: <RecordatoriosMockup />,
  },
  {
    id: 'pagos',
    icon: <CreditCardOutlinedIcon sx={{ fontSize: 22 }} />,
    color: '#27AE60', bg: '#EAF7EE',
    label: 'Pagos en línea',
    headline: 'Cobra antes de la consulta, sin fricciones',
    desc: 'Pasarela PayU Colombia integrada. Acepta tarjeta, PSE, Efecty y Nequi. Los pacientes pagan al agendar.',
    bullets: [
      'Tarjeta débito/crédito',
      'PSE · Efecty · Nequi',
      'Webhook de confirmación automático',
      'Sandbox para pruebas',
    ],
    badge: 'PayU Colombia',
    mockup: <PagosMockup />,
  },
  {
    id: 'consentimientos',
    icon: <GavelOutlinedIcon sx={{ fontSize: 22 }} />,
    color: '#C0392B', bg: '#FDE8E8',
    label: 'Consentimientos',
    headline: 'Firma digital con validez legal',
    desc: 'El paciente firma el consentimiento informado digitalmente desde su dispositivo. Almacenado con hash y timestamp inmutable.',
    bullets: [
      'Firma electrónica del paciente',
      'Registro con timestamp inmutable',
      'Hash de integridad SHA-256',
      'Historial por paciente',
    ],
    mockup: <ConsentimientosMockup />,
  },
  {
    id: 'reportes',
    icon: <BarChartOutlinedIcon sx={{ fontSize: 22 }} />,
    color: '#9B59B6', bg: '#F4EEF8',
    label: 'Reportes',
    headline: 'Métricas para tomar mejores decisiones',
    desc: 'Panel de reportes con métricas de citas, pacientes, ingresos y actividad. Visualiza el crecimiento de tu práctica.',
    bullets: [
      'Citas por mes con gráfica',
      'Ingresos y facturación estimada',
      'Ranking de servicios más solicitados',
      'Pacientes nuevos vs. recurrentes',
    ],
    mockup: <ReportesMockup />,
  },
];

// ── Componente principal ───────────────────────────────────────────────────────

export default function FuncionalidadesPage() {
  const [active, setActive] = useState(0);

  useSeo(
    'Funcionalidades | Ecosalud Market — Plataforma digital para clínicas',
    'Agenda online, HCE, recordatorios SMS/WhatsApp, pagos PayU, consentimientos digitales y reportes. Todo en una plataforma para profesionales de salud en Colombia.',
  );

  const feature = FEATURES[active];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFCFB', display: 'flex', flexDirection: 'column' }}>
      <PlatformNavbar />

      {/* ── Hero ── */}
      <Box sx={{ bgcolor: '#F4FAF8', borderBottom: '1px solid #E4F0ED', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Chip label="Plataforma completa"
            sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, mb: 2, fontSize: '0.72rem' }} />
          <Typography variant="h2" sx={{ fontWeight: 900, color: '#1A2E2A', mb: 2, fontSize: { xs: '1.8rem', md: '3rem' }, lineHeight: 1.1 }}>
            Todo lo que tu clínica necesita,<br />en una sola plataforma
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', lineHeight: 1.75, mb: 4 }}>
            Descubre cada funcionalidad y cómo se ve en tu panel de administración.
          </Typography>
          <Button
            component={RouterLink} to="/onboarding"
            variant="contained" size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ bgcolor: '#3DAA96', borderRadius: 2.5, px: 4, fontWeight: 800, textTransform: 'none', boxShadow: '0 4px 16px rgba(61,170,150,0.35)', '&:hover': { bgcolor: '#2B8A78' } }}
          >
            Empieza 14 días gratis
          </Button>
        </Container>
      </Box>

      {/* ── Feature selector ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>

        {/* Tabs — scroll horizontal en móvil */}
        <Box sx={{ mb: 5, borderBottom: '1px solid #E4F0ED' }}>
          <Tabs
            value={active}
            onChange={(_, v) => setActive(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            TabIndicatorProps={{ style: { backgroundColor: feature.color, height: 3 } }}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.85rem', minWidth: 'auto' } }}
          >
            {FEATURES.map((f, i) => (
              <Tab
                key={f.id}
                icon={<Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 1.5, mb: '4px !important',
                  bgcolor: active === i ? f.bg : 'transparent',
                  '& svg': { color: active === i ? f.color : '#9DBFBA', fontSize: 18 },
                }}>
                  {f.icon}
                </Box>}
                label={f.label}
                iconPosition="top"
                sx={{
                  color: active === i ? f.color : '#9DBFBA',
                  '&.Mui-selected': { color: f.color },
                  px: 2.5,
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Feature detail */}
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* Texto izquierda */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: 2.5,
                bgcolor: feature.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                '& svg': { color: feature.color },
              }}>
                {feature.icon}
              </Box>
              <Box>
                <Typography variant="overline" sx={{ color: feature.color, fontWeight: 700, fontSize: '0.68rem', letterSpacing: 1 }}>
                  {feature.label}
                </Typography>
                {feature.badge && (
                  <Chip label={feature.badge} size="small" sx={{ ml: 1, bgcolor: feature.bg, color: feature.color, fontWeight: 700, fontSize: '0.6rem' }} />
                )}
              </Box>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A2E2A', mb: 2, lineHeight: 1.2, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
              {feature.headline}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
              {feature.desc}
            </Typography>

            <Stack spacing={1.2}>
              {feature.bullets.map(b => (
                <Box key={b} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                  <CheckCircleOutlinedIcon sx={{ color: feature.color, fontSize: 18, mt: 0.1, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#1A2E2A', fontWeight: 600, lineHeight: 1.5 }}>
                    {b}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Box sx={{ mt: 4, display: 'flex', gap: 1.5 }}>
              <Button
                component={RouterLink} to="/onboarding"
                variant="contained" endIcon={<ArrowForwardIcon />}
                sx={{ bgcolor: feature.color, borderRadius: 2, fontWeight: 800, textTransform: 'none', px: 3, '&:hover': { filter: 'brightness(0.9)' } }}
              >
                Empieza gratis
              </Button>
              <Button
                component={RouterLink} to="/precios"
                variant="outlined"
                sx={{ borderColor: feature.color, color: feature.color, borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 3, '&:hover': { bgcolor: feature.bg } }}
              >
                Ver planes
              </Button>
            </Box>
          </Grid>

          {/* Mockup derecha */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{
              bgcolor: '#fff', borderRadius: 4,
              border: `2px solid ${feature.color}20`,
              p: { xs: 2, md: 3 },
              boxShadow: `0 16px 48px ${feature.color}15`,
            }}>
              {/* Barra de browser falsa */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {['#FF5F56', '#FFBD2E', '#27C93F'].map(c => (
                    <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
                  ))}
                </Box>
                <Box sx={{
                  flex: 1, bgcolor: '#F4FAF8', borderRadius: 1, px: 1.5, py: 0.5,
                  display: 'flex', alignItems: 'center', gap: 0.5,
                }}>
                  <SpaOutlinedIcon sx={{ fontSize: 12, color: '#3DAA96' }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#9DBFBA', fontFamily: 'monospace' }}>
                    panel.ecosalud.com/{feature.id}
                  </Typography>
                </Box>
              </Box>
              {feature.mockup}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── Grid resumen rápido ── */}
      <Box sx={{ bgcolor: '#F4FAF8', py: { xs: 6, md: 8 }, borderTop: '1px solid #E4F0ED' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2E2A', textAlign: 'center', mb: 5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            Incluido en todos los planes
          </Typography>
          <Grid container spacing={2}>
            {FEATURES.map(f => (
              <Grid key={f.id} size={{ xs: 6, sm: 4, md: 2 }}>
                <Box sx={{
                  textAlign: 'center', p: 2.5, bgcolor: '#fff', borderRadius: 3,
                  border: '1px solid #E4F0ED', height: '100%',
                  transition: 'all 0.2s', cursor: 'pointer',
                  '&:hover': { boxShadow: `0 4px 16px ${f.color}20`, borderColor: f.color },
                }}
                  onClick={() => setActive(FEATURES.indexOf(f))}
                >
                  <Box sx={{
                    width: 44, height: 44, borderRadius: 2, bgcolor: f.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 1.5,
                    '& svg': { color: f.color, fontSize: 20 },
                  }}>
                    {f.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#1A2E2A', lineHeight: 1.3 }}>
                    {f.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA final ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1A3E38 0%, #3DAA96 100%)',
        py: { xs: 7, md: 10 }, textAlign: 'center',
      }}>
        <Container maxWidth="sm">
          <PeopleOutlinedIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 48, mb: 2 }} />
          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, mb: 2, fontSize: { xs: '1.7rem', md: '2.5rem' } }}>
            Listo para digitalizar tu práctica?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.72)', mb: 4, lineHeight: 1.7 }}>
            14 días de prueba gratuita. Sin tarjeta de crédito. Soporte en español.
          </Typography>
          <Button
            component={RouterLink} to="/onboarding"
            variant="contained" size="large" endIcon={<ArrowForwardIcon />}
            sx={{ bgcolor: '#fff', color: '#1A3E38', borderRadius: 2.5, px: 5, py: 1.8, fontWeight: 900, textTransform: 'none', '&:hover': { bgcolor: '#E8F5F0' } }}
          >
            Crear mi clínica gratis
          </Button>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
