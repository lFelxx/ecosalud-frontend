import { useMemo, useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Avatar, Button, Chip, LinearProgress,
  Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, TextField, IconButton, Snackbar, Alert,
} from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RepeatIcon from '@mui/icons-material/Repeat';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import Navbar from '../../components/common/Navbar';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuthContext } from '../../context/AuthContext';
import { AppointmentRepository } from '../../../infrastructure/repositories/AppointmentRepository';
import { GetPatientAppointmentsUseCase } from '../../../application/usecases/appointments/GetPatientAppointmentsUseCase';
import { CancelAppointmentUseCase } from '../../../application/usecases/appointments/CancelAppointmentUseCase';
import { RescheduleAppointmentUseCase } from '../../../application/usecases/appointments/RescheduleAppointmentUseCase';
import type { Appointment } from '../../../domain/entities/Appointment';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface ActiveTherapy {
  id: string;
  name: string;
  category: string;
  sessionsCompleted: number;
  sessionsTotal: number;
  nextDate: string;
  nextTime: string;
  color: string;
  status: string;
}

// ── Helpers de datos ──────────────────────────────────────────────────────────

function parseDateTime(iso: string): { date: string; time: string } {
  const [date = '', rawTime = '00:00:00'] = iso.split('T');
  return { date, time: rawTime.slice(0, 5) };
}

function toActiveTherapy(apt: Appointment): ActiveTherapy {
  const { date, time } = parseDateTime(apt.date);
  return {
    id:                String(apt.id),
    name:              apt.catalogName ?? 'Terapia',
    category:          '',
    sessionsCompleted: 0,
    sessionsTotal:     1,
    nextDate:          date,
    nextTime:          time,
    color:             '#3DAA96',
    status:            apt.status,
  };
}

function toHistoryItem(apt: Appointment) {
  const { date } = parseDateTime(apt.date);
  const result =
    apt.status === 'CANCELADA'     ? 'CANCELADA'    :
    apt.status === 'REPROGRAMADA'  ? 'REPROGRAMADA' : 'EXITOSA';
  return { id: String(apt.id), name: apt.catalogName ?? 'Terapia', endDate: date, result };
}

// ── Constantes estáticas ──────────────────────────────────────────────────────

const RECOMMENDATIONS = [
  {
    id: 'rec-1',
    icon: <OpacityOutlinedIcon sx={{ fontSize: 22, color: '#3DAA96' }} />,
    title: 'Hidratación Constante',
    body: 'Bebe al menos 2.5 litros de agua alcalina durante las próximas 24 horas para facilitar la eliminación de toxinas.',
  },
  {
    id: 'rec-2',
    icon: <HotelOutlinedIcon sx={{ fontSize: 22, color: '#3DAA96' }} />,
    title: 'Descanso Reparador',
    body: 'Evita actividades físicas intensas durante las primeras 6 horas. Prioriza un sueño de al menos 8 horas esta noche.',
  },
  {
    id: 'rec-3',
    icon: <WbSunnyOutlinedIcon sx={{ fontSize: 22, color: '#3DAA96' }} />,
    title: 'Evitar Exposición Solar',
    body: 'No te expongas directamente al sol o fuentes de calor intensas (saunas) para prevenir irritaciones o descompensación.',
  },
];

// ── Helpers de formato ────────────────────────────────────────────────────────

