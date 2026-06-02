import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardContent,
  Button, Chip, Stack, Switch, Divider, Avatar,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SpaIcon from '@mui/icons-material/Spa';
import StarIcon from '@mui/icons-material/Star';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

// ── Datos de planes ───────────────────────────────────────────────────────────

const PLANS = [
  {
    id:          'starter',
    name:        'Starter',
    icon:        <SpaIcon sx={{ fontSize: 28 }} />,
    color:       '#5A7A74',
    accent:      '#E8F5F0',
    priceUSD:    29,
    priceAnnual: 23,   // ~20% descuento anual
    priceCOP:    '~$119.000',
    badge:       null,
    description: 'Para profesionales independientes que quieren digitalizar su consulta.',
    features: [
      { label: '1 especialista',           included: true  },
      { label: '50 citas por mes',          included: true  },
      { label: '30 pacientes activos',      included: true  },
      { label: '5 servicios / terapias',    included: true  },
      { label: 'Subdominio automático',     included: true  },
      { label: 'Perfil público de clínica', included: true  },
      { label: 'Agendamiento online',       included: true  },
      { label: 'Email de confirmación',     included: true  },
      { label: 'Historia clínica básica',   included: false },
      { label: 'Blog / publicaciones',      included: false },
      { label: 'Dominio propio',            included: false },
      { label: 'Analytics avanzados',       included: false },
      { label: 'Multi-especialista',        included: false },
      { label: 'Multi-sede',               included: false },
    ],
    cta:      'Comenzar gratis 14 días',
    ctaColor: '#5A7A74',
  },
  {
    id:          'pro',
    name:        'Pro',
    icon:        <RocketLaunchOutlinedIcon sx={{ fontSize: 28 }} />,
    color:       '#3DAA96',
    accent:      '#EAF6F3',
    priceUSD:    79,
    priceAnnual: 63,
    priceCOP:    '~$324.000',
    badge:       'Más popular',
    description: 'Para clínicas en crecimiento con varios especialistas y necesidades clínicas.',
    features: [
      { label: 'Hasta 3 especialistas',     included: true },
      { label: '300 citas por mes',         included: true },
      { label: '200 pacientes activos',     included: true },
      { label: '20 servicios / terapias',   included: true },
      { label: 'Subdominio automático',     included: true },
      { label: 'Perfil público de clínica', included: true },
      { label: 'Agendamiento online',       included: true },
      { label: 'Email de confirmación',     included: true },
      { label: 'Historia clínica básica',   included: true },
      { label: 'Blog / publicaciones',      included: true, note: 'hasta 10' },
      { label: 'Guía para dominio propio',  included: true },
      { label: 'Analytics avanzados',       included: true },
      { label: 'Multi-especialista',        included: true },
      { label: 'Multi-sede',               included: false },
    ],
    cta:      'Comenzar gratis 14 días',
    ctaColor: '#3DAA96',
  },
  {
    id:          'clinic',
    name:        'Clínica',
    icon:        <BusinessCenterOutlinedIcon sx={{ fontSize: 28 }} />,
    color:       '#1A4A3E',
    accent:      '#E8F5F0',
    priceUSD:    199,
    priceAnnual: 159,
    priceCOP:    '~$817.000',
    badge:       'Completo',
    description: 'Para IPS, clínicas establecidas y redes de salud que necesitan lo máximo.',
    features: [
      { label: 'Especialistas ilimitados',  included: true },
      { label: 'Citas ilimitadas',          included: true },
      { label: 'Pacientes ilimitados',      included: true },
      { label: 'Servicios ilimitados',      included: true },
      { label: 'Subdominio automático',     included: true },
      { label: 'Perfil público de clínica', included: true },
      { label: 'Agendamiento online',       included: true },
      { label: 'Email de confirmación',     included: true },
      { label: 'Historia clínica completa', included: true },
      { label: 'Blog / publicaciones',      included: true, note: 'ilimitadas' },
      { label: 'Dominio propio integrado',  included: true },
      { label: 'Analytics avanzados',       included: true },
      { label: 'Multi-especialista',        included: true },
      { label: 'Multi-sede',               included: true },
    ],
    cta:      'Hablar con ventas',
    ctaColor: '#1A4A3E',
  },
];

// ── Testimonios ───────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name:      'Dra. Angélica Camacho',
    role:      'Terapias alternativas y farmacología vegetal · Bogotá',
    avatar:    'AC',
    color:     '#3DAA96',
    quote:     'Ecosalud transformó la forma en que gestiono mi consulta. Mis pacientes agendan solos y yo me concentro en lo que importa: sanar.',
    plan:      'Clínica',
    verified:  true,
  },
  {
    name:      'Fisiosalud SAS',
    role:      'IPS · Fisioterapia y Rehabilitación',
    avatar:    'FS',
    color:     '#1A5F8A',
    quote:     'Con 10 especialistas, necesitábamos una solución robusta. La plataforma nos dio visibilidad digital y control total sobre nuestras citas.',
    plan:      'Clínica',
    verified:  true,
  },
];

