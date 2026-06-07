/**
 * AdminTherapyPlansPage — Gestión de planes de terapia multi-sesión.
 *
 * Ruta: /admin/therapy-plans
 * CRUD completo: crear, editar, cambiar estado, eliminar.
 * Conectado a:
 *   GET    /api/therapy-plans
 *   POST   /api/therapy-plans
 *   PUT    /api/therapy-plans/{id}
 *   DELETE /api/therapy-plans/{id}
 *   GET    /api/user  (para selector de pacientes)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid,
  Chip, TextField, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, LinearProgress, Alert,
  Skeleton, InputAdornment, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, Paper,
} from '@mui/material';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import axiosClient from '../../../../infrastructure/http/axiosClient';
import { useAdminData } from '../../../context/AdminDataContext';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Plan {
  id: number;
  patientId: number | null;
  patientName: string | null;
  patientEmail: string | null;
  serviceId: number | null;
  serviceName: string | null;
  specialistId?: number | null;
  totalSessions: number;
  completedSessions: number;
  startDate: string | null;
  status: 'ACTIVO' | 'PAUSADO' | 'COMPLETADO' | 'CANCELADO';
  notes: string | null;
  createdAt: string;
}

interface PatientOption {
  id: number;
  name: string;
  email: string;
}

const EMPTY_FORM = {
  patientId:         '' as string | number,
  serviceId:         '' as string | number,
  totalSessions:     6,
  completedSessions: 0,
  startDate:         new Date().toISOString().slice(0, 10),
  status:            'ACTIVO' as Plan['status'],
  notes:             '',
};

// ── Helpers visuales ──────────────────────────────────────────────────────────

const STATUS_META: Record<Plan['status'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  ACTIVO:     { label: 'Activo',     color: '#27AE60', bg: '#EAF7EE', icon: <PlayCircleOutlinedIcon  sx={{ fontSize: 14 }} /> },
  PAUSADO:    { label: 'Pausado',    color: '#E67E22', bg: '#FEF3E8', icon: <PauseCircleOutlinedIcon  sx={{ fontSize: 14 }} /> },
  COMPLETADO: { label: 'Completado', color: '#3DAA96', bg: '#E8F5F0', icon: <CheckCircleOutlinedIcon  sx={{ fontSize: 14 }} /> },
  CANCELADO:  { label: 'Cancelado',  color: '#C0392B', bg: '#FDECEA', icon: <CancelOutlinedIcon       sx={{ fontSize: 14 }} /> },
};

const STATUS_OPTS: Plan['status'][] = ['ACTIVO', 'PAUSADO', 'COMPLETADO', 'CANCELADO'];

function StatusChip({ status }: { status: Plan['status'] }) {
  const m = STATUS_META[status] ?? STATUS_META.ACTIVO;
  return (
    <Chip
      icon={m.icon as React.ReactElement}
      label={m.label}
      size="small"
      sx={{ bgcolor: m.bg, color: m.color, fontWeight: 700, fontSize: '0.72rem',
            '& .MuiChip-icon': { color: m.color } }}
    />
  );
}

function SessionBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
        <Typography variant="caption" sx={{ color: '#5A7A74', fontWeight: 600 }}>
          {completed}/{total} sesiones
        </Typography>
        <Typography variant="caption" sx={{ color: '#3DAA96', fontWeight: 700 }}>{pct}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 5, borderRadius: 4, bgcolor: '#E4F0ED',
              '& .MuiLinearProgress-bar': { bgcolor: '#3DAA96', borderRadius: 4 } }}
      />
    </Box>
  );
}

// ── Diálogo de formulario ─────────────────────────────────────────────────────

interface FormDialogProps {
  open: boolean;
  editing: Plan | null;
  patients: PatientOption[];
  services: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}

function PlanFormDialog({ open, editing, patients, services, onClose, onSaved }: FormDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (editing) {
      setForm({
        patientId:         editing.patientId  ?? '',
        serviceId:         editing.serviceId  ?? '',
        totalSessions:     editing.totalSessions,
        completedSessions: editing.completedSessions,
        startDate:         editing.startDate  ?? new Date().toISOString().slice(0, 10),
        status:            editing.status,
        notes:             editing.notes ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
  }, [editing, open]);

  const set = (field: string, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }));

  const valid =
    form.patientId !== '' &&
    form.serviceId !== '' &&
    form.totalSessions > 0 &&
    form.completedSessions >= 0 &&
    form.completedSessions <= form.totalSessions;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    setError('');
    const payload = {
      patientId:         Number(form.patientId),
      serviceId:         Number(form.serviceId),
      totalSessions:     form.totalSessions,
      completedSessions: form.completedSessions,
      startDate:         form.startDate || null,
      status:            form.status,
      notes:             form.notes || null,
    };
    try {
      if (editing) {
        await axiosClient.put(`/therapy-plans/${editing.id}`, payload);
      } else {
        await axiosClient.post('/therapy-plans', payload);
      }
      onSaved();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Error al guardar el plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#1A2E2A', pb: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventNoteOutlinedIcon sx={{ color: '#3DAA96' }} />
          {editing ? 'Editar plan de terapia' : 'Nuevo plan de terapia'}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseOutlinedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>

          {/* Paciente */}
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Paciente *</InputLabel>
              <Select
                value={form.patientId}
                label="Paciente *"
                onChange={e => set('patientId', e.target.value)}
              >
                {patients.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} — {p.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Servicio */}
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Terapia / Servicio *</InputLabel>
              <Select
                value={form.serviceId}
                label="Terapia / Servicio *"
                onChange={e => set('serviceId', e.target.value)}
              >
                {services.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sesiones */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth size="small" label="Total de sesiones *"
              type="number"
              inputProps={{ min: 1, max: 200 }}
              value={form.totalSessions}
              onChange={e => set('totalSessions', Math.max(1, parseInt(e.target.value) || 1))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth size="small" label="Sesiones completadas"
              type="number"
              inputProps={{ min: 0, max: form.totalSessions }}
              value={form.completedSessions}
              onChange={e => set('completedSessions', Math.min(
                form.totalSessions,
                Math.max(0, parseInt(e.target.value) || 0),
              ))}
            />
          </Grid>

          {/* Fecha de inicio */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth size="small" label="Fecha de inicio"
              type="date"
              value={form.startDate}
              onChange={e => set('startDate', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          {/* Estado */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={form.status}
                label="Estado"
                onChange={e => set('status', e.target.value as Plan['status'])}
              >
                {STATUS_OPTS.map(s => (
                  <MenuItem key={s} value={s}>{STATUS_META[s].label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Notas */}
          <Grid size={12}>
            <TextField
              fullWidth size="small" label="Notas / observaciones"
              multiline rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Indicaciones, objetivos del plan, observaciones del especialista…"
            />
          </Grid>

          {/* Barra de progreso previa */}
          {form.totalSessions > 0 && (
            <Grid size={12}>
              <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 2, p: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', mb: 0.5, display: 'block' }}>
                  Vista previa de progreso
                </Typography>
                <SessionBar completed={form.completedSessions} total={form.totalSessions} />
              </Box>
            </Grid>
          )}

        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, fontWeight: 700 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!valid || saving}
          variant="contained"
          sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
        >
          {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Diálogo de confirmación de eliminación ────────────────────────────────────

function DeleteDialog({ plan, onClose, onDeleted }: {
  plan: Plan | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  const handleDelete = async () => {
    if (!plan) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/therapy-plans/${plan.id}`);
      onDeleted();
      onClose();
    } catch {
      setError('No se pudo eliminar el plan. Intenta de nuevo.');
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!plan} onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800, color: '#C0392B' }}>Eliminar plan</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Typography color="text.secondary">
          ¿Seguro que deseas eliminar el plan de{' '}
          <strong>{plan?.patientName ?? 'este paciente'}</strong>{' '}
          ({plan?.serviceName ?? 'servicio'})? Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, fontWeight: 700 }}>
          Cancelar
        </Button>
        <Button onClick={handleDelete} disabled={deleting} variant="contained"
          sx={{ bgcolor: '#C0392B', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#962d22' } }}>
          {deleting ? 'Eliminando…' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function AdminTherapyPlansPage() {
  const { services } = useAdminData();

  const [plans,    setPlans]    = useState<Plan[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState<Plan['status'] | 'ALL'>('ALL');

  const [formOpen,  setFormOpen]  = useState(false);
  const [editing,   setEditing]   = useState<Plan | null>(null);
  const [toDelete,  setToDelete]  = useState<Plan | null>(null);

  // ── Carga de datos ──────────────────────────────────────────────────────────

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [plansRes, usersRes] = await Promise.allSettled([
        axiosClient.get<Plan[]>('/therapy-plans'),
        axiosClient.get<{ id: number; name: string; email: string; role: string }[]>('/user'),
      ]);

      if (plansRes.status === 'fulfilled') setPlans(plansRes.value.data);
      if (usersRes.status === 'fulfilled') {
        setPatients(
          usersRes.value.data
            .filter(u => u.role === 'USER' || u.role === 'PATIENT')
            .map(u => ({ id: u.id, name: u.name, email: u.email })),
        );
      }
    } catch {
      setError('No se pudieron cargar los planes de terapia.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  // ── Filtros ─────────────────────────────────────────────────────────────────

  const filtered = plans.filter(p => {
    const matchSearch = search === '' ||
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.serviceName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Estadísticas de resumen ─────────────────────────────────────────────────

  const stats = {
    total:     plans.length,
    activos:   plans.filter(p => p.status === 'ACTIVO').length,
    pausados:  plans.filter(p => p.status === 'PAUSADO').length,
    completados: plans.filter(p => p.status === 'COMPLETADO').length,
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit   = (p: Plan) => { setEditing(p); setFormOpen(true); };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                 mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <EventNoteOutlinedIcon sx={{ color: '#3DAA96', fontSize: 24 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
              Planes de Terapia
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Seguimiento de planes multi-sesión por paciente
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={openCreate}
          sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700,
                '&:hover': { bgcolor: '#2B8A78' } }}
        >
          Nuevo plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tarjetas de resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total planes',  value: stats.total,       color: '#3DAA96' },
          { label: 'Activos',       value: stats.activos,     color: '#27AE60' },
          { label: 'Pausados',      value: stats.pausados,    color: '#E67E22' },
          { label: 'Completados',   value: stats.completados, color: '#3DAA96' },
        ].map((c, i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            {loading
              ? <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
              : (
                <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.8rem',
                                      color: c.color, lineHeight: 1 }}>
                      {c.value}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#5A7A74' }}>
                      {c.label}
                    </Typography>
                  </CardContent>
                </Card>
              )}
          </Grid>
        ))}
      </Grid>

      {/* Filtros */}
      <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)', mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                fullWidth size="small"
                placeholder="Buscar por paciente o terapia…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon sx={{ color: '#9DBFBA', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterStatus}
                  label="Estado"
                  onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="ALL">Todos los estados</MenuItem>
                  {STATUS_OPTS.map(s => (
                    <MenuItem key={s} value={s}>{STATUS_META[s].label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <TableContainer component={Paper} elevation={0}
          sx={{ borderRadius: 3, '& .MuiTableHead-root': { bgcolor: '#F4FAF8' } }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Paciente', 'Terapia', 'Progreso', 'Fecha inicio', 'Estado', 'Acciones']
                  .map(h => (
                    <TableCell key={h}
                      sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem',
                            textTransform: 'uppercase', letterSpacing: 0.5,
                            borderBottom: '2px solid #E4F0ED', py: 1.5 }}>
                      {h}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#9DBFBA' }}>
                        <EventNoteOutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {plans.length === 0
                            ? 'Aún no hay planes de terapia registrados.'
                            : 'No se encontraron planes con esos filtros.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                  : filtered.map(plan => (
                    <TableRow key={plan.id}
                      sx={{ '&:hover': { bgcolor: '#F9FDFC' }, transition: 'background 0.15s' }}>

                      {/* Paciente */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#1A2E2A' }}>
                          {plan.patientName ?? '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {plan.patientEmail ?? ''}
                        </Typography>
                      </TableCell>

                      {/* Terapia */}
                      <TableCell>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1A2E2A' }}>
                          {plan.serviceName ?? '—'}
                        </Typography>
                      </TableCell>

                      {/* Progreso */}
                      <TableCell sx={{ minWidth: 160 }}>
                        <SessionBar completed={plan.completedSessions} total={plan.totalSessions} />
                      </TableCell>

                      {/* Fecha inicio */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#5A7A74' }}>
                          {plan.startDate
                            ? new Date(plan.startDate).toLocaleDateString('es-CO', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : '—'}
                        </Typography>
                      </TableCell>

                      {/* Estado */}
                      <TableCell>
                        <StatusChip status={plan.status} />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => openEdit(plan)}
                              sx={{ color: '#3DAA96', '&:hover': { bgcolor: '#E8F5F0' } }}>
                              <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" onClick={() => setToDelete(plan)}
                              sx={{ color: '#C0392B', '&:hover': { bgcolor: '#FDECEA' } }}>
                              <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>

                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialogs */}
      <PlanFormDialog
        open={formOpen}
        editing={editing}
        patients={patients}
        services={services.map(s => ({ id: s.id, name: s.name }))}
        onClose={() => setFormOpen(false)}
        onSaved={loadPlans}
      />
      <DeleteDialog
        plan={toDelete}
        onClose={() => setToDelete(null)}
        onDeleted={loadPlans}
      />
    </Box>
  );
}
