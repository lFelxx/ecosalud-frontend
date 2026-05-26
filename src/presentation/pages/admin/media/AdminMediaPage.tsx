import { useRef, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, IconButton,
  Dialog, Tooltip, LinearProgress,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useAdminData } from '../../../context/AdminDataContext';

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const { media, addMedia, deleteMedia } = useAdminData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          addMedia({
            name: file.name,
            base64: reader.result as string,
            mimeType: file.type,
            size: file.size,
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
          Biblioteca de Medios
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          {media.length} archivo{media.length !== 1 ? 's' : ''} · Las imágenes se guardan localmente en el navegador.
        </Typography>
      </Box>

      {/* Zona de carga */}
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: '2px dashed #B2DDD4',
          borderRadius: 3,
          bgcolor: '#F0FAF7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 5,
          mb: 3,
          cursor: 'pointer',
          transition: 'border-color 0.2s, bgcolor 0.2s',
          '&:hover': { borderColor: '#3DAA96', bgcolor: '#E8F5F0' },
        }}
      >
        <UploadFileOutlinedIcon sx={{ fontSize: 48, color: '#B2DDD4', mb: 1.5 }} />
        <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mb: 0.5 }}>
          Arrastra imágenes aquí
        </Typography>
        <Typography variant="body2" color="text.secondary">
          o haz clic para seleccionar · JPG, PNG, GIF, WebP
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </Box>

      {uploading && <LinearProgress sx={{ mb: 2, borderRadius: 1, bgcolor: '#E8F5F0', '& .MuiLinearProgress-bar': { bgcolor: '#3DAA96' } }} />}

      {/* Galería */}
      {media.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <UploadFileOutlinedIcon sx={{ fontSize: 56, color: '#D4EDE7', mb: 1 }} />
          <Typography>Aún no hay imágenes en la biblioteca.</Typography>
          <Typography variant="body2">Sube tu primera imagen usando la zona de arriba.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {media.map((item) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={item.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  border: '1px solid #E4F0ED',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover .media-actions': { opacity: 1 },
                }}
              >
                {/* Thumbnail */}
                <Box sx={{ height: 120, overflow: 'hidden', position: 'relative' }}>
                  <Box
                    component="img"
                    src={item.base64}
                    alt={item.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Acciones overlay */}
                  <Box
                    className="media-actions"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(26,46,42,0.55)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <Tooltip title="Vista previa">
                      <IconButton
                        size="small"
                        onClick={() => setPreview(item.base64)}
                        sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.30)' } }}
                      >
                        <ZoomInOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => setConfirmDel(item.id)}
                        sx={{ bgcolor: 'rgba(192,57,43,0.15)', color: '#ff8a80', '&:hover': { bgcolor: 'rgba(192,57,43,0.35)' } }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <CardContent sx={{ p: 1.2, pb: '10px !important' }}>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#1A2E2A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      mb: 0.3,
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#9DBFBA' }}>
                    {fileSize(item.size)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Vista previa */}
      <Dialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        maxWidth="md"
        slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: '#1A2E2A', overflow: 'hidden' } } }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setPreview(null)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>
          {preview && (
            <Box component="img" src={preview} sx={{ maxWidth: '90vw', maxHeight: '80vh', display: 'block' }} />
          )}
        </Box>
      </Dialog>

      {/* Confirmar eliminación */}
      <Dialog
        open={Boolean(confirmDel)}
        onClose={() => setConfirmDel(null)}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>¿Eliminar imagen?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Esta acción no se puede deshacer.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button fullWidth onClick={() => setConfirmDel(null)} sx={{ borderColor: '#C5DDD8', color: '#5A7A74', border: '1px solid' }}>
              Cancelar
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => { if (confirmDel) deleteMedia(confirmDel); setConfirmDel(null); }}
              sx={{ bgcolor: '#C0392B', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#A93226' } }}
            >
              Eliminar
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
