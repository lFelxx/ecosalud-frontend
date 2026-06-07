/**
 * DashboardPage — Panel personal del paciente autenticado.
 *
 * Muestra: próxima cita, historial de citas, planes de terapia activos
 * y accesos rápidos. Carga datos específicos del paciente vía ?patientId=
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent, Button, Chip,
  Avatar, Grid, LinearProgress, Divider, Skeleton, Alert,
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import Navbar from '../../components/common/Navbar';
import axiosClient from '../../../infrastructure/http/axiosClient';
import { useAuthContext } from '../../context/AuthContext';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Appointment {
  id: string;
  patientName: string;
  service: string;
  date: string;
  time: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
  notes?: string;
}

interface TherapyPlan {
  id: string;
  service: string;
  sessionsTotal: number;
  sessionsCompleted: number;
  startDate: string;
  status: 'ACTIVO' | 'PAUSADO' | 'COMPLETADO' | 'CANCELADO';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusChip(status: Appointment['status']) {
  const map = {
    PENDIENTE:  { label: 'Pendiente',  color: '#E67E22', bg: '#FEF9F0' },
    CONFIRMADA: { label: 'Confirmada', color: '#27AE60', bg: '#EAF7EF' },
    COMPLETADA: { label: 'Completada', color: '#3DAA96', bg: '#E8F5F0' },
    CANCELADA:  { label: 'Cancelada',  color: '#C0392B', bg: '#FDEEEC' },
  };
  const s = map[status] ?? map.PENDIENTE;
  return <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: '0.72rem' }} />;
}

function statusIcon(status: Appointment['status']) {
  if (status === 'CONFIRMADA') return <CheckCircleOutlinedIcon sx={{ color: '#27AE60', fontSize: 20 }} />;
  if (status === 'COMPLETADA') return <CheckCircleOutlinedIcon sx={{ color: '#3DAA96', fontSize: 20 }} />;
  if (status === 'CANCELADA')  return <CancelOutlinedIcon sx={{ color: '#C0392B', fontSize: 20 }} />;
  return <AccessTimeOutlinedIcon sx={{ color: '#E67E22', fontSize: 20 }} />;
}

function formatDate(date: string, time?: string) {
  if (!date) return '—';
  try {
    const d = new Date(date + (time ? `T${time}` : ''));
    return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      + (time ? ` · ${time.substring(0, 5)}` : '');
  } catch { return date; }
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapyPlans, setTherapyPlans] = useState<TherapyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.allSettled([
      axiosClient.get(`/appointments?patientId=${user.id}`),
      axiosClient.get(`/therapy-plans?patientId=${user.id}`),
    ]).then(([aptsRes, plansRes]) => {
      if (aptsRes.status === 'fulfilled') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAppointments(aptsRes.value.data.map((a: any) => ({
          id: String(a.id),
          patientName: a.patientName ?? '',
          service: a.serviceName ?? a.service ?? '—',
          date: a.appointmentDate ?? '',
          time: a.appointmentTime ?? '',
          status: a.status ?? 'PENDIENTE',
          notes: a.notes,
        })));
      }
      if (plansRes.status === 'fulfilled') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTherapyPlans(plansRes.value.data.map((p: any) => ({
          id: String(p.id),
          service: p.serviceName ?? '—',
          sessionsTotal: p.totalSessions ?? 0,
          sessionsCompleted: p.completedSessions ?? 0,
          startDate: p.startDate ?? '',
          status: p.status ?? 'ACTIVO',
        })));
      }
    }).catch(() => setError('No se pudieron cargar tus datos.')).finally(() => setLoading(false));
  }, [user?.id]);

  // Ordenar citas — próximas primero, luego historial
  const upcoming = appointments.filter(a => a.status === 'PENDIENTE' || a.status === 'CONFIRMADA')
    .sort((a, b) => a.date.localeCompare(b.date));
  const history  = appointments.filter(a => a.status === 'COMPLETADA' || a.status === 'CANCELADA')
    .slice(0, 5);
  const nextApt  = upcoming[0] ?? null;

  const activePlans = therapyPlans.filter(p => p.status === 'ACTIVO');

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>

        {/* Saludo */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
            Hola, {user?.name?.split(' ')[0] ?? 'bienvenido/a'} 👋
          </Typography>
          <Typography color="text.secondary">
            Este es tu panel personal de salud en Ecosalud.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>

          {/* ── Próxima cita ── */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarMonthOutlinedIcon sx={{ color: '#3DAA96', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.95rem' }}>
                    Próxima cita
                  </Typography>
                </Box>

                {loading ? (
                  <Skeleton variant="rounded" height={100} />
                ) : nextApt ? (
                  <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 2, p: 2.5, border: '1px solid #C5DDD8' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1.05rem' }}>
                        {nextApt.service}
                      </Typography>
                      {statusChip(nextApt.status)}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      📅 {formatDate(nextApt.date, nextApt.time)}
                    </Typography>
                    {nextApt.notes && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        📝 {nextApt.notes}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      No tienes citas próximas programadas.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddOutlinedIcon />}
                      onClick={() => navigate('/appointments/book')}
                      sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
                    >
                      Agendar cita
                    </Button>
                  </Box>
                )}

                {nextApt && (
                  <Button
                    fullWidth variant="outlined"
                    endIcon={<AddOutlinedIcon />}
                    onClick={() => navigate('/appointments/book')}
                    sx={{ mt: 2, borderColor: '#C5DDD8', color: '#3DAA96', borderRadius: 2, fontWeight: 700 }}
                  >
                    Agendar nueva cita
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ── Accesos rápidos ── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.95rem', mb: 2 }}>
                  Accesos rápidos
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {[
                    { label: 'Mis citas',          icon: <CalendarMonthOutlinedIcon />,    to: '/appointments' },
                    { label: 'Nuestros servicios', icon: <SpaOutlinedIcon />,              to: '/services' },
                    { label: 'Blog de salud',      icon: <MedicalServicesOutlinedIcon />,  to: '/publications' },
                    { label: 'Mi perfil',          icon: <PersonOutlinedIcon />,           to: '/profile' },
                    { label: 'Mis consentimientos',icon: <GavelOutlinedIcon />,             to: '/consents' },
                  ].map(item => (
                    <Box
                      key={item.to}
                      component={RouterLink}
                      to={item.to}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        p: 1.5, borderRadius: 2, bgcolor: '#F4FAF8', border: '1px solid #E4F0ED',
                        textDecoration: 'none', color: '#1A2E2A',
                        transition: 'all 0.18s',
                        '&:hover': { bgcolor: '#E8F5F0', borderColor: '#3DAA96' },
                      }}
                    >
                      <Box sx={{ color: '#3DAA96', display: 'flex' }}>{item.icon}</Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', flex: 1 }}>{item.label}</Typography>
                      <ArrowForwardOutlinedIcon sx={{ fontSize: 16, color: '#9DBFBA' }} />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ── Planes de terapia activos ── */}
          {(loading || activePlans.length > 0) && (
            <Grid size={12}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.95rem' }}>
                      Planes de terapia activos
                    </Typography>
                  </Box>
                  {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[1, 2].map(i => <Skeleton key={i} variant="rounded" height={60} />)}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {activePlans.map(plan => {
                        const pct = plan.sessionsTotal > 0
                          ? Math.round((plan.sessionsCompleted / plan.sessionsTotal) * 100)
                          : 0;
                        return (
                          <Box key={plan.id}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                              <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.9rem' }}>
                                {plan.service}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#5A7A74', fontWeight: 600 }}>
                                {plan.sessionsCompleted}/{plan.sessionsTotal} sesiones ({pct}%)
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 8, borderRadius: 4,
                                bgcolor: '#E4F0ED',
                                '& .MuiLinearProgress-bar': { bgcolor: '#3DAA96', borderRadius: 4 },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              Iniciado: {plan.startDate ? new Date(plan.startDate).toLocaleDateString('es-CO') : '—'}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* ── Historial de citas ── */}
          <Grid size={12}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutlinedIcon sx={{ color: '#3DAA96', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.95rem' }}>
                      Historial de citas
                    </Typography>
                  </Box>
                  <Button
                    size="small" endIcon={<ArrowForwardOutlinedIcon />}
                    onClick={() => navigate('/appointments')}
                    sx={{ color: '#3DAA96', fontWeight: 700, textTransform: 'none' }}
                  >
                    Ver todas
                  </Button>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={48} />)}
                  </Box>
                ) : history.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Aún no tienes citas en tu historial.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {history.map((apt, idx) => (
                      <Box key={apt.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: '#E8F5F0' }}>
                            {statusIcon(apt.status)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#1A2E2A' }}>
                              {apt.service}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(apt.date, apt.time)}
                            </Typography>
                          </Box>
                          {statusChip(apt.status)}
                        </Box>
                        {idx < history.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}
