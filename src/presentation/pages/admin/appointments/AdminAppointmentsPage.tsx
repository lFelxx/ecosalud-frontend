import { useState, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Stack,
  Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Avatar, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, Tabs, Tab,
  InputAdornment, Checkbox, FormControlLabel, Divider, Alert,
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAdminData } from '../../../context/AdminDataContext';
import type { AppointmentData, TherapyPlanData, UserData } from '../../../context/AdminDataContext';

// ── Constants ─────────────────────────────────────────────────────────────────

const SLOTS_WD  = ['08:00','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00'];
const SLOTS_SAT = ['09:00','10:00','11:00'];

function getSlotsForDate(dateStr: string): string[] {
  if (!dateStr) return [];
  const dow = new Date(dateStr + 'T00:00:00').getDay();
  if (dow === 0) return [];
  if (dow === 6) return SLOTS_SAT;
  return SLOTS_WD;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  let p = 'Eco';
  for (let i = 0; i < 5; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

// ── Status helpers ─────────────────────────────────────────────────────────────

const APT_STATUS_LABELS: Record<AppointmentData['status'], string> = {
  pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada',
};
const APT_STATUS_COLORS: Record<AppointmentData['status'], { bg: string; color: string; border: string }> = {
  pending:   { bg: '#FFF8E8', color: '#B67A00', border: '#F5D78A' },
  confirmed: { bg: '#E8F5F0', color: '#1A7A5E', border: '#B2DDD4' },
  completed: { bg: '#EAF0FF', color: '#2850A8', border: '#B2C4F0' },
  cancelled: { bg: '#FFF0EE', color: '#C0392B', border: '#F0C0BB' },
};
const PLAN_STATUS_LABELS: Record<TherapyPlanData['status'], string> = {
  active: 'En curso', paused: 'Pausado', completed: 'Completado', cancelled: 'Cancelado',
};
const PLAN_STATUS_COLORS: Record<TherapyPlanData['status'], { bg: string; color: string; border: string }> = {
  active:    { bg: '#E8F5F0', color: '#1A7A5E', border: '#B2DDD4' },
  paused:    { bg: '#FFF8E8', color: '#B67A00', border: '#F5D78A' },
  completed: { bg: '#EAF0FF', color: '#2850A8', border: '#B2C4F0' },
  cancelled: { bg: '#FFF0EE', color: '#C0392B', border: '#F0C0BB' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}
function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#9DBFBA', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, color, lineHeight: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ── Appointment Card ──────────────────────────────────────────────────────────

function AppointmentCard({
  apt, onConfirm, onComplete, onCancel,
}: { apt: AppointmentData; onConfirm: () => void; onComplete: () => void; onCancel: () => void }) {
  const st = APT_STATUS_COLORS[apt.status];
  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', '&:hover': { boxShadow: '0 6px 20px rgba(61,170,150,0.12)' }, transition: 'box-shadow 0.2s' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Avatar sx={{ bgcolor: '#C8EDE5', color: '#2B7A6A', fontWeight: 700, fontSize: '0.85rem', width: 44, height: 44, flexShrink: 0 }}>
            {initials(apt.patientName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 160 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A2E2A' }}>{apt.patientName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>{apt.patientEmail}</Typography>
            <Stack direction="row" sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <SpaOutlinedIcon sx={{ fontSize: 14, color: '#9DBFBA' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#4A6B60', fontWeight: 600 }}>{apt.service}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: '#9DBFBA' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#4A6B60' }}>{formatDate(apt.date)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: '#9DBFBA' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#4A6B60' }}>{apt.time}</Typography>
              </Box>
            </Stack>
            {apt.notes && <Typography variant="caption" sx={{ color: '#C0392B', fontStyle: 'italic', display: 'block', mt: 0.5 }}>Nota: {apt.notes}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.2, flexShrink: 0 }}>
            <Chip label={APT_STATUS_LABELS[apt.status]} size="small"
              sx={{ bgcolor: st.bg, color: st.color, border: `1px solid ${st.border}`, fontWeight: 700, fontSize: '0.72rem', borderRadius: '999px' }} />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {apt.status === 'pending' && (
                <Tooltip title="Confirmar cita">
                  <IconButton size="small" onClick={onConfirm} sx={{ color: '#1A7A5E', bgcolor: '#E8F5F0', '&:hover': { bgcolor: '#C8EDE5' } }}>
                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {(apt.status === 'pending' || apt.status === 'confirmed') && (
                <>
                  <Tooltip title="Completada">
                    <IconButton size="small" onClick={onComplete} sx={{ color: '#2850A8', bgcolor: '#EAF0FF', '&:hover': { bgcolor: '#C8D8F8' } }}>
                      <DoneAllIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancelar">
                    <IconButton size="small" onClick={onCancel} sx={{ color: '#C0392B', bgcolor: '#FFF0EE', '&:hover': { bgcolor: '#FFD8D4' } }}>
                      <CancelOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Therapy Plan Card ─────────────────────────────────────────────────────────

function TherapyPlanCard({ plan, onAddSession, onTogglePause, onComplete, onCancel }: {
  plan: TherapyPlanData;
  onAddSession: () => void;
  onTogglePause: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const pct = Math.round((plan.sessionsCompleted / plan.sessionsTotal) * 100);
  const st = PLAN_STATUS_COLORS[plan.status];
  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', '&:hover': { boxShadow: '0 6px 20px rgba(61,170,150,0.12)' }, transition: 'box-shadow 0.2s' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Avatar sx={{ bgcolor: '#C8EDE5', color: '#2B7A6A', fontWeight: 700, fontSize: '0.85rem', width: 44, height: 44, flexShrink: 0 }}>
            {initials(plan.patientName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A2E2A' }}>{plan.patientName}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', mb: 0.8 }}>{plan.patientEmail}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <SpaOutlinedIcon sx={{ fontSize: 14, color: '#9DBFBA' }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#4A6B60' }}>{plan.service}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#9DBFBA' }}>· desde {formatDate(plan.startDate)}</Typography>
            </Box>
            {/* Progress */}
            <Box sx={{ mb: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#5A7A74', fontWeight: 500 }}>
                  {plan.sessionsCompleted} de {plan.sessionsTotal} sesiones
                </Typography>
                <Typography variant="caption" sx={{ color: '#3DAA96', fontWeight: 700 }}>{pct}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{ height: 6, borderRadius: 3, bgcolor: '#E3EFEC', '& .MuiLinearProgress-bar': { bgcolor: '#3DAA96', borderRadius: 3 } }}
              />
            </Box>
            {plan.notes && <Typography variant="caption" sx={{ color: '#9DBFBA', fontStyle: 'italic' }}>{plan.notes}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.2, flexShrink: 0 }}>
            <Chip label={PLAN_STATUS_LABELS[plan.status]} size="small"
              sx={{ bgcolor: st.bg, color: st.color, border: `1px solid ${st.border}`, fontWeight: 700, fontSize: '0.72rem', borderRadius: '999px' }} />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {plan.status === 'active' && plan.sessionsCompleted < plan.sessionsTotal && (
                <Tooltip title="Registrar sesión">
                  <IconButton size="small" onClick={onAddSession} sx={{ color: '#1A7A5E', bgcolor: '#E8F5F0', '&:hover': { bgcolor: '#C8EDE5' } }}>
                    <AddCircleIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {(plan.status === 'active' || plan.status === 'paused') && (
                <Tooltip title={plan.status === 'active' ? 'Pausar' : 'Reanudar'}>
                  <IconButton size="small" onClick={onTogglePause} sx={{ color: '#B67A00', bgcolor: '#FFF8E8', '&:hover': { bgcolor: '#FCEBC0' } }}>
                    {plan.status === 'active'
                      ? <PauseIcon sx={{ fontSize: 18 }} />
                      : <PlayArrowIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>
              )}
              {plan.status === 'active' && (
                <Tooltip title="Marcar completado">
                  <IconButton size="small" onClick={onComplete} sx={{ color: '#2850A8', bgcolor: '#EAF0FF', '&:hover': { bgcolor: '#C8D8F8' } }}>
                    <DoneAllIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {plan.status !== 'cancelled' && plan.status !== 'completed' && (
                <Tooltip title="Cancelar plan">
                  <IconButton size="small" onClick={onCancel} sx={{ color: '#C0392B', bgcolor: '#FFF0EE', '&:hover': { bgcolor: '#FFD8D4' } }}>
                    <CancelOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Patient Selector (shared) ─────────────────────────────────────────────────

function PatientSelector({
  users,
  search,
  onSearchChange,
  onSelect,
  onCreateNew,
}: {
  users: UserData[];
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (u: UserData) => void;
  onCreateNew: () => void;
}) {
  const patients = useMemo(() =>
    users
      .filter((u) => u.role === 'PATIENT')
      .filter((u) =>
        search.length < 2 ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
      )
      .slice(0, 6),
    [users, search],
  );

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por nombre o correo…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#9DBFBA' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      {patients.length === 0 && search.length >= 2 ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            No se encontró ningún paciente con "{search}"
          </Typography>
          <Button
            startIcon={<PersonAddOutlinedIcon />}
            variant="outlined"
            size="small"
            onClick={onCreateNew}
            sx={{ borderColor: '#3DAA96', color: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Crear nuevo paciente
          </Button>
        </Box>
      ) : (
        <Stack spacing={0.8}>
          {patients.map((u) => (
            <Box
              key={u.id}
              onClick={() => onSelect(u)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                borderRadius: 2, border: '1px solid #E4F0ED', cursor: 'pointer',
                '&:hover': { bgcolor: '#F4FAF8', borderColor: '#3DAA96' },
                transition: 'all 0.15s',
              }}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#C8EDE5', color: '#2B7A6A', fontSize: '0.8rem', fontWeight: 700 }}>
                {initials(u.name)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1A2E2A' }}>{u.name}</Typography>
                <Typography variant="caption" color="text.secondary">{u.email}</Typography>
              </Box>
              <Chip label={u.status === 'ACTIVE' ? 'Activo' : 'Inactivo'} size="small"
                sx={{ bgcolor: u.status === 'ACTIVE' ? '#E8F5F0' : '#FFF0EE', color: u.status === 'ACTIVE' ? '#1A7A5E' : '#C0392B', fontSize: '0.65rem', height: 18 }} />
            </Box>
          ))}
          {search.length < 2 && (
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pt: 0.5 }}>
              Escribe al menos 2 caracteres para filtrar · mostrando {patients.length} pacientes
            </Typography>
          )}
        </Stack>
      )}

      <Divider sx={{ my: 2 }} />
      <Button
        startIcon={<PersonAddOutlinedIcon />}
        variant="text"
        size="small"
        onClick={onCreateNew}
        sx={{ color: '#3DAA96', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}
      >
        Crear nuevo perfil de paciente
      </Button>
    </Box>
  );
}

// ── Book Appointment Dialog ───────────────────────────────────────────────────

type BookStep = 'search' | 'new-patient' | 'appointment' | 'credentials';

interface BookState {
  step: BookStep;
  selectedUser: UserData | null;
  isNew: boolean;
  generatedPwd: string;
  newName: string;
  newEmail: string;
  sendEmail: boolean;
  service: string;
  date: string;
  time: string;
  aptStatus: AppointmentData['status'];
  notes: string;
  search: string;
}

const INIT_BOOK: BookState = {
  step: 'search', selectedUser: null, isNew: false, generatedPwd: '',
  newName: '', newEmail: '', sendEmail: true,
  service: '', date: '', time: '', aptStatus: 'confirmed', notes: '', search: '',
};

function BookDialog({
  open, onClose, services, users, specialist, addAppointment, addUser,
}: {
  open: boolean;
  onClose: () => void;
  services: { id: string; name: string }[];
  users: UserData[];
  specialist: { name: string };
  addAppointment: (data: Omit<AppointmentData, 'id'>) => AppointmentData;
  addUser: (data: { name: string; email: string; role: UserData['role'] }) => UserData;
}) {
  const [s, setS] = useState<BookState>(INIT_BOOK);
  const patch = (p: Partial<BookState>) => setS((prev) => ({ ...prev, ...p }));

  const timeSlots = useMemo(() => getSlotsForDate(s.date), [s.date]);

  const handleClose = () => { setS(INIT_BOOK); onClose(); };

  const handleSelectUser = (u: UserData) => patch({ selectedUser: u, step: 'appointment' });

  const handleCreatePatient = () => {
    if (!s.newName.trim() || !s.newEmail.trim()) return;
    const pwd = generatePassword();
    const newUser = addUser({ name: s.newName.trim(), email: s.newEmail.trim(), role: 'PATIENT' });
    patch({ selectedUser: newUser, isNew: true, generatedPwd: pwd, step: 'appointment' });
  };

  const handleBook = () => {
    if (!s.selectedUser || !s.service || !s.date || !s.time) return;
    addAppointment({
      patientId:    s.selectedUser.id,
      patientName:  s.selectedUser.name,
      patientEmail: s.selectedUser.email,
      service:      s.service,
      date:         s.date,
      time:         s.time,
      status:       s.aptStatus,
      notes:        s.notes || undefined,
    });
    if (s.isNew && s.sendEmail) {
      patch({ step: 'credentials' });
    } else {
      handleClose();
    }
  };

  const canBook = !!s.selectedUser && !!s.service && !!s.date && !!s.time;

  const STEP_TITLES: Record<BookStep, string> = {
    'search':      'Buscar paciente',
    'new-patient': 'Crear perfil de paciente',
    'appointment': 'Datos de la cita',
    'credentials': 'Credenciales enviadas',
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1rem', pb: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          {(s.step === 'new-patient' || s.step === 'appointment') && (
            <IconButton size="small" onClick={() => patch({ step: s.step === 'appointment' ? 'search' : 'search' })}
              sx={{ color: '#9DBFBA', mr: 0.5 }}>
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          {STEP_TITLES[s.step]}
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>

        {/* STEP: search */}
        {s.step === 'search' && (
          <PatientSelector
            users={users}
            search={s.search}
            onSearchChange={(v) => patch({ search: v })}
            onSelect={handleSelectUser}
            onCreateNew={() => patch({ step: 'new-patient' })}
          />
        )}

        {/* STEP: new-patient */}
        {s.step === 'new-patient' && (
          <Stack spacing={2}>
            <TextField
              label="Nombre completo *"
              fullWidth
              size="small"
              value={s.newName}
              onChange={(e) => patch({ newName: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Correo electrónico *"
              fullWidth
              size="small"
              type="email"
              value={s.newEmail}
              onChange={(e) => patch({ newEmail: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={s.sendEmail}
                  onChange={(e) => patch({ sendEmail: e.target.checked })}
                  size="small"
                  sx={{ color: '#3DAA96', '&.Mui-checked': { color: '#3DAA96' } }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#5A7A74', fontSize: '0.84rem' }}>
                  Generar y mostrar credenciales de acceso
                </Typography>
              }
            />
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
              Se creará el perfil del paciente en el sistema. Las credenciales se generan automáticamente.
            </Alert>
          </Stack>
        )}

        {/* STEP: appointment */}
        {s.step === 'appointment' && s.selectedUser && (
          <Stack spacing={2}>
            {/* Selected patient chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#F4FAF8', borderRadius: 2 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#C8EDE5', color: '#2B7A6A', fontSize: '0.8rem', fontWeight: 700 }}>
                {initials(s.selectedUser.name)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#1A2E2A' }}>{s.selectedUser.name}</Typography>
                <Typography variant="caption" color="text.secondary">{s.selectedUser.email}</Typography>
              </Box>
              {s.isNew && <Chip label="Nuevo" size="small" sx={{ bgcolor: '#E8F5F0', color: '#1A7A5E', fontSize: '0.65rem', fontWeight: 700 }} />}
              <Button size="small" onClick={() => patch({ step: 'search', selectedUser: null, isNew: false })}
                sx={{ color: '#9DBFBA', fontSize: '0.75rem', textTransform: 'none', minWidth: 0 }}>
                cambiar
              </Button>
            </Box>

            {/* Service */}
            <FormControl fullWidth size="small">
              <InputLabel>Servicio / Terapia *</InputLabel>
              <Select
                label="Servicio / Terapia *"
                value={s.service}
                onChange={(e) => patch({ service: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                {services.map((sv) => (
                  <MenuItem key={sv.id} value={sv.name}>{sv.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Date + Time */}
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Fecha *"
                type="date"
                size="small"
                fullWidth
                value={s.date}
                onChange={(e) => patch({ date: e.target.value, time: '' })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <FormControl fullWidth size="small" disabled={!s.date || timeSlots.length === 0}>
                <InputLabel>Hora *</InputLabel>
                <Select
                  label="Hora *"
                  value={s.time}
                  onChange={(e) => patch({ time: e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  {timeSlots.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  {s.date && timeSlots.length === 0 && (
                    <MenuItem value="" disabled>Sin disponibilidad (domingo)</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Stack>

            {/* Status */}
            <FormControl fullWidth size="small">
              <InputLabel>Estado inicial</InputLabel>
              <Select
                label="Estado inicial"
                value={s.aptStatus}
                onChange={(e) => patch({ aptStatus: e.target.value as AppointmentData['status'] })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="confirmed">Confirmada</MenuItem>
                <MenuItem value="pending">Pendiente (requiere confirmación)</MenuItem>
              </Select>
            </FormControl>

            {/* Notes */}
            <TextField
              label="Notas (opcional)"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={s.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            {/* Specialist */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#F4FAF8', borderRadius: 2 }}>
              <PersonOutlinedIcon sx={{ fontSize: 16, color: '#3DAA96' }} />
              <Typography variant="caption" sx={{ color: '#5A7A74' }}>
                Especialista: <Box component="span" sx={{ fontWeight: 700, color: '#1A2E2A' }}>{specialist.name}</Box>
              </Typography>
            </Box>
          </Stack>
        )}

        {/* STEP: credentials */}
        {s.step === 'credentials' && s.selectedUser && (
          <Stack spacing={2} sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: '#E8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
              <EmailOutlinedIcon sx={{ fontSize: 28, color: '#3DAA96' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A2E2A' }}>Cita agendada y perfil creado</Typography>
            <Typography variant="body2" color="text.secondary">
              Comparte las siguientes credenciales con el paciente para que pueda acceder a Ecosalud.
            </Typography>

            <Box sx={{ bgcolor: '#F4FAF8', border: '1px solid #B2DDD4', borderRadius: 2, p: 2.5, textAlign: 'left' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA', display: 'block', mb: 1.5, letterSpacing: 0.8 }}>
                CREDENCIALES DE ACCESO
              </Typography>
              {[
                { Icon: PersonOutlinedIcon, label: 'Paciente',    value: s.selectedUser.name },
                { Icon: EmailOutlinedIcon,  label: 'Usuario',     value: s.selectedUser.email },
                { Icon: KeyOutlinedIcon,    label: 'Contraseña',  value: s.generatedPwd },
              ].map(({ Icon, label, value }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.2, '&:last-child': { mb: 0 } }}>
                  <Icon sx={{ fontSize: 18, color: '#3DAA96', flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#9DBFBA', letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1A2E2A', fontFamily: label === 'Contraseña' ? 'monospace' : 'inherit' }}>{value}</Typography>
                  </Box>
                  {label === 'Contraseña' && (
                    <IconButton size="small" onClick={() => navigator.clipboard.writeText(value)}
                      sx={{ color: '#9DBFBA', '&:hover': { color: '#3DAA96' } }}>
                      <ContentCopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
            <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.78rem', textAlign: 'left' }}>
              Asegúrate de compartir estas credenciales de forma segura. El paciente debe cambiar su contraseña al primer inicio de sesión.
            </Alert>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined"
          sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          {s.step === 'credentials' ? 'Cerrar' : 'Cancelar'}
        </Button>
        {s.step === 'new-patient' && (
          <Button
            onClick={handleCreatePatient}
            variant="contained"
            disabled={!s.newName.trim() || !s.newEmail.trim()}
            disableElevation
            sx={{ bgcolor: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
          >
            Crear y continuar
          </Button>
        )}
        {s.step === 'appointment' && (
          <Button
            onClick={handleBook}
            disabled={!canBook}
            variant="contained"
            disableElevation
            sx={{ bgcolor: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
          >
            Agendar cita
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ── New Therapy Plan Dialog ───────────────────────────────────────────────────

type PlanStep = 'search' | 'new-patient' | 'plan';

interface PlanState {
  step: PlanStep;
  selectedUser: UserData | null;
  newName: string;
  newEmail: string;
  service: string;
  totalSessions: number;
  startDate: string;
  notes: string;
  search: string;
}

const INIT_PLAN: PlanState = {
  step: 'search', selectedUser: null, newName: '', newEmail: '',
  service: '', totalSessions: 6, startDate: '', notes: '', search: '',
};

function TherapyPlanDialog({
  open, onClose, services, users, addTherapyPlan, addUser,
}: {
  open: boolean;
  onClose: () => void;
  services: { id: string; name: string }[];
  users: UserData[];
  addTherapyPlan: (data: Omit<TherapyPlanData, 'id'>) => TherapyPlanData;
  addUser: (data: { name: string; email: string; role: UserData['role'] }) => UserData;
}) {
  const [s, setS] = useState<PlanState>(INIT_PLAN);
  const patch = (p: Partial<PlanState>) => setS((prev) => ({ ...prev, ...p }));

  const handleClose = () => { setS(INIT_PLAN); onClose(); };

  const handleCreatePatient = () => {
    if (!s.newName.trim() || !s.newEmail.trim()) return;
    const newUser = addUser({ name: s.newName.trim(), email: s.newEmail.trim(), role: 'PATIENT' });
    patch({ selectedUser: newUser, step: 'plan' });
  };

  const handleCreate = () => {
    if (!s.selectedUser || !s.service || !s.startDate) return;
    addTherapyPlan({
      patientId:         s.selectedUser.id,
      patientName:       s.selectedUser.name,
      patientEmail:      s.selectedUser.email,
      service:           s.service,
      sessionsTotal:     s.totalSessions,
      sessionsCompleted: 0,
      startDate:         s.startDate,
      status:            'active',
      notes:             s.notes || undefined,
    });
    handleClose();
  };

  const canCreate = !!s.selectedUser && !!s.service && !!s.startDate && s.totalSessions >= 1;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1rem', pb: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          {(s.step === 'new-patient' || s.step === 'plan') && (
            <IconButton size="small" onClick={() => patch({ step: 'search' })} sx={{ color: '#9DBFBA', mr: 0.5 }}>
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          {s.step === 'search' ? 'Nuevo Plan de Terapia' : s.step === 'new-patient' ? 'Crear paciente' : 'Configurar Plan'}
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {s.step === 'search' && (
          <PatientSelector
            users={users}
            search={s.search}
            onSearchChange={(v) => patch({ search: v })}
            onSelect={(u) => patch({ selectedUser: u, step: 'plan' })}
            onCreateNew={() => patch({ step: 'new-patient' })}
          />
        )}

        {s.step === 'new-patient' && (
          <Stack spacing={2}>
            <TextField label="Nombre completo *" fullWidth size="small" value={s.newName}
              onChange={(e) => patch({ newName: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Correo electrónico *" fullWidth size="small" type="email" value={s.newEmail}
              onChange={(e) => patch({ newEmail: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Stack>
        )}

        {s.step === 'plan' && s.selectedUser && (
          <Stack spacing={2}>
            {/* Patient chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#F4FAF8', borderRadius: 2 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#C8EDE5', color: '#2B7A6A', fontSize: '0.8rem', fontWeight: 700 }}>
                {initials(s.selectedUser.name)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#1A2E2A' }}>{s.selectedUser.name}</Typography>
                <Typography variant="caption" color="text.secondary">{s.selectedUser.email}</Typography>
              </Box>
              <Button size="small" onClick={() => patch({ step: 'search', selectedUser: null })}
                sx={{ color: '#9DBFBA', fontSize: '0.75rem', textTransform: 'none', minWidth: 0 }}>
                cambiar
              </Button>
            </Box>

            <FormControl fullWidth size="small">
              <InputLabel>Servicio / Terapia *</InputLabel>
              <Select label="Servicio / Terapia *" value={s.service}
                onChange={(e) => patch({ service: e.target.value })} sx={{ borderRadius: 2 }}>
                {services.map((sv) => <MenuItem key={sv.id} value={sv.name}>{sv.name}</MenuItem>)}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Total de sesiones *"
                type="number"
                size="small"
                fullWidth
                value={s.totalSessions}
                onChange={(e) => patch({ totalSessions: Math.max(1, Math.min(30, Number(e.target.value))) })}
                slotProps={{ htmlInput: { min: 1, max: 30 } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Fecha de inicio *"
                type="date"
                size="small"
                fullWidth
                value={s.startDate}
                onChange={(e) => patch({ startDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>

            <TextField
              label="Notas del plan (opcional)"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={s.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined"
          sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        {s.step === 'new-patient' && (
          <Button onClick={handleCreatePatient} disabled={!s.newName.trim() || !s.newEmail.trim()}
            variant="contained" disableElevation
            sx={{ bgcolor: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}>
            Crear y continuar
          </Button>
        )}
        {s.step === 'plan' && (
          <Button onClick={handleCreate} disabled={!canCreate}
            variant="contained" disableElevation
            sx={{ bgcolor: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}>
            Crear Plan
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAppointmentsPage() {
  const {
    appointments, updateAppointment, addAppointment,
    therapyPlans, addTherapyPlan, updateTherapyPlan,
    services, users, specialist, addUser,
  } = useAdminData();

  const [tab, setTab] = useState(0);

  // Citas filters & dialogs
  const [filterStatus, setFilterStatus] = useState<AppointmentData['status'] | 'all'>('all');
  const [filterDate, setFilterDate]     = useState('');
  const [cancelDialog, setCancelDialog] = useState<AppointmentData | null>(null);
  const [cancelNote, setCancelNote]     = useState('');
  const [bookOpen, setBookOpen]         = useState(false);

  // Terapias filters & dialogs
  const [planFilter, setPlanFilter]     = useState<TherapyPlanData['status'] | 'all'>('all');
  const [planOpen, setPlanOpen]         = useState(false);

  // ── Citas stats & filtered list
  const aptStats = useMemo(() => ({
    total:     appointments.length,
    pending:   appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  }), [appointments]);

  const filteredApts = useMemo(() =>
    appointments
      .filter((a) => (filterStatus === 'all' || a.status === filterStatus) && (!filterDate || a.date === filterDate))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [appointments, filterStatus, filterDate],
  );

  // ── Terapias filtered list
  const filteredPlans = useMemo(() =>
    therapyPlans.filter((p) => planFilter === 'all' || p.status === planFilter),
    [therapyPlans, planFilter],
  );

  const planStats = useMemo(() => ({
    total:     therapyPlans.length,
    active:    therapyPlans.filter((p) => p.status === 'active').length,
    completed: therapyPlans.filter((p) => p.status === 'completed').length,
    paused:    therapyPlans.filter((p) => p.status === 'paused').length,
  }), [therapyPlans]);

  const confirmCancel = () => {
    if (!cancelDialog) return;
    updateAppointment(cancelDialog.id, { status: 'cancelled', notes: cancelNote || undefined });
    setCancelDialog(null);
  };

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
            Citas & Terapias
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            Gestión de citas y planes de tratamiento de los pacientes.
          </Typography>
        </Box>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          disableElevation
          onClick={() => tab === 0 ? setBookOpen(true) : setPlanOpen(true)}
          sx={{
            bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700,
            textTransform: 'none', px: 2.5,
            '&:hover': { bgcolor: '#2B8A78' },
          }}
        >
          {tab === 0 ? 'Agendar Cita' : 'Nueva Terapia'}
        </Button>
      </Box>

      {/* ── Tabs ── */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', color: '#9DBFBA' },
          '& .Mui-selected': { color: '#3DAA96' },
          '& .MuiTabs-indicator': { bgcolor: '#3DAA96' },
        }}
      >
        <Tab label={`Citas  (${appointments.length})`} />
        <Tab label={`Planes de Terapia  (${therapyPlans.length})`} />
      </Tabs>

      {/* ══════════════ TAB 0: CITAS ══════════════ */}
      {tab === 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Total"      value={aptStats.total}     color="#1A2E2A" /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Pendientes" value={aptStats.pending}   color="#B67A00" /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Confirmadas"value={aptStats.confirmed} color="#1A7A5E" /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Completadas"value={aptStats.completed} color="#2850A8" /></Grid>
          </Grid>

          <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED', p: 2.5, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FilterListIcon sx={{ color: '#9DBFBA' }} />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Estado</InputLabel>
              <Select label="Estado" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="confirmed">Confirmada</MenuItem>
                <MenuItem value="completed">Completada</MenuItem>
                <MenuItem value="cancelled">Cancelada</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Fecha" type="date" size="small" value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 160 }}
            />
            {(filterStatus !== 'all' || filterDate) && (
              <Button size="small" onClick={() => { setFilterStatus('all'); setFilterDate(''); }}
                sx={{ color: '#9DBFBA', fontWeight: 600 }}>
                Limpiar
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">{filteredApts.length} resultado{filteredApts.length !== 1 ? 's' : ''}</Typography>
          </Box>

          {filteredApts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED' }}>
              <CalendarMonthOutlinedIcon sx={{ fontSize: 48, color: '#C8EDE5', mb: 1 }} />
              <Typography color="text.secondary" sx={{ fontWeight: 500 }}>No se encontraron citas.</Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {filteredApts.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  onConfirm={() => updateAppointment(apt.id, { status: 'confirmed' })}
                  onComplete={() => updateAppointment(apt.id, { status: 'completed' })}
                  onCancel={() => { setCancelDialog(apt); setCancelNote(''); }}
                />
              ))}
            </Stack>
          )}
        </>
      )}

      {/* ══════════════ TAB 1: PLANES DE TERAPIA ══════════════ */}
      {tab === 1 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Total"      value={planStats.total}     color="#1A2E2A" /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="En Curso"   value={planStats.active}    color="#1A7A5E" /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Completados"value={planStats.completed} color="#2850A8" /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Pausados"   value={planStats.paused}    color="#B67A00" /></Grid>
          </Grid>

          <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED', p: 2.5, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FilterListIcon sx={{ color: '#9DBFBA' }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Estado</InputLabel>
              <Select label="Estado" value={planFilter} onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">En curso</MenuItem>
                <MenuItem value="paused">Pausados</MenuItem>
                <MenuItem value="completed">Completados</MenuItem>
                <MenuItem value="cancelled">Cancelados</MenuItem>
              </Select>
            </FormControl>
            {planFilter !== 'all' && (
              <Button size="small" onClick={() => setPlanFilter('all')} sx={{ color: '#9DBFBA', fontWeight: 600 }}>Limpiar</Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">{filteredPlans.length} plan{filteredPlans.length !== 1 ? 'es' : ''}</Typography>
          </Box>

          {filteredPlans.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED' }}>
              <SpaOutlinedIcon sx={{ fontSize: 48, color: '#C8EDE5', mb: 1 }} />
              <Typography color="text.secondary" sx={{ fontWeight: 500 }}>No hay planes de terapia registrados.</Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {filteredPlans.map((plan) => (
                <TherapyPlanCard
                  key={plan.id}
                  plan={plan}
                  onAddSession={() => {
                    const next = plan.sessionsCompleted + 1;
                    updateTherapyPlan(plan.id, {
                      sessionsCompleted: next,
                      status: next >= plan.sessionsTotal ? 'completed' : plan.status,
                    });
                  }}
                  onTogglePause={() => updateTherapyPlan(plan.id, { status: plan.status === 'active' ? 'paused' : 'active' })}
                  onComplete={() => updateTherapyPlan(plan.id, { status: 'completed', sessionsCompleted: plan.sessionsTotal })}
                  onCancel={() => updateTherapyPlan(plan.id, { status: 'cancelled' })}
                />
              ))}
            </Stack>
          )}
        </>
      )}

      {/* ── Cancel Appointment Dialog ── */}
      <Dialog open={Boolean(cancelDialog)} onClose={() => setCancelDialog(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem', color: '#1A2E2A' }}>Cancelar cita</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ fontSize: '0.88rem', mb: 2, color: '#5A7A74' }}>
            ¿Confirmas la cancelación de la cita de <strong>{cancelDialog?.patientName}</strong> para <strong>{cancelDialog?.service}</strong>?
          </Typography>
          <TextField
            label="Motivo (opcional)" fullWidth size="small" multiline rows={2}
            value={cancelNote} onChange={(e) => setCancelNote(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCancelDialog(null)} variant="outlined"
            sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Volver
          </Button>
          <Button onClick={confirmCancel} variant="contained"
            sx={{ bgcolor: '#C0392B', borderRadius: 2, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#A93226' } }}>
            Cancelar cita
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Book Appointment Dialog ── */}
      <BookDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        services={services}
        users={users}
        specialist={specialist}
        addAppointment={addAppointment}
        addUser={addUser}
      />

      {/* ── New Therapy Plan Dialog ── */}
      <TherapyPlanDialog
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        services={services}
        users={users}
        addTherapyPlan={addTherapyPlan}
        addUser={addUser}
      />
    </Box>
  );
}
