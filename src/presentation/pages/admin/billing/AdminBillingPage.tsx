/**
 * AdminBillingPage — Panel de suscripción y facturación de la clínica.
 *
 * Ruta: /admin/billing
 * Conectado a:
 *   GET  /api/billing/status   — estado actual del plan
 *   POST /api/billing/checkout — genera parámetros de PayU y redirige
 */

import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  CircularProgress, Alert, Divider, Switch, FormControlLabel, Skeleton,
} from '@mui/material';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import axiosClient from '../../../../infrastructure/http/axiosClient';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface BillingStatus {
  plan: string;
  planLabel: string;
  billingStatus: string;
  billingStatusLabel: string;
  accountType: string;
  monthlyPriceCOP: number;
  annualPriceCOP: number;
  clinicName: string;
  ownerEmail: string;
}

interface CheckoutResponse {
  actionUrl: string;
  fields: Record<string, string>;
  referenceCode: string;
  amountCOP: number;
  description: string;
}

// ── Planes disponibles para contratar ────────────────────────────────────────

const PLANS = [
  {
    id:          'STARTER',
    name:        'Starter',
    icon:        <SpaOutlinedIcon sx={{ fontSize: 26 }} />,
    color:       '#5A7A74',
    monthlyUSD:  29,
    annualUSD:   23,
    monthlyCOP:  '119.000',
    annualCOP:   '1.142.400',
    limits:      '1 especialista · 50 citas/mes · 30 pacientes',
    highlight:   false,
  },
  {
    id:          'PRO',
    name:        'Pro',
    icon:        <RocketLaunchOutlinedIcon sx={{ fontSize: 26 }} />,
    color:       '#3DAA96',
    monthlyUSD:  79,
    annualUSD:   63,
    monthlyCOP:  '324.000',
    annualCOP:   '3.110.400',
    limits:      '3 especialistas · 300 citas/mes · 200 pacientes',
    highlight:   true,
  },
  {
    id:          'CLINIC',
    name:        'Clínica',
    icon:        <BusinessCenterOutlinedIcon sx={{ fontSize: 26 }} />,
    color:       '#1A4A3E',
    monthlyUSD:  199,
    annualUSD:   159,
    monthlyCOP:  '817.000',
    annualCOP:   '7.843.200',
    limits:      'Especialistas, citas y pacientes ilimitados',
    highlight:   false,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    ACTIVE:    { label: 'Al día',          color: '#27AE60', bg: '#EAF7EF' },
    PENDING:   { label: 'Pago pendiente',  color: '#E67E22', bg: '#FEF9F0' },
    SUSPENDED: { label: 'Suspendido',      color: '#C0392B', bg: '#FDEEEC' },
    EXEMPT:    { label: 'Exento',          color: '#3DAA96', bg: '#E8F5F0' },
    CANCELLED: { label: 'Cancelado',       color: '#7F8C8D', bg: '#F5F5F5' },
  };
  const s = map[status] ?? map.ACTIVE;
  return (
    <Chip label={s.label} size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: '0.78rem' }} />
  );
}

