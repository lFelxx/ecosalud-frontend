import { useState, useRef, useEffect } from 'react';
import {
  Box, Dialog, Typography, Slider, Button, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DoneIcon from '@mui/icons-material/Done';

interface ImageAdjusterProps {
  src: string;
  open: boolean;
  onConfirm: (croppedBase64: string) => void;
  onCancel: () => void;
  /** Use square (1:1) crop instead of the default 16:9 */
  square?: boolean;
}

export default function ImageAdjuster({ src, open, onConfirm, onCancel, square = false }: ImageAdjusterProps) {
  // Resolution del canvas de salida: 16:9 para servicios, 1:1 para fotos de perfil
  const OUT_W = square ? 600 : 800;
  const OUT_H = square ? 600 : 450;
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [baseScale, setBaseScale] = useState(1);
  const [natSize, setNatSize] = useState({ w: 1, h: 1 });
  // Tamaño real del contenedor en pantalla (se mide tras la animación del Dialog)
  const [contSize, setContSize] = useState({ w: 480, h: 270 });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, lastX: 0, lastY: 0 });

  // ── 1. Carga la imagen cuando cambia src/open ────────────────────────────
  useEffect(() => {
    if (!src || !open) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setNatSize({ w: img.naturalWidth, h: img.naturalHeight });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = src;
  }, [src, open]);

  // ── 2. Mide el contenedor después de que el Dialog termina su animación ──
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        if (w > 0) setContSize({ w, h: square ? w : Math.round(w * 9 / 16) });
      }
    }, 260);
    return () => clearTimeout(id);
  }, [open]);

  // ── 3. Recalcula baseScale cuando cambia el tamaño de imagen o contenedor ─
  useEffect(() => {
    if (natSize.w <= 1 || contSize.w <= 1) return;
    setBaseScale(Math.max(contSize.w / natSize.w, contSize.h / natSize.h));
  }, [natSize, contSize]);

  // ── Utilitario: clamp de offset para que la imagen siempre cubra el frame ─
  function clampOffset(ox: number, oy: number, z: number) {
    const sc = baseScale * z;
    const dw = natSize.w * sc;
    const dh = natSize.h * sc;
    const mx = Math.max(0, (dw - contSize.w) / 2);
    const my = Math.max(0, (dh - contSize.h) / 2);
    return {
      x: Math.max(-mx, Math.min(mx, ox)),
      y: Math.max(-my, Math.min(my, oy)),
    };
  }

  // ── Drag con ratón ───────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    drag.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    e.preventDefault();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    const dy = e.clientY - drag.current.lastY;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
    setOffset((prev) => clampOffset(prev.x + dx, prev.y + dy, zoom));
  };
  const stopDrag = () => { drag.current.active = false; };

  // ── Drag táctil ──────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    drag.current = { active: true, lastX: t.clientX, lastY: t.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!drag.current.active) return;
    const t = e.touches[0];
    const dx = t.clientX - drag.current.lastX;
    const dy = t.clientY - drag.current.lastY;
    drag.current.lastX = t.clientX;
    drag.current.lastY = t.clientY;
    setOffset((prev) => clampOffset(prev.x + dx, prev.y + dy, zoom));
  };

  // ── Zoom ─────────────────────────────────────────────────────────────────
  const handleZoom = (_: Event, v: number | number[]) => {
    const z = v as number;
    setZoom(z);
    setOffset((prev) => clampOffset(prev.x, prev.y, z));
  };

  const handleReset = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  // ── Renderiza el recorte a canvas y devuelve base64 ───────────────────────
  const handleConfirm = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext('2d')!;
    const sc = baseScale * zoom;
    // Rectángulo fuente en píxeles naturales de la imagen
    const srcX = natSize.w / 2 - contSize.w / (2 * sc) - offset.x / sc;
    const srcY = natSize.h / 2 - contSize.h / (2 * sc) - offset.y / sc;
    const srcW = contSize.w / sc;
    const srcH = contSize.h / sc;
    ctx.drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, OUT_W, OUT_H);
    onConfirm(canvas.toDataURL('image/jpeg', 0.92));
  };

  const sc = baseScale * zoom;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, m: { xs: 1, md: 2 } } } }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>

        {/* ── Encabezado ── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2E2A' }}>
              Ajustar imagen
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {square ? 'Recorte 1 : 1' : 'Recorte 16 : 9'} · Arrastra para reposicionar · deslizador para zoom
            </Typography>
          </Box>
          <IconButton size="small" onClick={onCancel} sx={{ color: '#9DBFBA', mt: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ── Área de previsualización / recorte ── */}
        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            aspectRatio: square ? '1 / 1' : '16 / 9',
            overflow: 'hidden',
            borderRadius: 2,
            border: '2px solid #3DAA96',
            position: 'relative',
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            bgcolor: '#0D1F1C',
            userSelect: 'none',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={stopDrag}
        >
          {/* Imagen posicionada y escalada */}
          {src && (
            <Box
              component="img"
              src={src}
              draggable={false}
              sx={{
                position: 'absolute',
                width: natSize.w * sc,
                height: natSize.h * sc,
                top: contSize.h / 2 - (natSize.h * sc) / 2 + offset.y,
                left: contSize.w / 2 - (natSize.w * sc) / 2 + offset.x,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Cuadrícula de tercios */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: [
                'linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)',
                'linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)',
              ].join(', '),
              backgroundSize: '33.33% 33.33%',
            }}
          />

          {/* Marcas de esquina */}
          <Box sx={{ position: 'absolute', width: 18, height: 18, top: 6, left: 6, borderTop: '2.5px solid #3DAA96', borderLeft: '2.5px solid #3DAA96', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', width: 18, height: 18, top: 6, right: 6, borderTop: '2.5px solid #3DAA96', borderRight: '2.5px solid #3DAA96', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', width: 18, height: 18, bottom: 6, left: 6, borderBottom: '2.5px solid #3DAA96', borderLeft: '2.5px solid #3DAA96', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', width: 18, height: 18, bottom: 6, right: 6, borderBottom: '2.5px solid #3DAA96', borderRight: '2.5px solid #3DAA96', pointerEvents: 'none' }} />

          {/* Badge de zoom */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              bgcolor: 'rgba(0,0,0,0.55)',
              borderRadius: 1,
              px: 1,
              py: 0.3,
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
              {Math.round(zoom * 100)}%
            </Typography>
          </Box>
        </Box>

        {/* ── Control de zoom ── */}
        <Box sx={{ mt: 2.5, px: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ZoomOutIcon sx={{ color: '#9DBFBA', fontSize: 22, flexShrink: 0 }} />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              onChange={handleZoom}
              sx={{
                flex: 1,
                color: '#3DAA96',
                '& .MuiSlider-thumb': { width: 20, height: 20 },
                '& .MuiSlider-rail': { bgcolor: '#B2DDD4' },
              }}
            />
            <ZoomInIcon sx={{ color: '#9DBFBA', fontSize: 22, flexShrink: 0 }} />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 0.5, lineHeight: 1.4 }}
          >
            Arrastra la imagen dentro del marco · ajusta el zoom con el deslizador
          </Typography>
        </Box>

        {/* ── Botones ── */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            sx={{
              borderColor: '#C5DDD8',
              color: '#5A7A74',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.8rem',
              flexShrink: 0,
            }}
          >
            Restablecer
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2 }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            startIcon={<DoneIcon />}
            onClick={handleConfirm}
            sx={{
              bgcolor: '#3DAA96',
              borderRadius: 2,
              fontWeight: 700,
              '&:hover': { bgcolor: '#2B8A78' },
            }}
          >
            Aplicar recorte
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
