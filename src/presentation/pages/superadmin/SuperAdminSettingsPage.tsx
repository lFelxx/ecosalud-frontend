/**
 * SuperAdminSettingsPage — Configuración global de la plataforma.
 *
 * El super-admin edita:
 * - Redes sociales (WhatsApp, Email, Instagram, Facebook, Twitter)
 * - Información de contacto (email soporte, teléfono, dirección, horario)
 * - Páginas legales (Política de privacidad, Términos y condiciones)
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, TextField, Button,
  IconButton, Alert, CircularProgress, Divider, Chip,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import XIcon from '@mui/icons-material/X';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import axiosClient from '../../../infrastructure/http/axiosClient';

// ── Grupos de configuración ────────────────────────────────────────────────────

const SETTING_GROUPS = [
  {
    id: 'social',
    label: 'Redes Sociales',
    desc: 'Links que aparecen como iconos en el footer',
    color: '#3DAA96',
    fields: [
      { key: 'social.whatsapp',  label: 'WhatsApp',  placeholder: '+573001234567', icon: <WhatsAppIcon sx={{ fontSize: 18, color: '#25D366' }} />, type: 'tel' },
      { key: 'social.email',     label: 'Email público', placeholder: 'contacto@ecosalud.com', icon: <EmailOutlinedIcon sx={{ fontSize: 18, color: '#3DAA96' }} />, type: 'email' },
      { key: 'social.instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/ecosalud', icon: <InstagramIcon sx={{ fontSize: 18, color: '#E1306C' }} />, type: 'url' },
      { key: 'social.facebook',  label: 'Facebook URL',  placeholder: 'https://facebook.com/ecosalud', icon: <FacebookOutlinedIcon sx={{ fontSize: 18, color: '#1877F2' }} />, type: 'url' },
      { key: 'social.twitter',   label: 'Twitter/X URL', placeholder: 'https://x.com/ecosalud', icon: <XIcon sx={{ fontSize: 18, color: '#1A1A1A' }} />, type: 'url' },
    ],
  },
  {
    id: 'contact',
    label: 'Información de Contacto',
    desc: 'Visible en la página /contacto',
    color: '#5A5FC8',
    fields: [
      { key: 'contact.email',    label: 'Email de soporte',  placeholder: 'soporte@ecosalud.com', icon: <EmailOutlinedIcon sx={{ fontSize: 18, color: '#5A5FC8' }} />, type: 'email' },
      { key: 'contact.phone',    label: 'Teléfono',          placeholder: '+57 (601) 123-4567',   icon: <PhoneOutlinedIcon sx={{ fontSize: 18, color: '#5A5FC8' }} />, type: 'tel' },
      { key: 'contact.address',  label: 'Dirección',         placeholder: 'Bogotá, Colombia',     icon: <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#5A5FC8' }} />, type: 'text' },
      { key: 'contact.schedule', label: 'Horario',           placeholder: 'Lun–Vie, 8AM–6PM',    icon: null, type: 'text' },
    ],
  },
];

const LEGAL_FIELDS = [
  { key: 'legal.privacy', label: 'Política de Privacidad', link: '/privacidad', icon: <SecurityOutlinedIcon sx={{ fontSize: 20, color: '#3DAA96' }} /> },
  { key: 'legal.terms',   label: 'Términos y Condiciones', link: '/terminos',   icon: <GavelOutlinedIcon    sx={{ fontSize: 20, color: '#C0392B' }} /> },
];

// ── Componente ─────────────────────────────────────────────────────────────────

export default function SuperAdminSettingsPage() {
  const navigate = useNavigate();
  const [values,  setValues]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<Record<string, boolean>>({});
  const [saved,   setSaved]   = useState<Record<string, boolean>>({});
  const [error,   setError]   = useState<string | null>(null);

  // ── Carga ────────────────────────────────────────────────────────────────────

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const r = await axiosClient.get<Record<string, string>>('/public/settings');
      setValues(r.data);
    } catch {
      setError('No se pudieron cargar las configuraciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Inicializar defaults si no existen
    axiosClient.post('/platform/settings/init').catch(() => {});
    loadSettings();
  }, [loadSettings]);

  // ── Guardar setting individual ───────────────────────────────────────────────

  const save = async (key: string) => {
    setSaving(s => ({ ...s, [key]: true }));
    setError(null);
    try {
      await axiosClient.put(`/platform/settings/${encodeURIComponent(key)}`, { value: values[key] ?? '' });
      setSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2000);
    } catch {
      setError(`Error al guardar '${key}'.`);
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  // ── Guardar grupo completo ────────────────────────────────────────────────────

  const saveGroup = async (keys: string[]) => {
    for (const key of keys) await save(key);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <IconButton onClick={() => navigate('/superadmin')} size="small"
            sx={{ bgcolor: '#fff', border: '1px solid #E4F0ED' }}>
            <ArrowBackOutlinedIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SettingsOutlinedIcon sx={{ color: '#3DAA96', fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A', lineHeight: 1 }}>
                Configuración de la plataforma
              </Typography>
              <Typography variant="caption" sx={{ color: '#9DBFBA' }}>
                Redes sociales, contacto y páginas legales
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#3DAA96' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>

            {/* Grupos de redes sociales y contacto */}
            {SETTING_GROUPS.map(group => (
              <Grid key={group.id} size={12}>
                <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED', overflow: 'hidden' }}>
                  <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E4F0ED' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#1A2E2A' }}>{group.label}</Typography>
                      <Typography variant="caption" sx={{ color: '#9DBFBA' }}>{group.desc}</Typography>
                    </Box>
                    <Button
                      onClick={() => saveGroup(group.fields.map(f => f.key))}
                      variant="outlined" size="small" startIcon={<SaveOutlinedIcon sx={{ fontSize: 15 }} />}
                      sx={{ borderColor: group.color, color: group.color, borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: `${group.color}10` } }}
                    >
                      Guardar todo
                    </Button>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {group.fields.map(field => (
                        <Grid key={field.key} size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              fullWidth
                              label={field.label}
                              type={field.type}
                              value={values[field.key] ?? ''}
                              onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                              placeholder={field.placeholder}
                              size="small"
                              InputProps={field.icon ? { startAdornment: <Box sx={{ mr: 1, display: 'flex' }}>{field.icon}</Box> } : undefined}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.8, gap: 1 }}>
                              {saved[field.key] && (
                                <Chip label="✓ Guardado" size="small" sx={{ bgcolor: '#EAF7EE', color: '#27AE60', fontWeight: 700, fontSize: '0.62rem' }} />
                              )}
                              <Button
                                onClick={() => save(field.key)}
                                disabled={saving[field.key]}
                                size="small"
                                sx={{ color: group.color, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', minWidth: 'auto' }}
                              >
                                {saving[field.key] ? <CircularProgress size={14} sx={{ color: group.color }} /> : 'Guardar'}
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </Grid>
            ))}

            {/* Páginas legales */}
            <Grid size={12}>
              <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED', overflow: 'hidden' }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E4F0ED' }}>
                  <Typography sx={{ fontWeight: 800, color: '#1A2E2A' }}>Páginas legales</Typography>
                  <Typography variant="caption" sx={{ color: '#9DBFBA' }}>
                    Texto visible en /privacidad y /terminos — edita con claridad, son documentos legales
                  </Typography>
                </Box>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {LEGAL_FIELDS.map(field => (
                    <Accordion key={field.key} sx={{ border: '1px solid #E4F0ED', borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 'none' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                          {field.icon}
                          <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.9rem' }}>{field.label}</Typography>
                          <Button
                            component="a" href={field.link} target="_blank"
                            size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                            sx={{ ml: 'auto', mr: 2, color: '#9DBFBA', textTransform: 'none', fontSize: '0.72rem' }}
                            onClick={e => e.stopPropagation()}
                          >
                            Ver página
                          </Button>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Divider sx={{ mb: 2 }} />
                        <TextField
                          fullWidth multiline rows={12}
                          value={values[field.key] ?? ''}
                          onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                          placeholder="Ingresa el contenido completo..."
                          sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.7 } }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5, gap: 1, alignItems: 'center' }}>
                          {saved[field.key] && (
                            <Chip label="✓ Guardado" size="small" sx={{ bgcolor: '#EAF7EE', color: '#27AE60', fontWeight: 700 }} />
                          )}
                          <Button
                            onClick={() => save(field.key)}
                            disabled={saving[field.key]}
                            variant="contained" startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                            sx={{ bgcolor: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
                          >
                            {saving[field.key] ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Guardar cambios'}
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Box>
            </Grid>

          </Grid>
        )}
      </Container>
    </Box>
  );
}