const MONTHS_ES_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_ES_LONG  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_ES_SHORT[m - 1]}. ${y}`;
}

function formatDateLong(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} de ${MONTHS_ES_LONG[m - 1]}`;
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActiveTherapyCard({
  name, category, sessionsCompleted, sessionsTotal, nextDate, nextTime, color, status,
  onRecommendations, onCancel, onReschedule,
}: ActiveTherapy & { onRecommendations: () => void; onCancel: () => void; onReschedule: () => void }) {
  const pct = Math.round((sessionsCompleted / sessionsTotal) * 100);
  return (
    <Paper
      elevation={0}
      sx={{ border: '1px solid #E3EFEC', borderRadius: 3, p: 2.5, bgcolor: '#FAFFFE' }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A3E38', lineHeight: 1.2 }}>
            {name}
          </Typography>
          {category && (
            <Chip
              label={category}
              size="small"
              sx={{ mt: 0.5, bgcolor: '#EAF6F3', color: '#2B8A78', fontWeight: 600, fontSize: '0.68rem', height: 20 }}
            />
          )}
        </Box>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={status === 'REPROGRAMADA' ? 'REPROGRAMADA' : 'EN CURSO'}
            size="small"
            sx={{
              bgcolor: status === 'REPROGRAMADA' ? '#FFF3E0' : '#3DAA96',
              color:   status === 'REPROGRAMADA' ? '#E65100'  : '#fff',
              fontWeight: 700, fontSize: '0.65rem', height: 22, letterSpacing: 0.5,
            }}
          />
        </Stack>
      </Stack>

      <Box sx={{ mb: 1.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
          <Typography variant="caption" sx={{ color: '#5A7A74', fontWeight: 500 }}>
            Sesión {sessionsCompleted} de {sessionsTotal}
          </Typography>
          <Typography variant="caption" sx={{ color: color, fontWeight: 700 }}>
            {pct}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 7, borderRadius: 4, bgcolor: '#E3EFEC',
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
          }}
        />
      </Box>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.7, mb: 2 }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#9DBFBA' }} />
        <Typography variant="caption" sx={{ color: '#5A7A74' }}>
          Próxima cita:&nbsp;
          <Box component="span" sx={{ fontWeight: 600, color: '#1A3E38' }}>
            {formatDateShort(nextDate)} · {nextTime}
          </Box>
        </Typography>
      </Stack>

      <Stack direction="row" sx={{ gap: 1.5, mb: 1 }}>
        <Button
          startIcon={<RepeatIcon sx={{ fontSize: 16 }} />}
          size="small"
          variant="outlined"
          onClick={onReschedule}
          sx={{
            flex: 1, borderColor: '#B2D4CE', color: '#3DAA96', borderRadius: 2,
            textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
            '&:hover': { borderColor: '#3DAA96', bgcolor: '#F0FBF8' },
          }}
        >
          Reprogramar
        </Button>
        <Button
          startIcon={<TipsAndUpdatesOutlinedIcon sx={{ fontSize: 16 }} />}
          size="small"
          variant="contained"
          disableElevation
          onClick={onRecommendations}
          sx={{
            flex: 1, bgcolor: '#3DAA96', borderRadius: 2,
            textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
            '&:hover': { bgcolor: '#2B8A78' },
          }}
        >
          Recomendaciones
        </Button>
      </Stack>

      <Button
        size="small"
        variant="outlined"
        fullWidth
        onClick={onCancel}
        sx={{
          borderColor: '#F4BFBA', color: '#C0392B', borderRadius: 2,
          textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
          '&:hover': { borderColor: '#C0392B', bgcolor: '#FFF0EE' },
        }}
      >
        Cancelar cita
      </Button>
    </Paper>
  );
}

// ── Helpers reprogramar ───────────────────────────────────────────────────────

const MONTHS_RSCH = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DOW_RSCH    = ['LU','MA','MI','JU','VI','SA','DO'];
const SLOTS_WD    = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:30 PM'];
const SLOTS_SAT   = ['09:00 AM','10:00 AM','11:00 AM'];

function buildCalR(year: number, month: number) {
  const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const cells: { day: number; inMonth: boolean }[] = [];
  for (let i = firstDow - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, inMonth: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, inMonth: true });
  let next = 1;
  while (cells.length % 7 !== 0) cells.push({ day: next++, inMonth: false });
  return cells;
}

function parseSlotR(slot: string) {
  const m = slot.match(/(\d+):(\d+) (AM|PM)/);
  if (!m) return { hours: 0, minutes: 0 };
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (m[3] === 'PM' && h !== 12) h += 12;
  if (m[3] === 'AM' && h === 12) h = 0;
  return { hours: h, minutes: min };
}

function getSlotsR(d: Date | null): string[] {
  if (!d) return [];
  if (d.getDay() === 0) return [];
  const raw = d.getDay() === 6 ? SLOTS_SAT : SLOTS_WD;
  const today = new Date();
  const sameDay = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  if (!sameDay) return raw;
  return raw.filter((slot) => {
    const { hours, minutes } = parseSlotR(slot);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes) > today;
  });
}

