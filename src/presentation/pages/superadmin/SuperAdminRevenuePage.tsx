/**
 * SuperAdminRevenuePage — Dashboard de ingresos de la plataforma Ecosalud.
 *
 * Ruta: /superadmin/revenue
 * Solo accesible para el super-administrador.
 *
 * Métricas:
 *   - MRR / ARR / MRR potencial
 *   - Distribución de tenants por estado y plan
 *   - Tasa de conversión trial → paid
 *   - Gráfica de barras: nuevas clínicas por mes (últimos 6 meses)
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  CircularProgress, Alert, Tooltip, Divider, IconButton,
} from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import axiosClient from '../../../infrastructure/http/axiosClient';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface MonthlyGrowth {
  month:      string;
  newClinics: number;
  mrrCOP:     number;
}

interface RevenueData {
  mrrCOP:          number;
  arrCOP:          number;
  potentialMrrCOP: number;
  activeTenants:   number;
  trialTenants:    number;
  overdueTenants:  number;
  exemptTenants:   number;
  totalTenants:    number;
  starterActive:   number;
  proActive:       number;
  clinicActive:    number;
  founderCount:    number;
  conversionRate:  number;
  last6Months:     MonthlyGrowth[];
}

// ── Helpers de formato ─────────────────────────────────────────────────────────

function formatCOP(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(value);
}

function formatCOPFull(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(value);
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, color, icon, tooltip,
}: {
  label:    string;
  value:    string;
  sub?:     string;
  color:    string;
  icon:     React.ReactNode;
  tooltip?: string;
}) {
  return (
    <Tooltip title={tooltip ?? ''} placement="top" arrow>
      <Card sx={{
        borderRadius: 3, border: '1px solid #E4F0ED',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%',
      }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: `${color}18`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              '& svg': { fontSize: 20, color },
            }}>
              {icon}
            </Box>
          </Box>
          <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A2E2A', lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#5A7A74', mt: 0.5 }}>
            {label}
          </Typography>
          {sub && (
            <Typography variant="caption" sx={{ color, fontWeight: 700, display: 'block', mt: 0.5 }}>
              {sub}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Tooltip>
  );
}

/** Barra de distribución de tenants por estado */
function StatusBar({ data }: { data: RevenueData }) {
  const segments = [
    { label: 'Activos',  value: data.activeTenants,  color: '#27AE60' },
    { label: 'Trial',    value: data.trialTenants,    color: '#3DAA96' },
    { label: 'Vencidos', value: data.overdueTenants,  color: '#E67E22' },
    { label: 'Exentos',  value: data.exemptTenants,   color: '#9DBFBA' },
  ].filter(s => s.value > 0);

  const total = data.totalTenants || 1;

  return (
    <Box>
      <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', mb: 1.5 }}>
        {segments.map((seg) => (
          <Box
            key={seg.label}
            sx={{ width: `${(seg.value / total) * 100}%`, bgcolor: seg.color, transition: 'width 0.6s' }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {segments.map((seg) => (
          <Box key={seg.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: seg.color, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#5A7A74', fontWeight: 600 }}>
              {seg.label}: <strong style={{ color: '#1A2E2A' }}>{seg.value}</strong>
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Gráfica de barras verticales — nuevas clínicas por mes */
function MonthlyBarChart({ data }: { data: MonthlyGrowth[] }) {
  const maxClinics = Math.max(...data.map(d => d.newClinics), 1);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 140, pt: 1 }}>
      {data.map((m) => {
        const pct = Math.round((m.newClinics / maxClinics) * 100);
        return (
          <Tooltip
            key={m.month}
            title={`${m.newClinics} clínica${m.newClinics !== 1 ? 's' : ''}${m.mrrCOP > 0 ? ` · ${formatCOPFull(m.mrrCOP)} MRR` : ''}`}
            placement="top"
            arrow
          >
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              {/* Valor */}
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#3DAA96', minHeight: 16 }}>
                {m.newClinics > 0 ? m.newClinics : ''}
              </Typography>
              {/* Barra */}
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 100 }}>
                <Box sx={{
                  width: '100%',
                  height: `${Math.max(pct, m.newClinics > 0 ? 8 : 0)}%`,
                  bgcolor: m.newClinics > 0 ? '#3DAA96' : '#E4F0ED',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#2B8A78', filter: 'brightness(1.05)' },
                }} />
              </Box>
              {/* Etiqueta mes */}
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 600, color: '#9DBFBA',
                textAlign: 'center', whiteSpace: 'nowrap',
              }}>
                {m.month.split(' ')[0]}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

/** Fila de distribución por plan */
function PlanRow({
  plan, count, price, color, active,
}: {
  plan: string; count: number; price: string; color: string; active: number;
}) {
  const pct = active > 0 ? Math.min(100, Math.round((count / active) * 100)) : 0;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A2E2A' }}>{plan}</Typography>
          <Typography variant="caption" sx={{ color: '#9DBFBA' }}>{price}</Typography>
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color }}>
          {count} <Typography component="span" variant="caption" sx={{ color: '#9DBFBA', fontWeight: 400 }}>
            clínica{count !== 1 ? 's' : ''}
          </Typography>
        </Typography>
      </Box>
      <Box sx={{ height: 4, borderRadius: 2, bgcolor: '#E4F0ED', overflow: 'hidden' }}>
        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: color, borderRadius: 2, transition: 'width 0.6s' }} />
      </Box>
    </Box>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function SuperAdminRevenuePage() {
  const navigate   = useNavigate();
  const [data,     setData]     = useState<RevenueData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get<RevenueData>('/platform/revenue');
      setData(res.data);
    } catch {
      setError('No se pudo cargar el dashboard de ingresos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F6F4', p: { xs: 2, md: 3 } }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton size="small" onClick={() => navigate('/superadmin')}
            sx={{ bgcolor: '#fff', border: '1px solid #E4F0ED', '&:hover': { bgcolor: '#F4FAF8' } }}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpOutlinedIcon sx={{ color: '#3DAA96', fontSize: 22 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
                Dashboard de Ingresos
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Métricas financieras en tiempo real · Ecosalud Market
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={load} disabled={loading}
          sx={{ bgcolor: '#fff', border: '1px solid #E4F0ED', '&:hover': { bgcolor: '#F4FAF8' } }}>
          <RefreshOutlinedIcon sx={{ fontSize: 18, color: '#3DAA96' }} />
        </IconButton>
      </Box>

      {/* ── Error ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* ── Loading ── */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#3DAA96' }} />
        </Box>
      )}

      {data && !loading && (
        <>
          {/* ── KPIs principales ── */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="MRR (Mensual)"
                value={formatCOP(data.mrrCOP)}
                sub={data.mrrCOP === 0 ? 'Sin ingresos aún' : `${formatCOP(data.potentialMrrCOP)} potencial`}
                color="#3DAA96"
                icon={<TrendingUpOutlinedIcon />}
                tooltip={`Ingresos recurrentes mensuales reales: ${formatCOPFull(data.mrrCOP)}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="ARR (Anual)"
                value={formatCOP(data.arrCOP)}
                sub="MRR × 12"
                color="#1A7A5E"
                icon={<TrendingUpOutlinedIcon />}
                tooltip={`Ingresos recurrentes anuales proyectados: ${formatCOPFull(data.arrCOP)}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Clínicas activas"
                value={String(data.totalTenants)}
                sub={`${data.activeTenants} pagando · ${data.trialTenants} en trial`}
                color="#5A5FC8"
                icon={<StorefrontOutlinedIcon />}
                tooltip="Total de clínicas registradas y activas en la plataforma"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Conversión trial→pago"
                value={`${data.conversionRate}%`}
                sub={data.overdueTenants > 0 ? `${data.overdueTenants} vencidas sin pagar` : 'Sin churn aún'}
                color={data.conversionRate >= 70 ? '#27AE60' : data.conversionRate >= 40 ? '#E67E22' : '#C0392B'}
                icon={<PeopleOutlinedIcon />}
                tooltip="Porcentaje de clínicas que convierten de trial a suscripción paga"
              />
            </Grid>
          </Grid>

          {/* ── Fila central: distribución + gráfica mensual ── */}
          <Grid container spacing={2} sx={{ mb: 3 }}>

            {/* Estado de tenants */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontWeight: 800, color: '#1A2E2A', mb: 2, fontSize: '0.95rem' }}>
                    Estado de cuentas
                  </Typography>

                  <StatusBar data={data} />

                  <Divider sx={{ my: 2 }} />

                  {/* Chips por estado */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      { label: 'Activas (pagando)', count: data.activeTenants, color: '#27AE60', bg: '#EAF7EE', icon: <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} /> },
                      { label: 'En trial (14 días)', count: data.trialTenants, color: '#3DAA96', bg: '#E8F5F0', icon: <HourglassEmptyOutlinedIcon sx={{ fontSize: 14 }} /> },
                      { label: 'Trial vencido', count: data.overdueTenants, color: '#E67E22', bg: '#FEF3E8', icon: <LockOutlinedIcon sx={{ fontSize: 14 }} /> },
                      { label: 'Fundadoras (exentas)', count: data.exemptTenants, color: '#9DBFBA', bg: '#F0F6F4', icon: <StarOutlinedIcon sx={{ fontSize: 14 }} /> },
                    ].map(({ label, count, color, bg, icon }) => (
                      <Box key={label} sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        bgcolor: bg, borderRadius: 1.5, px: 1.5, py: 0.8,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, '& svg': { color } }}>
                          {icon}
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A2E2A' }}>
                            {label}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color }}>
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Crecimiento mensual */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.95rem' }}>
                      Nuevas clínicas por mes
                    </Typography>
                    <Chip
                      label="Últimos 6 meses"
                      size="small"
                      sx={{ bgcolor: '#E8F5F0', color: '#1A7A5E', fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Pasa el cursor sobre cada barra para ver el detalle
                  </Typography>
                  <MonthlyBarChart data={data.last6Months} />

                  {/* Totales del período */}
                  <Box sx={{
                    display: 'flex', gap: 3, mt: 2, pt: 2,
                    borderTop: '1px solid #E4F0ED', flexWrap: 'wrap',
                  }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#9DBFBA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Total nuevas
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1.1rem' }}>
                        {data.last6Months.reduce((a, m) => a + m.newClinics, 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#9DBFBA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        MRR generado
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: '#3DAA96', fontSize: '1.1rem' }}>
                        {formatCOP(data.last6Months.reduce((a, m) => a + m.mrrCOP, 0))}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ── Distribución por plan ── */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontWeight: 800, color: '#1A2E2A', mb: 2, fontSize: '0.95rem' }}>
                    Distribución por plan (clínicas activas)
                  </Typography>

                  {data.activeTenants === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3, color: '#9DBFBA' }}>
                      <SpaOutlinedIcon sx={{ fontSize: 36, mb: 1, opacity: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Aún no hay clínicas en estado ACTIVE
                      </Typography>
                      <Typography variant="caption">
                        Aparecerán aquí cuando completen su suscripción
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <PlanRow plan="STARTER" count={data.starterActive} price="$119k/mes"
                        color="#3DAA96" active={data.activeTenants} />
                      <PlanRow plan="PRO"     count={data.proActive}     price="$324k/mes"
                        color="#5A5FC8" active={data.activeTenants} />
                      <PlanRow plan="CLINIC"  count={data.clinicActive}  price="$817k/mes"
                        color="#1A7A5E" active={data.activeTenants} />
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* MRR potencial */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontWeight: 800, color: '#1A2E2A', mb: 2, fontSize: '0.95rem' }}>
                    Oportunidad de ingresos
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      {
                        label: 'MRR actual',
                        value: formatCOPFull(data.mrrCOP),
                        color: '#3DAA96',
                        bg:    '#E8F5F0',
                        sub:   `${data.activeTenants} clínicas pagando`,
                      },
                      {
                        label: 'MRR potencial (todos los trials)',
                        value: formatCOPFull(data.potentialMrrCOP),
                        color: '#5A5FC8',
                        bg:    '#F0F0FF',
                        sub:   `+${data.trialTenants} clínicas en trial`,
                      },
                      {
                        label: 'ARR proyectado (actual × 12)',
                        value: formatCOPFull(data.arrCOP),
                        color: '#1A7A5E',
                        bg:    '#E0F4EE',
                        sub:   'Si la retención se mantiene',
                      },
                    ].map(({ label, value, color, bg, sub }) => (
                      <Box key={label} sx={{ bgcolor: bg, borderRadius: 2, p: 2 }}>
                        <Typography variant="caption" sx={{
                          fontWeight: 700, color: '#9DBFBA',
                          textTransform: 'uppercase', letterSpacing: 0.5,
                        }}>
                          {label}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color, mt: 0.3 }}>
                          {value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#5A7A74' }}>
                          {sub}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
