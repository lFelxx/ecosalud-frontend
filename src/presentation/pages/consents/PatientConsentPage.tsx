/**
 * PatientConsentPage — El paciente firma sus consentimientos informados.
 *
 * Ruta: /consents
 * Conectado a:
 *   GET  /api/consents/my   — ver consentimientos propios
 *   POST /api/consents/sign — firmar nuevo consentimiento
 *   GET  /api/services      — selector de servicio
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Alert, Divider,
  Chip, CircularProgress,
} from '@mui/material';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import axiosClient from '../../../infrastructure/http/axiosClient';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuthContext } from '../../context/AuthContext';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface MyConsent {
  id: number;
  serviceName: string | null;
  digitalSignature: string | null;
  signedAt: string | null;
}

// ── Template del consentimiento (preview en frontend) ─────────────────────────

function consentPreview(serviceName: string): string {
  return `CONSENTIMIENTO INFORMADO PARA TRATAMIENTO DE TERAPIAS ALTERNATIVAS

Yo, el/la paciente abajo firmante, declaro que:

1. He sido informado/a por el especialista de la clínica sobre el procedimiento
   denominado "${serviceName}", incluyendo sus beneficios, riesgos y alternativas.

2. Entiendo que las terapias alternativas son complementarias a la medicina
   convencional y no la sustituyen.

3. He tenido la oportunidad de realizar preguntas y estas han sido respondidas
   satisfactoriamente.

4. Doy mi consentimiento libre, voluntario e informado para recibir el tratamiento
   indicado, pudiendo revocarlo en cualquier momento sin perjuicio alguno.

5. Autorizo el uso de mis datos de salud exclusivamente para los fines del
   tratamiento, conforme a la Ley 1581 de 2012 (Habeas Data — Colombia).`;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PatientConsentPage() {
  const { services } = useAdminData();
  const { user }     = useAuthContext();
  const navigate     = useNavigate();

  const [myConsents, setMyConsents] = useState<MyConsent[]>([]);
  const [loading,    setLoading]    = useState(true);

  // Formulario
  const [serviceId,  setServiceId]  = useState<number | ''>('');
  const [signature,  setSignature]  = useState('');
  const [agreed,     setAgreed]     = useState(false);
  const [signing,    setSigning]    = useState(false);
  const [signOk,     setSignOk]     = useState(false);
  const [signErr,    setSignErr]    = useState('');

  const selectedService = services.find(s => Number(s.id) === serviceId);
  const preview = selectedService ? consentPreview(selectedService.name) : '';
  const canSign = serviceId !== '' && signature.trim().length >= 3 && agreed;

  useEffect(() => {
    axiosClient.get<MyConsent[]>('/consents/my')
      .then(r => setMyConsents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSign = async () => {
    if (!canSign) return;
    setSigning(true);
    setSignErr('');
    try {
      const { data } = await axiosClient.post<MyConsent>('/consents/sign', {
        serviceId,
        digitalSignature: signature.trim(),
      });
      setMyConsents(prev => [data, ...prev]);
      setSignOk(true);
      setServiceId('');
      setSignature('');
      setAgreed(false);
      setTimeout(() => setSignOk(false), 4000);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSignErr(msg ?? 'Error al registrar el consentimiento. Intenta de nuevo.');
    } finally {
      setSigning(false);
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Box sx={{ flex: 1, py: { xs: 3, md: 5 }, px: { xs: 2, md: 0 } }}>
        <Box sx={{ maxWidth: 860, mx: 'auto' }}>

          <Button startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate('/dashboard')}
            sx={{ color: '#5A7A74', fontWeight: 600, mb: 3, textTransform: 'none',
                  '&:hover': { bgcolor: 'transparent', color: '#3DAA96' } }}>
            Volver al inicio
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <GavelOutlinedIcon sx={{ color: '#3DAA96', fontSize: 26 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
              Consentimientos Informados
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Firma tu consentimiento antes de cada terapia. El proceso es digital, seguro y legalmente válido en Colombia.
          </Typography>

          <Grid container spacing={3}>

            {/* ── Formulario de firma ── */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                          boxShadow: '0 4px 20px rgba(61,170,150,0.08)' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mb: 2.5 }}>
                    Firmar nuevo consentimiento
                  </Typography>

                  {signOk && (
                    <Alert severity="success" icon={<CheckCircleOutlinedIcon />}
                      sx={{ mb: 2.5, borderRadius: 2 }}>
                      ¡Consentimiento firmado exitosamente!
                    </Alert>
                  )}
                  {signErr && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}
                      onClose={() => setSignErr('')}>{signErr}</Alert>
                  )}

                  {/* Selector de servicio */}
                  <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                    <InputLabel>Selecciona la terapia *</InputLabel>
                    <Select
                      value={serviceId}
                      label="Selecciona la terapia *"
                      onChange={e => setServiceId(e.target.value as number)}
                      sx={{ borderRadius: 2 }}
                    >
                      {services.map(s => (
                        <MenuItem key={s.id} value={Number(s.id)}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Preview del consentimiento */}
                  {preview && (
                    <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 2, p: 2,
                               border: '1px solid #D4EDE7', mb: 2.5,
                               maxHeight: 240, overflowY: 'auto' }}>
                      <Typography sx={{ fontSize: '0.78rem', lineHeight: 1.8,
                                         color: '#2A3A38', whiteSpace: 'pre-wrap',
                                         fontFamily: 'Georgia, serif' }}>
                        {preview}
                      </Typography>
                    </Box>
                  )}

                  {/* Firma */}
                  <TextField
                    fullWidth size="small"
                    label="Tu firma digital — escribe tu nombre completo *"
                    value={signature}
                    onChange={e => setSignature(e.target.value)}
                    disabled={serviceId === ''}
                    helperText="Escribe exactamente tu nombre completo tal como aparece en tu cédula"
                    sx={{ mb: 2,
                          '& .MuiOutlinedInput-root': { borderRadius: 2,
                            fontFamily: 'Georgia, serif', fontSize: '1rem' } }}
                  />

                  {/* Aceptación */}
                  <Box
                    onClick={() => serviceId !== '' && setAgreed(v => !v)}
                    sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, cursor: 'pointer',
                         mb: 3, p: 1.5, borderRadius: 2,
                         bgcolor: agreed ? '#E8F5F0' : '#F9F9F9',
                         border: `1px solid ${agreed ? '#B2DDD4' : '#E4F0ED'}`,
                         transition: 'all 0.2s' }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: 1, flexShrink: 0, mt: 0.1,
                      bgcolor: agreed ? '#3DAA96' : '#fff',
                      border: `2px solid ${agreed ? '#3DAA96' : '#C5DDD8'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {agreed && <CheckCircleOutlinedIcon sx={{ fontSize: 14, color: '#fff' }} />}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#1A2E2A', lineHeight: 1.6 }}>
                      He leído y comprendo el contenido del consentimiento informado. Acepto
                      libre y voluntariamente el tratamiento descrito y autorizo el uso de mis
                      datos de salud conforme a la normativa colombiana.
                    </Typography>
                  </Box>

                  <Button
                    fullWidth variant="contained"
                    disabled={!canSign || signing}
                    onClick={handleSign}
                    startIcon={signing
                      ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                      : <DrawOutlinedIcon />}
                    sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 800, py: 1.4,
                          fontSize: '0.95rem', '&:hover': { bgcolor: '#2B8A78' },
                          '&.Mui-disabled': { bgcolor: '#C5DDD8', color: '#fff' } }}
                  >
                    {signing ? 'Firmando…' : 'Firmar consentimiento'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* ── Mis consentimientos ── */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mb: 0.5 }}>
                    Mis consentimientos
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {user?.name}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[1, 2, 3].map(i => (
                        <Box key={i} sx={{ height: 56, bgcolor: '#F4FAF8', borderRadius: 2 }} />
                      ))}
                    </Box>
                  ) : myConsents.length === 0 ? (
                    <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', py: 3 }}>
                      Aún no has firmado ningún consentimiento.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {myConsents.map(c => (
                        <Box key={c.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F4FAF8',
                                               border: '1px solid #E4F0ED' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between',
                                     alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A2E2A' }}>
                              {c.serviceName ?? 'Terapia general'}
                            </Typography>
                            <Chip label="Firmado" size="small"
                              sx={{ bgcolor: '#E8F5F0', color: '#27AE60', fontWeight: 700,
                                    fontSize: '0.65rem', height: 20 }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(c.signedAt)} · {c.digitalSignature ?? '—'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
