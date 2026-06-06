import { Box, Typography, Link, Stack, IconButton } from '@mui/material';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#F4FAF8',
        borderTop: '1px solid #D6EDE7',
        px: { xs: 3, md: 6 },
        py: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="subtitle1" sx={{ color: '#3DAA96', fontWeight: 700 }}>
          Ecosalud
        </Typography>
        <Typography variant="caption" color="text.secondary">
          © 2026 Ecosalud. Bogotá, Colombia. Especialista Dra. Angélica Camacho.
        </Typography>
      </Box>

      <Stack direction="row" spacing={3}>
        {['Privacidad', 'Términos', 'Contacto'].map((item) => (
          <Link key={item} href="#" underline="hover" variant="body2" color="text.secondary">
            {item}
          </Link>
        ))}
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
        <VerifiedUserOutlinedIcon sx={{ color: '#3DAA96', fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Salud Certificada
        </Typography>
        <IconButton size="small" sx={{ color: '#7A9E98' }}><ShareOutlinedIcon fontSize="small" /></IconButton>
        <IconButton size="small" sx={{ color: '#7A9E98' }}><EmailOutlinedIcon fontSize="small" /></IconButton>
      </Stack>
    </Box>
  );
}
