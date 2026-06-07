/**
 * SuperAdminPage — Panel de Control de la Plataforma Ecosalud
 *
 * Dashboard centralizado para gestionar todas las clínicas registradas.
 * Permite ver, editar, dar soporte y controlar cada tenant de la plataforma.
 *
 * Funcionalidades:
 *   - Lista de clínicas con búsqueda y filtros
 *   - Drawer de detalle con tabs: Info · Admin · Suscripción · Stats
 *   - Edición completa de info de clínica
 *   - Reset de contraseña de admin (soporte)
 *   - Cambio de plan y estado de facturación
 *   - Estadísticas de uso en tiempo real
 *   - Activar/desactivar clínicas
 *   - Crear nueva clínica
 *   - Eliminación con confirmación (IRREVERSIBLE)
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, IconButton, Tooltip, Switch,
  CircularProgress, Alert, Divider, TextField, InputAdornment,
  Drawer, Tabs, Tab, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress,
} from '@mui/material';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { useAuthContext } from '../../context/AuthContext';
import axiosClient from '../../../infrastructure/http/axiosClient';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface TenantRow {
  id: number;
  name: string;
  slug: string;
  subdomain: string;
  customDomain?: string;
  domainVerified?: boolean;
  ownerName: string;
  ownerEmail: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  specialty?: string;
  primaryColor?: string;
  logoUrl?: string;
  plan: string;
  accountType: string;
  billingStatus: string;
  active: boolean;
  schemaInitialized: boolean;
  createdAt: string;
}

interface TenantStats {
  totalUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalSpecialists: number;
  totalServices: number;
  totalTherapyPlans: number;
  totalHealthRecords: number;
  totalPosts: number;
}

// ── Constantes visuales ────────────────────────────────────────────────────────

const PLAN_OPTS = ['STARTER', 'PRO', 'CLINIC', 'FOUNDER'];
const BILLING_OPTS = ['ACTIVE', 'EXEMPT', 'SUSPENDED', 'OVERDUE'];

const PLAN_COLOR: Record<string, string> = {
  STARTER: '#5A7A74', PRO: '#3DAA96', CLINIC: '#1A4A3E', FOUNDER: '#8B4513',
};
const BILLING_COLOR: Record<string, string> = {
  ACTIVE: '#27AE60', EXEMPT: '#3DAA96', TRIAL: '#5A5FC8',
  SUSPENDED: '#E67E22', OVERDUE: '#C0392B', PENDING: '#F39C12',
};

// ── Componente principal ───────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');

  // Drawer de detalle
  const [selected, setSelected] = useState<TenantRow | null>(null);
  const [tab, setTab] = useState(0);

  // Stats
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Edit info
  const [editForm, setEditForm] = useState<Partial<TenantRow>>({});
  const [saving, setSaving] = useState(false);

  // Reset password
  const [newPass, setNewPass] = useState('');
  const [resettingPass, setResettingPass] = useState(false);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // ── Carga inicial ─────────────────────────────────────────────────────────

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/platform/tenants');
      setTenants(data);
    } catch {
      setError('No se pudo cargar la lista de clínicas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const loadStats = useCallback(async (id: number) => {
    setStatsLoading(true);
    setStats(null);
    try {
      const { data } = await axiosClient.get(`/platform/tenants/${id}/stats`);
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Al abrir drawer, inicializar form y cargar stats
  const openDrawer = (t: TenantRow) => {
    setSelected(t);
    setEditForm({ ...t });
    setTab(0);
    setStats(null);
    setNewPass('');
    setDeleteConfirmText('');
    loadStats(t.id);
  };

  const closeDrawer = () => { setSelected(null); setDeleteDialog(false); };

  // ── Toggle active ─────────────────────────────────────────────────────────

  const toggleActive = async (id: number, current: boolean) => {
    try {
      const { data } = await axiosClient.patch(`/platform/tenants/${id}/active?active=${!current}`);
      setTenants(prev => prev.map(t => t.id === id ? { ...t, active: data.active } : t));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, active: data.active } : prev);
      setToast(`Clínica ${!current ? 'activada' : 'desactivada'} correctamente.`);
    } catch {
      setError('No se pudo actualizar el estado.');
    }
  };

  // ── Guardar info ──────────────────────────────────────────────────────────

  const saveInfo = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await axiosClient.put(`/platform/tenants/${selected.id}`, editForm);
      setTenants(prev => prev.map(t => t.id === selected.id ? { ...t, ...data } : t));
      setSelected(data);
      setToast('Información actualizada correctamente.');
    } catch {
      setError('No se pudo guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  // ── Cambiar plan ──────────────────────────────────────────────────────────

  const changePlan = async (plan: string) => {
    if (!selected) return;
    try {
      const { data } = await axiosClient.patch(`/platform/tenants/${selected.id}/plan?plan=${plan}`);
      setTenants(prev => prev.map(t => t.id === selected.id ? { ...t, plan: data.plan } : t));
      setSelected(data);
      setToast(`Plan cambiado a ${plan}.`);
    } catch { setError('No se pudo cambiar el plan.'); }
  };

  // ── Toggle billing exempt ─────────────────────────────────────────────────

  const toggleExempt = async (exempt: boolean) => {
    if (!selected) return;
    try {
      const { data } = await axiosClient.patch(`/platform/tenants/${selected.id}/billing-exempt?exempt=${exempt}`);
      setTenants(prev => prev.map(t => t.id === selected.id ? { ...t, billingStatus: data.billingStatus } : t));
      setSelected(data);
      setToast(`Facturación ${exempt ? 'exenta' : 'activa'}.`);
    } catch { setError('No se pudo cambiar la facturación.'); }
  };

  // ── Reset password ────────────────────────────────────────────────────────

  const resetPassword = async () => {
    if (!selected || newPass.length < 8) return;
    setResettingPass(true);
    try {
      await axiosClient.patch(`/platform/tenants/${selected.id}/admin-password`, { newPassword: newPass });
      setNewPass('');
      setToast('Contraseña del admin restablecida correctamente.');
    } catch {
      setError('No se pudo restablecer la contraseña.');
    } finally {
      setResettingPass(false);
    }
  };

  // ── Eliminar tenant ────────────────────────────────────────────────────────

  const deleteTenant = async () => {
    if (!selected || deleteConfirmText !== selected.slug) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/platform/tenants/${selected.id}`, {
        headers: { 'X-Confirm-Delete': 'true' },
      });
      setTenants(prev => prev.filter(t => t.id !== selected.id));
      closeDrawer();
      setToast(`Clínica "${selected.name}" eliminada permanentemente.`);
    } catch {
      setError('No se pudo eliminar la clínica.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Filtros ───────────────────────────────────────────────────────────────

  const filtered = tenants.filter(t => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());
    const matchPlan = !filterPlan || t.plan === filterPlan;
    return matchSearch && matchPlan;
  });

  const stats_bar = {
    total:    tenants.length,
    active:   tenants.filter(t => t.active).length,
    pro:      tenants.filter(t => t.plan === 'PRO').length,
    founder:  tenants.filter(t => t.accountType === 'FOUNDER').length,
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F6F4' }}>

      {/* ── Topbar ── */}
      <Box sx={{ bgcolor: '#1A2E2A', px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 22 }} />
        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem', flex: 1 }}>
          Ecosalud — Super Admin
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>{user?.name}</Typography>
        <Tooltip title="Cerrar sesión">
          <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#C0392B' } }}>
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1300, mx: 'auto' }}>

        {/* ── Header + nuevo ── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>Clínicas registradas</Typography>
            <Typography variant="body2" color="text.secondary">Gestión centralizada de tenants · soporte · facturación</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<TrendingUpOutlinedIcon />}
              onClick={() => navigate('/superadmin/revenue')}
              sx={{ borderColor: '#3DAA96', color: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#E8F5F0' } }}
            >
              Ingresos
            </Button>
            <Button
              variant="outlined"
              startIcon={<CampaignOutlinedIcon />}
              onClick={() => navigate('/superadmin/blog')}
              sx={{ borderColor: '#5A5FC8', color: '#5A5FC8', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#EEEEF8' } }}
            >
              Blog
            </Button>
            <Button
              variant="outlined"
              startIcon={<SettingsOutlinedIcon />}
              onClick={() => navigate('/superadmin/settings')}
              sx={{ borderColor: '#9DBFBA', color: '#5A7A74', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#F4FAF8' } }}
            >
              Configuración
            </Button>
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={() => navigate('/superadmin/new-clinic')}
              sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2E8B7A' } }}
            >
              Nueva clínica
            </Button>
          </Box>
        </Box>

        {/* ── Stats bar ── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',    value: stats_bar.total,   color: '#3DAA96', bg: '#E8F5F0' },
            { label: 'Activas',  value: stats_bar.active,  color: '#27AE60', bg: '#E8F8F0' },
            { label: 'Pro',      value: stats_bar.pro,     color: '#1A4A3E', bg: '#E3EDE9' },
            { label: 'Fundadoras', value: stats_bar.founder, color: '#8B4513', bg: '#FDF0E0' },
          ].map(s => (
            <Box key={s.label} sx={{ bgcolor: s.bg, border: `1px solid ${s.color}30`, borderRadius: 2, px: 2.5, py: 1.2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: s.color }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* ── Filtros ── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Buscar clínica, email, slug…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9DBFBA', fontSize: 18 }} /></InputAdornment> } }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Plan</InputLabel>
            <Select value={filterPlan} label="Plan" onChange={e => setFilterPlan(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {PLAN_OPTS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {/* ── Tabla ── */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#3DAA96' }} /></Box>
        ) : (
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E4F0ED' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FDFB' }}>
                    {['Clínica', 'Propietario', 'Especialidad', 'Plan', 'Facturación', 'Activa', 'Acciones'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(t => (
                    <TableRow key={t.id} sx={{ opacity: t.active ? 1 : 0.5, '&:hover': { bgcolor: '#F8FDFB' }, '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: t.primaryColor || '#3DAA96', fontSize: '0.75rem', fontWeight: 700 }}>
                            <StorefrontOutlinedIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A2E2A' }}>{t.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{t.subdomain}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{t.ownerName}</Typography>
                        <Typography variant="caption" color="text.secondary">{t.ownerEmail}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.specialty || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={t.plan} size="small"
                          sx={{ bgcolor: `${PLAN_COLOR[t.plan] || '#5A7A74'}18`, color: PLAN_COLOR[t.plan] || '#5A7A74', fontWeight: 700, fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={t.billingStatus} size="small"
                          sx={{ bgcolor: `${BILLING_COLOR[t.billingStatus] || '#5A7A74'}15`, color: BILLING_COLOR[t.billingStatus] || '#5A7A74', fontWeight: 700, fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell>
                        <Switch checked={t.active} size="small" onChange={() => toggleActive(t.id, t.active)}
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3DAA96' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3DAA96' } }} />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver detalle y gestionar">
                          <IconButton size="small" onClick={() => openDrawer(t)}
                            sx={{ color: '#3DAA96', '&:hover': { bgcolor: '#E8F5F0' } }}>
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {filtered.length === 0 && (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">No hay clínicas que coincidan con los filtros.</Typography>
              </Box>
            )}
            <Divider />
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                {filtered.length} de {tenants.length} clínicas · Plataforma Ecosalud
              </Typography>
            </Box>
          </Card>
        )}
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════
          DRAWER DE DETALLE Y GESTIÓN
      ══════════════════════════════════════════════════════════════════════ */}
      <Drawer
        anchor="right"
        open={Boolean(selected)}
        onClose={closeDrawer}
        slotProps={{ paper: { sx: { width: { xs: '100vw', sm: 520 }, display: 'flex', flexDirection: 'column' } } }}
      >
        {selected && (
          <>
            {/* Header del drawer */}
            <Box sx={{ bgcolor: '#1A2E2A', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: selected.primaryColor || '#3DAA96', width: 40, height: 40 }}>
                <StorefrontOutlinedIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>{selected.name}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>{selected.slug}</Typography>
              </Box>
              <IconButton size="small" onClick={closeDrawer} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
              sx={{ borderBottom: '1px solid #E4F0ED', bgcolor: '#F8FDFB',
                '& .MuiTab-root': { fontSize: '0.75rem', fontWeight: 600, minHeight: 44, textTransform: 'none' },
                '& .Mui-selected': { color: '#3DAA96' },
                '& .MuiTabs-indicator': { bgcolor: '#3DAA96' } }}>
              <Tab icon={<EditOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Información" />
              <Tab icon={<KeyOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Admin" />
              <Tab icon={<StorefrontOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Suscripción" />
              <Tab icon={<BarChartOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Stats" />
            </Tabs>

            {/* Contenido scrollable */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>

              {/* ─── Tab 0: Información ─── */}
              {tab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Identidad de la clínica
                  </Typography>
                  <TextField label="Nombre" size="small" fullWidth value={editForm.name || ''}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                  <TextField label="Especialidad" size="small" fullWidth value={editForm.specialty || ''}
                    onChange={e => setEditForm(p => ({ ...p, specialty: e.target.value }))} />
                  <TextField label="Color primario" size="small" fullWidth value={editForm.primaryColor || ''}
                    onChange={e => setEditForm(p => ({ ...p, primaryColor: e.target.value }))}
                    slotProps={{ input: { endAdornment: <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: editForm.primaryColor || '#3DAA96', border: '1px solid #ccc' }} /> } }}
                  />
                  <TextField label="URL del logo" size="small" fullWidth value={editForm.logoUrl || ''}
                    onChange={e => setEditForm(p => ({ ...p, logoUrl: e.target.value }))} />

                  <Divider sx={{ my: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Contacto y ubicación
                  </Typography>
                  <TextField label="Nombre del propietario" size="small" fullWidth value={editForm.ownerName || ''}
                    onChange={e => setEditForm(p => ({ ...p, ownerName: e.target.value }))} />
                  <TextField label="Email del propietario" size="small" fullWidth type="email" value={editForm.ownerEmail || ''}
                    onChange={e => setEditForm(p => ({ ...p, ownerEmail: e.target.value }))} />
                  <TextField label="Teléfono" size="small" fullWidth value={editForm.phone || ''}
                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                  <TextField label="Dirección" size="small" fullWidth value={editForm.address || ''}
                    onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField label="Ciudad" size="small" fullWidth value={editForm.city || ''}
                      onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} />
                    <TextField label="País" size="small" sx={{ width: 90 }} value={editForm.country || ''}
                      onChange={e => setEditForm(p => ({ ...p, country: e.target.value }))} />
                  </Box>

                  <Divider sx={{ my: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Dominio
                  </Typography>
                  <TextField label="Subdominio (solo lectura)" size="small" fullWidth value={selected.subdomain} disabled />
                  <TextField label="Dominio propio" size="small" fullWidth value={editForm.customDomain || ''}
                    onChange={e => setEditForm(p => ({ ...p, customDomain: e.target.value }))}
                    helperText="Ejemplo: www.clinicaejemplo.com.co" />
                  <TextField label="Código promocional" size="small" fullWidth value={editForm.promoCode || ''}
                    onChange={e => setEditForm(p => ({ ...p, promoCode: e.target.value }))} />

                  <Button variant="contained" onClick={saveInfo} disabled={saving}
                    sx={{ mt: 1, bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2E8B7A' } }}>
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                </Box>
              )}

              {/* ─── Tab 1: Admin ─── */}
              {tab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Info actual del admin */}
                  <Card sx={{ p: 2, bgcolor: '#F8FDFB', border: '1px solid #E4F0ED', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', mb: 0.5 }}>Admin actual</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#1A2E2A' }}>{selected.ownerName}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#5A7A74' }}>{selected.ownerEmail}</Typography>
                    {!selected.schemaInitialized && (
                      <Chip label="Schema no inicializado" size="small"
                        sx={{ mt: 1, bgcolor: '#FFF3E0', color: '#E67E22', fontWeight: 700, fontSize: '0.68rem' }} />
                    )}
                  </Card>

                  <Divider />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Restablecer contraseña de administrador
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                    Úsalo solo cuando el cliente confirme su identidad. La contraseña nueva es temporal — pídele que la cambie en su primer acceso.
                  </Typography>
                  <TextField
                    label="Nueva contraseña temporal"
                    size="small"
                    fullWidth
                    type="password"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    helperText="Mínimo 8 caracteres"
                    error={newPass.length > 0 && newPass.length < 8}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<KeyOutlinedIcon />}
                    onClick={resetPassword}
                    disabled={newPass.length < 8 || resettingPass}
                    sx={{ borderColor: '#3DAA96', color: '#3DAA96', borderRadius: 2, fontWeight: 700 }}
                  >
                    {resettingPass ? 'Restableciendo…' : 'Restablecer contraseña'}
                  </Button>

                  <Divider />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Estado de la clínica
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: '#F8FDFB', borderRadius: 2, border: '1px solid #E4F0ED' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Clínica activa</Typography>
                      <Typography variant="caption" color="text.secondary">Desactivar bloquea el acceso a todos sus usuarios.</Typography>
                    </Box>
                    <Switch
                      checked={selected.active}
                      onChange={() => toggleActive(selected.id, selected.active)}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3DAA96' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3DAA96' } }}
                    />
                  </Box>
                </Box>
              )}

              {/* ─── Tab 2: Suscripción ─── */}
              {tab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Plan de suscripción
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Plan</InputLabel>
                    <Select value={selected.plan} label="Plan" onChange={e => changePlan(e.target.value)}>
                      {PLAN_OPTS.map(p => (
                        <MenuItem key={p} value={p}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PLAN_COLOR[p] || '#5A7A74' }} />
                            {p}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Facturación
                  </Typography>

                  <Card sx={{ p: 2, bgcolor: '#F8FDFB', border: '1px solid #E4F0ED', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Exento de pago</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Activo para fundadores, demos y promociones especiales.
                        </Typography>
                      </Box>
                      <Switch
                        checked={selected.billingStatus === 'EXEMPT'}
                        onChange={e => toggleExempt(e.target.checked)}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3DAA96' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3DAA96' } }}
                      />
                    </Box>
                    <Chip
                      label={`Estado actual: ${selected.billingStatus}`}
                      size="small"
                      sx={{ mt: 1.5, bgcolor: `${BILLING_COLOR[selected.billingStatus] || '#5A7A74'}15`, color: BILLING_COLOR[selected.billingStatus] || '#5A7A74', fontWeight: 700, fontSize: '0.68rem' }}
                    />
                  </Card>

                  <Card sx={{ p: 2, bgcolor: '#F8FDFB', border: '1px solid #E4F0ED', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', mb: 0.5 }}>Tipo de cuenta</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#5A7A74' }}>{selected.accountType}</Typography>
                    <Typography variant="caption" color="text.secondary">Registrado: {new Date(selected.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
                  </Card>
                </Box>
              )}

              {/* ─── Tab 3: Stats ─── */}
              {tab === 3 && (
                <Box>
                  {statsLoading ? (
                    <Box sx={{ pt: 2 }}><LinearProgress sx={{ borderRadius: 1, bgcolor: '#E8F5F0', '& .MuiLinearProgress-bar': { bgcolor: '#3DAA96' } }} /></Box>
                  ) : stats ? (
                    <Grid container spacing={2}>
                      {[
                        { icon: <PeopleOutlineIcon />,             label: 'Usuarios',       value: stats.totalUsers },
                        { icon: <EventOutlinedIcon />,             label: 'Citas totales',  value: stats.totalAppointments },
                        { icon: <EventOutlinedIcon />,             label: 'Citas pendientes', value: stats.pendingAppointments },
                        { icon: <MedicalServicesOutlinedIcon />,   label: 'Especialistas',  value: stats.totalSpecialists },
                        { icon: <StorefrontOutlinedIcon />,        label: 'Servicios',      value: stats.totalServices },
                        { icon: <CheckCircleOutlineIcon />,        label: 'Planes terapia', value: stats.totalTherapyPlans },
                        { icon: <MedicalServicesOutlinedIcon />,   label: 'Hist. clínicas', value: stats.totalHealthRecords },
                        { icon: <ArticleOutlinedIcon />,           label: 'Posts',          value: stats.totalPosts },
                      ].map(s => (
                        <Grid size={{ xs: 6 }} key={s.label}>
                          <Card sx={{ p: 2, bgcolor: '#F8FDFB', border: '1px solid #E4F0ED', borderRadius: 2, textAlign: 'center' }}>
                            <Box sx={{ color: '#3DAA96', mb: 0.5 }}>{s.icon}</Box>
                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A2E2A', lineHeight: 1 }}>{s.value}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>{s.label}</Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No se pudieron cargar las estadísticas.</Typography>
                      <Button size="small" onClick={() => loadStats(selected.id)} sx={{ mt: 1, color: '#3DAA96' }}>Reintentar</Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* ─── Footer con zona de peligro ─── */}
            <Box sx={{ p: 3, borderTop: '1px solid #F0EAE8', bgcolor: '#FDFAF9' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#C0392B', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                Zona de peligro
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DeleteOutlinedIcon />}
                onClick={() => setDeleteDialog(true)}
                fullWidth
                sx={{ borderColor: '#C0392B', color: '#C0392B', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#FDF0EE', borderColor: '#A93226' } }}
              >
                Eliminar clínica permanentemente
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      {/* ── Dialog de confirmación de eliminación ── */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 440 } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#C0392B' }}>⚠ Eliminar clínica</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            Esta acción es <strong>IRREVERSIBLE</strong>. Se eliminará el schema de PostgreSQL con todos los datos clínicos, los usuarios y el registro del tenant.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Escribe el slug <strong>{selected?.slug}</strong> para confirmar:
          </Typography>
          <TextField
            fullWidth size="small"
            placeholder={selected?.slug}
            value={deleteConfirmText}
            onChange={e => setDeleteConfirmText(e.target.value)}
            error={deleteConfirmText.length > 0 && deleteConfirmText !== selected?.slug}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ color: '#5A7A74' }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={deleteTenant}
            disabled={deleteConfirmText !== selected?.slug || deleting}
            sx={{ bgcolor: '#C0392B', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#A93226' }, '&:disabled': { bgcolor: '#E8B4AE' } }}
          >
            {deleting ? 'Eliminando…' : 'Eliminar definitivamente'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{ content: { sx: { bgcolor: '#1A2E2A', borderRadius: 2, fontWeight: 600 } } }}
      />
    </Box>
  );
}
