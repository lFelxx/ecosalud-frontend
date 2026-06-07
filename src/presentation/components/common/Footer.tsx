/**
 * Footer de la plataforma Ecosalud Market.
 *
 * Layout de 3 columnas (flex:1 cada una):
 *   [Logo + copyright]   |   Privacidad · Términos · Contacto   |   [Iconos sociales]
 *   ← esquina izquierda           centrado exacto                    esquina derecha →
 *
 * En móvil: apila en columna, todo centrado.
 */

import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import XIcon from '@mui/icons-material/X';
import { useEffect, useState } from 'react';
import axiosClient from '../../../infrastructure/http/axiosClient';

interface SocialSettings {
  whatsapp:  string;
  email:     string;
  instagram: string;
  facebook:  string;
  twitter:   string;
}

const LEGAL_LINKS = [
  { label: 'Privacidad', to: '/privacidad' },
  { label: 'Términos',   to: '/terminos'   },
  { label: 'Contacto',   to: '/contacto'   },
];

export default function Footer() {
  const [social, setSocial] = useState<SocialSettings>({
    whatsapp: '', email: '', instagram: '', facebook: '', twitter: '',
  });

  useEffect(() => {
    axiosClient.get<Record<string, string>>('/public/settings')
      .then(r => {
        const s = r.data;
        setSocial({
          whatsapp:  s['social.whatsapp']  ?? '',
          email:     s['social.email']     ?? '',
          instagram: s['social.instagram'] ?? '',
          facebook:  s['social.facebook']  ?? '',
          twitter:   s['social.twitter']   ?? '',
        });
      })
      .catch(() => {});
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#F4FAF8',
        borderTop: '1px solid #D6EDE7',
      }}
    >
      {/* ── Fila principal: 3 columnas simétricas al 100% del ancho ── */}
      <Box sx={{
        width: '100%',
        boxSizing: 'border-box',
        px: { xs: 3, sm: 5, md: 7 },
        py: { xs: 1.8, md: 2 },

        // Desktop: fila de 3 columnas con flex:1 → extremos al borde, centro exacto
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: { xs: 1.5, sm: 0 },
      }}>

        {/* ── Columna izquierda: Logo + copyright ── */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-start' },
          gap: 0.8,
          minWidth: 0,
        }}>
          <SpaIcon sx={{ color: '#3DAA96', fontSize: 16, flexShrink: 0 }} />
          <Box>
            <Typography sx={{
              color: '#3DAA96', fontWeight: 800,
              fontSize: '0.85rem', lineHeight: 1,
            }}>
              Ecosalud Market
            </Typography>
            <Typography variant="caption" sx={{
              color: '#9DBFBA', fontSize: '0.66rem', lineHeight: 1.3,
              display: 'block',
            }}>
              © {new Date().getFullYear()} Ecosalud Market SAS · Bogotá
            </Typography>
          </Box>
        </Box>

        {/* ── Columna central: Links legales — centrado puro ── */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 2.5, sm: 3, md: 4 },
          flexWrap: 'wrap',
        }}>
          {LEGAL_LINKS.map(link => (
            <Box
              key={link.to}
              component={RouterLink}
              to={link.to}
              sx={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#5A7A74',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'color 0.18s',
                '&:hover': { color: '#3DAA96' },
              }}
            >
              {link.label}
            </Box>
          ))}
        </Box>

        {/* ── Columna derecha: Iconos sociales ── */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          gap: 0.3,
          minWidth: 0,
        }}>
          {social.whatsapp && (
            <Tooltip title="WhatsApp">
              <IconButton
                component="a"
                href={`https://wa.me/${social.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank" rel="noopener" size="small"
                sx={{ color: '#25D366', p: 0.65, '&:hover': { bgcolor: '#25D36615' } }}
              >
                <WhatsAppIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          {social.email && (
            <Tooltip title={social.email}>
              <IconButton
                component="a" href={`mailto:${social.email}`}
                size="small"
                sx={{ color: '#3DAA96', p: 0.65, '&:hover': { bgcolor: '#3DAA9615' } }}
              >
                <EmailOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          {social.instagram && (
            <Tooltip title="Instagram">
              <IconButton
                component="a" href={social.instagram}
                target="_blank" rel="noopener" size="small"
                sx={{ color: '#E1306C', p: 0.65, '&:hover': { bgcolor: '#E1306C15' } }}
              >
                <InstagramIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          {social.facebook && (
            <Tooltip title="Facebook">
              <IconButton
                component="a" href={social.facebook}
                target="_blank" rel="noopener" size="small"
                sx={{ color: '#1877F2', p: 0.65, '&:hover': { bgcolor: '#1877F215' } }}
              >
                <FacebookOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          {social.twitter && (
            <Tooltip title="Twitter / X">
              <IconButton
                component="a" href={social.twitter}
                target="_blank" rel="noopener" size="small"
                sx={{ color: '#555', p: 0.65, '&:hover': { bgcolor: '#55555512' } }}
              >
                <XIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── Línea de compliance — muy fina y discreta ── */}
      <Box sx={{
        borderTop: '1px dashed #E4F0ED',
        py: 0.8,
        textAlign: 'center',
        px: { xs: 3, sm: 5, md: 7 },
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <Typography variant="caption" sx={{ color: '#C8DDD9', fontSize: '0.62rem' }}>
          Plataforma de gestión clínica · Res. 1995/1999 MinSalud · Ley 1581/2012
        </Typography>
      </Box>
    </Box>
  );
}
