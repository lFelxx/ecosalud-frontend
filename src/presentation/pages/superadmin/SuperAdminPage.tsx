import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, IconButton, Tooltip, Switch,
  CircularProgress, Alert, Divider,
} from '@mui/material';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useAuthContext } from '../../context/AuthContext';
import axiosClient from '../../../infrastructure/http/axiosClient';

interface TenantRow {
  id: number;
  name: string;
  slug: string;
  subdomain: string;
  ownerName: string;
  ownerEmail: string;
  city: string;
  specialty: string;
  plan: string;
  accountType: string;
  billingStatus: string;
  active: boolean;
  schemaInitialized: boolean;
  createdAt: string;
}

const PLAN_COLOR: Record<string, string> = {
  STARTER: '#5A7A74', PRO: '#3DAA96', ENTERPRISE: '#1A4A3E',
};

export default function SuperAdminPage() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient.get('/platform/tenants')
      .then(r => setTenants(r.data))
      .catch(() => setError('No se pudo cargar la lista de clínicas.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: number, current: boolean) => {
    try {
      const { data } = await axiosClient.patch(`/platform/tenants/${id}/active?active=${!current}`);
      setTenants(prev => prev.map(t => t.id === id ? { ...t, active: data.active } : t));
    } catch {
      setError('No se pudo actualizar el estado.');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const stats = {
    total:   tenants.length,
    active:  tenants.filter(t => t.active).length,
    starter: tenants.filter(t => t.plan === 'STARTER').length,
    pro:     tenants.filter(t => t.plan === 'PRO').length,
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F6F4' }}>
      {/* Topbar */}
      <Box sx={{ bgcolor: '#1A2E2A', px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SpaOutlinedIcon sx={{ color: '#3DAA96', fontSize: 22 }} />
        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem', flex: 1 }}>
          Ecosalud Market — Super Admin
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
          {user?.name}
        </Typography>
        <Tooltip title="Cerrar sesión">
          <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#C0392B' } }}>
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2E2A' }}>
            Clínicas registradas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión centralizada de todos los tenants de la plataforma
          </Typography>
        </Box>

        {/* Estadísticas */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: stats.total,   color: '#3DAA96', bg: '#E8F5F0' },
            { label: 'Activas', value: stats.active,  color: '#27AE60', bg: '#E8F8F0' },
            { label: 'Starter', value: stats.starter, color: '#5A7A74', bg: '#EFF5F3' },
            { label: 'Pro',     value: stats.pro,     color: '#1A4A3E', bg: '#E3EDE9' },
          ].map(s => (
            <Box key={s.label} sx={{ bgcolor: s.bg, border: `1px solid ${s.color}30`, borderRadius: 2, px: 2.5, py: 1.2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: s.color }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#3DAA96' }} />
          </Box>
        ) : (
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E4F0ED' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FDFB' }}>
                    {['Clínica', 'Propietario', 'Especialidad', 'Plan', 'Estado', 'Activa'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: '#5A7A74', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenants.map(t => (
                    <TableRow key={t.id} sx={{ opacity: t.active ? 1 : 0.55, '&:hover': { bgcolor: '#F8FDFB' }, '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: '#3DAA96', fontSize: '0.8rem', fontWeight: 700 }}>
                            <StorefrontOutlinedIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2E2A' }}>{t.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{t.subdomain}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{t.ownerName}</Typography>
                        <Typography variant="caption" color="text.secondary">{t.ownerEmail}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {t.specialty || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t.plan}
                          size="small"
                          sx={{ bgcolor: `${PLAN_COLOR[t.plan] || '#5A7A74'}18`, color: PLAN_COLOR[t.plan] || '#5A7A74', fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t.schemaInitialized ? 'OK' : 'Pendiente'}
                          size="small"
                          sx={{ bgcolor: t.schemaInitialized ? '#E8F8F0' : '#FFF3E0', color: t.schemaInitialized ? '#27AE60' : '#E67E22', fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={t.active}
                          size="small"
                          onChange={() => toggleActive(t.id, t.active)}
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3DAA96' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3DAA96' } }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {tenants.length === 0 && (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">No hay clínicas registradas aún.</Typography>
              </Box>
            )}

            <Divider />
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                {tenants.length} clínica{tenants.length !== 1 ? 's' : ''} · Plataforma Ecosalud Market
              </Typography>
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  );
}
