import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Dialog, Box, Typography, Button, Chip, Divider, IconButton, Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';

export interface ServiceBenefit {
  icon: ReactNode;
  text: string;
}

export interface ServiceDetail {
  name: string;
  category: string;
  description: string;
  benefits: ServiceBenefit[];
  duration: string;
  price: string;
  image: string;
  icon: ReactNode;
}

interface Props {
  service: ServiceDetail | null;
  onClose: () => void;
}

// Imagen con fallback al ícono del servicio
function ModalImage({ src, icon }: { src: string; icon: ReactNode }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #2B8A78 0%, #3DAA96 50%, #5BBFAD 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            '& svg': { fontSize: 100, color: 'rgba(255,255,255,0.35)' },
          }}
        >
          {icon}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt=""
      onError={() => setErrored(true)}
      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

export default function ServiceDetailModal({ service, onClose }: Props) {
  if (!service) return null;

  return (
    <Dialog
      open={Boolean(service)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            minHeight: { md: 520 },
            m: { xs: 1.5, md: 3 },
          },
        },
      }}
    >
      {/* ── Panel izquierdo: imagen ── */}
      <Box
        sx={{
          flex: { xs: 'none', md: '0 0 42%' },
          height: { xs: 220, md: 'auto' },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ModalImage src={service.image} icon={service.icon} />
      </Box>

      {/* ── Panel derecho: contenido ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 3, md: 4 },
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Botón cerrar */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            color: '#8AACA6',
            bgcolor: '#F0F8F5',
            '&:hover': { bgcolor: '#E8F5F0', color: '#3DAA96' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Categoría */}
        <Chip
          label={service.category}
          size="small"
          sx={{
            alignSelf: 'flex-start',
            mb: 1.5,
            bgcolor: '#E8F5F0',
            color: '#3DAA96',
            fontWeight: 600,
            fontSize: '0.78rem',
            border: '1px solid #B2DDD4',
            borderRadius: '999px',
            mr: 4, // espacio para el botón cerrar
          }}
        />

        {/* Título */}
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: '#1A2E2A', mb: 1.5, fontSize: { xs: '1.5rem', md: '1.8rem' } }}
        >
          {service.name}
        </Typography>

        {/* Descripción */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.75, mb: 2.5 }}
        >
          {service.description}
        </Typography>

        {/* Beneficios */}
        <Stack spacing={1.2} sx={{ mb: 3 }}>
          {service.benefits.map((b, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: '#E8F5F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  '& svg': { fontSize: 17, color: '#3DAA96' },
                }}
              >
                {b.icon}
              </Box>
              <Typography variant="body2" sx={{ color: '#2D4A44', fontWeight: 500 }}>
                {b.text}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Espaciador */}
        <Box sx={{ flex: 1 }} />

        <Divider sx={{ mb: 2.5 }} />

        {/* Duración y precio */}
        <Box sx={{ display: 'flex', gap: 4, mb: 2.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4 }}>
              <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: '#9DBFBA' }} />
              <Typography variant="caption" sx={{ color: '#9DBFBA', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                Duración
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '1.1rem' }}>
              {service.duration}
            </Typography>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4 }}>
              <AttachMoneyOutlinedIcon sx={{ fontSize: 13, color: '#9DBFBA' }} />
              <Typography variant="caption" sx={{ color: '#9DBFBA', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                Precio
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#3DAA96', fontSize: '1.2rem' }}>
              {service.price}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Botones */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={RouterLink}
            to="/appointments/book"
            variant="contained"
            sx={{
              flex: 1,
              minWidth: 140,
              bgcolor: '#3DAA96',
              borderRadius: 2,
              fontWeight: 700,
              py: 1.3,
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(61,170,150,0.30)',
              '&:hover': { bgcolor: '#2B8A78', boxShadow: '0 6px 18px rgba(61,170,150,0.40)' },
            }}
          >
            Agendar ahora
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              flex: 1,
              minWidth: 120,
              borderColor: '#C5DDD8',
              color: '#5A7A74',
              borderRadius: 2,
              fontWeight: 600,
              py: 1.3,
              fontSize: '0.95rem',
              '&:hover': { borderColor: '#3DAA96', color: '#3DAA96', bgcolor: '#F0F8F5' },
            }}
          >
            Cerrar
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
