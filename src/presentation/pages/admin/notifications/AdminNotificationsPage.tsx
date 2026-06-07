/**
 * AdminNotificationsPage — Panel de recordatorios automáticos de cita.
 *
 * Ruta: /admin/notifications
 * Solo accesible para ADMIN del tenant.
 *
 * Muestra:
 *  - Estado de los canales (Email, SMS, WhatsApp)
 *  - Lista de citas próximas (7 días) que recibirán recordatorio
 *  - Información de configuración (cron)
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Tooltip,
  CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Divider,
} from '@mui/material';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import axiosClient from '../../../../infrastructure/http/axiosClient';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface UpcomingReminder {
  appointmentId:  number;
  patientName:    string;
  patientEmail:   string;
  patientHasPhone: boolean;
  date:           string;
  time:           string;
  status:         string;
  emailWillBeSent: boolean;
  smsWillBeSent:  boolean;
}

interface NotificationStatus {
  emailEnabled:          boolean;
  smsEnabled:            boolean;
  whatsAppEnabled:       boolean;
  reminderCron:          string;
  reminderCronDescription: string;
  tomorrowCount:         number;
  next7DaysCount:        number;
  upcoming:              UpcomingReminder[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function StatusCard({
  label, enabled, icon, description, configHint,
}: {
  label: string;
  enabled: boolean;
  icon: React.ReactNode;
  description: string;
  configHint: string;
}) {
  return (
    <Card sx={{
      borderRadius: 3,
      border: `1px solid ${enabled ? '#E4F0ED' : '#F5E6E6'}`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: 2,
            bgcolor: enabled ? '#E8F5F0' : '#FDE8E8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            '& svg': { fontSize: 20, color: enabled ? '#3DAA96' : '#C0392B' },
          }}>
            {icon}
          </Box>
          <Chip
            size="small"
            icon={enabled
              ? <CheckCircleOutlinedIcon sx={{ fontSize: '14px !important' }} />
              : <ErrorOutlineOutlinedIcon sx={{ fontSize: '14px !important' }} />}
            label={enabled ? 'Activo' : 'No configurado'}
            sx={{
              bgcolor: enabled ? '#E8F5F0' : '#FDE8E8',
              color: enabled ? '#27AE60' : '#C0392B',
              fontWeight: 700, fontSize: '0.7rem',
            }}
          />
        </Box>
        <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.95rem', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ color: '#5A7A74', lineHeight: 1.7, display: 'block' }}>
          {description}
        </Typography>
        {!enabled && (
          <Typography variant="caption" sx={{
            color: '#E67E22', fontFamily: 'monospace', display: 'block',
            mt: 1, bgcolor: '#FFF8E7', px: 1, py: 0.5, borderRadius: 1,
            fontSize: '0.68rem',
          }}>
            {configHint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ sent }: { sent: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
      {sent
        ? <CheckCircleOutlinedIcon sx={{ color: '#27AE60', fontSize: 14 }} />
        : <ErrorOutlineOutlinedIcon sx={{ color: '#9DBFBA', fontSize: 14 }} />}
      <Typography variant="caption" sx={{ color: sent ? '#27AE60' : '#9DBFBA', fontWeight: 600 }}>
        {sent ? 'Sí' : 'No'}
      </Typography>
    </Box>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function AdminNotificationsPage() {
  const [data,    setData]    = useState<NotificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get<NotificationStatus>('/notifications/status');
      setData(res.data);
    } catch {
      setError('No se pudo cargar el estado de notificaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsActiveOutlinedIcon sx={{ color: '#3DAA96', fontSize: 24 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
            Recordatorios automáticos
          </Typography>
        </Box>
        <IconButton onClick={load} disabled={loading}
          sx={{ bgcolor: '#F4FAF8', border: '1px solid #E4F0ED', '&:hover': { bgcolor: '#E8F5F0' } }}>
          <RefreshOutlinedIcon sx={{ fontSize: 18, color: '#3DAA96' }} />
        </IconButton>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        El sistema envía automáticamente recordatorios a los pacientes 24h antes de su cita.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#3DAA96' }} /></Box>}

      {data && !loading && (
        <>
          {/* ── Canales de notificación ── */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatusCard
                label="Email (Resend)"
                enabled={data.emailEnabled}
                icon={<EmailOutlinedIcon />}
                description="Envía emails de recordatorio con la plantilla de Ecosalud. Gratuito hasta 3.000 emails/mes."
                configHint="Configura: RESEND_API_KEY=re_..."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatusCard
                label="SMS (Twilio)"
                enabled={data.smsEnabled}
                icon={<SmsOutlinedIcon />}
                description="Envía SMS al número de teléfono del paciente si está registrado."
                configHint="Configura: TWILIO_ACCOUNT_SID · TWILIO_AUTH_TOKEN · TWILIO_FROM_NUMBER"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatusCard
                label="WhatsApp (Twilio)"
                enabled={data.whatsAppEnabled}
                icon={<WhatsAppIcon />}
                description="Envía mensaje WhatsApp (mayor tasa de apertura que SMS). Requiere aprobación de Meta Business."
                configHint="Configura: TWILIO_WHATSAPP_FROM=whatsapp:+14155238886"
              />
            </Grid>
          </Grid>

          {/* ── Programación del job ── */}
          <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.05)', mb: 4 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ScheduleOutlinedIcon sx={{ color: '#3DAA96', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.95rem' }}>
                  Programación del job
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Frecuencia
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mt: 0.3 }}>
                    {data.reminderCronDescription}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Expresión cron
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#3DAA96', mt: 0.3 }}>
                    {data.reminderCron}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Personalizar
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5A7A74', display: 'block', mt: 0.3, fontFamily: 'monospace' }}>
                    REMINDER_CRON="0 30 8 * * *"
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ── KPIs rápidos ── */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Mañana', value: data.tomorrowCount, color: '#3DAA96', bg: '#E8F5F0' },
              { label: 'Próximos 7 días', value: data.next7DaysCount, color: '#5A5FC8', bg: '#EEEEF8' },
            ].map(s => (
              <Box key={s.label} sx={{
                bgcolor: s.bg, borderRadius: 2, px: 2.5, py: 1.2,
                border: `1px solid ${s.color}25`,
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: s.color }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* ── Tabla de próximos recordatorios ── */}
          {data.upcoming.length === 0 ? (
            <Box sx={{
              textAlign: 'center', py: 6, bgcolor: '#F4FAF8',
              borderRadius: 3, border: '1px dashed #B5D5CC',
            }}>
              <NotificationsActiveOutlinedIcon sx={{ fontSize: 40, color: '#9DBFBA', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: '#5A7A74' }}>
                No hay citas en los próximos 7 días
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Los recordatorios aparecerán aquí cuando haya citas agendadas.
              </Typography>
            </Box>
          ) : (
            <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E4F0ED' }}>
                <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.95rem' }}>
                  Próximos recordatorios — 7 días
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FDFB' }}>
                      {['Paciente', 'Fecha', 'Hora', 'Estado', '📧 Email', '📱 SMS/WA'].map(h => (
                        <TableCell key={h} sx={{
                          fontWeight: 700, color: '#5A7A74',
                          fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5,
                        }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.upcoming.map(r => (
                      <TableRow key={r.appointmentId} sx={{
                        '&:hover': { bgcolor: '#F8FDFB' },
                        '&:last-child td': { border: 0 },
                      }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonOutlinedIcon sx={{ fontSize: 16, color: '#9DBFBA' }} />
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A2E2A' }}>
                                {r.patientName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {r.patientEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                            {new Date(r.date + 'T12:00:00').toLocaleDateString('es-CO', {
                              weekday: 'short', day: 'numeric', month: 'short',
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#3DAA96' }}>
                            {r.time}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={r.status}
                            size="small"
                            sx={{
                              bgcolor: r.status === 'CONFIRMADA' ? '#E8F5F0' : '#FFF8E7',
                              color: r.status === 'CONFIRMADA' ? '#27AE60' : '#E67E22',
                              fontWeight: 700, fontSize: '0.65rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={r.emailWillBeSent ? r.patientEmail : 'Email no configurado'}>
                            <Box><StatusBadge sent={r.emailWillBeSent} /></Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={
                            r.smsWillBeSent
                              ? 'Tiene teléfono + Twilio configurado'
                              : r.patientHasPhone
                              ? 'Tiene teléfono pero Twilio no está configurado'
                              : 'Sin número de teléfono registrado'
                          }>
                            <Box><StatusBadge sent={r.smsWillBeSent} /></Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider />
              <Box sx={{ px: 2.5, py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {data.upcoming.length} cita{data.upcoming.length !== 1 ? 's' : ''} en los próximos 7 días
                  · Los recordatorios se envían a las {data.reminderCronDescription.replace('Todos los días a las ', '')}
                </Typography>
              </Box>
            </Card>
          )}

          {/* ── Info sobre el teléfono ── */}
          {data.upcoming.some(r => !r.patientHasPhone) && (
            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              <strong>Agregar teléfono a los pacientes:</strong> Edita el perfil de cada paciente en
              "Usuarios" y agrega su número en formato internacional (p.ej. +573001234567)
              para que reciban recordatorios por SMS/WhatsApp.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
}
