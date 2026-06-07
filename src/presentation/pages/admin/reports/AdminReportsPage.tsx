/**
 * AdminReportsPage — Módulo de reportes y estadísticas de la clínica.
 *
 * Carga datos desde GET /api/reports/summary y los visualiza con
 * MUI puro (sin librería de charts) usando barras de progreso y tarjetas.
 *
 * Ruta: /admin/reports
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, LinearProgress,
  Chip, Button, Skeleton, Alert, Divider, Tooltip,
} from '@mui/material';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import axiosClient from '../../../../infrastructure/http/axiosClient';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ServiceStat {
  serviceName: string;
  count: number;
  percentage: number;
}

interface Summary {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalPatients: number;
  totalServices: number;
  topServices: ServiceStat[];
  totalTherapyPlans: number;
  activeTherapyPlans: number;
  totalHealthRecords: number;
  occupancyRate: number;
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, color = '#3DAA96',
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
}) {
  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box sx={{ color, display: 'flex' }}>{icon}</Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: '#1A2E2A', lineHeight: 1 }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBar({
  label, count, total, color,
}: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A2E2A' }}>{label}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#1A2E2A' }}>{count}</Typography>
          <Chip label={`${pct}%`} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: `${color}22`, color }} />
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 7, borderRadius: 4, bgcolor: '#F0F6F4', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }}
      />
    </Box>
  );
}

// ── CSV Export ────────────────────────────────────────────────────────────────

function exportCSV(data: Summary) {
  const rows = [
    ['Métrica', 'Valor'],
    ['Total citas', data.totalAppointments],
    ['Citas pendientes', data.pendingAppointments],
    ['Citas confirmadas', data.confirmedAppointments],
    ['Citas completadas', data.completedAppointments],
    ['Citas canceladas', data.cancelledAppointments],
    ['Total pacientes', data.totalPatients],
    ['Total servicios', data.totalServices],
    ['Total planes de terapia', data.totalTherapyPlans],
    ['Planes activos', data.activeTherapyPlans],
    ['Historias clínicas', data.totalHealthRecords],
    ['Tasa de ocupación (%)', data.occupancyRate],
    [],
    ['Top Servicios', 'Citas', '% del total'],
    ...data.topServices.map(s => [s.serviceName, s.count, `${s.percentage}%`]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-clinica-${new Date().toISOString().substring(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await axiosClient.get('/reports/summary');
      setData(res);
      setLastUpdated(new Date());
    } catch {
      setError('No se pudo cargar el resumen de reportes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const STATUS_BARS = data ? [
    { label: 'Completadas', count: data.completedAppointments,  color: '#3DAA96' },
    { label: 'Confirmadas', count: data.confirmedAppointments,  color: '#27AE60' },
    { label: 'Pendientes',  count: data.pendingAppointments,    color: '#E67E22' },
    { label: 'Canceladas',  count: data.cancelledAppointments,  color: '#C0392B' },
  ] : [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <BarChartOutlinedIcon sx={{ color: '#3DAA96', fontSize: 24 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
              Reportes
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Estadísticas en tiempo real de tu clínica
            {lastUpdated && ` · Actualizado ${lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title="Actualizar datos">
            <Button
              variant="outlined" startIcon={<RefreshOutlinedIcon />}
              onClick={load} disabled={loading}
              sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, fontWeight: 700 }}
            >
              Actualizar
            </Button>
          </Tooltip>
          <Tooltip title="Exportar datos a Excel / CSV">
            <Button
              variant="contained" startIcon={<DownloadOutlinedIcon />}
              onClick={() => data && exportCSV(data)} disabled={!data || loading}
              sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
            >
              Exportar CSV
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* ── Tarjetas de resumen ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { icon: <CalendarMonthOutlinedIcon />, label: 'Total citas',     value: data?.totalAppointments ?? 0, sub: `${data?.completedAppointments ?? 0} completadas` },
          { icon: <PeopleOutlinedIcon />,        label: 'Pacientes',       value: data?.totalPatients ?? 0,      sub: 'usuarios activos' },
          { icon: <SpaOutlinedIcon />,           label: 'Planes activos',  value: data?.activeTherapyPlans ?? 0, sub: `de ${data?.totalTherapyPlans ?? 0} totales` },
          { icon: <MedicalServicesOutlinedIcon />, label: 'Historias clín.', value: data?.totalHealthRecords ?? 0, sub: 'registros HCE' },
        ].map((c, i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            {loading
              ? <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
              : <StatCard {...c} />
            }
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>

        {/* ── Distribución de citas por estado ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mb: 0.5 }}>
                Citas por estado
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2.5, display: 'block' }}>
                Distribución del total de {data?.totalAppointments ?? 0} citas registradas
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={40} />)}
                </Box>
              ) : data?.totalAppointments === 0 ? (
                <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  Sin citas registradas aún.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {STATUS_BARS.map(b => (
                    <StatusBar key={b.label} {...b} total={data?.totalAppointments ?? 1} />
                  ))}
                </Box>
              )}

              {data && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#F4FAF8', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Tasa de ocupación
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: '#3DAA96' }}>
                    {data.occupancyRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Citas completadas vs total
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Top servicios ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mb: 0.5 }}>
                Servicios más solicitados
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2.5, display: 'block' }}>
                Top 5 terapias por número de citas
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={44} />)}
                </Box>
              ) : !data?.topServices?.length ? (
                <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  Sin datos de servicios aún.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data.topServices.map((s, i) => (
                    <Box key={s.serviceName}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{
                            fontWeight: 800, color: '#fff', bgcolor: '#3DAA96',
                            width: 20, height: 20, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', flexShrink: 0,
                          }}>
                            {i + 1}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A2E2A' }}>
                            {s.serviceName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#1A2E2A' }}>{s.count}</Typography>
                          <Chip label={`${s.percentage}%`} size="small"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#E8F5F0', color: '#3DAA96' }} />
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={s.percentage}
                        sx={{ height: 6, borderRadius: 4, bgcolor: '#F0F6F4', '& .MuiLinearProgress-bar': { bgcolor: '#3DAA96', borderRadius: 4, opacity: 1 - i * 0.15 } }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Resumen rápido ── */}
        <Grid size={12}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mb: 2 }}>Resumen general</Typography>
              <Grid container spacing={0} divider={<Divider orientation="vertical" flexItem />}>
                {[
                  { label: 'Servicios disponibles',  value: data?.totalServices ?? 0 },
                  { label: 'Planes de terapia',      value: data?.totalTherapyPlans ?? 0 },
                  { label: 'Planes activos',          value: data?.activeTherapyPlans ?? 0 },
                  { label: 'Historias clínicas',      value: data?.totalHealthRecords ?? 0 },
                ].map((item, i) => (
                  <Grid key={i} size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: 'center', py: 1, px: 2 }}>
                      {loading
                        ? <Skeleton width={60} height={40} sx={{ mx: 'auto' }} />
                        : <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: '#1A2E2A' }}>{item.value}</Typography>
                      }
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}
