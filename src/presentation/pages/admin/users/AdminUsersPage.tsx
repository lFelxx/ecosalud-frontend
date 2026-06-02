import { useState } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip, Select,
  MenuItem, Switch, Tooltip, Button, Dialog, TextField,
  FormControl, InputLabel, FormControlLabel, Checkbox,
  IconButton, InputAdornment, Divider, Alert,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAdminData } from '../../../context/AdminDataContext';
import { useAuthContext } from '../../../context/AuthContext';
import type { UserData } from '../../../context/AdminDataContext';

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN:   { bg: '#E8F5F0', color: '#3DAA96' },
  EDITOR:  { bg: '#FFF3E0', color: '#F39C12' },
  PATIENT: { bg: '#F0F4FF', color: '#7B68EE' },
};

// ── Generador de contraseña temporal ─────────────────────────────────────────
function genPassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Abre el cliente de correo con las credenciales precargadas ────────────────
function sendCredentialsMail(name: string, email: string, password: string, role: string) {
  const roleName = role === 'ADMIN' ? 'Administrador' : role === 'EDITOR' ? 'Editor' : 'Paciente';
  const subject = encodeURIComponent('Tus credenciales de acceso – Ecosalud');
  const body = encodeURIComponent(
    `Hola ${name},\n\n` +
    `Se ha creado una cuenta para ti en el portal de Ecosalud.\n\n` +
    `── Tus credenciales ──────────────────────\n` +
    `Correo:       ${email}\n` +
    `Contraseña:   ${password}\n` +
    `Rol:          ${roleName}\n` +
    `─────────────────────────────────────────\n\n` +
    `Inicia sesión en: https://ecosalud-market.com/login\n\n` +
    `Por seguridad, te recomendamos cambiar tu contraseña después\n` +
    `de tu primer inicio de sesión.\n\n` +
    `Saludos,\n` +
    `Equipo Ecosalud`,
  );
  window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
}

interface NewUserForm {
  name: string;
  email: string;
  role: UserData['role'];
  password: string;
  sendEmail: boolean;
}

const EMPTY_FORM: NewUserForm = {
  name: '',
  email: '',
  role: 'PATIENT',
  password: genPassword(),
  sendEmail: true,
};

