import { Link as RouterLink, useParams, Navigate } from 'react-router-dom';
import {
  Box, Typography, Container, Chip, Avatar, Button, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuthContext } from '../../context/AuthContext';

export default function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { posts } = useAdminData();
  const { user } = useAuthContext();

  const post = posts.find((p) => p.id === id);

  // Si no existe o es borrador (sin permisos), redirigir
  if (!post) return <Navigate to="/publications" replace />;
  if (post.status === 'draft' && user?.role !== 'ADMIN' && user?.role !== 'EDITOR') {
    return <Navigate to="/publications" replace />;
  }

  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="md" sx={{ flex: 1, py: { xs: 3, md: 5 } }}>

        {/* Nav superior */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Button
            component={RouterLink}
            to="/publications"
            startIcon={<ArrowBackIcon />}
            sx={{ color: '#5A7A74', fontWeight: 600, textTransform: 'none' }}
          >
            Publicaciones
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {post.status === 'draft' && (
              <Chip label="Borrador" size="small" sx={{ fontWeight: 700, bgcolor: '#FFF3E0', color: '#F39C12' }} />
            )}
            {canEdit && (
              <Button
                component={RouterLink}
                to={`/admin/posts/edit/${post.id}`}
                variant="outlined"
                size="small"
                startIcon={<EditOutlinedIcon />}
                sx={{ borderColor: '#C5DDD8', color: '#3DAA96', borderRadius: 2, fontWeight: 600, '&:hover': { borderColor: '#3DAA96' } }}
              >
                Editar
              </Button>
            )}
          </Box>
        </Box>

        {/* Tags */}
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
          {post.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#E8F5F0', color: '#3DAA96' }}
            />
          ))}
        </Box>

        {/* Título */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: '#1A2E2A',
            lineHeight: 1.2,
            mb: 2,
            fontSize: { xs: '1.6rem', md: '2.2rem' },
          }}
        >
          {post.title}
        </Typography>

        {/* Extracto */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ lineHeight: 1.75, mb: 3, fontSize: '1.05rem', fontStyle: 'italic' }}
        >
          {post.excerpt}
        </Typography>

        {/* Meta */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#3DAA96', fontSize: '0.8rem', fontWeight: 700 }}>
              {post.authorName.charAt(0)}
            </Avatar>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1A2E2A' }}>
              {post.authorName}
            </Typography>
          </Box>
          {post.publishedAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#9DBFBA' }} />
              <Typography sx={{ fontSize: '0.82rem', color: '#9DBFBA' }}>
                {new Date(post.publishedAt).toLocaleDateString('es-CO', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Imagen de portada */}
        {post.imageBase64 ? (
          <Box
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              mb: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
            }}
          >
            <Box
              component="img"
              src={post.imageBase64}
              alt={post.title}
              sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              height: 220,
              borderRadius: 3,
              bgcolor: '#E8F5F0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              border: '1px solid #D4EDE7',
            }}
          >
            <ImageOutlinedIcon sx={{ fontSize: 48, color: '#B2DDD4', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">Sin imagen de portada</Typography>
          </Box>
        )}

        {/* Contenido */}
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            border: '1px solid #E4F0ED',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            mb: 4,
          }}
        >
          <Typography
            component="div"
            sx={{
              fontSize: '1rem',
              lineHeight: 1.85,
              color: '#2D4A44',
              whiteSpace: 'pre-wrap',
              '& p': { mb: 2 },
            }}
          >
            {post.content}
          </Typography>
        </Box>

        {/* Footer de artículo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: '#E8F5F0',
            borderRadius: 3,
            p: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 20 }} />
            <Typography sx={{ fontWeight: 600, color: '#2B8A78', fontSize: '0.875rem' }}>
              Ecosalud — Medicina Integrativa
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/publications"
            sx={{ color: '#3DAA96', fontWeight: 700, textTransform: 'none', fontSize: '0.85rem' }}
          >
            Ver más publicaciones →
          </Button>
        </Box>

      </Container>

      <Footer />
    </Box>
  );
}
