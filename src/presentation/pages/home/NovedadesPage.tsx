/**
 * NovedadesPage — Blog público de la plataforma Ecosalud Market.
 *
 * Muestra las publicaciones creadas por el super-admin (novedades, ofertas,
 * tutoriales). Consume GET /api/public/blog — no requiere JWT ni X-Tenant-Slug.
 */

import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardContent,
  Chip, Avatar, Button, Skeleton, Divider,
} from '@mui/material';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PlatformNavbar from '../../components/common/PlatformNavbar';
import Footer from '../../components/common/Footer';
import { useSeo } from '../../hooks/useSeo';
import axiosClient from '../../../infrastructure/http/axiosClient';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface PlatformPost {
  id:           number;
  title:        string;
  excerpt:      string;
  content?:     string;
  imageUrl?:    string;
  tags:         string[];
  category:     string;
  status:       string;
  authorName:   string;
  publishedAt:  string | null;
  createdAt:    string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  NOVEDAD:       { label: 'Novedad',       color: '#3DAA96', bg: '#E8F5F0' },
  OFERTA:        { label: 'Oferta',        color: '#E67E22', bg: '#FFF3E8' },
  TUTORIAL:      { label: 'Tutorial',      color: '#5A5FC8', bg: '#EEEEF8' },
  GENERAL:       { label: 'General',       color: '#5A7A74', bg: '#F4FAF8' },
  ACTUALIZACION: { label: 'Actualización', color: '#27AE60', bg: '#EAF7EE' },
};

function categoryStyle(cat: string) {
  return CATEGORY_LABELS[cat] ?? CATEGORY_LABELS.GENERAL;
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── PostCard ───────────────────────────────────────────────────────────────────

function PostCard({ post, featured = false }: { post: PlatformPost; featured?: boolean }) {
  const cat = categoryStyle(post.category);
  return (
    <Card sx={{
      borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column',
      border: '1px solid #E4F0ED',
      boxShadow: featured ? '0 8px 30px rgba(61,170,150,0.12)' : '0 2px 10px rgba(0,0,0,0.04)',
      transition: 'all 0.22s',
      '&:hover': { boxShadow: '0 8px 28px rgba(61,170,150,0.18)', transform: 'translateY(-3px)', borderColor: '#3DAA96' },
      overflow: 'hidden',
    }}>
      {/* Imagen */}
      <Box sx={{
        height: featured ? { xs: 200, md: 260 } : 160, bgcolor: '#E8F5F0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0, position: 'relative',
      }}>
        {post.imageUrl ? (
          <Box component="img" src={post.imageUrl} alt={post.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ textAlign: 'center', opacity: 0.35 }}>
            <ImageOutlinedIcon sx={{ fontSize: featured ? 56 : 40, color: '#3DAA96' }} />
          </Box>
        )}
        {/* Category badge */}
        <Chip
          label={cat.label}
          size="small"
          sx={{
            position: 'absolute', top: 10, left: 10,
            bgcolor: cat.bg, color: cat.color, fontWeight: 800,
            fontSize: '0.65rem', border: `1px solid ${cat.color}30`,
          }}
        />
      </Box>

      <CardContent sx={{ p: featured ? 3 : 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.2 }}>
          {post.tags.slice(0, 3).map((tag) => (
            <Chip key={tag} label={tag.trim()} size="small"
              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#F4FAF8', color: '#5A7A74' }} />
          ))}
        </Box>

        <Typography variant={featured ? 'h5' : 'h6'} sx={{
          fontWeight: 800, color: '#1A2E2A', lineHeight: 1.3, mb: 1,
          fontSize: featured ? { xs: '1.1rem', md: '1.25rem' } : '1rem',
        }}>
          {post.title}
        </Typography>

        <Typography variant="body2" color="text.secondary"
          sx={{ lineHeight: 1.7, flex: 1, mb: 2, fontSize: featured ? '0.9rem' : '0.82rem' }}>
          {post.excerpt}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: '#3DAA96', fontSize: '0.65rem', fontWeight: 700 }}>
              {post.authorName?.charAt(0) ?? 'E'}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.73rem', fontWeight: 600, color: '#1A2E2A', lineHeight: 1 }}>
                {post.authorName}
              </Typography>
              {post.publishedAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 10, color: '#9DBFBA' }} />
                  <Typography sx={{ fontSize: '0.62rem', color: '#9DBFBA' }}>
                    {formatDate(post.publishedAt)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Button component={RouterLink} to={`/novedades/${post.id}`} size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{ color: '#3DAA96', fontWeight: 700, fontSize: '0.78rem', textTransform: 'none' }}>
            Leer más
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────────

function PostSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED', overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={featured ? 240 : 160} />
      <CardContent>
        <Skeleton width="30%" height={20} sx={{ mb: 1 }} />
        <Skeleton width="90%" height={28} sx={{ mb: 0.5 }} />
        <Skeleton width="70%" height={28} sx={{ mb: 1.5 }} />
        <Skeleton width="100%" height={16} />
        <Skeleton width="85%" height={16} />
        <Skeleton width="60%" height={16} />
      </CardContent>
    </Card>
  );
}

// ── Vista de detalle de un post ─────────────────────────────────────────────────

