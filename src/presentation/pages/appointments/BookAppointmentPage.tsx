import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardContent,
  Button, Avatar, Chip, Divider, IconButton, Stack, Dialog,
} from '@mui/material';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import doctorImage from '../../../assets/doctor-hero.jpg';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuthContext } from '../../context/AuthContext';

// ── Constants ──────────────────────────────────────────────────────────────────

const DOW = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS_ES_LONG = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
];

const SLOTS_WEEKDAY = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM'];
const SLOTS_SATURDAY = ['09:00 AM', '10:00 AM', '11:00 AM'];

const SERVICE_ICONS: Record<string, ReactNode> = {
  'acupuntura':            <AccessibilityNewOutlinedIcon sx={{ fontSize: 26 }} />,
  'oxivenaciones':         <BoltOutlinedIcon             sx={{ fontSize: 26 }} />,
  'sueroterapia-dirigida': <WaterDropOutlinedIcon        sx={{ fontSize: 26 }} />,
  'ozonoterapia':          <CloudOutlinedIcon            sx={{ fontSize: 26 }} />,
  'terapia-neural':        <PsychologyOutlinedIcon       sx={{ fontSize: 26 }} />,
  'biopuntura':            <MedicalServicesOutlinedIcon  sx={{ fontSize: 26 }} />,
  'farmacologia-vegetal':  <LocalPharmacyOutlinedIcon    sx={{ fontSize: 26 }} />,
  'homeopatia':            <SpaOutlinedIcon              sx={{ fontSize: 26 }} />,
};

const CATEGORY_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  'Inmunidad':     { label: 'Inmunidad',    bg: '#E8F5F0', color: '#1A7A5E' },
  'Energía':       { label: 'Energía',      bg: '#FFF8E8', color: '#B67A00' },
  'Dolor Crónico': { label: 'Popular',      bg: '#FFF0EE', color: '#C0392B' },
  'Desintoxicación':{ label: 'Bienestar',   bg: '#EEF0FF', color: '#5A5FC8' },
};

// ── Calendar helpers ───────────────────────────────────────────────────────────

interface CalCell { day: number; inMonth: boolean }

function buildCalendar(year: number, month: number): CalCell[] {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const cells: CalCell[] = [];

  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, inMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, inMonth: true });

  let next = 1;
  while (cells.length % 7 !== 0) cells.push({ day: next++, inMonth: false });
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function isPast(d: Date) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return d < today;
}

function formatDateLong(d: Date) {
  return `${DAYS_ES_LONG[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}, ${d.getFullYear()}`;
}

