import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Chip, Grid,
  ToggleButton, ToggleButtonGroup, Divider, IconButton, Alert,
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useAdminData } from '../../../context/AdminDataContext';
import { useAuthContext } from '../../../context/AuthContext';

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function AdminPostEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { posts, createPost, updatePost } = useAdminData();
  const { user } = useAuthContext();
  const imgRef = useRef<HTMLInputElement>(null);

  const existing = id ? posts.find((p) => p.id === id) : undefined;

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill when editing
  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setExcerpt(existing.excerpt);
      setContent(existing.content);
      setImageBase64(existing.imageBase64);
      setStatus(existing.status);
      setTags(existing.tags);
    }
  }, [existing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setImageBase64(b64);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  };

  const validate = () => {
    if (!title.trim()) { setError('El título es obligatorio.'); return false; }
    if (!excerpt.trim()) { setError('El extracto es obligatorio.'); return false; }
    if (!content.trim()) { setError('El contenido no puede estar vacío.'); return false; }
    setError('');
    return true;
  };

  const handleSave = (targetStatus: 'draft' | 'published' = status) => {
    if (!validate()) return;

    const data = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      imageBase64,
      status: targetStatus,
      tags,
      authorId: user?.id ?? 0,
      authorName: user?.name ?? 'Admin',
    };

    if (existing) {
      updatePost(existing.id, data);
    } else {
      createPost(data);
    }

    setSaved(true);
    setTimeout(() => navigate('/admin/posts'), 700);
  };

  const isEditing = Boolean(existing);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/posts')} sx={{ color: '#5A7A74' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
            {isEditing ? 'Editar publicación' : 'Nueva publicación'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditing ? `Última edición: ${new Date(existing!.updatedAt).toLocaleDateString('es-CO')}` : 'Completa los campos y elige el estado antes de guardar.'}
          </Typography>
        </Box>

        {/* Estado */}
        <ToggleButtonGroup
          value={status}
          exclusive
          onChange={(_, v) => { if (v) setStatus(v as 'draft' | 'published'); }}
          size="small"
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          <ToggleButton value="draft" sx={{ fontWeight: 600, fontSize: '0.78rem', textTransform: 'none', px: 2 }}>
            Borrador
          </ToggleButton>
          <ToggleButton value="published" sx={{ fontWeight: 600, fontSize: '0.78rem', textTransform: 'none', px: 2 }}>
            Publicar
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>¡Guardado! Redirigiendo…</Alert>}

      <Grid container spacing={3}>
        {/* Columna principal */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: 3, border: '1px solid #E4F0ED', mb: 2.5 }}>
            <TextField
              label="Título de la publicación"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
              slotProps={{ htmlInput: { style: { fontSize: '1.1rem', fontWeight: 700 } } }}
            />
            <TextField
              label="Extracto (resumen corto)"
              fullWidth
              multiline
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              helperText="Se muestra en las tarjetas de publicaciones. Máx. 200 caracteres recomendados."
              sx={{ mb: 2 }}
            />
            <TextField
              label="Contenido"
              fullWidth
              multiline
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el cuerpo completo de la publicación…&#10;&#10;Puedes usar saltos de línea para separar párrafos."
              helperText="El texto se mostrará tal cual, con sus saltos de línea."
            />
          </Box>
        </Grid>

        {/* Columna lateral */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Imagen de portada */}
          <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: 2.5, border: '1px solid #E4F0ED', mb: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>Imagen de portada</Typography>
            <Box
              sx={{
                height: 160,
                bgcolor: '#E8F5F0',
                borderRadius: 2,
                border: '2px dashed #B2DDD4',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': { borderColor: '#3DAA96' },
              }}
              onClick={() => imgRef.current?.click()}
            >
              {imageBase64 ? (
                <>
                  <Box component="img" src={imageBase64} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: '0.2s',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem' }}>Cambiar imagen</Typography>
                  </Box>
                </>
              ) : (
                <>
                  <ImageOutlinedIcon sx={{ fontSize: 32, color: '#B2DDD4', mb: 0.8 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    Subir imagen
                  </Typography>
                </>
              )}
            </Box>
            {imageBase64 && (
              <Button
                size="small"
                onClick={() => setImageBase64(undefined)}
                sx={{ color: '#C0392B', mt: 1, fontSize: '0.75rem' }}
              >
                Quitar imagen
              </Button>
            )}
            <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
          </Box>

          {/* Tags */}
          <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: 2.5, border: '1px solid #E4F0ED', mb: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>Etiquetas</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <TextField
                size="small"
                placeholder="Añadir tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={addTag}
                sx={{ borderColor: '#C5DDD8', color: '#3DAA96', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                + Tag
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => removeTag(tag)}
                  deleteIcon={<CloseIcon />}
                  sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 600, '& .MuiChip-deleteIcon': { fontSize: 14, color: '#3DAA96' } }}
                />
              ))}
              {tags.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  Escribe un tag y presiona Enter o coma
                </Typography>
              )}
            </Box>
          </Box>

          {/* Estado móvil */}
          <Box sx={{ display: { xs: 'block', sm: 'none' }, bgcolor: '#fff', borderRadius: 3, p: 2.5, border: '1px solid #E4F0ED', mb: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>Estado</Typography>
            <ToggleButtonGroup value={status} exclusive onChange={(_, v) => { if (v) setStatus(v); }} size="small" fullWidth>
              <ToggleButton value="draft" sx={{ fontWeight: 600, textTransform: 'none' }}>Borrador</ToggleButton>
              <ToggleButton value="published" sx={{ fontWeight: 600, textTransform: 'none' }}>Publicado</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Botones */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<SaveOutlinedIcon />}
            onClick={() => handleSave('draft')}
            disabled={saved}
            sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, fontWeight: 600, mb: 1.5, '&:hover': { borderColor: '#3DAA96' } }}
          >
            Guardar borrador
          </Button>
          <Button
            variant="contained"
            fullWidth
            startIcon={<PublishOutlinedIcon />}
            onClick={() => handleSave('published')}
            disabled={saved}
            sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
          >
            {isEditing && existing?.status === 'published' ? 'Actualizar publicación' : 'Publicar ahora'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
