/**
 * BillingResultPage — Página de resultado del pago PayU.
 *
 * Ruta: /billing/result
 * PayU redirige aquí después del pago con query params:
 *   ?transactionState=4   (4=Aprobado, 6=Rechazado, 104=Error, 7=Pendiente)
 *   &referenceCode=ECO-...
 *   &TX_VALUE=324000.00
 *   &currency=COP
 *   &message=APPROVED
 */

import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

// ── Estados posibles de PayU ──────────────────────────────────────────────────

type PayUState = 'approved' | 'pending' | 'rejected' | 'error' | 'unknown';

function resolveState(transactionState: string | null): PayUState {
  switch (transactionState) {
    case '4':   return 'approved';
    case '7':   return 'pending';
    case '6':   return 'rejected';
    case '104': return 'error';
    default:    return 'unknown';
  }
}

const STATE_CONFIG: Record<PayUState, {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  cta: string;
  ctaPath: string;
}> = {
  approved: {
    icon:    <CheckCircleOutlinedIcon sx={{ fontSize: 72, color: '#27AE60' }} />,
    title:   '¡Pago aprobado!',
    subtitle: 'Tu suscripción está activa. Ya tienes acceso completo a todas las funcionalidades de tu plan.',
    color:   '#27AE60',
    bg:      '#EAF7EF',
    cta:     'Ir al panel de administración',
    ctaPath: '/admin',
  },
  pending: {
    icon:    <HourglassEmptyOutlinedIcon sx={{ fontSize: 72, color: '#E67E22' }} />,
    title:   'Pago en proceso',
    subtitle: 'Tu pago está siendo verificado. Esto puede tomar unos minutos. Recibirás una confirmación por email cuando se complete.',
    color:   '#E67E22',
    bg:      '#FEF9F0',
    cta:     'Volver al panel',
    ctaPath: '/admin/billing',
  },
  rejected: {
    icon:    <CancelOutlinedIcon sx={{ fontSize: 72, color: '#C0392B' }} />,
    title:   'Pago rechazado',
    subtitle: 'Tu pago fue rechazado. Verifica los datos de tu método de pago e intenta de nuevo.',
    color:   '#C0392B',
    bg:      '#FDEEEC',
    cta:     'Intentar de nuevo',
    ctaPath: '/admin/billing',
  },
  error: {
    icon:    <ReportProblemOutlinedIcon sx={{ fontSize: 72, color: '#7F8C8D' }} />,
    title:   'Error en el pago',
    subtitle: 'Ocurrió un error inesperado al procesar tu pago. Por favor intenta de nuevo o contacta a soporte.',
    color:   '#7F8C8D',
    bg:      '#F5F5F5',
    cta:     'Intentar de nuevo',
    ctaPath: '/admin/billing',
  },
  unknown: {
    icon:    <SpaOutlinedIcon sx={{ fontSize: 72, color: '#3DAA96' }} />,
    title:   'Estado de pago',
    subtitle: 'Estamos procesando tu pago. Puedes revisar el estado en tu panel de suscripción.',
    color:   '#3DAA96',
    bg:      '#E8F5F0',
    cta:     'Ver mi suscripción',
    ctaPath: '/admin/billing',
  },
};

// ── Componente ────────────────────────────────────────────────────────────────

export default function BillingResultPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();

  const transactionState = params.get('transactionState');
  const referenceCode    = params.get('referenceCode');
  const amount           = params.get('TX_VALUE');
  const currency         = params.get('currency') ?? 'COP';

  const state  = resolveState(transactionState);
  const config = STATE_CONFIG[state];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                 py: { xs: 4, md: 6 }, px: 2 }}>
        <Card sx={{ maxWidth: 520, width: '100%', borderRadius: 4,
                    border: '1px solid #E4F0ED', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>

            {/* Ícono */}
            <Box sx={{ mb: 3 }}>{config.icon}</Box>

            {/* Título */}
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A', mb: 1.5 }}>
              {config.title}
            </Typography>

            {/* Subtítulo */}
            <Typography variant="body2" color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.8, maxWidth: 380, mx: 'auto' }}>
              {config.subtitle}
            </Typography>

            {/* Detalles de la transacción */}
            {referenceCode && (
              <Box sx={{ bgcolor: config.bg, borderRadius: 2, p: 2, mb: 3, textAlign: 'left' }}>
                {referenceCode && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA',
                      textTransform: 'uppercase', letterSpacing: 0.5 }}>Referencia</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1A2E2A',
                      fontFamily: 'monospace' }}>{referenceCode}</Typography>
                  </Box>
                )}
                {amount && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA',
                      textTransform: 'uppercase', letterSpacing: 0.5 }}>Monto</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1A2E2A' }}>
                      {parseFloat(amount).toLocaleString('es-CO', { style: 'currency', currency })}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Botón CTA */}
            <Button
              fullWidth
              variant="contained"
              endIcon={<ArrowForwardOutlinedIcon />}
              onClick={() => navigate(config.ctaPath)}
              sx={{
                bgcolor: config.color, borderRadius: 2, fontWeight: 800,
                py: 1.4, fontSize: '0.95rem',
                '&:hover': { filter: 'brightness(0.9)', bgcolor: config.color },
              }}
            >
              {config.cta}
            </Button>

            {/* Soporte */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              ¿Tienes algún problema? Escríbenos a{' '}
              <Box component="a" href="mailto:soporte@ecosalud.com"
                sx={{ color: '#3DAA96', fontWeight: 700 }}>
                soporte@ecosalud.com
              </Box>
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Footer />
    </Box>
  );
}
