/**
 * SuperAdminBlogPage — Gestión del blog de la plataforma.
 *
 * El super-admin crea, edita y publica posts de novedades que aparecen
 * en la landing page (/novedades) — accesibles sin autenticación.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Grid, Card, CardContent,
  Chip, TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, Tooltip, CircularProgress, Alert, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import UnpublishedOutlinedIcon from '@mui/icons-material/UnpublishedOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import axiosClient from '../../../infrastructure/http/axiosClient';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface Post {
  id:          number;
  title:       string;
  excerpt:     string;
  content?:    string;
  imageUrl?:   string;
  tagsRaw?:    string;
  tags:        string[];
  category:    string;
  status:      string;
  authorName:  string;
  publishedAt: string | null;
  createdAt:   string;
}

interface PostForm {
  title:      string;
  excerpt:    string;
  content:    string;
  imageUrl:   string;
  tagsRaw:    string;
  category:   string;
  authorName: string;
}

const EMPTY_FORM: PostForm = {
  title:      '',
  excerpt:    '',
  content:    '',
  imageUrl:   '',
  tagsRaw:    '',
  category:   'NOVEDAD',
  authorName: 'Equipo Ecosalud',
};

const CATEGORY_OPTS = [
  { value: 'NOVEDAD',       label: 'Novedad',         color: '#3DAA96' },
  { value: 'OFERTA',        label: 'Oferta',           color: '#E67E22' },
  { value: 'TUTORIAL',      label: 'Tutorial',         color: '#5A5FC8' },
  { value: 'ACTUALIZACION', label: 'Actualización',    color: '#27AE60' },
  { value: 'GENERAL',       label: 'General',          color: '#5A7A74' },
];

function catLabel(val: string) {
  return CATEGORY_OPTS.find(c => c.value === val) ?? CATEGORY_OPTS[4];
}

// ── Componente ─────────────────────────────────────────────────────────────────

export default function SuperAdminBlogPage() {
  const navigate = useNavigate();
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ── Carga ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await axiosClient.get<Post[]>('/platform/blog');
      setPosts(r.data);
    } catch {
      setError('No se pudieron cargar las publicaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Editor ───────────────────────────────────────────────────────────────────

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setEditorOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditingId(post.id);
    setForm({
      title:      post.title,
      excerpt:    post.excerpt ?? '',
      content:    post.content ?? '',
      imageUrl:   post.imageUrl ?? '',
      tagsRaw:    post.tagsRaw ?? post.tags.join(', '),
      category:   post.category,
      authorName: post.authorName,
    });
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('El título es obligatorio.'); return; }
    setSaving(true); setError(null);
    try {
      if (editingId) {
        await axiosClient.put(`/platform/blog/${editingId}`, form);
        setSuccess('Publicación actualizada.');
      } else {
        await axiosClient.post('/platform/blog', form);
        setSuccess('Publicación creada como borrador.');
      }
      setEditorOpen(false);
      load();
    } catch {
      setError('Error al guardar. Revisa los datos.');
    } finally {
      setSaving(false);
    }
  };

  // ── Publicar / Despublicar ───────────────────────────────────────────────────

  const togglePublish = async (id: number) => {
    try {
      await axiosClient.patch(`/platform/blog/${id}/publish`);
      load();
    } catch {
      setError('Error al cambiar el estado.');
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axiosClient.delete(`/platform/blog/${deleteId}`);
      setSuccess('Publicación eliminada.');
      setDeleteId(null);
      load();
    } catch {
      setError('Error al eliminar.');
      setDeleteId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const published = posts.filter(p => p.status === 'PUBLISHED');
  const drafts    = posts.filter(p => p.status === 'DRAFT');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/superadmin')} size="small"
              sx={{ bgcolor: '#fff', border: '1px solid #E4F0ED' }}>
              <ArrowBackOutlinedIcon fontSize="small" />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CampaignOutlinedIcon sx={{ color: '#3DAA96', fontSize: 28 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A', lineHeight: 1 }}>
                  Blog de la plataforma
                </Typography>
                <Typography variant="caption" sx={{ color: '#9DBFBA' }}>
                  Publicaciones visibles en /novedades · {published.length} publicadas · {drafts.length} borradores
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              href="/novedades" target="_blank"
              startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}
              variant="outlined" size="small"
              sx={{ borderColor: '#C5DDD8', color: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Ver en vivo
            </Button>
            <Button
              onClick={openNew}
              startIcon={<AddOutlinedIcon />}
              variant="contained" size="small"
              sx={{ bgcolor: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
            >
              Nueva publicación
            </Button>
          </Box>
        </Box>

        {/* Mensajes */}
        {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        {/* Loading */}
        {loading && <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress sx={{ color: '#3DAA96' }} /></Box>}

        {/* Sin publicaciones */}
        {!loading && posts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#fff', borderRadius: 3, border: '1px solid #E4F0ED' }}>
            <CampaignOutlinedIcon sx={{ fontSize: 60, color: '#D4EDE7', mb: 2 }} />
            <Typography sx={{ fontWeight: 700, color: '#5A7A74', mb: 1 }}>Aún no hay publicaciones</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea la primera para que aparezca en la landing page.
            </Typography>
            <Button onClick={openNew} variant="contained"
              sx={{ bgcolor: '#3DAA96', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
              Crear primera publicación
            </Button>
          </Box>
        )}

        {/* Publicadas */}
        {published.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="overline" sx={{ color: '#27AE60', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
              ✦ Publicadas ({published.length})
            </Typography>
            <Grid container spacing={2}>
              {published.map(post => <PostCard key={post.id} post={post} onEdit={openEdit} onToggle={togglePublish} onDelete={setDeleteId} />)}
            </Grid>
          </Box>
        )}

        {/* Borradores */}
        {drafts.length > 0 && (
          <Box>
            {published.length > 0 && <Divider sx={{ mb: 4 }} />}
            <Typography variant="overline" sx={{ color: '#9DBFBA', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
              Borradores ({drafts.length})
            </Typography>
            <Grid container spacing={2}>
              {drafts.map(post => <PostCard key={post.id} post={post} onEdit={openEdit} onToggle={togglePublish} onDelete={setDeleteId} />)}
            </Grid>
          </Box>
        )}
      </Container>

      {/* ── Editor dialog ── */}
      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1A2E2A', borderBottom: '1px solid #E4F0ED' }}>
          {editingId ? 'Editar publicación' : 'Nueva publicación'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <TextField fullWidth label="Título *" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                inputProps={{ maxLength: 500 }} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth multiline rows={2} label="Extracto (resumen visible en la lista)"
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth multiline rows={8} label="Contenido completo"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Escribe el contenido completo del post aquí..." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select value={form.category} label="Categoría"
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORY_OPTS.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color }} />
                        {c.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Autor" value={form.authorName}
                onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Tags (separados por coma)" value={form.tagsRaw}
                onChange={e => setForm(f => ({ ...f, tagsRaw: e.target.value }))}
                placeholder="fhir, novedades, SISPRO" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="URL de imagen de portada (opcional)" value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #E4F0ED' }}>
          <Button onClick={() => setEditorOpen(false)} sx={{ color: '#9DBFBA', textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} variant="contained"
            sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, textTransform: 'none', minWidth: 120, '&:hover': { bgcolor: '#2B8A78' } }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : editingId ? 'Actualizar' : 'Guardar borrador'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirm delete ── */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1A2E2A' }}>¿Eliminar publicación?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: 'none', color: '#9DBFBA' }}>Cancelar</Button>
          <Button onClick={confirmDelete} variant="contained"
            sx={{ bgcolor: '#C0392B', borderRadius: 2, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#A93226' } }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── PostCard ───────────────────────────────────────────────────────────────────

function PostCard({ post, onEdit, onToggle, onDelete }: {
  post:     Post;
  onEdit:   (p: Post) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const cat = catLabel(post.category);
  const published = post.status === 'PUBLISHED';

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Card sx={{
        borderRadius: 2.5, border: '1px solid #E4F0ED', height: '100%',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        opacity: published ? 1 : 0.75,
        transition: 'all 0.2s',
        '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip label={cat.label} size="small"
                sx={{ bgcolor: `${cat.color}18`, color: cat.color, fontWeight: 700, fontSize: '0.62rem', border: `1px solid ${cat.color}30` }} />
              <Chip
                label={published ? 'Publicado' : 'Borrador'}
                size="small"
                sx={{ bgcolor: published ? '#EAF7EE' : '#F4FAF8', color: published ? '#27AE60' : '#9DBFBA', fontWeight: 700, fontSize: '0.62rem' }}
              />
            </Box>
          </Box>

          <Typography sx={{ fontWeight: 800, color: '#1A2E2A', fontSize: '0.9rem', lineHeight: 1.3, mb: 1 }}>
            {post.title}
          </Typography>

          {post.excerpt && (
            <Typography variant="caption" color="text.secondary"
              sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, mb: 1.5 }}>
              {post.excerpt}
            </Typography>
          )}

          {post.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mb: 2 }}>
              {post.tags.slice(0, 3).map(t => (
                <Chip key={t} label={t.trim()} size="small"
                  sx={{ height: 16, fontSize: '0.58rem', bgcolor: '#F4FAF8', color: '#5A7A74' }} />
              ))}
            </Box>
          )}

          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#9DBFBA', fontSize: '0.65rem' }}>
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
                : new Date(post.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => onEdit(post)}
                  sx={{ color: '#5A7A74', '&:hover': { color: '#3DAA96', bgcolor: '#E8F5F0' } }}>
                  <EditOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={published ? 'Despublicar' : 'Publicar'}>
                <IconButton size="small" onClick={() => onToggle(post.id)}
                  sx={{ color: published ? '#27AE60' : '#9DBFBA', '&:hover': { color: published ? '#1E8449' : '#27AE60', bgcolor: '#EAF7EE' } }}>
                  {published
                    ? <UnpublishedOutlinedIcon sx={{ fontSize: 16 }} />
                    : <PublishOutlinedIcon     sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => onDelete(post.id)}
                  sx={{ color: '#9DBFBA', '&:hover': { color: '#C0392B', bgcolor: '#FDE8E8' } }}>
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}