// ── Features adicionales ──────────────────────────────────────────────────────

const COMING_SOON = [
  '🔔 Recordatorios por WhatsApp',
  '📹 Teleconsulta integrada',
  '📄 Consentimientos informados digitales',
  '📊 Dashboard de ingresos',
  '🏥 Historia clínica con MinSalud (Res. 2654/2019)',
  '💳 Pago online de citas (PayU)',
];

// ── Componente ────────────────────────────────────────────────────────────────

function FeatureRow({ label, included, note }: { label: string; included: boolean; note?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 0.7 }}>
      {included ? (
        <CheckIcon sx={{ fontSize: 16, color: '#3DAA96', flexShrink: 0 }} />
      ) : (
        <CloseIcon sx={{ fontSize: 16, color: '#D0D0D0', flexShrink: 0 }} />
      )}
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.84rem',
          color: included ? '#2C3E35' : '#B0B0B0',
          flex: 1,
        }}
      >
        {label}
        {note && (
          <Box component="span" sx={{ ml: 0.5, fontSize: '0.72rem', color: '#3DAA96', fontWeight: 600 }}>
            ({note})
          </Box>
        )}
      </Typography>
    </Box>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F7FAF9' }}>
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1A3E38 0%, #3DAA96 100%)',
          py: { xs: 8, md: 10 },
          textAlign: 'center',
          px: 2,
        }}
      >
        <Chip
          label="Precios transparentes · Sin sorpresas"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mb: 2, fontWeight: 600 }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', mb: 1.5, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
          Elige el plan para tu clínica
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.82)', maxWidth: 520, mx: 'auto', mb: 4, lineHeight: 1.7 }}>
          Sin contratos de largo plazo. Cancela cuando quieras.
          Precios en <strong>USD</strong> con equivalente aproximado en COP.
        </Typography>

        {/* Toggle mensual / anual */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: annual ? 'rgba(255,255,255,0.6)' : '#fff', fontWeight: 600 }}>
            Mensual
          </Typography>
          <Switch
            checked={annual}
            onChange={(e) => setAnnual(e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#fff' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.4)' },
            }}
          />
          <Typography variant="body2" sx={{ color: annual ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            Anual
          </Typography>
          {annual && (
            <Chip
              label="Ahorra 20%"
              size="small"
              sx={{ bgcolor: '#FFD700', color: '#1A3E38', fontWeight: 800, fontSize: '0.7rem' }}
            />
          )}
        </Stack>
      </Box>

      {/* ── Plan cards ─────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, mt: -4 }}>
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {PLANS.map((plan) => {
            const isPro = plan.id === 'pro';
            const price = annual ? plan.priceAnnual : plan.priceUSD;

            return (
              <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
                <Card
                  elevation={isPro ? 8 : 0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    border: isPro ? `2px solid ${plan.color}` : '1px solid #E3EFEC',
                    position: 'relative',
                    overflow: 'visible',
                    transform: isPro ? 'scale(1.03)' : 'none',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: isPro ? 'scale(1.05)' : 'translateY(-4px)' },
                  }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: plan.color,
                        color: '#fff',
                        px: 2,
                        py: 0.4,
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: 0.5,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <StarIcon sx={{ fontSize: 12 }} />
                      {plan.badge}
                    </Box>
                  )}

                  <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Plan header */}
                    <Box
                      sx={{
                        width: 52, height: 52, borderRadius: 2.5,
                        bgcolor: plan.accent, color: plan.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      {plan.icon}
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A3E38', mb: 0.5 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5A7A74', mb: 2.5, lineHeight: 1.6, fontSize: '0.84rem' }}>
                      {plan.description}
                    </Typography>

                    {/* Precio */}
                    <Box sx={{ mb: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.9rem', color: '#9DBFBA', fontWeight: 600 }}>USD</Typography>
                        <Typography sx={{ fontSize: '2.4rem', fontWeight: 800, color: plan.color, lineHeight: 1 }}>
                          ${price}
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: '#9DBFBA' }}>/mes</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#B0C4BE' }}>
                        {plan.priceCOP} COP · tipo de cambio del día
                      </Typography>
                      {annual && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#3DAA96', fontWeight: 600, mt: 0.3 }}>
                          Facturado ${plan.priceAnnual * 12} USD/año
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Features */}
                    <Box sx={{ flex: 1, mb: 3 }}>
                      {plan.features.map((f) => (
                        <FeatureRow key={f.label} {...f} />
                      ))}
                    </Box>

                    {/* CTA */}
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                      fullWidth
                      disableElevation
                      sx={{
                        bgcolor: plan.ctaColor,
                        borderRadius: 2.5,
                        py: 1.4,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        '&:hover': { filter: 'brightness(0.9)' },
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Nota de prueba gratuita */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: '#5A7A74' }}>
            ✅ 14 días de prueba gratuita · Sin tarjeta de crédito · Cancela cuando quieras
          </Typography>
        </Box>
      </Container>

      {/* ── Coming Soon features ────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', py: 7 }}>
        <Container maxWidth="md">
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A3E38', textAlign: 'center', mb: 1 }}>
            Próximamente en todos los planes
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A7A74', textAlign: 'center', mb: 4 }}>
            Estamos construyendo continuamente. Estas funcionalidades llegan pronto.
          </Typography>
          <Grid container spacing={2}>
            {COMING_SOON.map((feat) => (
              <Grid size={{ xs: 12, sm: 6 }} key={feat}>
                <Box
                  sx={{
                    p: 2, borderRadius: 2.5,
                    border: '1px dashed #B2DDD4',
                    bgcolor: '#FAFFFE',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#4A6B60', fontWeight: 500 }}>
                    {feat}
                  </Typography>
                  <Chip label="Pronto" size="small" sx={{ ml: 'auto', bgcolor: '#EAF6F3', color: '#2B8A78', fontSize: '0.65rem', fontWeight: 700 }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Testimonios ────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#F0FBF8', py: 7 }}>
        <Container maxWidth="md">
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A3E38', textAlign: 'center', mb: 4 }}>
            Clínicas que ya confían en Ecosalud
          </Typography>
          <Grid container spacing={3}>
            {TESTIMONIALS.map((t) => (
              <Grid size={{ xs: 12, sm: 6 }} key={t.name}>
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E3EFEC', p: 3, height: '100%' }}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar sx={{ bgcolor: t.color, fontWeight: 700, width: 44, height: 44 }}>
                      {t.avatar}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A3E38' }}>
                        {t.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#5A7A74' }}>{t.role}</Typography>
                    </Box>
                    {t.verified && (
                      <Chip
                        label="Plan Clínica"
                        size="small"
                        sx={{ ml: 'auto', bgcolor: '#EAF6F3', color: '#2B8A78', fontSize: '0.65rem', fontWeight: 700 }}
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#4A6B60', fontStyle: 'italic', lineHeight: 1.7 }}>
                    "{t.quote}"
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── FAQ rápido ─────────────────────────────────────────────────────── */}
      <Box sx={{ py: 7, bgcolor: '#fff' }}>
        <Container maxWidth="sm">
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A3E38', textAlign: 'center', mb: 4 }}>
            Preguntas frecuentes
          </Typography>
          {[
            {
              q: '¿Puedo cambiar de plan después?',
              a: 'Sí. Puedes subir o bajar de plan en cualquier momento. El cambio aplica en el próximo ciclo de facturación.',
            },
            {
              q: '¿Los 14 días de prueba requieren tarjeta?',
              a: 'No. Regístrate, configura tu clínica y empieza a usar la plataforma. Solo pedimos datos de pago si decides continuar.',
            },
            {
              q: '¿Mis datos de pacientes están seguros?',
              a: 'Cada clínica tiene su propia base de datos aislada. Cumplimos con las normativas de datos personales y salud vigentes en Colombia.',
            },
            {
              q: '¿Cómo funciona el dominio propio?',
              a: 'En el plan Clínica te guiamos paso a paso para conectar tu dominio (GoDaddy, Namecheap, etc.) con un CNAME. Incluye SSL automático.',
            },
          ].map(({ q, a }) => (
            <Box key={q} sx={{ mb: 2.5, p: 2.5, bgcolor: '#F7FAF9', borderRadius: 2.5 }}>
              <Typography sx={{ fontWeight: 700, color: '#1A3E38', mb: 0.8, fontSize: '0.92rem' }}>
                {q}
              </Typography>
              <Typography variant="body2" sx={{ color: '#5A7A74', lineHeight: 1.7 }}>
                {a}
              </Typography>
            </Box>
          ))}
        </Container>
      </Box>

      {/* ── CTA final ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1A3E38 0%, #3DAA96 100%)',
          py: 8, textAlign: 'center', px: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 1.5 }}>
          ¿Listo para digitalizar tu clínica?
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.82)', mb: 4 }}>
          Más de 2 clínicas ya gestionan sus pacientes en Ecosalud.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, justifyContent: 'center' }}>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#fff', color: '#1A3E38',
              borderRadius: 3, fontWeight: 800, px: 4,
              '&:hover': { bgcolor: '#F0FBF8' },
            }}
          >
            Comenzar gratis
          </Button>
          <Button
            component={RouterLink}
            to="/"
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'rgba(255,255,255,0.6)', color: '#fff',
              borderRadius: 3, fontWeight: 700, px: 4,
              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.10)' },
            }}
          >
            Ver la plataforma
          </Button>
        </Stack>
      </Box>

      <Footer />
    </Box>
  );
}
