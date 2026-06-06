import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel,
  Container, Card, InputAdornment, Alert, CircularProgress,
  ToggleButton, ToggleButtonGroup, Chip, Divider, Link, MenuItem,
} from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import LinkIcon from '@mui/icons-material/Link';
import axiosClient from '../../../infrastructure/http/axiosClient';
import { useAuthContext } from '../../context/AuthContext';

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

// ── Tipos ─────────────────────────────────────────────────────────────────────

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

const STEPS = ['Tu clínica', 'Tus datos', '¡Listo!'];

const SPECIALTIES = [
  'Fisioterapia', 'Medicina alternativa', 'Acupuntura', 'Osteopatía',
  'Nutrición', 'Psicología', 'Odontología', 'Medicina general',
  'Terapia ocupacional', 'Otra',
];

// ── Componente ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [searchParams] = useSearchParams();

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
      if (k === 'clinicName' && !slugEdited) {
        next.slug = toSlug(v as string);
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [k]: '' }));
  }, [slugEdited]);

  // ── Validaciones por paso ─────────────────────────────────────────────────

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.clinicName.trim()) e.clinicName = 'Obligatorio';
    if (!form.slug) e.slug = 'Obligatorio';
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) e.slug = 'Solo letras minúsculas, números y guiones';
    if (!form.specialty) e.specialty = 'Obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: typeof errors = {};
    if (!form.ownerName.trim()) e.ownerName = 'Obligatorio';
    if (!form.ownerEmail.trim()) e.ownerEmail = 'Obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) e.ownerEmail = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep2()) return;
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

      // Guardar JWT en contexto para auto-login
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

  // ── Render por paso ───────────────────────────────────────────────────────

  const renderStep1 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        label="Nombre de la clínica"
        fullWidth
        value={form.clinicName}
        onChange={e => set('clinicName', e.target.value)}
        error={!!errors.clinicName}
        helperText={errors.clinicName}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><StorefrontOutlinedIcon sx={{ fontSize: 20, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="Ej. Clínica Fisiosalud Camacho"
      />

      <Box>
        <TextField
          label="URL de tu clínica (slug)"
          fullWidth
          value={form.slug}
          onChange={e => { setSlugEdited(true); set('slug', toSlug(e.target.value)); }}
          error={!!errors.slug}
          helperText={errors.slug || `Tu URL será: ${form.slug || 'mi-clinica'}.ecosalud.com`}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><LinkIcon sx={{ fontSize: 18, color: '#9DBFBA' }} /></InputAdornment> } }}
          placeholder="mi-clinica"
        />
      </Box>

      <TextField
        label="Especialidad"
        fullWidth
        select
        value={form.specialty}
        onChange={e => set('specialty', e.target.value)}
        error={!!errors.specialty}
        helperText={errors.specialty}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><MedicalServicesOutlinedIcon sx={{ fontSize: 18, color: '#9DBFBA' }} /></InputAdornment> } }}
      >
        <MenuItem value="" disabled><em>Selecciona tu especialidad</em></MenuItem>
        {SPECIALTIES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>

      <TextField
        label="Ciudad (opcional)"
        fullWidth
        value={form.city}
        onChange={e => set('city', e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="Bogotá"
      />

      <Button
        variant="contained"
        size="large"
        onClick={() => { if (validateStep1()) setStep(1); }}
        sx={{ mt: 1, bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, py: 1.5, '&:hover': { bgcolor: '#2B8A78' } }}
      >
        Continuar
      </Button>
    </Box>
  );

  const renderStep2 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        label="Tu nombre completo"
        fullWidth
        value={form.ownerName}
        onChange={e => set('ownerName', e.target.value)}
        error={!!errors.ownerName}
        helperText={errors.ownerName}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 20, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="Dra. María García"
      />

      <TextField
        label="Correo electrónico"
        fullWidth
        type="email"
        value={form.ownerEmail}
        onChange={e => { set('ownerEmail', e.target.value); setEmailConflict(false); setRecoveryState('idle'); }}
        error={!!errors.ownerEmail}
        helperText={errors.ownerEmail || 'Recibirás tus credenciales de acceso aquí'}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 18, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="doctor@midominio.com"
      />

      <TextField
        label="Teléfono (opcional)"
        fullWidth
        value={form.phone}
        onChange={e => set('phone', e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ fontSize: 18, color: '#9DBFBA' }} /></InputAdornment> } }}
        placeholder="+57 300 000 0000"
      />

      <Divider sx={{ my: 0.5 }} />

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: '#1A2E2A' }}>
          Plan de suscripción
        </Typography>
        <ToggleButtonGroup
          value={form.plan}
          exclusive
          onChange={(_, v) => { if (v) set('plan', v); }}
          fullWidth
          sx={{ gap: 1.5, '& .MuiToggleButton-root': { borderRadius: '12px !important', border: '1.5px solid #C5DDD8 !important', flexDirection: 'column', py: 2 } }}
        >
          <ToggleButton value="STARTER" sx={{ '&.Mui-selected': { bgcolor: '#E8F5F0', borderColor: '#3DAA96 !important', color: '#3DAA96' } }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Starter</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>$29 USD/mes</Typography>
            <Chip label="14 días gratis" size="small" sx={{ mt: 0.5, bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, fontSize: '0.65rem' }} />
          </ToggleButton>
          <ToggleButton value="PRO" sx={{ '&.Mui-selected': { bgcolor: '#E8F5F0', borderColor: '#3DAA96 !important', color: '#3DAA96' } }}>
            <Box sx={{ position: 'relative', width: '100%', textAlign: 'center' }}>
              <Chip label="Recomendado" size="small" sx={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', bgcolor: '#3DAA96', color: '#fff', fontWeight: 700, fontSize: '0.6rem' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', mt: 1 }}>Pro</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>$59 USD/mes</Typography>
            <Chip label="14 días gratis" size="small" sx={{ mt: 0.5, bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, fontSize: '0.65rem' }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {emailConflict && !recoveryState.startsWith('sent') && (
        <Box sx={{ bgcolor: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 2, p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, color: '#7A5C00', mb: 0.5, fontSize: '0.92rem' }}>
            Este correo ya tiene una cuenta registrada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ¿Deseas iniciar sesión o recuperar tu contraseña?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/login')}
              sx={{ borderColor: '#3DAA96', color: '#3DAA96', borderRadius: 2, fontWeight: 700 }}
            >
              Iniciar sesión
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={recoveryState === 'loading'}
              startIcon={recoveryState === 'loading' ? <CircularProgress size={14} color="inherit" /> : undefined}
              onClick={handleRecoverPassword}
              sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
            >
              {recoveryState === 'loading' ? 'Enviando…' : 'Recuperar contraseña'}
            </Button>
          </Box>
        </Box>
      )}

      {recoveryState === 'sent' && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          ✅ Te enviamos una nueva contraseña temporal a <strong>{form.ownerEmail}</strong>. Revisa tu correo.
        </Alert>
      )}

      {apiError && <Alert severity="error" sx={{ borderRadius: 2 }}>{apiError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
        <Button
          variant="outlined"
          onClick={() => setStep(0)}
          sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, flex: 1 }}
        >
          Atrás
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, py: 1.5, flex: 2, '&:hover': { bgcolor: '#2B8A78' } }}
        >
          {loading ? 'Creando tu clínica…' : 'Crear mi clínica'}
        </Button>
      </Box>
    </Box>
  );

  const renderStep3 = () => (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <CheckCircleIcon sx={{ fontSize: 72, color: '#3DAA96', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A', mb: 1 }}>
        ¡Tu clínica está lista!
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
        Hemos enviado tus credenciales de acceso a <strong>{result?.email}</strong>.
        Ya estás autenticado — accede a tu panel ahora.
      </Typography>

      <Card sx={{ bgcolor: '#F8FDFB', border: '1px solid #C5DDD8', borderRadius: 2, p: 2, mb: 3, maxWidth: 360, mx: 'auto', textAlign: 'left' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Tu subdominio
        </Typography>
        <Typography sx={{ fontWeight: 600, color: '#1A2E2A', mt: 0.5, wordBreak: 'break-all' }}>
          {result?.subdomain}
        </Typography>
      </Card>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={() => navigate('/admin')}
        sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, py: 1.5, maxWidth: 360, '&:hover': { bgcolor: '#2B8A78' } }}
      >
        Ir a mi panel
      </Button>
    </Box>
  );

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E4F0ED', py: 2, px: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SpaIcon sx={{ color: '#3DAA96', fontSize: 28 }} />
        <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1.1rem' }}>
          Ecosalud Market
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Link href="/login" underline="hover" sx={{ fontSize: '0.875rem', color: '#5A7A74' }}>
          Ya tengo cuenta
        </Link>
      </Box>

      {/* Contenido */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2E2A', mb: 1 }}>
            {step < 2 ? 'Registra tu clínica' : ''}
          </Typography>
          {step < 2 && (
            <Typography color="text.secondary">
              En menos de 2 minutos tu clínica estará online.
            </Typography>
          )}
        </Box>

        {step < 2 && (
          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {STEPS.slice(0, 2).map(label => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { fontWeight: 600 },
                    '& .MuiStepIcon-root.Mui-active': { color: '#3DAA96' },
                    '& .MuiStepIcon-root.Mui-completed': { color: '#3DAA96' },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 20px rgba(0,0,0,0.07)', p: { xs: 3, md: 4 } }}>
          {step === 0 && renderStep1()}
          {step === 1 && renderStep2()}
          {step === 2 && renderStep3()}
        </Card>

        {step < 2 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
            Al registrarte aceptas los <Link href="/terminos" underline="hover">Términos de servicio</Link> y la <Link href="/privacidad" underline="hover">Política de privacidad</Link> de Ecosalud Market.
          </Typography>
        )}
      </Container>
    </Box>
  );
}
