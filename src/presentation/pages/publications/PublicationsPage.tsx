import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardContent,
  Chip, Avatar, Button,
} from '@mui/material';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuthContext } from '../../context/AuthContext';
import { useSeo } from '../../hooks/useSeo';

function PostCard({ post, featured = false }: { post: { id: string; title: string; excerpt: string; imageBase64?: string; tags: string[]; authorName: string; publishedAt?: string }; featured?: boolean }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #E4F0ED',
        boxShadow: featured ? '0 8px 30px rgba(61,170,150,0.14)' : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.22s',
        '&:hover': {
          boxShadow: '0 8px 28px rgba(61,170,150,0.18)',
          transform: 'translateY(-2px)',
          borderColor: '#3DAA96',
        },
        overflow: 'hidden',
      }}
    >
      {/* Imagen */}
      <Box
        sx={{
          height: featured ? { xs: 200, md: 260 } : 160,
          bgcolor: '#E8F5F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {post.imageBase64 ? (
          <Box
            component="img"
            src={post.imageBase64}
            alt={post.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ textAlign: 'center', opacity: 0.4 }}>
            <ImageOutlinedIcon sx={{ fontSize: featured ? 56 : 40, color: '#3DAA96' }} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ p: featured ? 3 : 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.2 }}>
          {post.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#E8F5F0', color: '#3DAA96' }}
            />
          ))}
        </Box>

        {/* Título */}
        <Typography
          variant={featured ? 'h5' : 'h6'}
          sx={{
            fontWeight: 800,
            color: '#1A2E2A',
            lineHeight: 1.3,
            mb: 1,
            fontSize: featured ? { xs: '1.1rem', md: '1.3rem' } : '1rem',
          }}
        >
          {post.title}
        </Typography>

        {/* Extracto */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.65, flex: 1, mb: 2, fontSize: featured ? '0.9rem' : '0.82rem' }}
        >
          {post.excerpt}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: '#3DAA96', fontSize: '0.65rem', fontWeight: 700 }}>
              {post.authorName.charAt(0)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A2E2A', lineHeight: 1 }}>
                {post.authorName}
              </Typography>
              {post.publishedAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 10, color: '#9DBFBA' }} />
                  <Typography sx={{ fontSize: '0.65rem', color: '#9DBFBA' }}>
                    {new Date(post.publishedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Button
            component={RouterLink}
            to={`/publications/${post.id}`}
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{ color: '#3DAA96', fontWeight: 700, fontSize: '0.78rem', textTransform: 'none' }}
          >
            Leer más
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function PublicationsPage() {
  const { posts, markAllRead, specialist } = useAdminData();
  const { user, isAuthenticated } = useAuthContext();

  useSeo(
    `Blog de salud | ${specialist.name} — Ecosalud`,
    `Artículos y consejos de ${specialist.specialty}. Lee nuestras publicaciones sobre bienestar, terapias y salud integral.`,
  );

  const published = posts
    .filter((p) => p.status === 'published')
    .sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime());

  // Marcar como leídas cuando el usuario visita esta página
  useEffect(() => {
    if (isAuthenticated && user) {
      markAllRead(user.id);
    }
  }, [isAuthenticated, user, markAllRead]);

  const [featured, ...rest] = published;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 6 } }}>

        {/* Hero header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, bgcolor: '#E8F5F0', border: '1px solid #B2DDD4', borderRadius: '999px', px: 2, py: 0.6, mb: 2 }}>
            <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#3DAA96', fontWeight: 700, fontSize: '0.75rem' }}>
              Blog & Noticias
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1A2E2A', lineHeight: 1.15, mb: 1.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Publicaciones de Ecosalud
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.7 }}>
            Artículos, novedades, promociones y contenido educativo sobre terapias integrativas y bienestar natural.
          </Typography>
        </Box>

        {published.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <SpaOutlinedIcon sx={{ fontSize: 64, color: '#D4EDE7', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#5A7A74', fontWeight: 600 }}>Próximamente</Typography>
            <Typography variant="body2" color="text.secondary">
              Estamos preparando contenido especial para ti.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Post destacado */}
            {featured && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="overline" sx={{ color: '#3DAA96', fontWeight: 700, letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
                  ✦ Más reciente
                </Typography>
                <PostCard post={featured} featured />
              </Box>
            )}

            {/* Grid del resto */}
            {rest.length > 0 && (
              <>
                <Typography variant="overline" sx={{ color: '#9DBFBA', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                  Otras publicaciones
                </Typography>
                <Grid container spacing={2.5}>
                  {rest.map((post) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                      <PostCard post={post} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* CTA para admins */}
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
              <Box sx={{ mt: 5, textAlign: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/admin/posts/new"
                  variant="outlined"
                  startIcon={<SpaOutlinedIcon />}
                  sx={{ borderColor: '#C5DDD8', color: '#3DAA96', borderRadius: 2, fontWeight: 600, '&:hover': { borderColor: '#3DAA96', bgcolor: '#F0F8F5' } }}
                >
                  + Nueva publicación
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
