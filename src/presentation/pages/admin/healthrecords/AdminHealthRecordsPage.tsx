/**
 * AdminHealthRecordsPage — Historia Clínica Electrónica
 *
 * Módulo de gestión de historias clínicas en el panel admin de Ecosalud.
 * Cumple con la Resolución 1995/1999 de MinSalud (Colombia):
 *   - Campos obligatorios: motivo de consulta y diagnóstico
 *   - Bloqueo de registros firmados (inmutabilidad)
 *   - Identificación completa del paciente
 *
 * TODO Fase 3 — Res. 2654/2019: interoperabilidad HL7 FHIR con SISPRO
 */

import { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Chip, Avatar,
  Button, TextField, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, InputAdornment, Alert, Divider,
  FormControl, InputLabel, Select, MenuItem, Grid,
  Drawer, Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useAdminData } from '../../../context/AdminDataContext';
import type { HealthRecordData, UserData } from '../../../context/AdminDataContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(iso?: string) {
  if (!iso) return '—';
  // "2025-01-15" → "15 ene. 2025"
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncate(s?: string, n = 80) {
  if (!s) return '—';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#9DBFBA', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, color, lineHeight: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ── Patient Selector ──────────────────────────────────────────────────────────

function PatientSelector({
  users, value, onChange,
}: {
  users: UserData[];
  value: UserData | null;
  onChange: (u: UserData | null) => void;
}) {
  const [search, setSearch] = useState('');

  const patients = useMemo(() =>
    users
      .filter(u => u.role === 'PATIENT')
      .filter(u =>
        search.length < 2 ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
      )
      .slice(0, 8),
    [users, search],
  );

  if (value) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#F4FAF8', borderRadius: 2, border: '1px solid #B2DDD4' }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#C8EDE5', color: '#2B7A6A', fontSize: '0.8rem', fontWeight: 700 }}>
          {initials(value.name)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#1A2E2A' }}>{value.name}</Typography>
          <Typography variant="caption" color="text.secondary">{value.email}</Typography>
        </Box>
        <Button size="small" onClick={() => onChange(null)} sx={{ color: '#9DBFBA', fontSize: '0.75rem', textTransform: 'none', minWidth: 0 }}>
          cambiar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar paciente por nombre o correo…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#9DBFBA' }} /></InputAdornment> } }}
        sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />
      <Stack spacing={0.8}>
        {patients.map(u => (
          <Box
            key={u.id}
            onClick={() => { onChange(u); setSearch(''); }}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2,
              borderRadius: 2, border: '1px solid #E4F0ED', cursor: 'pointer',
              '&:hover': { bgcolor: '#F4FAF8', borderColor: '#3DAA96' }, transition: 'all 0.15s',
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#C8EDE5', color: '#2B7A6A', fontSize: '0.78rem', fontWeight: 700 }}>
              {initials(u.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.86rem', color: '#1A2E2A' }}>{u.name}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{u.email}</Typography>
            </Box>
          </Box>
        ))}
        {patients.length === 0 && search.length >= 2 && (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
            No se encontraron pacientes con "{search}"
          </Typography>
        )}
        {search.length < 2 && (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 0.5 }}>
            Escribe al menos 2 caracteres para buscar
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

// ── Record Form ───────────────────────────────────────────────────────────────

interface RecordFormState {
  patientId: number | null;
  patientUser: UserData | null;
  reasonForConsultation: string;
  currentIllness: string;
  physicalExam: string;
  diagnosis: string;
  treatmentPlan: string;
  observations: string;
  nextAppointment: string;
}

const BLANK_FORM: RecordFormState = {
  patientId: null,
  patientUser: null,
  reasonForConsultation: '',
  currentIllness: '',
  physicalExam: '',
  diagnosis: '',
  treatmentPlan: '',
  observations: '',
  nextAppointment: '',
};

function RecordFormDialog({
  open, onClose, users,
  initialRecord, onSave,
}: {
  open: boolean;
  onClose: () => void;
  users: UserData[];
  initialRecord?: HealthRecordData | null;
  onSave: (form: RecordFormState) => Promise<void>;
}) {
  const isEdit = !!initialRecord;

  const [form, setForm] = useState<RecordFormState>(() => {
    if (initialRecord) {
      const patient = users.find(u => u.id === initialRecord.patientId) ?? null;
      return {
        patientId: initialRecord.patientId,
        patientUser: patient,
        reasonForConsultation: initialRecord.reasonForConsultation,
        currentIllness: initialRecord.currentIllness ?? '',
        physicalExam: initialRecord.physicalExam ?? '',
        diagnosis: initialRecord.diagnosis,
        treatmentPlan: initialRecord.treatmentPlan ?? '',
        observations: initialRecord.observations ?? '',
        nextAppointment: initialRecord.nextAppointment ?? '',
      };
    }
    return BLANK_FORM;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const patch = (p: Partial<RecordFormState>) => setForm(prev => ({ ...prev, ...p }));

  const handleClose = () => {
    setForm(BLANK_FORM);
    setError('');
    onClose();
  };

  const handleSave = async () => {
    if (!form.patientUser) { setError('Selecciona un paciente.'); return; }
    if (!form.reasonForConsultation.trim()) { setError('El motivo de consulta es obligatorio (Res. 1995/1999).'); return; }
    if (!form.diagnosis.trim()) { setError('El diagnóstico es obligatorio (Res. 1995/1999).'); return; }

    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, patientId: form.patientUser.id });
      handleClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al guardar la historia clínica.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const canSave = !!form.patientUser && !!form.reasonForConsultation.trim() && !!form.diagnosis.trim();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '90vh' } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1rem', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MedicalServicesOutlinedIcon sx={{ color: '#3DAA96', fontSize: 22 }} />
          {isEdit ? 'Editar Historia Clínica' : 'Nueva Historia Clínica'}
          <Box sx={{ flex: 1 }} />
          <Chip
            size="small"
            label="Res. 1995/1999"
            sx={{ bgcolor: '#E8F5F0', color: '#1A7A5E', fontSize: '0.65rem', fontWeight: 700, borderRadius: '999px' }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        <Stack spacing={3}>

          {/* Paciente */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.8, mb: 1 }}>
              Paciente *
            </Typography>
            <PatientSelector
              users={users}
              value={form.patientUser}
              onChange={u => patch({ patientUser: u, patientId: u?.id ?? null })}
            />
          </Box>

          <Divider />

          {/* Sección clínica — campos obligatorios */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Datos Clínicos — Res. 1995/1999
              </Typography>
              <Chip size="small" label="Campos con * son obligatorios" sx={{ fontSize: '0.6rem', bgcolor: '#FFF8E8', color: '#B67A00', height: 18 }} />
            </Box>

            <Stack spacing={2}>
              {/* Motivo consulta — OBLIGATORIO */}
              <TextField
                label="Motivo de consulta *"
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={form.reasonForConsultation}
                onChange={e => patch({ reasonForConsultation: e.target.value })}
                helperText="¿Por qué consulta el paciente? (obligatorio según Res. 1995/1999)"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Enfermedad actual */}
              <TextField
                label="Enfermedad actual / Anamnesis"
                fullWidth
                multiline
                minRows={3}
                size="small"
                value={form.currentIllness}
                onChange={e => patch({ currentIllness: e.target.value })}
                helperText="Historia de la enfermedad, síntomas, evolución temporal"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Examen físico */}
              <TextField
                label="Examen físico"
                fullWidth
                multiline
                minRows={3}
                size="small"
                value={form.physicalExam}
                onChange={e => patch({ physicalExam: e.target.value })}
                helperText="Signos vitales, hallazgos físicos relevantes"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Diagnóstico — OBLIGATORIO */}
              <TextField
                label="Diagnóstico *"
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={form.diagnosis}
                onChange={e => patch({ diagnosis: e.target.value })}
                helperText="Diagnóstico clínico principal (obligatorio según Res. 1995/1999)"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Plan de tratamiento */}
              <TextField
                label="Plan de tratamiento"
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={form.treatmentPlan}
                onChange={e => patch({ treatmentPlan: e.target.value })}
                helperText="Medicamentos, procedimientos, terapias prescritas"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Observaciones */}
              <TextField
                label="Observaciones adicionales"
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={form.observations}
                onChange={e => patch({ observations: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Próxima cita */}
              <TextField
                label="Próxima cita sugerida"
                type="date"
                size="small"
                fullWidth
                value={form.nextAppointment}
                onChange={e => patch({ nextAppointment: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>{error}</Alert>
          )}

          <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ borderRadius: 2, fontSize: '0.78rem' }}>
            <strong>Res. 1995/1999 MinSalud:</strong> Una vez bloqueada, esta historia clínica será
            inmutable. Las historias bloqueadas tienen integridad verificada por hash SHA-256 y deben
            custodiarse mínimo 20 años.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined"
          sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canSave || saving}
          variant="contained"
          disableElevation
          sx={{ bgcolor: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#2B8A78' } }}
        >
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear historia clínica'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Record Detail Drawer ──────────────────────────────────────────────────────

function RecordDetailDrawer({
  record, open, onClose,
  onEdit, onLock, onDelete,
}: {
  record: HealthRecordData | null;
  open: boolean;
  onClose: () => void;
  onEdit: (r: HealthRecordData) => void;
  onLock: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [locking, setLocking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    anamnesis: true, examen: true, diagnostico: true, tratamiento: true, obs: false,
  });

  if (!record) return null;

  const toggle = (k: string) => setExpanded(prev => ({ ...prev, [k]: !prev[k] }));

  const handleLock = async () => {
    setLocking(true);
    await onLock(record.id);
    setLocking(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(record.id);
    setDeleting(false);
    onClose();
    setConfirmDelete(false);
  };

  function Section({ title, content, k }: { title: string; content?: string; k: string }) {
    if (!content) return null;
    return (
      <Box sx={{ mb: 1.5 }}>
        <Box
          onClick={() => toggle(k)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', mb: 0.5 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {title}
          </Typography>
          {expanded[k] ? <ExpandLessIcon sx={{ fontSize: 16, color: '#9DBFBA' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: '#9DBFBA' }} />}
        </Box>
        <Collapse in={expanded[k]}>
          <Typography sx={{ fontSize: '0.88rem', color: '#1A2E2A', lineHeight: 1.65, whiteSpace: 'pre-wrap', bgcolor: '#F4FAF8', p: 1.5, borderRadius: 2, border: '1px solid #E4F0ED' }}>
            {content}
          </Typography>
        </Collapse>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100vw', sm: 520 }, p: 0 } } }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: '#1A2E2A', px: 3, py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#3DAA96', color: '#fff', fontWeight: 700, fontSize: '0.9rem', width: 44, height: 44, flexShrink: 0 }}>
            {initials(record.patientName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{record.patientName}</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', mt: 0.2 }}>
              Historia #{record.id} · {formatDate(record.createdAt)}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            icon={record.locked ? <LockOutlinedIcon sx={{ fontSize: '14px !important' }} /> : <LockOpenOutlinedIcon sx={{ fontSize: '14px !important' }} />}
            label={record.locked ? 'Bloqueada' : 'Editable'}
            sx={{
              bgcolor: record.locked ? 'rgba(40,80,168,0.25)' : 'rgba(61,170,150,0.22)',
              color: record.locked ? '#90AAE8' : '#3DAA96',
              fontSize: '0.7rem', fontWeight: 700, borderRadius: '999px',
            }}
          />
          {record.hashIntegrity && (
            <Chip
              size="small"
              icon={<VerifiedOutlinedIcon sx={{ fontSize: '14px !important' }} />}
              label="Integridad verificada"
              sx={{ bgcolor: 'rgba(26,122,94,0.20)', color: '#3DAA96', fontSize: '0.68rem', borderRadius: '999px' }}
            />
          )}
        </Box>
      </Box>

      {/* Contenido */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>

        {/* Datos rápidos */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
          {record.nextAppointment && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: '#3DAA96' }} />
              <Typography sx={{ fontSize: '0.8rem', color: '#4A6B60' }}>
                Próxima cita: <strong>{formatDateShort(record.nextAppointment)}</strong>
              </Typography>
            </Box>
          )}
          {record.updatedAt && (
            <Typography sx={{ fontSize: '0.75rem', color: '#9DBFBA' }}>
              Actualizado: {formatDate(record.updatedAt)}
            </Typography>
          )}
        </Box>

        {/* Campos clínicos */}
        <Section title="Motivo de consulta" content={record.reasonForConsultation} k="motivo" />
        <Section title="Enfermedad actual / Anamnesis" content={record.currentIllness} k="anamnesis" />
        <Section title="Examen físico" content={record.physicalExam} k="examen" />
        <Section title="Diagnóstico" content={record.diagnosis} k="diagnostico" />
        <Section title="Plan de tratamiento" content={record.treatmentPlan} k="tratamiento" />
        <Section title="Observaciones" content={record.observations} k="obs" />

        {/* Hash de integridad */}
        {record.hashIntegrity && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F4FAF8', borderRadius: 2, border: '1px solid #E4F0ED' }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.5 }}>
              Hash de integridad (SHA-256)
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#5A7A74', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {record.hashIntegrity}
            </Typography>
          </Box>
        )}

        {record.locked && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2, fontSize: '0.78rem' }}>
            <strong>Historia clínica bloqueada.</strong> Esta historia fue firmada por el profesional y es inmutable
            conforme a la Resolución 1995/1999 de MinSalud. Debe custodiarse mínimo 20 años.
          </Alert>
        )}
      </Box>

      {/* Acciones */}
      {!record.locked && (
        <Box sx={{ p: 2.5, borderTop: '1px solid #E4F0ED', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Tooltip title="Editar historia clínica">
            <Button
              startIcon={<EditOutlinedIcon />}
              variant="outlined"
              size="small"
              onClick={() => { onClose(); onEdit(record); }}
              sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Editar
            </Button>
          </Tooltip>

          <Tooltip title="Bloquear historia — acción irreversible">
            <Button
              startIcon={<LockOutlinedIcon />}
              variant="outlined"
              size="small"
              disabled={locking}
              onClick={handleLock}
              sx={{ borderColor: '#2850A8', color: '#2850A8', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#EAF0FF' } }}
            >
              {locking ? 'Bloqueando…' : 'Bloquear'}
            </Button>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          {!confirmDelete ? (
            <Tooltip title="Eliminar historia clínica">
              <IconButton size="small" onClick={() => setConfirmDelete(true)}
                sx={{ color: '#C0392B', bgcolor: '#FFF0EE', '&:hover': { bgcolor: '#FFD8D4' } }}>
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          ) : (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#C0392B', fontWeight: 600 }}>¿Eliminar?</Typography>
              <Button size="small" onClick={() => setConfirmDelete(false)}
                sx={{ color: '#9DBFBA', textTransform: 'none', fontSize: '0.78rem', minWidth: 0 }}>No</Button>
              <Button size="small" variant="contained" onClick={handleDelete} disabled={deleting}
                sx={{ bgcolor: '#C0392B', borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', '&:hover': { bgcolor: '#A93226' } }}>
                {deleting ? '…' : 'Sí, eliminar'}
              </Button>
            </Stack>
          )}
        </Box>
      )}
    </Drawer>
  );
}

// ── Record Card ───────────────────────────────────────────────────────────────

function RecordCard({
  record, onClick,
}: {
  record: HealthRecordData;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        border: '1px solid #E4F0ED',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'all 0.18s',
        '&:hover': { boxShadow: '0 6px 20px rgba(61,170,150,0.12)', borderColor: '#3DAA96' },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#C8EDE5', color: '#2B7A6A', fontWeight: 700, fontSize: '0.85rem', width: 44, height: 44, flexShrink: 0 }}>
            {initials(record.patientName)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A2E2A' }}>
                {record.patientName}
              </Typography>
              {record.locked && (
                <Chip
                  size="small"
                  icon={<LockOutlinedIcon sx={{ fontSize: '12px !important' }} />}
                  label="Bloqueada"
                  sx={{ bgcolor: '#EAF0FF', color: '#2850A8', fontSize: '0.65rem', fontWeight: 700, borderRadius: '999px', height: 20 }}
                />
              )}
            </Box>

            {/* Diagnóstico destacado */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
              <MedicalServicesOutlinedIcon sx={{ fontSize: 14, color: '#3DAA96', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.82rem', color: '#1A7A5E', fontWeight: 600 }}>
                {truncate(record.diagnosis, 70)}
              </Typography>
            </Box>

            {/* Motivo de consulta */}
            <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#5A7A74', mb: 0.8 }}>
              <strong>Motivo:</strong> {truncate(record.reasonForConsultation, 90)}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarMonthOutlinedIcon sx={{ fontSize: 13, color: '#9DBFBA' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#9DBFBA' }}>{formatDate(record.createdAt)}</Typography>
              </Box>
              {record.nextAppointment && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonOutlinedIcon sx={{ fontSize: 13, color: '#9DBFBA' }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#9DBFBA' }}>
                    Próx. cita: {formatDateShort(record.nextAppointment)}
                  </Typography>
                </Box>
              )}
              {record.hashIntegrity && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <VerifiedOutlinedIcon sx={{ fontSize: 13, color: '#3DAA96' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: '#3DAA96', fontWeight: 600 }}>Integridad OK</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminHealthRecordsPage() {
  const {
    healthRecords, addHealthRecord, updateHealthRecord, lockHealthRecord, deleteHealthRecord,
    users,
  } = useAdminData();

  // Dialogs / drawers
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<HealthRecordData | null>(null);
  const [detailRecord, setDetailRecord] = useState<HealthRecordData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filtros
  const [searchPatient, setSearchPatient] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'locked' | 'unlocked'>('all');

  // Stats
  const stats = useMemo(() => ({
    total: healthRecords.length,
    locked: healthRecords.filter(r => r.locked).length,
    unlocked: healthRecords.filter(r => !r.locked).length,
    thisMonth: healthRecords.filter(r => {
      const d = new Date(r.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  }), [healthRecords]);

  // Filtrado
  const filtered = useMemo(() =>
    healthRecords
      .filter(r => {
        const q = searchPatient.toLowerCase();
        if (q.length >= 2 && !r.patientName.toLowerCase().includes(q)) return false;
        if (filterStatus === 'locked' && !r.locked) return false;
        if (filterStatus === 'unlocked' && r.locked) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [healthRecords, searchPatient, filterStatus],
  );

  const openDetail = (r: HealthRecordData) => { setDetailRecord(r); setDetailOpen(true); };
  const closeDetail = () => { setDetailOpen(false); setTimeout(() => setDetailRecord(null), 300); };

  const handleCreate = async (form: RecordFormState) => {
    await addHealthRecord({
      patientId: form.patientId!,
      patientName: form.patientUser?.name ?? '',
      reasonForConsultation: form.reasonForConsultation,
      currentIllness: form.currentIllness || undefined,
      physicalExam: form.physicalExam || undefined,
      diagnosis: form.diagnosis,
      treatmentPlan: form.treatmentPlan || undefined,
      observations: form.observations || undefined,
      nextAppointment: form.nextAppointment || undefined,
    });
  };

  const handleEdit = async (form: RecordFormState) => {
    if (!editRecord) return;
    await updateHealthRecord(editRecord.id, {
      patientId: form.patientId!,
      reasonForConsultation: form.reasonForConsultation,
      currentIllness: form.currentIllness || undefined,
      physicalExam: form.physicalExam || undefined,
      diagnosis: form.diagnosis,
      treatmentPlan: form.treatmentPlan || undefined,
      observations: form.observations || undefined,
      nextAppointment: form.nextAppointment || undefined,
    });
  };

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
            Historia Clínica
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            Registros clínicos de los pacientes · Res. 1995/1999 MinSalud
          </Typography>
        </Box>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          disableElevation
          onClick={() => setCreateOpen(true)}
          sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 2.5, '&:hover': { bgcolor: '#2B8A78' } }}
        >
          Nueva Historia
        </Button>
      </Box>

      {/* ── Stats ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Total" value={stats.total} color="#1A2E2A" /></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Este mes" value={stats.thisMonth} color="#3DAA96" /></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Bloqueadas" value={stats.locked} color="#2850A8" /></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Editables" value={stats.unlocked} color="#B67A00" /></Grid>
      </Grid>

      {/* ── Filtros ── */}
      <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED', p: 2.5, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterListIcon sx={{ color: '#9DBFBA' }} />
        <TextField
          size="small"
          placeholder="Buscar por nombre de paciente…"
          value={searchPatient}
          onChange={e => setSearchPatient(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#9DBFBA' }} /></InputAdornment> } }}
          sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            label="Estado"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="unlocked">Solo editables</MenuItem>
            <MenuItem value="locked">Solo bloqueadas</MenuItem>
          </Select>
        </FormControl>
        {(searchPatient || filterStatus !== 'all') && (
          <Button size="small" onClick={() => { setSearchPatient(''); setFilterStatus('all'); }}
            sx={{ color: '#9DBFBA', fontWeight: 600 }}>
            Limpiar
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {filtered.length} historia{filtered.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* ── Lista ── */}
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED' }}>
          <MedicalServicesOutlinedIcon sx={{ fontSize: 52, color: '#C8EDE5', mb: 1.5 }} />
          <Typography color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
            {healthRecords.length === 0
              ? 'Aún no hay historias clínicas registradas.'
              : 'No se encontraron historias que coincidan con el filtro.'}
          </Typography>
          {healthRecords.length === 0 && (
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={() => setCreateOpen(true)}
              sx={{ mt: 1.5, borderColor: '#3DAA96', color: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Crear primera historia clínica
            </Button>
          )}
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {filtered.map(r => (
            <RecordCard key={r.id} record={r} onClick={() => openDetail(r)} />
          ))}
        </Stack>
      )}

      {/* ── Dialogs ── */}

      {/* Crear */}
      <RecordFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        users={users}
        onSave={handleCreate}
      />

      {/* Editar */}
      <RecordFormDialog
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        users={users}
        initialRecord={editRecord}
        onSave={handleEdit}
      />

      {/* Detalle */}
      <RecordDetailDrawer
        record={detailRecord}
        open={detailOpen}
        onClose={closeDetail}
        onEdit={r => { closeDetail(); setTimeout(() => setEditRecord(r), 350); }}
        onLock={lockHealthRecord}
        onDelete={deleteHealthRecord}
      />
    </Box>
  );
}
