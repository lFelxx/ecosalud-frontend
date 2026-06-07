/**
 * Cliente HTTP centralizado para Ecosalud.
 *
 * Interceptores:
 *  1. Authorization — adjunta el JWT si existe en localStorage.
 *  2. X-Tenant-Slug — resuelve el tenant para peticiones públicas (sin JWT):
 *       a) Si el usuario está logueado: extrae el slug de user.tenantSchema
 *          ej. "tenant_dra_angelica_camacho" → "dra-angelica-camacho"
 *       b) Fallback: lee el primer label del hostname
 *          ej. "dra-angelica-camacho.ecosaludmarket.com" → "dra-angelica-camacho"
 *       c) Dev local (localhost): no añade el header → backend usa schema "public"
 *  3. Logout automático en 401.
 */

import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Resuelve el slug del tenant activo sin depender del JWT ─────────────────

function resolveTenantSlug(): string | null {
  // a) Usuario logueado → tenantSchema en localStorage
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw) as { tenantSchema?: string };
      if (u?.tenantSchema) {
        // "tenant_dra_angelica_camacho" → "dra-angelica-camacho"
        return u.tenantSchema.replace(/^tenant_/, '').replaceAll('_', '-');
      }
    }
  } catch { /* JSON corrupto — ignorar */ }

  // b) Hostname con subdominio  (ej. dra-angelica-camacho.ecosaludmarket.com)
  const hostname = window.location.hostname;
  if (!hostname.startsWith('localhost') && !hostname.startsWith('127.')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) return parts[0]; // primer label = slug del tenant
  }

  return null; // dev local sin tenant → backend usa "public"
}

// ── Request interceptor ──────────────────────────────────────────────────────

axiosClient.interceptors.request.use((config) => {
  // JWT
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Tenant slug para peticiones sin JWT (páginas públicas)
  if (!token) {
    const slug = resolveTenantSlug();
    if (slug) config.headers['X-Tenant-Slug'] = slug;
  }

  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