export default function AdminUsersPage() {
  const { users, addUser, updateUserRole, toggleUserStatus } = useAdminData();
  const { user: currentUser } = useAuthContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<NewUserForm>(EMPTY_FORM);
  const [showPwd, setShowPwd] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [created, setCreated] = useState(false);

  const sorted = [...users].sort((a, b) => {
    const order: Record<string, number> = { ADMIN: 0, EDITOR: 1, PATIENT: 2 };
    return order[a.role] - order[b.role];
  });

  // ── Dialog handlers ──────────────────────────────────────────────────────────
  const openDialog = () => {
    setForm({ ...EMPTY_FORM, password: genPassword() });
    setEmailError('');
    setCreated(false);
    setShowPwd(false);
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const setField = <K extends keyof NewUserForm>(k: K, v: NewUserForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return false;
    const dup = users.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase());
    if (dup) { setEmailError('Este correo ya está registrado.'); return false; }
    setEmailError('');
    return true;
  };

  const handleCreate = () => {
    if (!validate()) return;
    addUser({ name: form.name.trim(), email: form.email.trim(), role: form.role });
    if (form.sendEmail) {
      sendCredentialsMail(form.name.trim(), form.email.trim(), form.password, form.role);
    }
    setCreated(true);
  };

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
            Gestión de Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            {users.filter((u) => u.status === 'ACTIVE').length} activos · {users.length} en total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          onClick={openDialog}
          sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
        >
          Nuevo usuario
        </Button>
      </Box>

      {/* ── Resumen roles ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {(['ADMIN', 'EDITOR', 'PATIENT'] as UserData['role'][]).map((role) => {
          const count = users.filter((u) => u.role === role).length;
          const c = ROLE_COLORS[role];
          return (
            <Box
              key={role}
              sx={{ bgcolor: c.bg, border: `1px solid ${c.color}30`, borderRadius: 2, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: c.color }}>{count}</Typography>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: c.color }}>
                {role === 'PATIENT' ? 'Paciente' : role === 'EDITOR' ? 'Editor' : 'Admin'}{count !== 1 ? 's' : ''}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* ── Tabla ── */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E4F0ED', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FDFB' }}>
                <TableCell sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, display: { xs: 'none', md: 'table-cell' } }}>Registro</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Activo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((u) => {
                const isCurrentUser = u.id === currentUser?.id;
                const c = ROLE_COLORS[u.role];
                return (
                  <TableRow
                    key={u.id}
                    sx={{ opacity: u.status === 'INACTIVE' ? 0.55 : 1, '&:hover': { bgcolor: '#F8FDFB' }, '&:last-child td': { border: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: c.color, fontSize: '0.8rem', fontWeight: 700 }}>
                          {u.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A2E2A' }}>
                            {u.name}
                            {isCurrentUser && (
                              <Chip label="Tú" size="small" sx={{ ml: 0.8, height: 16, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#E8F5F0', color: '#3DAA96' }} />
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {u.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Tooltip title={isCurrentUser ? 'No puedes cambiar tu propio rol' : ''} placement="top">
                        <Select
                          value={u.role}
                          size="small"
                          disabled={isCurrentUser}
                          onChange={(e) => updateUserRole(u.id, e.target.value as UserData['role'])}
                          sx={{
                            fontSize: '0.78rem', fontWeight: 700, color: c.color, bgcolor: c.bg,
                            borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: `${c.color}30` }, minWidth: 110,
                          }}
                        >
                          <MenuItem value="PATIENT">Paciente</MenuItem>
                          <MenuItem value="EDITOR">Editor</MenuItem>
                          <MenuItem value="ADMIN">Admin</MenuItem>
                        </Select>
                      </Tooltip>
                    </TableCell>

                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                        {new Date(u.joinedAt).toLocaleDateString('es-CO')}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title={isCurrentUser ? 'No puedes desactivarte a ti mismo' : u.status === 'ACTIVE' ? 'Desactivar usuario' : 'Activar usuario'}>
                        <span>
                          <Switch
                            checked={u.status === 'ACTIVE'}
                            disabled={isCurrentUser}
                            onChange={() => toggleUserStatus(u.id)}
                            size="small"
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3DAA96' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3DAA96' } }}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── Diálogo: Nuevo usuario ── */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, m: { xs: 1.5, md: 3 } } } }}
      >
        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>

          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2E2A' }}>
                Crear nuevo usuario
              </Typography>
              <Typography variant="caption" color="text.secondary">
                El usuario podrá iniciar sesión con las credenciales generadas
              </Typography>
            </Box>
            <IconButton size="small" onClick={closeDialog} sx={{ color: '#9DBFBA' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Estado: creado exitosamente */}
          {created ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 56, color: '#3DAA96', mb: 1.5 }} />
              <Typography sx={{ fontWeight: 700, color: '#1A2E2A', mb: 0.5 }}>
                ¡Usuario creado exitosamente!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>{form.name}</strong> fue añadido como <strong>{form.role === 'PATIENT' ? 'Paciente' : form.role === 'EDITOR' ? 'Editor' : 'Administrador'}</strong>.
              </Typography>
              {form.sendEmail && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Se abrió tu cliente de correo con las credenciales listas para enviar.
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => { setForm({ ...EMPTY_FORM, password: genPassword() }); setCreated(false); }}
                  sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2 }}
                >
                  Crear otro
                </Button>
                <Button
                  variant="contained"
                  onClick={closeDialog}
                  sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
                >
                  Cerrar
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              {/* Nombre */}
              <TextField
                label="Nombre completo"
                fullWidth
                size="small"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Ej. Laura Martínez"
              />

              {/* Email */}
              <TextField
                label="Correo electrónico"
                fullWidth
                size="small"
                type="email"
                value={form.email}
                onChange={(e) => { setField('email', e.target.value); setEmailError(''); }}
                error={Boolean(emailError)}
                helperText={emailError}
                sx={{ mb: 2 }}
                placeholder="usuario@ejemplo.com"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ fontSize: 18, color: '#9DBFBA' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Rol */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Rol</InputLabel>
                <Select
                  label="Rol"
                  value={form.role}
                  onChange={(e) => setField('role', e.target.value as UserData['role'])}
                >
                  <MenuItem value="PATIENT">Paciente</MenuItem>
                  <MenuItem value="EDITOR">Editor</MenuItem>
                  <MenuItem value="ADMIN">Administrador</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ mb: 2 }} />

              {/* Contraseña temporal */}
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Contraseña temporal
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowPwd((p) => !p)}
                              sx={{ color: '#9DBFBA', '&:hover': { color: '#3DAA96' } }}
                            >
                              {showPwd
                                ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                                : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                              }
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Tooltip title="Generar nueva contraseña">
                    <IconButton
                      onClick={() => setField('password', genPassword())}
                      sx={{ border: '1px solid #C5DDD8', borderRadius: 2, color: '#3DAA96', px: 1.5, '&:hover': { bgcolor: '#E8F5F0' } }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Puedes editarla manualmente o generar una nueva aleatoria
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Checkbox enviar correo */}
              <Alert
                severity="info"
                icon={<EmailOutlinedIcon fontSize="small" />}
                sx={{ mb: 2, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.sendEmail}
                      onChange={(e) => setField('sendEmail', e.target.checked)}
                      size="small"
                      sx={{ '&.Mui-checked': { color: '#3DAA96' }, p: 0.5 }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      Enviar credenciales por correo al crear
                    </Typography>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                  Se abrirá tu cliente de correo con un mensaje listo para enviar.
                </Typography>
              </Alert>

              {/* Botones */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={closeDialog}
                  sx={{ borderColor: '#C5DDD8', color: '#5A7A74', borderRadius: 2 }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCreate}
                  disabled={!form.name.trim() || !form.email.trim() || !form.password.trim()}
                  startIcon={<PersonAddOutlinedIcon />}
                  sx={{ bgcolor: '#3DAA96', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#2B8A78' } }}
                >
                  Crear usuario
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
