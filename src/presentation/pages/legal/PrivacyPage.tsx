/**
 * PrivacyPage — Política de privacidad de la plataforma.
 * Contenido cargado desde GET /api/public/settings → legal.privacy
 */
import { useEffect, useState } from 'react';
import { Box, Typography, Container, Skeleton, Chip } from '@mui/material';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import PlatformNavbar from '../../components/common/PlatformNavbar';
import Footer from '../../components/common/Footer';
import { useSeo } from '../../hooks/useSeo';
import axiosClient from '../../../infrastructure/http/axiosClient';

export default function PrivacyPage() {
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(true);

  useSeo('Política de Privacidad | Ecosalud Market', 'Conoce cómo protegemos tus datos personales en la plataforma Ecosalud Market.');

  useEffect(() => {
    axiosClient.get<Record<string, string>>('/public/settings')
      .then(r => setText(r.data['legal.privacy'] ?? ''))
      .catch(() => setText(''))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <PlatformNavbar />
      <Container maxWidth="md" sx={{ flex: 1, py: { xs: 4, md: 7 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ width: 52, height: 52, bgcolor: '#E8F5F0', borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <SecurityOutlinedIcon sx={{ color: '#3DAA96', fontSize: 26 }} />
          </Box>
          <Chip label="Legal" size="small" sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700, mb: 1.5 }} />
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1A2E2A', fontSize: { xs: '1.6rem', md: '2.2rem' } }}>
            Política de Privacidad
          </Typography>
        </Box>

        <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED', p: { xs: 3, md: 5 } }}>
          {loading ? (
            [1,2,3,4,5].map(i => <Skeleton key={i} height={18} sx={{ mb: 1, width: i % 3 === 0 ? '70%' : '100%' }} />)
          ) : (
            text.split('\n').map((line, i) =>
              line.trim() ? (
                <Typography key={i} sx={{
                  mb: 1.2, color: line.match(/^\d+\./) ? '#1A2E2A' : '#3A5048',
                  fontWeight: line.match(/^\d+\./) ? 700 : 400,
                  fontSize: '0.92rem', lineHeight: 1.8,
                }}>
                  {line}
                </Typography>
              ) : <Box key={i} sx={{ mb: 1.5 }} />
            )
          )}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
