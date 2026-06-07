/**
 * SuperAdminNewClinicPage — Registrar nueva clínica desde el panel super-admin.
 *
 * Crea el tenant, su schema PostgreSQL y el usuario admin inicial.
 * Ruta: /superadmin/new-clinic
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, Alert, Divider, IconButton, Tooltip, Chip,
} from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import axiosClient from '../../../infrastructure/http/axiosClient';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  specialty: string;
  primaryColor: string;
  plan: string;
  accountType: string;
  promoCode: string;
}

const INITIAL: FormState = {
  name: '', slug: '', ownerName: '', ownerEmail: '',
  phone: '', address: '', city: '', country: 'CO',
  specialty: '', primaryColor: '#3DAA96',
  plan: 'STARTER', accountType: 'REGULAR', promoCode: '',
};

const PLAN_OPTS    = ['STARTER', 'PRO', 'CLINIC', 'FOUNDER'];
const ACCOUNT_OPTS = ['REGULAR', 'FOUNDER', 'DEMO'];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Genera slug desde el nombre: minúsculas, sin tildes, guiones en vez de espacios */
function slugify(name: string): string {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ── Componente ────────────────────────────────────────────────────────────────

export default function SuperAdminNewClinicPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState('');

  // ── Handlers ──────────────────────────────────────────────────────────────

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm(p => {
      const next = { ...p, [field]: val };
      // Auto-generar slug desde nombre si no fue editado manualmente
      if (field === 'name' && !slugManual) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  const slugError = form.slug.length > 0 && !SLUG_REGEX.test(form.slug);

  const canSubmit =
    form.name.trim() &&
    form.slug.trim() && SLUG_REGEX.test(form.slug) &&
    form.ownerName.trim() &&
    form.ownerEmail.trim() && form.ownerEmail.includes('@');

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await axiosClient.post('/platform/tenants', {
        name:         form.name,
        slug:         form.slug,
        ownerName:    form.ownerName,
        ownerEmail:   form.ownerEmail,
        phone:        form.phone || undefined,
        address:      form.address || undefined,
        city:         form.city || undefined,
        country:      form.country || 'CO',
        specialty:    form.specialty || undefined,
        primaryColor: form.primaryColor || '#3DAA96',
        plan:         form.plan,
        accountType:  form.accountType,
        promoCode:    form.promoCode || undefined,
      });
      setSuccess(`Clínica "${data.name}" creada. Subdominio: ${data.subdomain}`);
      setTimeout(() => navigate('/superadmin'), 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || 'No se pudo crear la clínica.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F6F4' }}>

      {/* Topbar */}
      <Box sx={{ bgcolor: '#1A2E2A', px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title="Volver al panel">
          <IconButton size="small" onClick={() => navigate('/superadmin')} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 22 }} />
        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
          Ecosalud — Nueva Clínica
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 780, mx: 'auto' }}>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
            Registrar nueva clínica
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Se creará el tenant, su schema PostgreSQL y el usuario administrador inicial.
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" icon={<CheckCircleOutlinedIcon />} sx={{ mb: 3, borderRadius: 2 }}>
            {success} — redirigiendo al panel…
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* ── Identidad ── */}
          <SectionTitle>Identidad de la clínica</SectionTitle>

          <TextField
            label="Nombre de la clínica *"
            size="small" fullWidth
            value={form.name}
            onChange={set('name')}
            helperText="Nombre visible en la plataforma"
          />

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <TextField
              label="Slug (URL única) *"
              size="small" fullWidth
              value={form.slug}
              onChange={e => { setSlugManual(true); setForm(p => ({ ...p, slug: e.target.value })); }}
              error={slugError}
              helperText={
                slugError
                  ? 'Solo minúsculas, números y guiones. Ej: mi-clinica-salud'
                  : `Subdominio: ${form.slug || 'tu-clinica'}.ecosalud.com`
              }
            />
            {!slugManual && form.name && (
              <Chip label="Auto" size="small" sx={{ mt: 1, bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, fontSize: '0.68rem' }} />
            )}
          </Box>

          <TextField
            label="Especialidad principal"
            size="small" fullWidth
            value={form.specialty}
            onChange={set('specialty')}
            helperText="Ej: Fisioterapia, Medicina integrativa, Psicología…"
          />

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              label="Color primario"
              size="small" fullWidth
              value={form.primaryColor}
              onChange={set('primaryColor')}
              helperText="Hex: #RRGGBB"
              slotProps={{
                input: {
                  endAdornment: (
                    <Box sx={{ width: 22, height: 22, borderRadius: 1, bgcolor: form.primaryColor || '#3DAA96', border: '1px solid #ccc', flexShrink: 0 }} />
                  )
                }
              }}
            />
          </Box>

          <Divider />

          {/* ── Propietario ── */}
          <SectionTitle>Administrador de la clínica</SectionTitle>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label="Nombre completo *" size="small" fullWidth value={form.ownerName} onChange={set('ownerName')} />
            <TextField label="Email *" size="small" fullWidth type="email" value={form.ownerEmail} onChange={set('ownerEmail')}
              helperText="Será su usuario de acceso" />
          </Box>
          <TextField label="Teléfono" size="small" fullWidth value={form.phone} onChange={set('phone')} />

          <Divider />

          {/* ── Ubicación ── */}
          <SectionTitle>Ubicación</SectionTitle>

          <TextField label="Dirección" size="small" fullWidth value={form.address} onChange={set('address')} />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label="Ciudad" size="small" fullWidth value={form.city} onChange={set('city')} />
            <TextField label="País" size="small" sx={{ width: 100 }} value={form.country} onChange={set('country')} />
          </Box>

          <Divider />

          {/* ── Suscripción ── */}
          <SectionTitle>Suscripción y cuenta</SectionTitle>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select value={form.plan} label="Plan" onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
                {PLAN_OPTS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de cuenta</InputLabel>
              <Select value={form.accountType} label="Tipo de cuenta" onChange={e => setForm(p => ({ ...p, accountType: e.target.value }))}>
                {ACCOUNT_OPTS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Código promocional"
            size="small" fullWidth
            value={form.promoCode}
            onChange={set('promoCode')}
            helperText="Opcional — para descuentos o acuerdos especiales"
          />

          <Divider />

          {/* ── Acciones ── */}
          <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
            <Button variant="outlined" onClick={() => navigate('/superadmin')}
              sx={{ flex: 1, borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2 }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!canSubmit || saving || Boolean(success)}
              sx={{ flex: 2, bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2E8B7A' } }}
            >
              {saving ? 'Creando clínica…' : 'Crear clínica'}
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

// ── Helper component ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
      {children}
    </Typography>
  );
}
