/**
 * OnboardingPage — Registro de nueva clínica desde la landing pública.
 *
 * Layout split en desktop: panel izquierdo (beneficios) + formulario derecho.
 * 3 pasos: Clínica → Propietario → Éxito con próximos pasos.
 */

import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel,
  Container, Card, InputAdornment, Alert, CircularProgress,
  ToggleButton, ToggleButtonGroup, Chip, Divider, Link, MenuItem,
  List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import LinkIcon from '@mui/icons-material/Link';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import axiosClient from '../../../infrastructure/http/axiosClient';
import { useAuthContext } from '../../context/AuthContext';
import { useSeo } from '../../hooks/useSeo';

// ── Utilidades ────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

// ── Constantes ────────────────────────────────────────────────────────────────

interface FormData {
  clinicName: string;
  slug: string;
  specialty: string;
  city: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  plan: 'STARTER' | 'PRO';
}

const EMPTY: FormData = {
  clinicName: '', slug: '', specialty: '', city: '',
  ownerName: '', ownerEmail: '', phone: '', plan: 'STARTER',
};

const STEPS = ['Tu clínica', 'Tus datos'];

const SPECIALTIES = [
  'Fisioterapia', 'Medicina alternativa', 'Acupuntura', 'Osteopatía',
  'Nutrición', 'Psicología', 'Odontología', 'Medicina general',
  'Terapia ocupacional', 'Medicina estética', 'Quiropraxia', 'Otra',
];

const PLAN_FEATURES: Record<'STARTER' | 'PRO', string[]> = {
  STARTER: [
    'Hasta 100 citas/mes',
    'Hasta 3 especialistas',
    'Historia clínica electrónica',
    'Planes de terapia',
    'Panel de admin completo',
  ],
  PRO: [
    'Citas ilimitadas',
    'Especialistas ilimitados',
    'Historia clínica electrónica',
    'Planes de terapia avanzados',
    'Blog y publicaciones',
    'Dominio personalizado',
    'Reportes y estadísticas',
    'Soporte prioritario',
  ],
};

const BENEFITS = [
  { icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 20, color: '#3DAA96' }} />, text: 'Gestión de citas en tiempo real' },
  { icon: <PeopleOutlinedIcon      sx={{ fontSize: 20, color: '#3DAA96' }} />, text: 'Historial clínico por paciente' },
  { icon: <BarChartOutlinedIcon    sx={{ fontSize: 20, color: '#3DAA96' }} />, text: 'Panel de administración completo' },
  { icon: <CheckOutlinedIcon       sx={{ fontSize: 20, color: '#3DAA96' }} />, text: '14 días gratis, sin tarjeta' },
];

const NEXT_STEPS = [
  { icon: '🎨', title: 'Personaliza tu clínica', desc: 'Agrega tu logo, color y especialistas.' },
  { icon: '📅', title: 'Crea tus primeras citas', desc: 'Importa o registra tus pacientes actuales.' },
  { icon: '📝', title: 'Publica en tu blog', desc: 'Comparte artículos de salud con tus pacientes.' },
];