function copFormat(n: number) {
  return '$' + n.toLocaleString('es-CO');
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function AdminBillingPage() {
  const [status,  setStatus]  = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [annual,  setAnnual]  = useState(false);

  // Estado del checkout
  const [checkingOut,   setCheckingOut]   = useState<string | null>(null); // planId en proceso
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    axiosClient.get<BillingStatus>('/billing/status')
      .then(r => setStatus(r.data))
      .catch(() => setError('No se pudo cargar el estado de suscripción.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (planId: string) => {
    setCheckingOut(planId);
    setCheckoutError('');
    try {
      const { data } = await axiosClient.post<CheckoutResponse>('/billing/checkout', {
        plan: planId,
        annual,
      });

      // Crear y enviar formulario a PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.actionUrl;
      Object.entries(data.fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type  = 'hidden';
        input.name  = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      // La página redirige → no es necesario resetear estado

    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCheckoutError(msg ?? 'Error al iniciar el pago. Intenta de nuevo.');
      setCheckingOut(null);
    }
  };

  if (loading) return (
    <Box>
      <Skeleton variant="rounded" height={120} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {[1, 2, 3].map(i => <Grid key={i} size={{ xs: 12, md: 4 }}><Skeleton variant="rounded" height={280} /></Grid>)}
      </Grid>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <CreditCardOutlinedIcon sx={{ color: '#3DAA96', fontSize: 24 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
          Suscripción y facturación
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Gestiona el plan de tu clínica. Todos los pagos son procesados de forma segura por PayU Colombia.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {checkoutError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setCheckoutError('')}>
          {checkoutError}
        </Alert>
      )}

      {/* Estado actual */}
      {status && (
        <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mb: 2 }}>
              Tu suscripción actual
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA',
                  textTransform: 'uppercase', letterSpacing: 0.5 }}>Plan activo</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2E2A' }}>
                  {status.planLabel}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA',
                  textTransform: 'uppercase', letterSpacing: 0.5 }}>Estado</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip status={status.billingStatus} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA',
                  textTransform: 'uppercase', letterSpacing: 0.5 }}>Clínica</Typography>
                <Typography sx={{ fontWeight: 600, color: '#1A2E2A', fontSize: '0.9rem' }}>
                  {status.clinicName}
                </Typography>
                <Typography variant="caption" color="text.secondary">{status.ownerEmail}</Typography>
              </Grid>
            </Grid>

            {status.billingStatus === 'PENDING' && (
              <Alert severity="warning" icon={<WarningAmberOutlinedIcon />}
                sx={{ mt: 2, borderRadius: 2 }}>
                Tu pago está pendiente. Suscríbete a continuación para mantener el acceso completo.
              </Alert>
            )}
            {status.billingStatus === 'EXEMPT' && (
              <Alert severity="success" icon={<CheckCircleOutlinedIcon />}
                sx={{ mt: 2, borderRadius: 2 }}>
                Eres un tenant fundador con acceso ilimitado. No se requiere pago.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selector mensual / anual */}
      {status?.accountType !== 'FOUNDER' && status?.billingStatus !== 'EXEMPT' && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                     mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography sx={{ fontWeight: 700, color: '#1A2E2A' }}>
              Elige tu plan
            </Typography>
            <FormControlLabel
              control={
                <Switch checked={annual} onChange={e => setAnnual(e.target.checked)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3DAA96' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3DAA96' } }} />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A2E2A' }}>
                    Anual
                  </Typography>
                  {annual && (
                    <Chip label="Ahorra 20%" size="small"
                      sx={{ bgcolor: '#FFD700', color: '#1A3E38', fontWeight: 800, fontSize: '0.65rem' }} />
                  )}
                </Box>
              }
            />
          </Box>

          {/* Tarjetas de planes */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {PLANS.map(plan => {
              const isCurrent  = status?.plan === plan.id;
              const isLoading  = checkingOut === plan.id;

              return (
                <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
                  <Card sx={{
                    borderRadius: 3, height: '100%',
                    border: plan.highlight
                      ? `2px solid ${plan.color}`
                      : isCurrent ? `2px solid #3DAA96` : '1px solid #E4F0ED',
                    boxShadow: plan.highlight ? '0 8px 24px rgba(61,170,150,0.15)' : 'none',
                    transform: plan.highlight ? 'translateY(-4px)' : 'none',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}>
                    {plan.highlight && (
                      <Box sx={{
                        position: 'absolute', top: -12, left: '50%',
                        transform: 'translateX(-50%)', bgcolor: plan.color,
                        color: '#fff', px: 2, py: 0.3, borderRadius: '999px',
                        fontSize: '0.68rem', fontWeight: 800, whiteSpace: 'nowrap',
                      }}>
                        Más popular
                      </Box>
                    )}
                    {isCurrent && (
                      <Box sx={{
                        position: 'absolute', top: -12, right: 16,
                        bgcolor: '#E8F5F0', border: '1px solid #3DAA96',
                        color: '#3DAA96', px: 1.5, py: 0.3, borderRadius: '999px',
                        fontSize: '0.68rem', fontWeight: 800,
                      }}>
                        Plan actual
                      </Box>
                    )}

                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ color: plan.color, mb: 1 }}>{plan.icon}</Box>
                      <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1.1rem', mb: 0.5 }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        {plan.limits}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: plan.color, lineHeight: 1 }}>
                          ${annual ? plan.annualUSD : plan.monthlyUSD} <Box component="span" sx={{ fontSize: '0.9rem', color: '#9DBFBA', fontWeight: 400 }}>USD/mes</Box>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9DBFBA' }}>
                          ≈ ${annual ? plan.annualCOP : plan.monthlyCOP} COP · {annual ? 'facturado anualmente' : 'facturado mensualmente'}
                        </Typography>
                        {annual && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#3DAA96', fontWeight: 600 }}>
                            Total año: {copFormat(
                              plan.id === 'STARTER' ? 1142400 : plan.id === 'PRO' ? 3110400 : 7843200
                            )} COP
                          </Typography>
                        )}
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Button
                        fullWidth variant={plan.highlight || isCurrent ? 'contained' : 'outlined'}
                        disabled={isLoading || checkingOut !== null}
                        onClick={() => handleCheckout(plan.id)}
                        startIcon={isLoading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : undefined}
                        sx={{
                          bgcolor: plan.highlight ? plan.color : isCurrent ? '#3DAA96' : 'transparent',
                          borderColor: plan.color,
                          color: plan.highlight || isCurrent ? '#fff' : plan.color,
                          borderRadius: 2, fontWeight: 700, py: 1.2,
                          '&:hover': { bgcolor: plan.color, color: '#fff', borderColor: plan.color },
                        }}
                      >
                        {isLoading
                          ? 'Redirigiendo a PayU…'
                          : isCurrent
                          ? 'Renovar plan actual'
                          : 'Suscribirse ahora'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Info de seguridad */}
          <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 3, p: 2.5,
                     border: '1px solid #E4F0ED', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <CheckCircleOutlinedIcon sx={{ color: '#3DAA96', mt: 0.2, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.9rem', mb: 0.5 }}>
                Pago seguro con PayU Colombia
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Al hacer clic en "Suscribirse" serás redirigido a la pasarela de PayU.
                Aceptamos tarjeta de crédito/débito, PSE, efectivo (Efecty, Baloto) y más métodos.
                Tu información bancaria nunca pasa por nuestros servidores.
                Cancela en cualquier momento desde el panel.
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* ── FHIR R4 API Info ─────────────────────────────────────────────── */}
      <Box sx={{ mt: 5 }}>
        <Divider sx={{ mb: 4 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IntegrationInstructionsOutlinedIcon sx={{ color: '#5A5FC8', fontSize: 22 }} />
          <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '1rem' }}>
            Interoperabilidad HL7 FHIR R4
          </Typography>
          <Chip
            label="Res. 2654/2019"
            size="small"
            sx={{ bgcolor: '#EEEEF8', color: '#5A5FC8', fontWeight: 700, fontSize: '0.68rem' }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
          Tu clínica tiene disponible una API FHIR R4 de solo lectura para integración con SISPRO
          y sistemas de información en salud (conforme a la Resolución 2654/2019 del MinSalud Colombia).
        </Typography>

        <Grid container spacing={2}>
          {[
            {
              method: 'GET',
              path: '/api/fhir/metadata',
              label: 'CapabilityStatement',
              desc: 'Capacidades del servidor FHIR. Público — sin autenticación.',
              color: '#27AE60',
              bg: '#EAF7EE',
            },
            {
              method: 'GET',
              path: '/api/fhir/Patient',
              label: 'Pacientes',
              desc: 'Lista todos los pacientes del tenant en formato FHIR Patient.',
              color: '#3DAA96',
              bg: '#E8F5F0',
            },
            {
              method: 'GET',
              path: '/api/fhir/Encounter',
              label: 'Encuentros',
              desc: 'Citas médicas como FHIR Encounter. Filtros: ?patient=ID&status=finished',
              color: '#5A5FC8',
              bg: '#EEEEF8',
            },
          ].map(ep => (
            <Grid size={{ xs: 12, md: 4 }} key={ep.path}>
              <Box sx={{
                bgcolor: ep.bg, border: `1px solid ${ep.color}30`,
                borderRadius: 2, p: 2, height: '100%',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={ep.method}
                    size="small"
                    sx={{ bgcolor: ep.color, color: '#fff', fontWeight: 800, fontSize: '0.65rem' }}
                  />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A2E2A' }}>
                    {ep.label}
                  </Typography>
                </Box>
                <Typography sx={{
                  fontFamily: 'monospace', fontSize: '0.72rem', color: ep.color,
                  bgcolor: 'rgba(255,255,255,0.7)', px: 1, py: 0.3, borderRadius: 1,
                  mb: 1, display: 'block', wordBreak: 'break-all',
                }}>
                  {ep.path}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ep.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2, p: 2, bgcolor: '#F8FDFB', borderRadius: 2, border: '1px solid #E4F0ED',
                   display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <CheckCircleOutlinedIcon sx={{ color: '#3DAA96', fontSize: 18, mt: 0.1, flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            <strong>Autenticación:</strong> Todos los endpoints (excepto /metadata) requieren tu token JWT.
            Incluye el header <code>Authorization: Bearer &lt;token&gt;</code> en las peticiones.
            {' '}
            <a
              href="https://hl7.org/fhir/R4/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#5A5FC8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 }}
            >
              Documentación FHIR R4 <OpenInNewOutlinedIcon sx={{ fontSize: 12, ml: 0.3 }} />
            </a>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
