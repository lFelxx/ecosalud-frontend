import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip, Avatar, Divider,
} from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuthContext } from '../../context/AuthContext';

function StatCard({ label, value, sub, icon, color }: { label: string; value: number | string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E4F0ED', height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { fontSize: 22, color } }}>
            {icon}
          </Box>
        </Box>
        <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#1A2E2A', lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontWeight: 600, color: '#1A2E2A', fontSize: '0.9rem', mt: 0.5 }}>{label}</Typography>
        <Typography variant="caption" color="text.secondary">{sub}</Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { posts, services, users } = useAdminData();
  const { user } = useAuthContext();

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = posts.filter((p) => p.status === 'draft');
  const activeUsers = users.filter((u) => u.status === 'ACTIVE');
  const isAdmin = user?.role === 'ADMIN';

  const recentPosts = [...posts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  ).slice(0, 5);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
          Bienvenido, {user?.name?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Publicaciones"
            value={publishedPosts.length}
            sub={`${draftPosts.length} borrador${draftPosts.length !== 1 ? 'es' : ''}`}
            icon={<ArticleOutlinedIcon />}
            color="#3DAA96"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Terapias activas"
            value={services.length}
            sub="en el catálogo"
            icon={<SpaOutlinedIcon />}
            color="#5B8FA8"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Usuarios"
            value={activeUsers.length}
            sub={`de ${users.length} registrados`}
            icon={<PeopleOutlinedIcon />}
            color="#7B68EE"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Borradores"
            value={draftPosts.length}
            sub="pendientes de publicar"
            icon={<EditNoteOutlinedIcon />}
            color="#F39C12"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Publicaciones recientes */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E4F0ED', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Typography sx={{ fontWeight: 700, color: '#1A2E2A' }}>Publicaciones recientes</Typography>
                <Button
                  component={RouterLink}
                  to="/admin/posts"
                  size="small"
                  sx={{ color: '#3DAA96', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  Ver todas
                </Button>
              </Box>

              {recentPosts.map((post, i) => (
                <Box key={post.id}>
                  {i > 0 && <Divider sx={{ my: 1.5 }} />}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: post.status === 'published' ? '#E8F5F0' : '#FFF3E0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {post.status === 'published'
                        ? <PublishOutlinedIcon sx={{ fontSize: 18, color: '#3DAA96' }} />
                        : <EditNoteOutlinedIcon sx={{ fontSize: 18, color: '#F39C12' }} />
                      }
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1A2E2A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                        <Chip
                          label={post.status === 'published' ? 'Publicado' : 'Borrador'}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: post.status === 'published' ? '#E8F5F0' : '#FFF3E0',
                            color: post.status === 'published' ? '#3DAA96' : '#F39C12',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {post.authorName} · {new Date(post.updatedAt).toLocaleDateString('es-CO')}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      component={RouterLink}
                      to={`/admin/posts/edit/${post.id}`}
                      size="small"
                      sx={{ color: '#9DBFBA', fontSize: '0.75rem', flexShrink: 0 }}
                    >
                      Editar
                    </Button>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones rápidas */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E4F0ED', mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mb: 2 }}>Acciones rápidas</Typography>

              <Button
                component={RouterLink}
                to="/admin/posts/new"
                variant="contained"
                fullWidth
                startIcon={<AddCircleOutlineIcon />}
                sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, mb: 1.5, '&:hover': { bgcolor: '#2B8A78' } }}
              >
                Nueva publicación
              </Button>

              {isAdmin && (
                <Button
                  component={RouterLink}
                  to="/admin/services"
                  variant="outlined"
                  fullWidth
                  startIcon={<SpaOutlinedIcon />}
                  sx={{ borderColor: '#C5DDD8', color: '#3DAA96', borderRadius: 2, fontWeight: 600, mb: 1.5, '&:hover': { borderColor: '#3DAA96', bgcolor: '#F0F8F5' } }}
                >
                  Gestionar terapias
                </Button>
              )}

              <Button
                component={RouterLink}
                to="/publications"
                variant="outlined"
                fullWidth
                startIcon={<ArticleOutlinedIcon />}
                sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, fontWeight: 600, '&:hover': { borderColor: '#3DAA96', bgcolor: '#F0F8F5' } }}
              >
                Ver publicaciones
              </Button>
            </CardContent>
          </Card>

          {/* Últimos usuarios */}
          {isAdmin && (
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E4F0ED' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '0.875rem' }}>Usuarios recientes</Typography>
                  <Button component={RouterLink} to="/admin/users" size="small" sx={{ color: '#3DAA96', fontSize: '0.75rem' }}>Ver todos</Button>
                </Box>
                {users.slice(0, 4).map((u) => (
                  <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: '#3DAA96', fontSize: '0.75rem' }}>
                      {u.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A2E2A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={u.role}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        bgcolor: u.role === 'ADMIN' ? '#E8F5F0' : u.role === 'EDITOR' ? '#FFF3E0' : '#F5F5F5',
                        color: u.role === 'ADMIN' ? '#3DAA96' : u.role === 'EDITOR' ? '#F39C12' : '#888',
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
