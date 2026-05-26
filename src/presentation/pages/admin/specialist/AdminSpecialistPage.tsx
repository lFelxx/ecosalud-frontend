import { useState, useRef } from 'react';
import {
  Box, Typography, Grid, Button, TextField, Divider,
  Avatar, IconButton, Alert, Chip,
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useAdminData } from '../../../context/AdminDataContext';
import type { SpecialistData } from '../../../context/AdminDataContext';
import ImageAdjuster from '../../../components/common/ImageAdjuster';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type FormState = SpecialistData;

export default function AdminSpecialistPage() {
  const { specialist, updateSpecialist } = useAdminData();

  const [form, setForm] = useState<FormState>({ ...specialist });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adjustSrc, setAdjustSrc] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handleField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setAdjustSrc(base64);
    e.target.value = '';
  };

  const handleAdjusted = (cropped: string) => {
    setForm((prev) => ({ ...prev, photoBase64: cropped }));
    setAdjustSrc(null);
    setSaved(false);
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photoBase64: undefined }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateSpecialist(form);
      setSaving(false);
      setSaved(true);
    }, 400);
  };

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
            Perfil del Especialista
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            Edita la información pública del especialista que aparece en la página de inicio.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saved ? <CheckCircleIcon /> : <SaveOutlinedIcon />}
          sx={{
            bgcolor: saved ? '#27AE60' : '#3DAA96',
            borderRadius: 2,
            fontWeight: 700,
            px: 3,
            '&:hover': { bgcolor: saved ? '#219A52' : '#2B8A78' },
          }}
        >
          {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </Button>
      </Box>

      <Grid container spacing={3}>

        {/* ── Columna izquierda: foto + preview ── */}
        <Grid size={{ xs: 12, md: 4 }}>

          {/* Foto de perfil */}
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              border: '1px solid #E4F0ED',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              p: 3,
              mb: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2E2A', mb: 2 }}>
              Foto de perfil
            </Typography>

            {/* Avatar + botón de carga */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={form.photoBase64}
                  sx={{
                    width: 130,
                    height: 130,
                    bgcolor: '#C8EDE5',
                    border: '4px solid #fff',
                    boxShadow: '0 6px 24px rgba(61,170,150,0.20)',
                  }}
                >
                  <PersonOutlinedIcon sx={{ fontSize: 56, color: '#3DAA96' }} />
                </Avatar>
                {form.photoBase64 && (
                  <IconButton
                    size="small"
                    onClick={handleRemovePhoto}
                    sx={{
                      position: 'absolute', top: -4, right: -4,
                      bgcolor: '#fff', border: '1px solid #E4F0ED',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                      '&:hover': { bgcolor: '#FFF0EE', borderColor: '#E53935' },
                      color: '#999',
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<TuneIcon />}
                onClick={() => imgInputRef.current?.click()}
                sx={{ borderColor: '#C5DDD8', color: '#3DAA96', borderRadius: 2, fontWeight: 600, fontSize: '0.8rem' }}
              >
                {form.photoBase64 ? 'Cambiar foto' : 'Subir foto'}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                JPG o PNG · Se abrirá el ajustador de recorte circular
              </Typography>
            </Box>

            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
          </Box>

          {/* Vista previa del badge de credenciales */}
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              border: '1px solid #E4F0ED',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              p: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2E2A', mb: 2 }}>
              Vista previa — Credenciales
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<VerifiedOutlinedIcon sx={{ fontSize: '15px !important', color: '#3DAA96 !important' }} />}
                label={form.credential1 || 'Credencial 1'}
                size="small"
                sx={{ bgcolor: '#E8F5F0', color: '#2B7A6A', fontWeight: 600, border: '1px solid #B2DDD4', borderRadius: '999px', px: 0.5 }}
              />
              <Chip
                icon={<SchoolOutlinedIcon sx={{ fontSize: '15px !important', color: '#3DAA96 !important' }} />}
                label={form.credential2 || 'Credencial 2'}
                size="small"
                sx={{ bgcolor: '#E8F5F0', color: '#2B7A6A', fontWeight: 600, border: '1px solid #B2DDD4', borderRadius: '999px', px: 0.5 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{
              display: 'inline-flex', alignItems: 'center',
              border: '1.5px solid #9DBFBA', borderRadius: '999px',
              px: 1.6, py: 0.4,
            }}>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#5A7A74', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                {form.badge || 'Badge'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* ── Columna derecha: campos del formulario ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              border: '1px solid #E4F0ED',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              p: 3,
            }}
          >
            {/* Identidad */}
            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.8, mb: 2 }}>
              Identidad
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="Nombre completo"
                  fullWidth
                  size="small"
                  value={form.name}
                  onChange={(e) => handleField('name', e.target.value)}
                  placeholder="Dra. Angélica Camacho"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Badge / Etiqueta"
                  fullWidth
                  size="small"
                  value={form.badge}
                  onChange={(e) => handleField('badge', e.target.value)}
                  placeholder="Especialista Líder"
                />
              </Grid>
            </Grid>

            <TextField
              label="Especialidad"
              fullWidth
              size="small"
              value={form.specialty}
              onChange={(e) => handleField('specialty', e.target.value)}
              placeholder="Medicina Alternativa y Farmacología Vegetal"
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2.5 }} />

            {/* Biografía */}
            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.5 }}>
              Biografía
            </Typography>
            <Alert severity="info" sx={{ mb: 2, fontSize: '0.78rem', py: 0.3 }}>
              El texto de la universidad será resaltado automáticamente en verde en la página pública.
            </Alert>

            <TextField
              label="Universidad / Institución"
              fullWidth
              size="small"
              value={form.university}
              onChange={(e) => handleField('university', e.target.value)}
              placeholder="Universidad Juan N Corpas"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Biografía completa"
              fullWidth
              size="small"
              multiline
              rows={4}
              value={form.bio}
              onChange={(e) => handleField('bio', e.target.value)}
              helperText="Incluye el nombre de la universidad dentro del texto para que se resalte en verde."
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2.5 }} />

            {/* Credenciales */}
            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#9DBFBA', textTransform: 'uppercase', letterSpacing: 0.8, mb: 2 }}>
              Credenciales (chips de la tarjeta)
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Credencial 1"
                  fullWidth
                  size="small"
                  value={form.credential1}
                  onChange={(e) => handleField('credential1', e.target.value)}
                  placeholder="Certificación Médica"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Credencial 2"
                  fullWidth
                  size="small"
                  value={form.credential2}
                  onChange={(e) => handleField('credential2', e.target.value)}
                  placeholder="Especialista Corpas"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* ── Ajustador de imagen 1:1 ── */}
      <ImageAdjuster
        src={adjustSrc ?? ''}
        open={Boolean(adjustSrc)}
        square
        onConfirm={handleAdjusted}
        onCancel={() => setAdjustSrc(null)}
      />
    </Box>
  );
}
