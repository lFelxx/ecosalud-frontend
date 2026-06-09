import { useState, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Dialog,
  TextField, Select, MenuItem, InputLabel, FormControl, Divider,
  IconButton,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import { useAdminData } from '../../../context/AdminDataContext';
import type { ServiceData } from '../../../context/AdminDataContext';
import ImageAdjuster from '../../../components/common/ImageAdjuster';

const CATEGORIES = ['Dolor Crónico', 'Energía', 'Inmunidad', 'Desintoxicación'];

const CATEGORY_COLORS: Record<string, string> = {
  'Dolor Crónico': '#E8401A',
  'Energía': '#E8A01A',
  'Inmunidad': '#1A90E8',
  'Desintoxicación': '#3DAA96',
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface EditForm {
  name: string;
  category: string;
  description: string;
  benefit0: string;
  benefit1: string;
  benefit2: string;
  duration: string;
  price: string;
  imageBase64?: string;
}

function fromService(s: ServiceData): EditForm {
  return {
    name: s.name,
    category: s.category,
    description: s.description,
    benefit0: s.benefitsText[0] ?? '',
    benefit1: s.benefitsText[1] ?? '',
    benefit2: s.benefitsText[2] ?? '',
    duration: s.duration,
    price: s.price,
    imageBase64: s.imageBase64,
  };
}

export default function AdminCatalogPage() {
  const { services, updateService } = useAdminData();
  const [editing, setEditing] = useState<ServiceData | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adjustSrc, setAdjustSrc] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const openEdit = (s: ServiceData) => {
    setEditing(s);
    setForm(fromService(s));
    setSuccess(false);
  };

  const closeEdit = () => { setEditing(null); setForm(null); };

  const handleField = (field: keyof EditForm, value: string) => {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setAdjustSrc(base64);
    e.target.value = '';
  };

  const handleAdjusted = (cropped: string) => {
    setForm((prev) => prev ? { ...prev, imageBase64: cropped } : prev);
    setAdjustSrc(null);
  };

  const handleSave = () => {
    if (!editing || !form) return;
    setSaving(true);
    setTimeout(() => {
      updateService(editing.id, {
        name: form.name,
        category: form.category,
        description: form.description,
        benefitsText: [form.benefit0, form.benefit1, form.benefit2],
        duration: form.duration,
        price: form.price,
        imageBase64: form.imageBase64,
      });
      setSaving(false);
      setSuccess(true);
      setTimeout(closeEdit, 800);
    }, 400);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
          Gestión de Terapias
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          Edita los precios, descripciones e imágenes de cada servicio.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {services.map((service) => {
          const catColor = CATEGORY_COLORS[service.category] ?? '#3DAA96';
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={service.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: '1px solid #E4F0ED',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 6px 20px rgba(61,170,150,0.14)' },
                }}
              >
                <Box
                  sx={{
                    height: 130, bgcolor: '#E8F5F0',
                    borderRadius: '12px 12px 0 0', overflow: 'hidden',
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {service.imageBase64 ? (
                    <Box component="img" src={service.imageBase64} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <SpaOutlinedIcon sx={{ fontSize: 48, color: '#B2DDD4', opacity: 0.7 }} />
                  )}
                  <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 1, px: 1, py: 0.3 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: catColor }}>
                      {service.category.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A2E2A', mb: 0.4 }}>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.5, mb: 1.5, flex: 1 }}>
                    {service.description.slice(0, 80)}…
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', color: '#9DBFBA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Precio</Typography>
                      <Typography sx={{ fontWeight: 800, color: '#3DAA96', fontSize: '1rem' }}>{service.price}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: '#9DBFBA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Duración</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#1A2E2A' }}>{service.duration}</Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => openEdit(service)}
                    sx={{
                      borderColor: '#C5DDD8', color: '#3DAA96', borderRadius: 2,
                      fontWeight: 600, fontSize: '0.82rem',
                      '&:hover': { borderColor: '#3DAA96', bgcolor: '#F0F8F5' },
                    }}
                  >
                    Editar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <ImageAdjuster
        src={adjustSrc ?? ''}
        open={Boolean(adjustSrc)}
        onConfirm={handleAdjusted}
        onCancel={() => setAdjustSrc(null)}
      />

      <Dialog
        open={Boolean(editing)}
        onClose={closeEdit}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, m: { xs: 1.5, md: 3 } } } }}
      >
        {form && editing && (
          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2E2A' }}>
                Editar — {editing.name}
              </Typography>
              <IconButton size="small" onClick={closeEdit} sx={{ color: '#9DBFBA' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Imagen de portada</Typography>
              <Box
                sx={{
                  height: 160, bgcolor: '#E8F5F0', borderRadius: 2,
                  border: '2px dashed #B2DDD4',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', position: 'relative',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: '#3DAA96' },
                }}
                onClick={() => imgInputRef.current?.click()}
              >
                {form.imageBase64 ? (
                  <>
                    <Box component="img" src={form.imageBase64} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.40)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5, opacity: 0, transition: '0.2s', '&:hover': { opacity: 1 } }}>
                      <TuneIcon sx={{ fontSize: 22, color: '#fff' }} />
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem' }}>Cambiar y ajustar</Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <ImageOutlinedIcon sx={{ fontSize: 36, color: '#B2DDD4', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Haz clic para subir imagen</Typography>
                    <Typography variant="caption" color="text.secondary">JPG, PNG · se abrirá el ajustador</Typography>
                  </>
                )}
              </Box>
              <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={7}>
                <TextField label="Nombre" fullWidth size="small" value={form.name} onChange={(e) => handleField('name', e.target.value)} />
              </Grid>
              <Grid size={5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select label="Categoría" value={form.category} onChange={(e) => handleField('category', e.target.value)}>
                    {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField label="Descripción" fullWidth size="small" multiline rows={3} value={form.description} onChange={(e) => handleField('description', e.target.value)} sx={{ mb: 2 }} />

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Beneficios (3 puntos)</Typography>
            {(['benefit0', 'benefit1', 'benefit2'] as const).map((field, i) => (
              <TextField key={field} label={`Beneficio ${i + 1}`} fullWidth size="small" value={form[field]} onChange={(e) => handleField(field, e.target.value)} sx={{ mb: 1 }} />
            ))}

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={6}>
                <TextField label="Precio" fullWidth size="small" value={form.price} onChange={(e) => handleField('price', e.target.value)} placeholder="$150.000 COP" />
              </Grid>
              <Grid size={6}>
                <TextField label="Duración" fullWidth size="small" value={form.duration} onChange={(e) => handleField('duration', e.target.value)} placeholder="60 min" />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" fullWidth onClick={closeEdit} sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2 }}>
                Cancelar
              </Button>
              <Button
                variant="contained" fullWidth onClick={handleSave} disabled={saving}
                startIcon={success ? undefined : <SaveOutlinedIcon />}
                sx={{ bgcolor: success ? '#27AE60' : '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: success ? '#219A52' : '#2B8A78' } }}
              >
                {saving ? 'Guardando…' : success ? '¡Guardado!' : 'Guardar cambios'}
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
