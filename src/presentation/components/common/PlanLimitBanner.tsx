/**
 * PlanLimitBanner — Banner de límite de plan superado (HTTP 402).
 *
 * Se muestra cuando el backend devuelve un error PLAN_LIMIT_EXCEEDED.
 * Incluye detalles del límite actual y un CTA para actualizar el plan.
 *
 * Uso:
 *   const [planLimitErr, setPlanLimitErr] = usePlanLimitError();
 *   // en el catch:
 *   setPlanLimitErr(err);
 *   // en el JSX:
 *   <PlanLimitBanner error={planLimitErr} />
 */

import { Box, Typography, Button, LinearProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import UpgradeOutlinedIcon from '@mui/icons-material/UpgradeOutlined';
import TimerOffOutlinedIcon from '@mui/icons-material/TimerOffOutlined';
import { useNavigate } from 'react-router-dom';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface PlanLimitError {
  message:   string;
  limitType: 'APPOINTMENTS' | 'PATIENTS' | 'TRIAL_EXPIRED';
  current:   number;
  max:       number;
  plan:      string;
}

// ── Helper: extrae el error de límite de una respuesta axios ──────────────────

/**
 * Extrae información de límite de plan desde un error de Axios.
 * Devuelve `null` si no es un 402 o no tiene el formato esperado.
 */
export function extractPlanLimitError(err: unknown): PlanLimitError | null {
  const res = (err as { response?: { status?: number; data?: Record<string, unknown> } })?.response;
  if (res?.status !== 402) return null;
  const d = res.data;
  if (!d || d['error'] !== 'PLAN_LIMIT_EXCEEDED') return null;
  return {
    message:   String(d['message']   ?? ''),
    limitType: (d['limitType'] as PlanLimitError['limitType']) ?? 'APPOINTMENTS',
    current:   Number(d['current']   ?? 0),
    max:       Number(d['max']       ?? 0),
    plan:      String(d['plan']      ?? ''),
  };
}

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
  error: PlanLimitError | null;
  /** Si true, muestra solo el banner sin botón de navegación (para diálogos). */
  compact?: boolean;
}

const PLAN_LABELS: Record<string, string> = {
  STARTER: 'Starter',
  PRO:     'Pro',
  CLINIC:  'Clínica',
  FOUNDER: 'Founder',
};

const TYPE_LABELS: Record<string, string> = {
  APPOINTMENTS: 'citas este mes',
  PATIENTS:     'pacientes registrados',
};

// ── Configuración visual por tipo de error ────────────────────────────────────

interface BannerTheme {
  bgcolor:   string;
  border:    string;
  textColor: string;
  capColor:  string;
  barBg:     string;
  barFill:   string;
  btnBg:     string;
  btnHover:  string;
  icon:      React.ReactNode;
  title:     string;
}

function getBannerTheme(error: PlanLimitError): BannerTheme {
  if (error.limitType === 'TRIAL_EXPIRED') {
    return {
      bgcolor:   '#FDE8E8',
      border:    '1.5px solid #C0392B',
      textColor: '#7D0000',
      capColor:  '#9A0000',
      barBg:     '#F5C6C6',
      barFill:   '#C0392B',
      btnBg:     '#C0392B',
      btnHover:  '#962D22',
      icon:      <TimerOffOutlinedIcon sx={{ color: '#C0392B', fontSize: 20, flexShrink: 0 }} />,
      title:     'Período de prueba vencido',
    };
  }
  return {
    bgcolor:   '#FFF8E7',
    border:    '1.5px solid #F5A623',
    textColor: '#7D4B00',
    capColor:  '#9A6300',
    barBg:     '#FDEABC',
    barFill:   '#E67E22',
    btnBg:     '#E67E22',
    btnHover:  '#CF6D17',
    icon:      <LockOutlinedIcon sx={{ color: '#E67E22', fontSize: 20, flexShrink: 0 }} />,
    title:     `Límite del plan ${PLAN_LABELS[error.plan] ?? error.plan} alcanzado`,
  };
}

export default function PlanLimitBanner({ error, compact = false }: Props) {
  const navigate = useNavigate();

  if (!error) return null;

  const theme     = getBannerTheme(error);
  const isExpired = error.limitType === 'TRIAL_EXPIRED';
  const pct       = !isExpired && error.max > 0
    ? Math.min(100, Math.round((error.current / error.max) * 100))
    : 100;
  const typeLabel = TYPE_LABELS[error.limitType] ?? 'recursos';

  return (
    <Box
      sx={{
        bgcolor:      theme.bgcolor,
        border:       theme.border,
        borderRadius: 2,
        p:            compact ? 2 : 2.5,
        mb:           compact ? 0 : 2,
      }}
    >
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {theme.icon}
        <Typography sx={{ fontWeight: 800, color: theme.textColor, fontSize: '0.9rem' }}>
          {theme.title}
        </Typography>
      </Box>

      {/* Mensaje */}
      <Typography variant="body2" sx={{ color: theme.textColor, mb: 1.5, lineHeight: 1.6 }}>
        {error.message}
      </Typography>

      {/* Barra de uso — solo para límites de plan, no para trial expirado */}
      {!isExpired && (
        <Box sx={{ mb: compact ? 1.5 : 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: theme.capColor }}>
              {error.current} de {error.max} {typeLabel}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.barFill }}>
              {pct}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 6, borderRadius: 4,
              bgcolor: theme.barBg,
              '& .MuiLinearProgress-bar': { bgcolor: theme.barFill, borderRadius: 4 },
            }}
          />
        </Box>
      )}

      {/* CTA */}
      {!compact ? (
        <Button
          variant="contained"
          size="small"
          startIcon={<UpgradeOutlinedIcon />}
          onClick={() => navigate('/admin/billing')}
          sx={{
            bgcolor: theme.btnBg, borderRadius: 2, fontWeight: 700, fontSize: '0.82rem',
            '&:hover': { bgcolor: theme.btnHover },
          }}
        >
          {isExpired ? 'Activar suscripción' : 'Actualizar plan'}
        </Button>
      ) : (
        <Button
          variant="outlined"
          size="small"
          startIcon={<UpgradeOutlinedIcon />}
          onClick={() => navigate('/admin/billing')}
          sx={{
            borderColor: theme.btnBg, color: theme.btnBg, borderRadius: 2,
            fontWeight: 700, fontSize: '0.8rem', mt: isExpired ? 0 : 0,
            '&:hover': { bgcolor: `${theme.btnBg}12`, borderColor: theme.btnHover },
          }}
        >
          {isExpired ? 'Activar suscripción' : 'Actualizar plan'}
        </Button>
      )}
    </Box>
  );
}
