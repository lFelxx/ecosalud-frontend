/**
 * ContactPage — Página de contacto de la plataforma.
 * Información cargada desde GET /api/public/settings → contact.*
 */
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Chip, Button, Skeleton,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlatformNavbar from '../../components/common/PlatformNavbar';
import Footer from '../../components/common/Footer';
import { useSeo } from '../../hooks/useSeo';
import axiosClient from '../../../infrastructure/http/axiosClient';

interface ContactSettings {
  email:     string;
  phone:     string;
  address:   string;
  schedule:  string;
  whatsapp:  string;
}

export default function ContactPage() {
  const [info,    setInfo]    = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useSeo('Contacto | Ecosalud Market', 'Comunícate con el equipo de Ecosalud Market. Soporte en español para profesionales de salud en Colombia.');

  useEffect(() => {
    axiosClient.get<Record<string, string>>('/public/settings')
      .then(r => {
        const s = r.data;
        setInfo({
          email:    s['contact.email']    || 'soporte@ecosalud.com',
          phone:    s['contact.phone']    || '+57 (601) 123-4567',
          address:  s['contact.address']  || 'Bogotá, Colombia',
          schedule: s['contact.schedule'] || 'Lunes a Viernes, 8:00 AM – 6:00 PM (COT)',
          whatsapp: s['social.whatsapp']  || '',
        });
      })
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  const CONTACT_ITEMS = info ? [
    { icon: <EmailOutlinedIcon sx={{ fontSize: 22 }} />, color: '#3DAA96', bg: '#E8F5F0', label: 'Email', value: info.email, href: `mailto:${info.email}` },
    { icon: <PhoneOutlinedIcon sx={{ fontSize: 22 }} />, color: '#5A5FC8', bg: '#EEEEF8', label: 'Teléfono', value: info.phone, href: `tel:${info.phone}` },
    info.whatsapp && { icon: <WhatsAppIcon sx={{ fontSize: 22 }} />, color: '#25D366', bg: '#E8F5F0', label: 'WhatsApp', value: info.whatsapp, href: `https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}` },
    { icon: <LocationOnOutlinedIcon sx={{ fontSize: 22 }} />, color: '#E67E22', bg: '#FFF3E8', label: 'Ubicación', value: info.address, href: undefined },
    { icon: <AccessTimeOutlinedIcon sx={{ fontSize: 22 }} />, color: '#27AE60', bg: '#EAF7EE', label: 'Horario', value: info.schedule, href: undefined },
  ].filter(Boolean) : [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <PlatformNavbar />

      <Container maxWidth="md" sx={{ flex: 1, py: { xs: 4, md: 7 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="Soporte" size="small" sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1A2E2A', fontSize: { xs: '1.7rem', md: '2.3rem' }, mb: 1.5 }}>
            ¿Cómo podemos ayudarte?
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', lineHeight: 1.75 }}>
            Nuestro equipo de soporte está listo para ayudarte. Soporte 100% en español, enfocado en profesionales de salud colombianos.
          </Typography>
        </Box>

        {/* Tarjetas de contacto */}
        {loading ? (
          <Grid container spacing={2.5}>
            {[1,2,3,4].map(i => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: 3, border: '1px solid #E4F0ED' }}>
                  <Skeleton variant="circular" width={44} height={44} sx={{ mb: 2 }} />
                  <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
                  <Skeleton width="70%" height={16} />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2.5}>
            {CONTACT_ITEMS.map((item: any) => (
              <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                <Box sx={{
                  bgcolor: '#fff', borderRadius: 3, p: 3,
                  border: '1px solid #E4F0ED', height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: item.color, boxShadow: `0 4px 16px ${item.color}15` },
                }}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: 2, bgcolor: item.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 2, '& svg': { color: item.color },
                  }}>
                    {item.icon}
                  </Box>
                  <Typography variant="overline" sx={{ color: item.color, fontWeight: 700, fontSize: '0.68rem', letterSpacing: 1 }}>
                    {item.label}
                  </Typography>
                  {item.href ? (
                    <Typography
                      component="a" href={item.href}
                      sx={{ display: 'block', fontWeight: 700, color: '#1A2E2A', fontSize: '0.9rem', mt: 0.5, textDecoration: 'none', '&:hover': { color: item.color } }}
                    >
                      {item.value}
                    </Typography>
                  ) : (
                    <Typography sx={{ fontWeight: 600, color: '#3A5048', fontSize: '0.88rem', mt: 0.5, lineHeight: 1.6 }}>
                      {item.value}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* CTA */}
        <Box sx={{ textAlign: 'center', mt: 6, bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED', p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A', mb: 1.5 }}>
            ¿Listo para empezar?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 380, mx: 'auto' }}>
            14 días de prueba gratuita. Sin compromisos.
          </Typography>
          <Button component={RouterLink} to="/onboarding" variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{ bgcolor: '#3DAA96', borderRadius: 2, px: 4, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#2B8A78' } }}>
            Crear mi clínica gratis
          </Button>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
