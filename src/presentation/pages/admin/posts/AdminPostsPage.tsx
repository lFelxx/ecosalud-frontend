import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Card, Button, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
  TextField, InputAdornment,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import UnpublishedOutlinedIcon from '@mui/icons-material/UnpublishedOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useAdminData } from '../../../context/AdminDataContext';

export default function AdminPostsPage() {
  const { posts, updatePost, deletePost } = useAdminData();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.authorName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleStatus = (id: string, currentStatus: 'draft' | 'published') => {
    updatePost(id, { status: currentStatus === 'published' ? 'draft' : 'published' });
  };

  const handleDelete = (id: string) => {
    deletePost(id);
    setConfirmDelete(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
            Publicaciones
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            {posts.filter((p) => p.status === 'published').length} publicadas · {posts.filter((p) => p.status === 'draft').length} borradores
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/admin/posts/new"
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
        >
          Nueva publicación
        </Button>
      </Box>

      {/* Buscador */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar publicación…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ color: '#9DBFBA', fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Tabla */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E4F0ED', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FDFB' }}>
                <TableCell sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Título</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, display: { xs: 'none', md: 'table-cell' } }}>Autor</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, display: { xs: 'none', sm: 'table-cell' } }}>Tags</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, display: { xs: 'none', lg: 'table-cell' } }}>Fecha</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    No se encontraron publicaciones
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((post) => (
                <TableRow
                  key={post.id}
                  sx={{ '&:hover': { bgcolor: '#F8FDFB' }, '&:last-child td': { border: 0 } }}
                >
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A2E2A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.excerpt.slice(0, 60)}…
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={post.status === 'published' ? 'Publicado' : 'Borrador'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: post.status === 'published' ? '#E8F5F0' : '#FFF3E0',
                        color: post.status === 'published' ? '#3DAA96' : '#F39C12',
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {post.authorName}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {post.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#E8F5F0', color: '#3DAA96' }}
                        />
                      ))}
                      {post.tags.length > 2 && (
                        <Chip label={`+${post.tags.length - 2}`} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                  </TableCell>

                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                      {new Date(post.updatedAt).toLocaleDateString('es-CO')}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <Tooltip title={post.status === 'published' ? 'Despublicar' : 'Publicar'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(post.id, post.status)}
                          sx={{ color: post.status === 'published' ? '#F39C12' : '#3DAA96' }}
                        >
                          {post.status === 'published'
                            ? <UnpublishedOutlinedIcon sx={{ fontSize: 18 }} />
                            : <PublishOutlinedIcon sx={{ fontSize: 18 }} />
                          }
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          component={RouterLink}
                          to={`/admin/posts/edit/${post.id}`}
                          size="small"
                          sx={{ color: '#5A7A74' }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => setConfirmDelete(post.id)}
                          sx={{ color: '#C0392B' }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Diálogo confirmar eliminación */}
      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Eliminar publicación</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esta acción es irreversible. ¿Deseas eliminar esta publicación definitivamente?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmDelete(null)} sx={{ color: '#5A7A74' }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => confirmDelete && handleDelete(confirmDelete)}
            sx={{ bgcolor: '#C0392B', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#A93226' } }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