function getSlots(d: Date | null): string[] {
  if (!d) return [];
  const dow = d.getDay(); // 0=Sun, 6=Sat
  if (dow === 0) return [];
  if (dow === 6) return SLOTS_SATURDAY;
  return SLOTS_WEEKDAY;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepLabel({ n, text }: { n: number; text: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
      <Box sx={{
        width: 28, height: 28, borderRadius: '50%',
        bgcolor: '#3DAA96', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.78rem' }}>{n}</Typography>
      </Box>
      <Typography sx={{ fontWeight: 700, color: '#3DAA96', fontSize: '0.95rem' }}>{text}</Typography>
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookAppointmentPage() {
  const { services, specialist, addAppointment } = useAdminData();
  const { user } = useAuthContext();

  const today = new Date();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const displayServices = useMemo(() => services.slice(0, 4), [services]);
  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  const calCells = useMemo(() => buildCalendar(calYear, calMonth), [calYear, calMonth]);
  const slots = useMemo(() => getSlots(selectedDate), [selectedDate]);

  const canConfirm = !!selectedServiceId && !!selectedDate && !!selectedTime;

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  const handleSelectDate = (cell: CalCell) => {
    if (!cell.inMonth) return;
    const d = new Date(calYear, calMonth, cell.day);
    if (isPast(d) && !isSameDay(d, today)) return;
    if (d.getDay() === 0) return; // Sundays closed
    setSelectedDate(d);
    setSelectedTime(null);
  };

  const handleConfirm = () => {
    if (!canConfirm || !selectedService || !selectedDate || !selectedTime) return;
    addAppointment({
      patientId:    user?.id ?? 0,
      patientName:  user?.name ?? 'Paciente',
      patientEmail: user?.email ?? '',
      service:      selectedService.name,
      date:         selectedDate.toISOString().slice(0, 10),
      time:         selectedTime.replace(' AM', ':00').replace(' PM', ':00'), // normalize
      status:       'pending',
    });
    setConfirmed(true);
  };

  // ── Main booking flow ───────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Page header */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E4F0ED', py: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#3DAA96', mb: 0.8, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
          Agendar Tu Terapia
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', lineHeight: 1.6 }}>
          Comienza tu camino hacia el bienestar integral seleccionando el tratamiento adecuado para ti.
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>

          {/* ══ LEFT — Steps ══════════════════════════════════════════════════ */}
          <Grid size={{ xs: 12, md: 8 }}>

            {/* ── PASO 1: Servicio ── */}
            <Box sx={{ mb: 4 }}>
              <StepLabel n={1} text="Paso 1: Selecciona un Servicio" />
              <Grid container spacing={2}>
                {displayServices.map((svc) => {
                  const isSelected = selectedServiceId === svc.id;
                  const badge = CATEGORY_BADGE[svc.category];
                  const icon = SERVICE_ICONS[svc.id] ?? <SpaOutlinedIcon sx={{ fontSize: 26 }} />;
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={svc.id}>
                      <Card
                        onClick={() => setSelectedServiceId(svc.id)}
                        sx={{
                          borderRadius: 3, cursor: 'pointer', height: '100%',
                          border: `2px solid ${isSelected ? '#3DAA96' : '#E4F0ED'}`,
                          boxShadow: isSelected ? '0 4px 20px rgba(61,170,150,0.18)' : '0 2px 8px rgba(0,0,0,0.05)',
                          transition: 'all 0.2s',
                          bgcolor: isSelected ? '#F4FAF8' : '#fff',
                          '&:hover': { borderColor: '#3DAA96', boxShadow: '0 4px 16px rgba(61,170,150,0.15)', transform: 'translateY(-2px)' },
                          position: 'relative',
                        }}
                      >
                        {badge && (
                          <Box sx={{ position: 'absolute', top: 14, right: 14 }}>
                            <Chip
                              label={badge.label}
                              size="small"
                              sx={{ bgcolor: badge.bg, color: badge.color, fontWeight: 700, fontSize: '0.7rem', height: 22, borderRadius: '999px' }}
                            />
                          </Box>
                        )}
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{
                            width: 46, height: 46, borderRadius: 2,
                            bgcolor: isSelected ? '#3DAA96' : '#E8F5F0',
                            color: isSelected ? '#fff' : '#3DAA96',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.8,
                            transition: 'all 0.2s',
                          }}>
                            {icon}
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A2E2A', mb: 0.6 }}>
                            {svc.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2, fontSize: '0.82rem' }}>
                            {svc.description.slice(0, 80)}…
                          </Typography>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? '#3DAA96' : '#6B8F85' }}>
                            {svc.duration} | {svc.price}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            {/* ── PASO 2: Especialista ── */}
            <Box sx={{ mb: 4 }}>
              <StepLabel n={2} text="Paso 2: Selecciona tu Especialista" />
              <Card sx={{
                borderRadius: 3, border: '2px solid #3DAA96',
                boxShadow: '0 4px 16px rgba(61,170,150,0.12)', bgcolor: '#F4FAF8',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Photo */}
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar
                        src={specialist.photoBase64 ?? doctorImage}
                        alt={specialist.name}
                        sx={{ width: 80, height: 80, border: '3px solid #fff', boxShadow: '0 4px 16px rgba(61,170,150,0.20)' }}
                      />
                      <Box sx={{
                        position: 'absolute', bottom: 2, right: 2,
                        width: 14, height: 14, borderRadius: '50%',
                        bgcolor: '#27AE60', border: '2px solid #fff',
                      }} />
                    </Box>

                    {/* Info */}
                    <Box sx={{ flex: 1, minWidth: 160 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#1A2E2A', mb: 0.3 }}>
                        {specialist.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mb: 1.2 }}>
                        {specialist.specialty}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                        {['10+ Años Exp.', 'Magister en Salud', 'Investigadora'].map((tag) => (
                          <Chip key={tag} label={tag} size="small"
                            sx={{ bgcolor: '#E8F5F0', color: '#2B7A6A', fontWeight: 600, fontSize: '0.68rem', height: 22, borderRadius: '999px' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, px: 3, minWidth: 130,
                          '&:hover': { bgcolor: '#2B8A78' },
                        }}
                      >
                        Seleccionar
                      </Button>
                      <Button
                        component={RouterLink} to="/especialista"
                        variant="text"
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                        sx={{ color: '#3DAA96', fontWeight: 600, fontSize: '0.82rem', textTransform: 'none' }}
                      >
                        Ver Perfil
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* ── PASO 3: Calendario ── */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                <StepLabel n={3} text="Paso 3: Calendario de Disponibilidad" />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={prevMonth} sx={{ color: '#9DBFBA', '&:hover': { color: '#3DAA96' } }}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.9rem', minWidth: 120, textAlign: 'center' }}>
                    {MONTHS_ES[calMonth]} {calYear}
                  </Typography>
                  <IconButton size="small" onClick={nextMonth} sx={{ color: '#9DBFBA', '&:hover': { color: '#3DAA96' } }}>
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
              </Box>

              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'visible' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  {/* Day-of-week headers */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
                    {DOW.map((d) => (
                      <Typography key={d} sx={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#9DBFBA', py: 1 }}>
                        {d}
                      </Typography>
                    ))}
                  </Box>

                  {/* Calendar cells */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                    {calCells.map((cell, idx) => {
                      const cellDate = new Date(
                        cell.inMonth ? calYear : (idx < 7 ? calYear : calYear),
                        cell.inMonth ? calMonth : (idx < 7 ? calMonth - 1 : calMonth + 1),
                        cell.day,
                      );
                      const isToday = cell.inMonth && isSameDay(cellDate, today);
                      const isSelected = cell.inMonth && selectedDate ? isSameDay(cellDate, selectedDate) : false;
                      const isPastDay = cell.inMonth && isPast(cellDate) && !isToday;
                      const isSunday = new Date(calYear, calMonth, cell.day).getDay() === 0;
                      const disabled = !cell.inMonth || isPastDay || isSunday;

                      return (
                        <Box
                          key={idx}
                          onClick={() => !disabled && handleSelectDate(cell)}
                          sx={{
                            height: 42,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 2,
                            cursor: disabled ? 'default' : 'pointer',
                            bgcolor: isSelected ? '#3DAA96' : isToday ? '#E8F5F0' : 'transparent',
                            transition: 'all 0.15s',
                            '&:hover': disabled ? {} : { bgcolor: isSelected ? '#2B8A78' : '#D4EDE7' },
                          }}
                        >
                          <Typography sx={{
                            fontSize: '0.88rem',
                            fontWeight: isSelected ? 800 : isToday ? 700 : 400,
                            color: isSelected ? '#fff'
                              : !cell.inMonth ? '#C5DDD8'
                              : isPastDay || isSunday ? '#C5DDD8'
                              : isToday ? '#3DAA96'
                              : '#1A2E2A',
                          }}>
                            {cell.day}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Time slots */}
                  {selectedDate && (
                    <Box sx={{ mt: 3 }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 1, mb: 1.8 }}>
                        Horarios Disponibles — {DAYS_ES_LONG[selectedDate.getDay()]} {selectedDate.getDate()} {MONTHS_ES[selectedDate.getMonth()].slice(0, 3).toUpperCase()}
                      </Typography>

                      {slots.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No hay horarios disponibles para este día.
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1 }}>
                          {slots.map((slot) => {
                            const isSelTime = selectedTime === slot;
                            return (
                              <Button
                                key={slot}
                                onClick={() => setSelectedTime(slot)}
                                variant={isSelTime ? 'contained' : 'outlined'}
                                size="small"
                                startIcon={<AccessTimeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                sx={{
                                  borderRadius: 2,
                                  fontWeight: 600,
                                  fontSize: '0.82rem',
                                  borderColor: isSelTime ? '#3DAA96' : '#D4EDE7',
                                  bgcolor: isSelTime ? '#3DAA96' : '#fff',
                                  color: isSelTime ? '#fff' : '#4A6B60',
                                  '&:hover': {
                                    bgcolor: isSelTime ? '#2B8A78' : '#E8F5F0',
                                    borderColor: '#3DAA96',
                                  },
                                }}
                              >
                                {slot}
                              </Button>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

          </Grid>

          {/* ══ RIGHT — Summary sidebar ══════════════════════════════════════ */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>

              {/* Summary card */}
              <Card sx={{
                borderRadius: 3, border: '1.5px solid #B2DDD4',
                boxShadow: '0 4px 20px rgba(61,170,150,0.12)', mb: 2,
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontWeight: 800, color: '#3DAA96', fontSize: '1rem', mb: 2.5 }}>
                    Resumen de Cita
                  </Typography>

                  {/* FECHA Y HORA */}
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 20, color: '#3DAA96', mt: 0.3, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.8 }}>Fecha y Hora</Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: selectedDate && selectedTime ? '#1A2E2A' : '#C5DDD8' }}>
                        {selectedDate && selectedTime
                          ? `${DAYS_ES_LONG[selectedDate.getDay()]} ${selectedDate.getDate()} de ${MONTHS_ES[selectedDate.getMonth()]}, ${selectedTime}`
                          : 'Sin seleccionar'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* TERAPIA */}
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <SpaOutlinedIcon sx={{ fontSize: 20, color: '#3DAA96', mt: 0.3, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.8 }}>Terapia</Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: selectedService ? '#1A2E2A' : '#C5DDD8' }}>
                        {selectedService?.name ?? 'Sin seleccionar'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ESPECIALISTA */}
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
                    <PersonOutlinedIcon sx={{ fontSize: 20, color: '#3DAA96', mt: 0.3, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.8 }}>Especialista</Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1A2E2A' }}>
                        {specialist.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Precios */}
                  <Box sx={{ mb: 0.8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedService?.price ?? '—'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Total</Typography>
                      <Typography sx={{ fontWeight: 800, color: '#3DAA96', fontSize: '0.95rem' }}>
                        {selectedService?.price ?? '—'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Confirm button */}
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                    sx={{
                      bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 800, py: 1.4, fontSize: '0.95rem',
                      boxShadow: canConfirm ? '0 4px 16px rgba(61,170,150,0.35)' : 'none',
                      '&:hover': { bgcolor: '#2B8A78' },
                      '&.Mui-disabled': { bgcolor: '#C5DDD8', color: '#fff' },
                    }}
                  >
                    Confirmar Agendamiento
                  </Button>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5, lineHeight: 1.5, px: 1 }}>
                    Al confirmar, aceptas nuestras políticas de cancelación y términos de servicio médico.
                  </Typography>
                </CardContent>
              </Card>

              {/* Security notice */}
              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <ShieldOutlinedIcon sx={{ fontSize: 22, color: '#3DAA96', flexShrink: 0, mt: 0.2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, fontSize: '0.82rem' }}>
                      Tu información médica está protegida con estándares de seguridad clínica avanzada.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

            </Box>
          </Grid>

        </Grid>
      </Container>

      {/* ── Confirmation modal ─────────────────────────────────────────────── */}
      <Dialog
        open={confirmed}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
        sx={{
          '& .MuiBackdrop-root': {
            bgcolor: 'rgba(26,62,56,0.60)',
            backdropFilter: 'blur(6px)',
          },
        }}
      >
        {selectedService && selectedDate && selectedTime && (
          <Box sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
            {/* Circle check */}
            <Box
              sx={{
                width: 72, height: 72, borderRadius: '50%',
                bgcolor: '#3DAA96',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2.5,
                boxShadow: '0 8px 24px rgba(61,170,150,0.35)',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 38, color: '#fff' }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A', mb: 1 }}>
              ¡Cita Agendada!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3, maxWidth: 310, mx: 'auto' }}>
              Tu cita ha sido registrada exitosamente. Recibirás una confirmación del especialista pronto.
            </Typography>

            {/* Summary */}
            <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 3, p: 2.5, mb: 3, textAlign: 'left' }}>
              {[
                { Icon: CalendarMonthOutlinedIcon, label: 'FECHA Y HORA', value: `${formatDateLong(selectedDate)}, ${selectedTime}` },
                { Icon: SpaOutlinedIcon,           label: 'TERAPIA',      value: selectedService.name },
                { Icon: PersonOutlinedIcon,        label: 'ESPECIALISTA', value: specialist.name },
              ].map(({ Icon, label, value }) => (
                <Box key={label} sx={{ display: 'flex', gap: 1.5, mb: 2, '&:last-child': { mb: 0 } }}>
                  <Icon sx={{ fontSize: 20, color: '#3DAA96', mt: 0.2, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.9 }}>
                      {label}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1A2E2A' }}>
                      {value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Actions */}
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5, justifyContent: 'center' }}>
              <Button
                component={RouterLink}
                to="/appointments"
                variant="contained"
                disableElevation
                sx={{
                  bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, px: 3,
                  '&:hover': { bgcolor: '#2B8A78' },
                }}
              >
                Ver mis citas
              </Button>
              <Button
                onClick={() => {
                  setConfirmed(false);
                  setSelectedServiceId(null);
                  setSelectedDate(null);
                  setSelectedTime(null);
                }}
                variant="outlined"
                sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, fontWeight: 600 }}
              >
                Agendar otra cita
              </Button>
            </Stack>
          </Box>
        )}
      </Dialog>

      <Footer />
    </Box>
  );
}