function PostDetail({ id }: { id: number }) {
  const [post, setPost] = useState<PlatformPost | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useSeo(
    post ? `${post.title} | Novedades Ecosalud` : 'Novedades Ecosalud',
    post?.excerpt,
  );

  useEffect(() => {
    setLoading(true);
    axiosClient.get<PlatformPost>(`/public/blog/${id}`)
      .then(r => setPost(r.data))
      .catch(() => navigate('/novedades', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Skeleton height={40} width="80%" sx={{ mb: 2 }} />
      <Skeleton height={20} width="40%" sx={{ mb: 4 }} />
      {[1,2,3,4].map(i => <Skeleton key={i} height={16} sx={{ mb: 1 }} />)}
    </Container>
  );

  if (!post) return null;
  const cat = categoryStyle(post.category);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Button startIcon={<ArrowBackOutlinedIcon />}
        component={RouterLink} to="/novedades"
        sx={{ mb: 3, color: '#5A7A74', textTransform: 'none', fontWeight: 600, '&:hover': { color: '#3DAA96' } }}>
        Volver a Novedades
      </Button>

      {/* Header del post */}
      {post.imageUrl && (
        <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 4, maxHeight: 380 }}>
          <Box component="img" src={post.imageUrl} alt={post.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
      )}

      <Box sx={{ mb: 1 }}>
        <Chip label={cat.label} size="small"
          sx={{ bgcolor: cat.bg, color: cat.color, fontWeight: 800, fontSize: '0.7rem', mr: 1 }} />
        {post.tags.map(t => (
          <Chip key={t} label={t.trim()} size="small"
            sx={{ bgcolor: '#F4FAF8', color: '#5A7A74', fontWeight: 600, fontSize: '0.65rem', mr: 0.5 }} />
        ))}
      </Box>

      <Typography variant="h3" sx={{ fontWeight: 900, color: '#1A2E2A', lineHeight: 1.2, mt: 2, mb: 1.5, fontSize: { xs: '1.6rem', md: '2.2rem' } }}>
        {post.title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: '#3DAA96', fontWeight: 700, fontSize: '0.8rem' }}>
          {post.authorName?.charAt(0) ?? 'E'}
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.85rem', lineHeight: 1 }}>
            {post.authorName}
          </Typography>
          <Typography sx={{ color: '#9DBFBA', fontSize: '0.72rem' }}>
            {formatDate(post.publishedAt)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Contenido — text simple con saltos de línea */}
      <Box sx={{ '& p': { mb: 2, lineHeight: 1.85, color: '#2A3F38' }, '& h2': { mt: 3, mb: 1.5, fontWeight: 800, color: '#1A2E2A' } }}>
        {post.content?.split('\n').map((line, i) =>
          line.trim() ? (
            <Typography key={i} sx={{ mb: 1.5, lineHeight: 1.85, color: '#2A3F38', fontSize: '1rem' }}>
              {line}
            </Typography>
          ) : <Box key={i} sx={{ mb: 1 }} />
        )}
      </Box>
    </Container>
  );
}

// ── Lista principal ─────────────────────────────────────────────────────────────

export default function NovedadesPage() {
  const { id } = useParams<{ id?: string }>();
  const [posts, setPosts] = useState<PlatformPost[]>([]);
  const [loading, setLoading] = useState(true);

  useSeo(
    'Novedades | Ecosalud Market',
    'Blog oficial de la plataforma Ecosalud Market: nuevas funcionalidades, ofertas, tutoriales y actualizaciones.',
  );

  useEffect(() => {
    axiosClient.get<PlatformPost[]>('/public/blog')
      .then(r => setPosts(r.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  // Si hay un ID en la URL → mostrar detalle
  if (id) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
        <PlatformNavbar />
        <Box sx={{ flex: 1 }}>
          <PostDetail id={Number(id)} />
        </Box>
        <Footer />
      </Box>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <PlatformNavbar />

      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 6 } }}>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, bgcolor: '#E8F5F0', border: '1px solid #B2DDD4', borderRadius: '999px', px: 2, py: 0.6, mb: 2 }}>
            <CampaignOutlinedIcon sx={{ color: '#3DAA96', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#3DAA96', fontWeight: 700, fontSize: '0.75rem' }}>
              Blog oficial de la plataforma
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1A2E2A', lineHeight: 1.15, mb: 1.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Novedades de Ecosalud
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
            Nuevas funcionalidades, ofertas especiales, tutoriales y todo lo que está pasando en la plataforma.
          </Typography>
        </Box>

        {/* Loading state */}
        {loading && (
          <>
            <PostSkeleton featured />
            <Grid container spacing={2.5} sx={{ mt: 4 }}>
              {[1, 2, 3].map(i => <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}><PostSkeleton /></Grid>)}
            </Grid>
          </>
        )}

        {/* Sin publicaciones */}
        {!loading && posts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <SpaOutlinedIcon sx={{ fontSize: 64, color: '#D4EDE7', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#5A7A74', fontWeight: 700 }}>Próximamente</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 320, mx: 'auto' }}>
              Estamos preparando las primeras publicaciones sobre novedades de la plataforma.
            </Typography>
          </Box>
        )}

        {/* Con publicaciones */}
        {!loading && posts.length > 0 && (
          <>
            {/* Post destacado */}
            {featured && (
              <Box sx={{ mb: 5 }}>
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
                  Publicaciones anteriores
                </Typography>
                <Grid container spacing={2.5}>
                  {rest.map(post => (
                    <Grid key={post.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <PostCard post={post} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}

      </Container>

      <Footer />
    </Box>
  );
}
