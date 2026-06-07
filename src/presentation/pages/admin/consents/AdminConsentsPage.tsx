/**
 * AdminConsentsPage — Vista admin de todos los consentimientos informados firmados.
 *
 * Ruta: /admin/consents
 * Conectado a: GET /api/consents
 *
 * Los consentimientos son inmutables — solo lectura y búsqueda.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, TextField,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Skeleton, Alert, IconButton, Tooltip, Divider,
} from '@mui/material';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import axiosClient from '../../../../infrastructure/http/axiosClient';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Consent {
  id: number;
  patientId: number;
  patientName: string | null;
  patientEmail: string | null;
  serviceId: number | null;
  serviceName: string | null;
  consentText: string;
  digitalSignature: string | null;
  ipAddress: string | null;
  signedAt: string | null;
  createdAt: string;
}

// ── Diálogo de detalle ────────────────────────────────────────────────────────

function ConsentDetailDialog({ consent, onClose }: { consent: Consent | null; onClose: () => void }) {
  if (!consent) return null;

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : '—';

  return (
    <Dialog open={!!consent} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          fontWeight: 800, color: '#1A2E2A' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelOutlinedIcon sx={{ color: '#3DAA96' }} />
          Consentimiento #{consent.id}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseOutlinedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Metadata */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          {[
            { label: 'Paciente',   value: consent.patientName ?? '—' },
            { label: 'Email',      value: consent.patientEmail ?? '—' },
            { label: 'Servicio',   value: consent.serviceName ?? 'General' },
            { label: 'IP de firma', value: consent.ipAddress ?? '—' },
            { label: 'Firmado el', value: formatDate(consent.signedAt), span: 2 },
          ].map(f => (
            <Box key={f.label} sx={{ gridColumn: (f as {span?: number}).span === 2 ? '1 / -1' : undefined }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA',
                                                   textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {f.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A2E2A' }}>
                {f.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Texto del consentimiento */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DBFBA',
                                             textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
          Texto del consentimiento (almacenado en el momento de la firma)
        </Typography>
        <Box sx={{ bgcolor: '#F4FAF8', borderRadius: 2, p: 2.5, mb: 3,
                   border: '1px solid #E4F0ED', fontFamily: 'monospace',
                   fontSize: '0.82rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#2A3A38' }}>
          {consent.consentText}
        </Box>

        {/* Firma digital */}
        {consent.digitalSignature && (
          <Box sx={{ bgcolor: '#E8F5F0', borderRadius: 2, p: 2,
                     border: '1px solid #B2DDD4', display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircleOutlinedIcon sx={{ color: '#3DAA96', fontSize: 28 }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#5A7A74',
                                                   textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Firma digital del paciente
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2E2A',
                                 fontFamily: 'Georgia, serif', letterSpacing: 1 }}>
                {consent.digitalSignature}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2, fontWeight: 700 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function AdminConsentsPage() {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<Consent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get<Consent[]>('/consents');
      setConsents(data);
    } catch {
      setError('No se pudieron cargar los consentimientos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = consents.filter(c =>
    search === '' ||
    c.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    c.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
    c.digitalSignature?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                 mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <GavelOutlinedIcon sx={{ color: '#3DAA96', fontSize: 24 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
              Consentimientos Informados
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Registro inmutable de consentimientos firmados digitalmente por los pacientes
          </Typography>
        </Box>
        <Chip
          label={`${consents.length} firmados`}
          sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700 }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Búsqueda */}
      <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)', mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField
            fullWidth size="small"
            placeholder="Buscar por paciente, servicio o firma…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: '#9DBFBA', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <TableContainer component={Paper} elevation={0}
          sx={{ borderRadius: 3, '& .MuiTableHead-root': { bgcolor: '#F4FAF8' } }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['#', 'Paciente', 'Servicio', 'Firma digital', 'Fecha de firma', 'Acción'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem',
                    textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #E4F0ED', py: 1.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#9DBFBA' }}>
                        <GavelOutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {consents.length === 0
                            ? 'Aún no hay consentimientos registrados.'
                            : 'No se encontraron resultados.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                  : filtered.map(c => (
                    <TableRow key={c.id}
                      sx={{ '&:hover': { bgcolor: '#F9FDFC' }, transition: 'background 0.15s' }}>
                      <TableCell sx={{ color: '#9DBFBA', fontSize: '0.8rem' }}>#{c.id}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#1A2E2A' }}>
                          {c.patientName ?? '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{c.patientEmail}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A2E2A' }}>
                          {c.serviceName ?? 'General'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {c.digitalSignature
                          ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: '#27AE60' }} />
                              <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif',
                                                                 color: '#1A2E2A', fontWeight: 600 }}>
                                {c.digitalSignature}
                              </Typography>
                            </Box>
                          )
                          : <Typography variant="caption" color="text.secondary">Sin firma</Typography>}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#5A7A74' }}>
                          {formatDate(c.signedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver consentimiento completo">
                          <IconButton size="small" onClick={() => setSelected(c)}
                            sx={{ color: '#3DAA96', '&:hover': { bgcolor: '#E8F5F0' } }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ConsentDetailDialog consent={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