function buildDateTimeR(date: Date, slot: string): string {
  const { hours, minutes } = parseSlotR(slot);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(hours)}:${p(minutes)}:00`;
}

function RescheduleModal({ open, therapyName, onClose, onConfirm }: {
  open: boolean; therapyName: string;
  onClose: () => void; onConfirm: (newDate: string) => void;
}) {
  const todayR = useMemo(() => new Date(), []);
  const [calYear,      setCalYear]      = useState(todayR.getFullYear());
  const [calMonth,     setCalMonth]     = useState(todayR.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const calCells = useMemo(() => buildCalR(calYear, calMonth), [calYear, calMonth]);
  const slots    = useMemo(() => getSlotsR(selectedDate), [selectedDate]);

  const handleClose = () => { setSelectedDate(null); setSelectedTime(null); onClose(); };
  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    onConfirm(buildDateTimeR(selectedDate, selectedTime));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      sx={{ '& .MuiBackdrop-root': { bgcolor: 'rgba(26,62,56,0.60)', backdropFilter: 'blur(6px)' } }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A3E38' }}>Reprogramar Cita</Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: '#9DBFBA', '&:hover': { color: '#1A3E38' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ color: '#5A7A74', mb: 2 }}>
          Nueva fecha para <Box component="span" sx={{ fontWeight: 700, color: '#1A3E38' }}>{therapyName}</Box>
        </Typography>

        {/* Navegación mes */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <IconButton size="small" onClick={() => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); }} sx={{ color: '#9DBFBA' }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700, color: '#1A3E38', fontSize: '0.88rem' }}>
            {MONTHS_RSCH[calMonth]} {calYear}
          </Typography>
          <IconButton size="small" onClick={() => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); }} sx={{ color: '#9DBFBA' }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Días */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.3 }}>
          {DOW_RSCH.map((d) => (
            <Typography key={d} sx={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#9DBFBA', py: 0.5 }}>{d}</Typography>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.3, mb: 2 }}>
          {calCells.map((cell, idx) => {
            const cellDate = new Date(calYear, calMonth, cell.day);
            const today0   = new Date(); today0.setHours(0, 0, 0, 0);
            const isToday  = cell.inMonth && cellDate.getTime() === today0.getTime();
            const isSel    = cell.inMonth && selectedDate != null &&
              cellDate.getFullYear() === selectedDate.getFullYear() &&
              cellDate.getMonth()    === selectedDate.getMonth()    &&
              cellDate.getDate()     === selectedDate.getDate();
            const disabled = !cell.inMonth || (cellDate < today0 && !isToday) || cellDate.getDay() === 0;
            return (
              <Box key={idx} onClick={() => { if (!disabled) { setSelectedDate(cellDate); setSelectedTime(null); } }}
                sx={{
                  height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 1.5, cursor: disabled ? 'default' : 'pointer',
                  bgcolor: isSel ? '#3DAA96' : isToday ? '#E8F5F0' : 'transparent',
                  '&:hover': disabled ? {} : { bgcolor: isSel ? '#2B8A78' : '#D4EDE7' },
                }}
              >
                <Typography sx={{ fontSize: '0.8rem', fontWeight: isSel ? 800 : 400,
                  color: isSel ? '#fff' : !cell.inMonth || disabled ? '#C5DDD8' : isToday ? '#3DAA96' : '#1A2E2A' }}>
                  {cell.day}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Horarios */}
        {selectedDate && (
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
              Horarios disponibles
            </Typography>
            {slots.length === 0
              ? <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Sin horarios disponibles.</Typography>
              : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {slots.map((slot) => (
                    <Button key={slot} size="small"
                      variant={selectedTime === slot ? 'contained' : 'outlined'}
                      startIcon={<AccessTimeOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                      onClick={() => setSelectedTime(slot)}
                      sx={{
                        borderRadius: 2, fontWeight: 600, fontSize: '0.78rem',
                        borderColor: selectedTime === slot ? '#3DAA96' : '#D4EDE7',
                        bgcolor: selectedTime === slot ? '#3DAA96' : '#fff',
                        color: selectedTime === slot ? '#fff' : '#4A6B60',
                        '&:hover': { bgcolor: selectedTime === slot ? '#2B8A78' : '#E8F5F0', borderColor: '#3DAA96' },
                      }}
                    >{slot}</Button>
                  ))}
                </Box>
              )
            }
          </Box>
        )}

        <Stack direction="row" spacing={1.5}>
          <Button fullWidth variant="contained" disabled={!selectedDate || !selectedTime} onClick={handleConfirm}
            sx={{ flex: 1, bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' }, '&.Mui-disabled': { bgcolor: '#C5DDD8', color: '#fff' } }}>
            Confirmar
          </Button>
          <Button fullWidth variant="outlined" onClick={handleClose}
            sx={{ flex: 1, borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, fontWeight: 600, '&:hover': { borderColor: '#3DAA96', color: '#3DAA96' } }}>
            Cancelar
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────

function RecommendationsModal({ open, therapyName, onClose }: { open: boolean; therapyName: string; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      sx={{ '& .MuiBackdrop-root': { bgcolor: 'rgba(26,62,56,0.60)', backdropFilter: 'blur(6px)' } }}
    >
      <Box sx={{ background: 'linear-gradient(135deg, #1A4A3E 0%, #3DAA96 100%)', px: 3, pt: 3, pb: 2.5, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SpaOutlinedIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              Recomendaciones para tu recuperación
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {therapyName} · Sigue estas pautas para optimizar tus resultados
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        {RECOMMENDATIONS.map((rec) => (
          <Paper
            key={rec.id}
            elevation={0}
            sx={{ border: '1px solid #E3EFEC', borderRadius: 2.5, p: 2, mb: 1.5, display: 'flex', gap: 1.8, alignItems: 'flex-start' }}
          >
            <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: '#EAF6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {rec.icon}
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A3E38', mb: 0.3 }}>{rec.title}</Typography>
              <Typography variant="caption" sx={{ color: '#5A7A74', lineHeight: 1.55, display: 'block' }}>{rec.body}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ px: 2.5, pb: 3, pt: 1 }}>
        <Button fullWidth variant="contained" disableElevation onClick={onClose}
          sx={{ bgcolor: '#1A4A3E', borderRadius: 2, fontWeight: 700, py: 1.3, fontSize: '0.9rem', mb: 1, '&:hover': { bgcolor: '#0F2E28' } }}>
          Entendido
        </Button>
        <Button fullWidth variant="outlined" startIcon={<DownloadOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{ borderColor: '#B2D4CE', color: '#3DAA96', borderRadius: 2, fontWeight: 600, py: 1.1, fontSize: '0.85rem', textTransform: 'none', '&:hover': { borderColor: '#3DAA96', bgcolor: '#F0FBF8' } }}>
          Descargar Guía Completa
        </Button>
      </Box>
    </Dialog>
  );
}

function CancelModal({ open, therapyName, nextDate, onClose, onConfirm }: {
  open: boolean; therapyName: string; nextDate: string; onClose: () => void; onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState('');

  const handleConfirm = () => { onConfirm(note); setNote(''); };
  const handleClose   = () => { setNote(''); onClose(); };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      sx={{ '& .MuiBackdrop-root': { bgcolor: 'rgba(26,62,56,0.60)', backdropFilter: 'blur(6px)' } }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton onClick={handleClose} size="small" sx={{ color: '#9DBFBA', '&:hover': { color: '#1A3E38', bgcolor: '#F0F8F5' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: '#FFF0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <WarningAmberRoundedIcon sx={{ fontSize: 28, color: '#E05A3A' }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A3E38', mb: 1 }}>Cancelar Cita</Typography>
        <Typography variant="body2" sx={{ color: '#5A7A74', lineHeight: 1.65, mb: 2.5 }}>
          ¿Estás seguro de que deseas cancelar tu cita para{' '}
          <Box component="span" sx={{ fontWeight: 700, color: '#1A3E38' }}>{therapyName}</Box>{' '}
          el{' '}
          <Box component="span" sx={{ fontWeight: 700, color: '#1A3E38' }}>{formatDateLong(nextDate)}</Box>?
        </Typography>

        <Typography variant="caption" sx={{ fontWeight: 600, color: '#5A7A74', mb: 0.8, display: 'block' }}>
          Motivo de la cancelación (Opcional)
        </Typography>
        <TextField
          multiline rows={3} fullWidth
          placeholder="Cuéntanos brevemente por qué necesitas cancelar…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2, fontSize: '0.85rem',
              '& fieldset': { borderColor: '#D4EDE7' },
              '&:hover fieldset': { borderColor: '#3DAA96' },
              '&.Mui-focused fieldset': { borderColor: '#3DAA96' },
            },
          }}
        />

        <Stack direction="row" sx={{ gap: 1.5 }}>
          <Button
            variant="outlined" onClick={handleConfirm}
            sx={{ flex: 1, borderColor: '#E05A3A', color: '#E05A3A', borderRadius: 2, fontWeight: 700, textTransform: 'none', py: 1.1, '&:hover': { bgcolor: '#FFF0EE', borderColor: '#C0392B', color: '#C0392B' } }}
          >
            Confirmar Cancelación
          </Button>
          <Button
            variant="contained" disableElevation onClick={handleClose}
            sx={{ flex: 1, bgcolor: '#1A4A3E', borderRadius: 2, fontWeight: 700, textTransform: 'none', py: 1.1, '&:hover': { bgcolor: '#0F2E28' } }}
          >
            Mantener Cita
          </Button>
        </Stack>
      </Box>

      <Box sx={{ bgcolor: '#F7FAF9', borderTop: '1px solid #E3EFEC', px: 3, py: 1.5 }}>
        <Typography variant="caption" sx={{ color: '#9DBFBA', textAlign: 'center', display: 'block' }}>
          Recuerda que cancelaciones con menos de 24 horas pueden aplicar cargos.
        </Typography>
      </Box>
    </Dialog>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const { specialist } = useAdminData();
  const { user }       = useAuthContext();

  const appointmentRepo          = useMemo(() => new AppointmentRepository(), []);
  const getPatientAppointments   = useMemo(() => new GetPatientAppointmentsUseCase(appointmentRepo), [appointmentRepo]);
  const cancelAppointmentUC      = useMemo(() => new CancelAppointmentUseCase(appointmentRepo), [appointmentRepo]);
  const rescheduleAppointmentUC  = useMemo(() => new RescheduleAppointmentUseCase(appointmentRepo), [appointmentRepo]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getPatientAppointments.execute(user.id).then(setAppointments).catch(console.error);
  }, [user, getPatientAppointments]);

  const activeTherapies: ActiveTherapy[] = useMemo(
    () => {
      const now = new Date();
      return appointments
        .filter((a) =>
          (a.status === 'PENDIENTE' || a.status === 'CONFIRMADA' || a.status === 'REPROGRAMADA') &&
          new Date(a.date) >= now,
        )
        .map(toActiveTherapy);
    },
    [appointments],
  );

  const completedTherapies = useMemo(
    () => {
      const now = new Date();
      return appointments
        .filter((a) =>
          a.status === 'CANCELADA' ||
          (a.status === 'REPROGRAMADA' && new Date(a.date) < now) ||
          (a.status === 'CONFIRMADA'   && new Date(a.date) < now),
        )
        .map(toHistoryItem);
    },
    [appointments],
  );

  const completedCount   = completedTherapies.length;
  const activePlansCount = activeTherapies.length;

  const [recsOpen,    setRecsOpen]    = useState(false);
  const [recsTherapy, setRecsTherapy] = useState('');
  const [cancelOpen,  setCancelOpen]  = useState(false);
  const [cancelTherapy, setCancelTherapy] = useState<ActiveTherapy | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleTherapy, setRescheduleTherapy] = useState<ActiveTherapy | null>(null);

  const openRecs       = (name: string)     => { setRecsTherapy(name); setRecsOpen(true); };
  const openCancel     = (t: ActiveTherapy) => { setCancelTherapy(t);  setCancelOpen(true); };
  const openReschedule = (t: ActiveTherapy) => { setRescheduleTherapy(t); setRescheduleOpen(true); };

  const handleCancelConfirm = async (_note: string) => {
    if (cancelTherapy && user) {
      try {
        await cancelAppointmentUC.execute(Number(cancelTherapy.id));
        const updated = await getPatientAppointments.execute(user.id);
        setAppointments(updated);
      } catch {
        setErrorMsg('No se pudo cancelar la cita. Intenta de nuevo.');
      }
    }
    setCancelOpen(false);
    setCancelTherapy(null);
  };

  const handleRescheduleConfirm = async (newDate: string) => {
    if (rescheduleTherapy && user) {
      try {
        await rescheduleAppointmentUC.execute(Number(rescheduleTherapy.id), newDate);
        const updated = await getPatientAppointments.execute(user.id);
        setAppointments(updated);
      } catch {
        setErrorMsg('No se pudo reprogramar la cita. Intenta de nuevo.');
      }
    }
    setRescheduleOpen(false);
    setRescheduleTherapy(null);
  };

  const specialistInitials = initials(specialist.name);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F7FAF9' }}>
      <Navbar />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A3E38', lineHeight: 1.2 }}>
            Mis Terapias
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A7A74', mt: 0.4 }}>
            Seguimiento de tus planes de tratamiento activos e historial de sesiones
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 3, alignItems: 'flex-start' }}>

          {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>

            {/* Doctor card */}
            <Paper elevation={0} sx={{ border: '1px solid #E3EFEC', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
              <Box sx={{ bgcolor: '#3DAA96', height: 60, position: 'relative' }}>
                <Box sx={{
                  position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)',
                  width: 80, height: 80, borderRadius: '50%',
                  border: '4px solid #fff', overflow: 'hidden', bgcolor: '#EAF6F3',
                }}>
                  {specialist.photoBase64 ? (
                    <Box component="img" src={specialist.photoBase64} alt={specialist.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Avatar sx={{ width: '100%', height: '100%', bgcolor: '#2B8A78', fontSize: '1.4rem', fontWeight: 700, borderRadius: 0 }}>
                      {specialistInitials}
                    </Avatar>
                  )}
                </Box>
              </Box>

              <Box sx={{ pt: 6, pb: 2.5, px: 2.5, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A3E38' }}>
                  {specialist.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#3DAA96', fontWeight: 600, display: 'block', mb: 1.5 }}>
                  {specialist.specialty}
                </Typography>

                <Box sx={{ bgcolor: '#F0FBF8', borderLeft: '3px solid #3DAA96', borderRadius: 1, px: 1.5, py: 1, mb: 2, textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ color: '#4A6B60', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "La salud no es solo ausencia de enfermedad, es vitalidad plena en cuerpo, mente y espíritu."
                  </Typography>
                </Box>

                <Button
                  component={RouterLink} to="/especialista"
                  variant="contained" disableElevation fullWidth size="small"
                  startIcon={<SpaIcon sx={{ fontSize: 16 }} />}
                  sx={{ bgcolor: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', '&:hover': { bgcolor: '#2B8A78' } }}
                >
                  Ver Perfil Especialista
                </Button>
              </Box>
            </Paper>

            {/* Stat: Sesiones completadas */}
            <Paper elevation={0} sx={{ border: '1px solid #E3EFEC', borderRadius: 3, p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#EAF6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircleOutlinedIcon sx={{ color: '#3DAA96', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A3E38', lineHeight: 1 }}>
                  {String(completedCount).padStart(2, '0')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5A7A74', fontWeight: 500, letterSpacing: 0.4 }}>
                  SESIONES COMPLETADAS
                </Typography>
              </Box>
            </Paper>

            {/* Stat: Planes activos */}
            <Paper elevation={0} sx={{ border: '1px solid #E3EFEC', borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#EAF6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <SpaIcon sx={{ color: '#3DAA96', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A3E38', lineHeight: 1 }}>
                  {String(activePlansCount).padStart(2, '0')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5A7A74', fontWeight: 500, letterSpacing: 0.4 }}>
                  PLANES ACTIVOS
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* ── RIGHT MAIN ─────────────────────────────────────────────────── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* ── Mis Citas (real del backend) ─────────────────────────────── */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A3E38' }}>Terapias Activas</Typography>
                <Chip label="EN CURSO" size="small"
                  sx={{ bgcolor: '#EAF6F3', color: '#2B8A78', fontWeight: 700, fontSize: '0.65rem', height: 20, letterSpacing: 0.5 }} />
              </Stack>

              {activeTherapies.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
                  No tienes citas activas en este momento.
                </Typography>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 2 }}>
                  {activeTherapies.map((t) => (
                    <Box key={t.id}>
                      <ActiveTherapyCard
                        {...t}
                        onRecommendations={() => openRecs(t.name)}
                        onCancel={() => openCancel(t)}
                        onReschedule={() => openReschedule(t)}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Historial de Terapias */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A3E38' }}>Historial de Terapias</Typography>
                <Chip label="COMPLETADAS" size="small"
                  sx={{ bgcolor: '#E8F5E9', color: '#388E3C', fontWeight: 700, fontSize: '0.65rem', height: 20, letterSpacing: 0.5 }} />
              </Stack>

              <Paper elevation={0} sx={{ border: '1px solid #E3EFEC', borderRadius: 3, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F4FAF8' }}>
                      {['Terapia', 'Finalización', 'Resultado', 'Acción'].map((h) => (
                        <TableCell key={h} sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#5A7A74', letterSpacing: 0.5, borderBottom: '1px solid #E3EFEC', py: 1.2 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {completedTherapies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ py: 2, textAlign: 'center', color: '#9DBFBA', fontStyle: 'italic', fontSize: '0.84rem' }}>
                          Sin historial de terapias aún.
                        </TableCell>
                      </TableRow>
                    ) : (
                      completedTherapies.map((t, idx) => (
                        <TableRow key={t.id} sx={{ bgcolor: idx % 2 === 0 ? '#FAFFFE' : '#fff', '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ py: 1.4, fontSize: '0.84rem', fontWeight: 600, color: '#1A3E38' }}>{t.name}</TableCell>
                          <TableCell sx={{ py: 1.4, fontSize: '0.82rem', color: '#5A7A74' }}>{formatDateShort(t.endDate)}</TableCell>
                          <TableCell sx={{ py: 1.4 }}>
                            <Chip
                              label={t.result} size="small"
                              sx={{
                                bgcolor: t.result === 'EXITOSA' ? '#E8F5E9' : '#FFF0EE',
                                color:   t.result === 'EXITOSA' ? '#2E7D32' : '#C0392B',
                                fontWeight: 700, fontSize: '0.65rem', height: 20,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1.4 }}>
                            <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                              sx={{ color: '#3DAA96', fontSize: '0.75rem', fontWeight: 600, textTransform: 'none', p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', color: '#2B8A78' } }}>
                              Ver Resumen
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>

            {/* Recomendaciones Post-Terapia */}
            <Box sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #1A3E38 0%, #3DAA96 100%)', p: 3, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', border: '20px solid rgba(255,255,255,0.07)' }} />
              <Box sx={{ position: 'absolute', bottom: -20, right: 60, width: 70, height: 70, borderRadius: '50%', border: '14px solid rgba(255,255,255,0.05)' }} />

              <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 2, position: 'relative' }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TipsAndUpdatesOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                    Recomendaciones Post-Terapia
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, mb: 2, maxWidth: 480 }}>
                    Basado en tus sesiones activas, hemos preparado una guía personalizada con hábitos, alimentación y cuidados para potenciar los resultados de tu tratamiento.
                  </Typography>
                  <Button
                    variant="outlined"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                    size="small"
                    onClick={() => openRecs('Tus Terapias')}
                    sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.55)', borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', px: 2, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.10)' } }}
                  >
                    Leer Guía de Bienestar
                  </Button>
                </Box>
              </Stack>
            </Box>

          </Box>
        </Stack>
      </Box>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <RecommendationsModal open={recsOpen} therapyName={recsTherapy} onClose={() => setRecsOpen(false)} />

      <CancelModal
        open={cancelOpen}
        therapyName={cancelTherapy?.name ?? ''}
        nextDate={cancelTherapy?.nextDate ?? '2026-01-01'}
        onClose={() => { setCancelOpen(false); setCancelTherapy(null); }}
        onConfirm={handleCancelConfirm}
      />

      <RescheduleModal
        open={rescheduleOpen}
        therapyName={rescheduleTherapy?.name ?? ''}
        onClose={() => { setRescheduleOpen(false); setRescheduleTherapy(null); }}
        onConfirm={handleRescheduleConfirm}
      />

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={4000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