// ── Componente ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [searchParams] = useSearchParams();

  useSeo('Registra tu clínica gratis — Ecosalud', 'Crea tu clínica en menos de 2 minutos. Gestión de citas, historia clínica y más.');

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    ...EMPTY,
    plan: (searchParams.get('plan')?.toUpperCase() as FormData['plan']) || 'STARTER',
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subdomain: string; email: string } | null>(null);
  const [emailConflict, setEmailConflict] = useState(false);
  const [recoveryState, setRecoveryState] = useState<'idle' | 'loading' | 'sent'>('idle');

  const set = useCallback(<K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'clinicName' && !slugEdited) next.slug = toSlug(v as string);
      return next;
    });
    setErrors(prev => ({ ...prev, [k]: '' }));
  }, [slugEdited]);

  // ── Validación ─────────────────────────────────────────────────────────────

  const validateStep0 = () => {
    const e: typeof errors = {};
    if (!form.clinicName.trim()) e.clinicName = 'Obligatorio';
    if (!form.slug) e.slug = 'Obligatorio';
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) e.slug = 'Solo letras minúsculas, números y guiones';
    if (!form.specialty) e.specialty = 'Selecciona una especialidad';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.ownerName.trim()) e.ownerName = 'Obligatorio';
    if (!form.ownerEmail.trim()) e.ownerEmail = 'Obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) e.ownerEmail = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    setApiError('');
    try {
      const { data } = await axiosClient.post('/onboarding', {
        clinicName: form.clinicName.trim(),
        slug:       form.slug,
        ownerName:  form.ownerName.trim(),
        ownerEmail: form.ownerEmail.trim().toLowerCase(),
        phone:      form.phone.trim() || undefined,
        specialty:  form.specialty,
        city:       form.city.trim() || undefined,
        country:    'CO',
        plan:       form.plan,
      });

      login(data.token, {
        id:    data.userId,
        name:  data.userName,
        email: data.userEmail,
        role:  data.role,
      });

      setResult({ subdomain: data.subdomain, email: data.userEmail });
      setStep(2);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? '';
      if (status === 409 && msg.toLowerCase().includes('email')) {
        setEmailConflict(true);
      } else {
        setApiError(msg || 'Ocurrió un error al crear tu clínica. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    setRecoveryState('loading');
    try {
      await axiosClient.post('/auth/forgot-password', { email: form.ownerEmail.trim().toLowerCase() });
      setRecoveryState('sent');
    } catch {
      setRecoveryState('idle');
      setApiError('No se pudo enviar el correo. Intenta de nuevo.');
    }
  };

  // ── Renders ────────────────────────────────────────────────────────────────

  const Step0 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        label="Nombre de la clínica *"
        fullWidth size="small"
        value={form.clinicName}
        onChange={e => set('clinicName', e.target.value)}
        error={!!errors.clinicName}
        helperText={errors.clinicName || 'Nombre visible para tus pacientes'}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><StorefrontOutlinedIcon sx={{ fontSize: 18, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="Ej. Clínica Fisiosalud Camacho"
      />

      <TextField
        label="URL de tu clínica *"
        fullWidth size="small"
        value={form.slug}
        onChange={e => { setSlugEdited(true); set('slug', toSlug(e.target.value)); }}
        error={!!errors.slug}
        helperText={errors.slug || `Tu URL: ${form.slug || 'mi-clinica'}.ecosalud.com`}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><LinkIcon sx={{ fontSize: 16, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="mi-clinica"
      />

      <TextField
        label="Especialidad *"
        fullWidth size="small" select
        value={form.specialty}
        onChange={e => set('specialty', e.target.value)}
        error={!!errors.specialty}
        helperText={errors.specialty}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><MedicalServicesOutlinedIcon sx={{ fontSize: 16, color: '#9DBFBA' }} /></InputAdornment> } }}
      >
        <MenuItem value="" disabled><em>Selecciona tu especialidad</em></MenuItem>
        {SPECIALTIES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>

      <TextField
        label="Ciudad"
        fullWidth size="small"
        value={form.city}
        onChange={e => set('city', e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="Bogotá"
      />

      <Button
        variant="contained" size="large" fullWidth
        onClick={() => { if (validateStep0()) setStep(1); }}
        endIcon={<ArrowForwardOutlinedIcon />}
        sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, py: 1.4, '&:hover': { bgcolor: '#2B8A78' } }}
      >
        Continuar
      </Button>
    </Box>
  );

  const Step1 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        label="Tu nombre completo *"
        fullWidth size="small"
        value={form.ownerName}
        onChange={e => set('ownerName', e.target.value)}
        error={!!errors.ownerName}
        helperText={errors.ownerName}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlinedIcon sx={{ fontSize: 18, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="Dra. María García"
      />

      <TextField
        label="Correo electrónico *"
        fullWidth size="small" type="email"
        value={form.ownerEmail}
        onChange={e => { set('ownerEmail', e.target.value); setEmailConflict(false); setRecoveryState('idle'); }}
        error={!!errors.ownerEmail}
        helperText={errors.ownerEmail || 'Recibirás tus credenciales de acceso aquí'}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 16, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="doctor@midominio.com"
      />

      <TextField
        label="Teléfono"
        fullWidth size="small"
        value={form.phone}
        onChange={e => set('phone', e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ fontSize: 16, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="+57 300 000 0000"
      />

      <Divider sx={{ my: 0.5 }} />

      {/* Plan selector */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: '#1A2E2A' }}>
          Plan de suscripción — 14 días gratis
        </Typography>
        <ToggleButtonGroup
          value={form.plan} exclusive
          onChange={(_, v) => { if (v) set('plan', v); }}
          fullWidth
          sx={{ gap: 1.5, '& .MuiToggleButton-root': { borderRadius: '10px !important', border: '1.5px solid #C5DDD8 !important', flexDirection: 'column', py: 1.5, alignItems: 'flex-start', px: 2 } }}
        >
          {(['STARTER', 'PRO'] as const).map(p => (
            <ToggleButton key={p} value={p} sx={{ '&.Mui-selected': { bgcolor: '#E8F5F0', borderColor: '#3DAA96 !important' }, position: 'relative', overflow: 'visible' }}>
              {p === 'PRO' && (
                <Chip label="Recomendado" size="small" sx={{ position: 'absolute', top: -10, right: 10, bgcolor: '#3DAA96', color: '#fff', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2E2A' }}>{p === 'STARTER' ? 'Starter' : 'Pro'}</Typography>
                <Typography variant="caption" sx={{ color: '#5A7A74', fontWeight: 600 }}>
                  {p === 'STARTER' ? '$29 USD/mes' : '$59 USD/mes'}
                </Typography>
              </Box>
              {PLAN_FEATURES[p].slice(0, 3).map(f => (
                <Typography key={f} variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckOutlinedIcon sx={{ fontSize: 12, color: '#3DAA96' }} /> {f}
                </Typography>
              ))}
              {PLAN_FEATURES[p].length > 3 && (
                <Typography variant="caption" sx={{ color: '#3DAA96', fontWeight: 600 }}>+{PLAN_FEATURES[p].length - 3} más…</Typography>
              )}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Email en conflicto */}
      {emailConflict && recoveryState !== 'sent' && (
        <Box sx={{ bgcolor: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 2, p: 2 }}>
          <Typography sx={{ fontWeight: 700, color: '#7A5C00', mb: 0.5, fontSize: '0.9rem' }}>
            Este correo ya tiene una cuenta registrada
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
            <Button variant="outlined" size="small" onClick={() => navigate('/login')}
              sx={{ borderColor: '#3DAA96', color: '#3DAA96', borderRadius: 2, fontWeight: 700 }}>
              Iniciar sesión
            </Button>
            <Button variant="contained" size="small" disabled={recoveryState === 'loading'}
              startIcon={recoveryState === 'loading' ? <CircularProgress size={12} color="inherit" /> : undefined}
              onClick={handleRecoverPassword}
              sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}>
              {recoveryState === 'loading' ? 'Enviando…' : 'Recuperar contraseña'}
            </Button>
          </Box>
        </Box>
      )}

      {recoveryState === 'sent' && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Te enviamos una contraseña temporal a <strong>{form.ownerEmail}</strong>.
        </Alert>
      )}

      {apiError && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError('')}>{apiError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button variant="outlined" onClick={() => setStep(0)}
          sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, flex: 1 }}>
          Atrás
        </Button>
        <Button
          variant="contained" size="large" disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          onClick={handleSubmit}
          sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, py: 1.4, flex: 2, '&:hover': { bgcolor: '#2B8A78' } }}>
          {loading ? 'Creando tu clínica…' : 'Crear mi clínica'}
        </Button>
      </Box>
    </Box>
  );

  const StepSuccess = () => (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#E8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
        <CheckCircleOutlinedIcon sx={{ fontSize: 44, color: '#3DAA96' }} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A', mb: 1 }}>
        ¡Tu clínica está lista!
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Hemos enviado tus credenciales a <strong>{result?.email}</strong>.
      </Typography>

      {/* Subdominio */}
      <Box sx={{ bgcolor: '#F8FDFB', border: '1px solid #C5DDD8', borderRadius: 2, p: 2, mb: 3, textAlign: 'left' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Tu subdominio
        </Typography>
        <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mt: 0.5, fontSize: '0.9rem', wordBreak: 'break-all' }}>
          🌐 {result?.subdomain}
        </Typography>
      </Box>

      {/* Próximos pasos */}
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5, textAlign: 'left' }}>
        Próximos pasos
      </Typography>
      <List dense disablePadding sx={{ mb: 3 }}>
        {NEXT_STEPS.map((ns, i) => (
          <ListItem key={i} alignItems="flex-start" sx={{ px: 0, py: 0.8 }}>
            <ListItemIcon sx={{ minWidth: 36, mt: 0.2 }}>
              <Typography sx={{ fontSize: '1.2rem' }}>{ns.icon}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#1A2E2A' }}>{ns.title}</Typography>}
              secondary={<Typography variant="caption" color="text.secondary">{ns.desc}</Typography>}
            />
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained" size="large" fullWidth
        onClick={() => navigate('/admin')}
        endIcon={<ArrowForwardOutlinedIcon />}
        sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, py: 1.4, '&:hover': { bgcolor: '#2B8A78' } }}>
        Ir a mi panel de administración
      </Button>
    </Box>
  );

  // ── Layout ─────────────────────────────────────────────────────────────────

  const showSuccess = step === 2;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E4F0ED', py: 1.5, px: 3, display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 24 }} />
        <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1rem' }}>
          Ecosalud
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary">
          ¿Ya tienes cuenta?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ color: '#3DAA96', fontWeight: 700 }}>
            Inicia sesión
          </Link>
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: showSuccess ? '1fr' : '1fr 1.1fr' }, gap: 5, maxWidth: showSuccess ? 520 : '100%', mx: 'auto' }}>

          {/* ── Panel izquierdo: beneficios (solo visible antes del éxito en desktop) ── */}
          {!showSuccess && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
              <Box>
                <Chip label="14 días gratis • Sin tarjeta" size="small" sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2E2A', lineHeight: 1.15, mb: 2 }}>
                  Tu clínica online<br />en menos de 2 minutos
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Todo lo que necesitas para digitalizar tu práctica médica: citas, pacientes, historia clínica y más.
                </Typography>
              </Box>

              {/* Beneficios */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {BENEFITS.map((b, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#E8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {b.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 600, color: '#1A2E2A', fontSize: '0.9rem' }}>{b.text}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Features del plan seleccionado */}
              <Box sx={{ bgcolor: '#fff', border: '1px solid #E4F0ED', borderRadius: 3, p: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Plan {form.plan === 'STARTER' ? 'Starter' : 'Pro'} incluye
                </Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  {PLAN_FEATURES[form.plan].map(f => (
                    <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckOutlinedIcon sx={{ fontSize: 14, color: '#3DAA96', flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary">{f}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* ── Panel derecho: formulario ── */}
          <Box>
            {!showSuccess && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A2E2A', mb: 0.5 }}>
                  {step === 0 ? 'Cuéntanos sobre tu clínica' : 'Tus datos de acceso'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step === 0 ? 'Paso 1 de 2 — Información básica' : 'Paso 2 de 2 — Crea tu cuenta de administrador'}
                </Typography>
                <Stepper activeStep={step} sx={{ mb: 0 }}>
                  {STEPS.map(label => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          '& .MuiStepLabel-label': { fontWeight: 600, fontSize: '0.8rem' },
                          '& .MuiStepIcon-root.Mui-active': { color: '#3DAA96' },
                          '& .MuiStepIcon-root.Mui-completed': { color: '#3DAA96' },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}

            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 20px rgba(0,0,0,0.07)', p: { xs: 3, md: 3.5 } }}>
              {step === 0 && <Step0 />}
              {step === 1 && <Step1 />}
              {step === 2 && <StepSuccess />}
            </Card>

            {!showSuccess && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2.5 }}>
                Al registrarte aceptas los{' '}
                <Link href="/terminos" underline="hover" sx={{ color: '#3DAA96' }}>Términos de servicio</Link>
                {' '}y la{' '}
                <Link href="/privacidad" underline="hover" sx={{ color: '#3DAA96' }}>Política de privacidad</Link>.
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
