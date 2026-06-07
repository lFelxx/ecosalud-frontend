/**
 * PatientProfilePage — Perfil editable del paciente.
 *
 * Permite al paciente:
 *  - Ver su información actual (nombre, email, rol)
 *  - Editar su nombre
 *  - Cambiar su contraseña (opcional, solo si escribe una nueva)
 *
 * Conectado a:
 *   GET /api/user/{id}  — cargar datos actuales
 *   PUT /api/user/{id}  — guardar cambios
 *
 * Ruta: /profile
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField,
  Button, Avatar, Chip, Alert, Divider, CircularProgress,
  InputAdornment, IconButton,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import axiosClient from '../../../infrastructure/http/axiosClient';
import { useAuthContext } from '../../context/AuthContext';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name?: string | null): string {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function roleLabel(role?: string): string {
  const map: Record<string, string> = {
    USER: 'Paciente', PATIENT: 'Paciente',
    ADMIN: 'Administrador', EDITOR: 'Editor',
    THERAPIST: 'Terapeuta',
  };
  return map[role ?? ''] ?? role ?? '';
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PatientProfilePage() {
  const { user: authUser, logout } = useAuthContext();
  const navigate = useNavigate();

  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [loadErr, setLoadErr]   = useState('');

  // Sección datos personales
  const [name,      setName]      = useState('');
  const [saving,    setSaving]    = useState(false);
  const [infoOk,    setInfoOk]    = useState(false);
  const [infoErr,   setInfoErr]   = useState('');

  // Sección contraseña
  const [newPass,   setNewPass]   = useState('');
  const [confPass,  setConfPass]  = useState('');
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [passOk,    setPassOk]    = useState(false);
  const [passErr,   setPassErr]   = useState('');
  const [savingPw,  setSavingPw]  = useState(false);

  // ── Carga ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authUser?.id) return;
    (async () => {
      try {
        const { data } = await axiosClient.get<UserProfile>(`/user/${authUser.id}`);
        setProfile(data);
        setName(data.name ?? '');
      } catch {
        setLoadErr('No se pudo cargar tu perfil. Intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    })();
  }, [authUser?.id]);

  // ── Guardar nombre ────────────────────────────────────────────────────────

  const handleSaveInfo = async () => {
    if (!profile || !name.trim()) return;
    setSaving(true);
    setInfoOk(false);
    setInfoErr('');
    try {
      await axiosClient.put(`/user/${profile.id}`, {
        name:   name.trim(),
        email:  profile.email,
        role:   profile.role,
        status: profile.status,
      });
      setProfile(p => p ? { ...p, name: name.trim() } : p);
      setInfoOk(true);
      setTimeout(() => setInfoOk(false), 3000);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setInfoErr(msg ?? 'No se pudo actualizar el nombre.');
    } finally {
      setSaving(false);
    }
  };

  // ── Cambiar contraseña ────────────────────────────────────────────────────

  const passValid = newPass.length >= 6 && newPass === confPass;

  const handleSavePassword = async () => {
    if (!profile || !passValid) return;
    setSavingPw(true);
    setPassOk(false);
    setPassErr('');
    try {
      await axiosClient.put(`/user/${profile.id}`, {
        name:     profile.name,
        email:    profile.email,
        role:     profile.role,
        status:   profile.status,
        password: newPass,
      });
      setNewPass('');
      setConfPass('');
      setPassOk(true);
      setTimeout(() => setPassOk(false), 3000);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPassErr(msg ?? 'No se pudo actualizar la contraseña.');
    } finally {
      setSavingPw(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4FAF8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Box sx={{ flex: 1, py: { xs: 3, md: 5 }, px: { xs: 2, md: 0 } }}>
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>

          {/* Volver */}
          <Button
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ color: '#5A7A74', fontWeight: 600, mb: 3, textTransform: 'none',
                  '&:hover': { bgcolor: 'transparent', color: '#3DAA96' } }}
          >
            Volver al inicio
          </Button>

          {/* Error de carga */}
          {loadErr && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{loadErr}</Alert>
          )}

          {/* ── Hero card — Avatar + nombre ── */}
          <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                      boxShadow: '0 4px 20px rgba(61,170,150,0.10)', mb: 3 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {loading
                ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#E4F0ED' }} />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ height: 24, bgcolor: '#E4F0ED', borderRadius: 1, mb: 1, width: '40%' }} />
                      <Box sx={{ height: 16, bgcolor: '#E4F0ED', borderRadius: 1, width: '60%' }} />
                    </Box>
                  </Box>
                )
                : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                    <Avatar
                      sx={{
                        width: 80, height: 80, bgcolor: '#3DAA96',
                        fontSize: '1.6rem', fontWeight: 800, flexShrink: 0,
                        boxShadow: '0 4px 16px rgba(61,170,150,0.30)',
                      }}
                    >
                      {initials(profile?.name ?? authUser?.name)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#1A2E2A',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile?.name ?? authUser?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {profile?.email ?? authUser?.email}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={roleLabel(profile?.role ?? authUser?.role)}
                          size="small"
                          sx={{ bgcolor: '#E8F5F0', color: '#3DAA96', fontWeight: 700,
                                fontSize: '0.72rem', height: 22 }}
                        />
                        {profile?.createdAt && (
                          <Chip
                            label={`Desde ${new Date(profile.createdAt)
                              .toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`}
                            size="small"
                            sx={{ bgcolor: '#F0F6F4', color: '#5A7A74', fontWeight: 600,
                                  fontSize: '0.72rem', height: 22 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
            </CardContent>
          </Card>

          <Grid container spacing={3}>

            {/* ── Información personal ── */}
            <Grid size={12}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <PersonOutlinedIcon sx={{ color: '#3DAA96' }} />
                    <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '1rem' }}>
                      Información personal
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  {infoOk && (
                    <Alert
                      severity="success"
                      icon={<CheckCircleOutlinedIcon fontSize="inherit" />}
                      sx={{ mb: 2.5, borderRadius: 2 }}
                    >
                      Nombre actualizado correctamente.
                    </Alert>
                  )}
                  {infoErr && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}
                      onClose={() => setInfoErr('')}>
                      {infoErr}
                    </Alert>
                  )}

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth label="Nombre completo" size="small"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={loading}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth label="Correo electrónico" size="small"
                        value={profile?.email ?? authUser?.email ?? ''}
                        disabled
                        helperText="El email no se puede cambiar desde aquí"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={saving
                        ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                        : <SaveOutlinedIcon />}
                      onClick={handleSaveInfo}
                      disabled={saving || loading || !name.trim() || name.trim() === profile?.name}
                      sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700,
                            '&:hover': { bgcolor: '#2B8A78' } }}
                    >
                      {saving ? 'Guardando…' : 'Guardar nombre'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* ── Seguridad / Contraseña ── */}
            <Grid size={12}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E4F0ED',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <LockOutlinedIcon sx={{ color: '#3DAA96' }} />
                    <Typography sx={{ fontWeight: 700, color: '#1A2E2A', fontSize: '1rem' }}>
                      Cambiar contraseña
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  {passOk && (
                    <Alert
                      severity="success"
                      icon={<CheckCircleOutlinedIcon fontSize="inherit" />}
                      sx={{ mb: 2.5, borderRadius: 2 }}
                    >
                      Contraseña actualizada. La próxima vez que inicies sesión usa la nueva clave.
                    </Alert>
                  )}
                  {passErr && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}
                      onClose={() => setPassErr('')}>
                      {passErr}
                    </Alert>
                  )}

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth label="Nueva contraseña" size="small"
                        type={showNew ? 'text' : 'password'}
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        helperText="Mínimo 6 caracteres"
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton size="small"
                                  onClick={() => setShowNew(v => !v)}>
                                  {showNew
                                    ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                                    : <VisibilityOutlinedIcon    sx={{ fontSize: 18 }} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth label="Confirmar contraseña" size="small"
                        type={showConf ? 'text' : 'password'}
                        value={confPass}
                        onChange={e => setConfPass(e.target.value)}
                        error={confPass.length > 0 && newPass !== confPass}
                        helperText={confPass.length > 0 && newPass !== confPass
                          ? 'Las contraseñas no coinciden' : ' '}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton size="small"
                                  onClick={() => setShowConf(v => !v)}>
                                  {showConf
                                    ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                                    : <VisibilityOutlinedIcon    sx={{ fontSize: 18 }} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={savingPw
                        ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                        : <LockOutlinedIcon />}
                      onClick={handleSavePassword}
                      disabled={savingPw || !passValid}
                      sx={{ bgcolor: '#1A2E2A', borderRadius: 2, fontWeight: 700,
                            '&:hover': { bgcolor: '#122020' } }}
                    >
                      {savingPw ? 'Actualizando…' : 'Actualizar contraseña'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* ── Zona de peligro ── */}
            <Grid size={12}>
              <Card sx={{ borderRadius: 3, border: '1px solid #FDECEA',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography sx={{ fontWeight: 700, color: '#C0392B', mb: 1 }}>
                    Cerrar sesión
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Cierra la sesión activa en este dispositivo.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => { logout(); navigate('/'); }}
                    sx={{ borderColor: '#C0392B', color: '#C0392B', borderRadius: 2, fontWeight: 700,
                          '&:hover': { bgcolor: '#FDECEA' } }}
                  >
                    Cerrar sesión
                  </Button>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
