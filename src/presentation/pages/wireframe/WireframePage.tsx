/**
 * WireframePage — Maquetación inicial del proyecto EcoSalud
 *
 * Muestra la estructura visual de la home page en estilo wireframe clásico:
 * cajas grises, placeholders de imágenes con X diagonal, barras de texto,
 * sin colores de marca. Útil para presentaciones y revisión de UX/UI.
 */

import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';

// ─── Paleta wireframe ────────────────────────────────────────────────────────
const W = {
  bg:       '#F2F2F2',
  sectionBg:'#FFFFFF',
  altBg:    '#E8E8E8',
  box:      '#D0D0D0',
  boxBorder:'#A8A8A8',
  barDark:  '#B8B8B8',
  barMid:   '#C8C8C8',
  barLight: '#D8D8D8',
  label:    '#888888',
  divider:  '1.5px solid #CCCCCC',
};

// ─── Primitivas ──────────────────────────────────────────────────────────────

/** Rectángulo gris con líneas diagonales (placeholder de imagen) */
function ImgBox({
  w = '100%',
  h,
  circle = false,
}: {
  w?: string | number;
  h: number;
  circle?: boolean;
}) {
  return (
    <Box
      sx={{
        width: w,
        height: h,
        minWidth: typeof w === 'number' ? w : undefined,
        minHeight: h,
        bgcolor: W.box,
        border: `2px solid ${W.boxBorder}`,
        borderRadius: circle ? '50%' : '6px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0 }}
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke={W.boxBorder} strokeWidth="1.5" />
        <line x1="100" y1="0" x2="0" y2="100" stroke={W.boxBorder} strokeWidth="1.5" />
      </svg>
    </Box>
  );
}

/** Barra horizontal para simular texto */
function Bar({
  w = '100%',
  h = 11,
  mt = 0,
  color = W.barMid,
}: {
  w?: string | number;
  h?: number;
  mt?: number;
  color?: string;
}) {
  return (
    <Box
      sx={{
        width: w,
        height: h,
        bgcolor: color,
        borderRadius: '4px',
        mt: `${mt}px`,
        flexShrink: 0,
      }}
    />
  );
}

/** Botón wireframe */
function WBtn({
  label,
  solid = false,
  w,
}: {
  label: string;
  solid?: boolean;
  w?: number | string;
}) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2.5,
        py: 1,
        border: `2px solid ${W.boxBorder}`,
        bgcolor: solid ? W.box : 'transparent',
        borderRadius: '6px',
        minWidth: w ?? 'auto',
        height: 40,
        cursor: 'default',
      }}
    >
      <Box sx={{ fontSize: '0.72rem', color: W.label, fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>
        {label}
      </Box>
    </Box>
  );
}

/** Etiqueta de sección wireframe */
function SectionLabel({ text }: { text: string }) {
  return (
    <Box
      sx={{
        display: 'inline-block',
        border: `1.5px dashed ${W.boxBorder}`,
        borderRadius: '4px',
        px: 1.5,
        py: 0.3,
        mb: 2,
        fontFamily: 'monospace',
        fontSize: '0.68rem',
        fontWeight: 800,
        color: W.label,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
      }}
    >
      {text}
    </Box>
  );
}

/** Chip/tag pequeño */
function WTag() {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.3,
        bgcolor: W.box,
        border: `1px solid ${W.boxBorder}`,
        borderRadius: '3px',
      }}
    >
      <Bar w={38} h={7} />
    </Box>
  );
}

// ─── Layout base de sección ──────────────────────────────────────────────────
function Section({
  children,
  alt = false,
  dark = false,
  py = 48,
}: {
  children: React.ReactNode;
  alt?: boolean;
  dark?: boolean;
  py?: number;
}) {
  return (
    <Box
      sx={{
        bgcolor: dark ? W.altBg : alt ? '#EEEEEE' : W.sectionBg,
        borderBottom: W.divider,
        py: `${py}px`,
        px: '48px',
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
}

// ─── Página ─────────────────────────────────────────────────────────────────

export default function WireframePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: W.bg }}>

      {/* ══════════════════════════════════════════════
          TÍTULO DE PÁGINA (fuera del wireframe)
      ══════════════════════════════════════════════ */}
      <Box
        sx={{
          bgcolor: '#3A3A3A',
          px: 4,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#BBBBBB', fontWeight: 700, letterSpacing: 1 }}>
          📐 ECOSALUD — WIREFRAME / MAQUETACIÓN INICIAL
        </Box>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            color: '#AAAAAA',
            textDecoration: 'none',
            border: '1px solid #666',
            px: 1.5,
            py: 0.5,
            borderRadius: '4px',
            '&:hover': { color: '#fff', borderColor: '#999' },
            transition: 'color 0.2s, border-color 0.2s',
          }}
        >
          ← Volver al sitio
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════
          1. NAVBAR
      ══════════════════════════════════════════════ */}
      <Box
        sx={{
          bgcolor: W.sectionBg,
          borderBottom: `2px solid ${W.boxBorder}`,
          height: 64,
          px: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        {/* Logo */}
        <Box sx={{ width: 130, height: 30, bgcolor: W.box, border: `1.5px solid ${W.boxBorder}`, borderRadius: '5px' }} />

        {/* Nav links */}
        <Box sx={{ display: 'flex', gap: 3, flex: 1, justifyContent: 'center' }}>
          {[90, 75, 100, 85].map((w, i) => (
            <Bar key={i} w={w} h={11} color={W.barDark} />
          ))}
        </Box>

        {/* Auth buttons */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <WBtn label="Iniciar sesión" />
          <WBtn label="Registrarse" solid />
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════
          2. HERO
      ══════════════════════════════════════════════ */}
      <Section py={60}>
        <SectionLabel text="Sección Hero" />
        <Box sx={{ display: 'flex', gap: 8, alignItems: 'center' }}>

          {/* Texto */}
          <Box sx={{ flex: 1 }}>
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                border: `1.5px solid ${W.boxBorder}`,
                borderRadius: '999px',
                px: 1.5,
                py: 0.5,
                mb: 2.5,
              }}
            >
              <Box sx={{ width: 12, height: 12, bgcolor: W.box, border: `1px solid ${W.boxBorder}`, borderRadius: '50%' }} />
              <Bar w={140} h={9} />
            </Box>

            {/* Título H1 */}
            <Bar w="88%" h={24} color={W.barDark} />
            <Bar w="65%" h={24} color={W.barDark} mt={10} />

            {/* Subtítulo */}
            <Bar w="95%" h={12} mt={20} />
            <Bar w="82%" h={12} mt={6} />
            <Bar w="70%" h={12} mt={6} />

            {/* CTAs */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <WBtn label="[ Crear cuenta gratis → ]" solid />
              <WBtn label="[ Ver servicios ]" />
            </Box>
          </Box>

          {/* Foto circular */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            {/* Anillo decorativo */}
            <Box
              sx={{
                position: 'absolute',
                inset: -12,
                borderRadius: '50%',
                border: `2px dashed ${W.boxBorder}`,
                opacity: 0.5,
              }}
            />
            <ImgBox w={300} h={300} circle />
            <Box
              sx={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                fontFamily: 'monospace',
                fontSize: '0.6rem',
                color: W.label,
                bgcolor: '#fff',
                border: `1px solid ${W.boxBorder}`,
                px: 0.8,
                py: 0.3,
                borderRadius: '3px',
              }}
            >
              300×300 – Foto Dr.
            </Box>
          </Box>
        </Box>
      </Section>

      {/* ══════════════════════════════════════════════
          3. BENEFICIOS
      ══════════════════════════════════════════════ */}
      <Section alt py={44}>
        <SectionLabel text="Barra de Beneficios" />
        <Box sx={{ display: 'flex', gap: 4 }}>
          {['Atención Certificada', 'Agenda Flexible', 'Enfoque Integral'].map((_, i) => (
            <Box key={i} sx={{ flex: 1, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              {/* Ícono */}
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: W.box,
                  border: `1.5px solid ${W.boxBorder}`,
                  borderRadius: '8px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ fontSize: '0.55rem', color: W.label, fontFamily: 'monospace', textAlign: 'center', lineHeight: 1.2 }}>
                  ICON
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Bar w="75%" h={13} color={W.barDark} />
                <Bar w="95%" h={10} mt={8} />
                <Bar w="85%" h={10} mt={5} />
                <Bar w="65%" h={10} mt={5} />
              </Box>
            </Box>
          ))}
        </Box>
      </Section>

      {/* ══════════════════════════════════════════════
          4. SERVICIOS
      ══════════════════════════════════════════════ */}
      <Section py={52}>
        <SectionLabel text="Servicios — Vista Previa" />

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3.5 }}>
          <Box>
            <Bar w={220} h={20} color={W.barDark} />
            <Bar w={280} h={11} mt={9} />
          </Box>
          <Bar w={100} h={11} color={W.barDark} />
        </Box>

        {/* Grid 3 × 2 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box
              key={i}
              sx={{
                bgcolor: '#EEEEEE',
                border: `1.5px solid ${W.boxBorder}`,
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              {/* Imagen */}
              <ImgBox h={140} />

              {/* Contenido */}
              <Box sx={{ p: 2 }}>
                {/* Nombre */}
                <Bar w="65%" h={14} color={W.barDark} />

                {/* Tags */}
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <WTag />
                  <WTag />
                </Box>

                {/* Descripción */}
                <Bar w="100%" h={9} mt={10} />
                <Bar w="85%" h={9} mt={5} />

                {/* Precio */}
                <Bar w={80} h={11} color={W.barDark} mt={10} />

                {/* Botón */}
                <Box
                  sx={{
                    mt: 1.5,
                    height: 34,
                    bgcolor: W.box,
                    border: `1.5px solid ${W.boxBorder}`,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ fontSize: '0.68rem', color: W.label, fontFamily: 'monospace', fontWeight: 700 }}>
                    Agendar
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Section>

      {/* ══════════════════════════════════════════════
          5. ESPECIALISTA
      ══════════════════════════════════════════════ */}
      <Section alt py={56}>
        <SectionLabel text="Perfil Especialista" />
        <Box sx={{ display: 'flex', gap: 8, alignItems: 'center' }}>

          {/* Foto */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Box
              sx={{
                position: 'absolute',
                inset: -14,
                borderRadius: '50%',
                border: `3px solid ${W.boxBorder}`,
                opacity: 0.35,
              }}
            />
            <ImgBox w={230} h={230} circle />
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1 }}>
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                border: `1.5px solid ${W.boxBorder}`,
                borderRadius: '999px',
                px: 1.5,
                py: 0.5,
                mb: 2,
              }}
            >
              <Bar w={90} h={9} />
            </Box>

            {/* Nombre */}
            <Bar w="70%" h={26} color={W.barDark} />

            {/* Especialidad */}
            <Bar w="50%" h={14} color={W.barMid} mt={10} />

            {/* Línea divisoria decorativa */}
            <Box sx={{ width: 44, height: 3, bgcolor: W.boxBorder, borderRadius: '2px', mt: 1.5, mb: 2 }} />

            {/* Bio */}
            <Bar w="100%" h={10} />
            <Bar w="95%" h={10} mt={5} />
            <Bar w="90%" h={10} mt={5} />
            <Bar w="70%" h={10} mt={5} />

            {/* Chips credenciales */}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
              {[120, 140].map((w, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    px: 1.5,
                    py: 0.5,
                    border: `1px solid ${W.boxBorder}`,
                    borderRadius: '999px',
                    bgcolor: W.box,
                  }}
                >
                  <Box sx={{ width: 12, height: 12, bgcolor: W.boxBorder, borderRadius: '50%' }} />
                  <Bar w={w} h={9} />
                </Box>
              ))}
            </Box>

            {/* Ver perfil link */}
            <Bar w={140} h={10} mt={16} color={W.barDark} />
          </Box>
        </Box>
      </Section>

      {/* ══════════════════════════════════════════════
          6. CTA REGISTRO
      ══════════════════════════════════════════════ */}
      <Section py={52}>
        <SectionLabel text="CTA — Llamada a la Acción" />
        <Box sx={{ maxWidth: 520, mx: 'auto', textAlign: 'center' }}>
          <Bar w="75%" h={22} color={W.barDark} />
          <Bar w="55%" h={22} color={W.barDark} mt={10} />
          <Bar w="90%" h={11} mt={18} />
          <Bar w="80%" h={11} mt={6} />
          <Bar w="65%" h={11} mt={6} />
          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
            <WBtn label="[ Ver Perfil Especialista → ]" solid />
            <WBtn label="[ Agendar Cita ]" />
          </Box>
        </Box>
      </Section>

      {/* ══════════════════════════════════════════════
          7. PUBLICACIONES
      ══════════════════════════════════════════════ */}
      <Section alt py={52}>
        <SectionLabel text="Publicaciones / Blog" />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3.5 }}>
          <Box>
            <Bar w={200} h={20} color={W.barDark} />
            <Bar w={260} h={11} mt={9} />
          </Box>
          <Bar w={90} h={11} color={W.barDark} />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                bgcolor: '#EEEEEE',
                border: `1.5px solid ${W.boxBorder}`,
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <ImgBox h={160} />
              <Box sx={{ p: 2 }}>
                {/* Categoría tag */}
                <Box sx={{ mb: 1 }}>
                  <WTag />
                </Box>
                {/* Título */}
                <Bar w="90%" h={14} color={W.barDark} />
                <Bar w="70%" h={14} color={W.barDark} mt={6} />
                {/* Extracto */}
                <Bar w="100%" h={9} mt={10} />
                <Bar w="85%" h={9} mt={5} />
                {/* Fecha + autor */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Bar w={80} h={9} color={W.barLight} />
                  <Bar w={60} h={9} color={W.barLight} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Section>

      {/* ══════════════════════════════════════════════
          8. FOOTER
      ══════════════════════════════════════════════ */}
      <Box
        sx={{
          bgcolor: W.altBg,
          borderTop: `2px solid ${W.boxBorder}`,
          px: '48px',
          py: '40px',
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <SectionLabel text="Footer" />
          <Box sx={{ display: 'flex', gap: 5 }}>
            {/* Logo + descripción */}
            <Box sx={{ flex: 1.5 }}>
              <Box sx={{ width: 130, height: 28, bgcolor: W.box, border: `1.5px solid ${W.boxBorder}`, borderRadius: '5px', mb: 2 }} />
              <Bar w="90%" h={10} />
              <Bar w="80%" h={10} mt={5} />
              <Bar w="70%" h={10} mt={5} />
              {/* Social icons */}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: W.box,
                      border: `1.5px solid ${W.boxBorder}`,
                      borderRadius: '6px',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Columnas de links */}
            {['Servicios', 'Empresa', 'Legal'].map((_, ci) => (
              <Box key={ci} sx={{ flex: 1 }}>
                <Bar w="55%" h={13} color={W.barDark} />
                {[1, 2, 3, 4].map((row) => (
                  <Bar key={row} w="70%" h={10} mt={10} />
                ))}
              </Box>
            ))}
          </Box>

          {/* Copyright strip */}
          <Box
            sx={{
              mt: 4,
              pt: 2.5,
              borderTop: `1px solid ${W.boxBorder}`,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Bar w={200} h={9} color={W.barLight} />
            <Bar w={120} h={9} color={W.barLight} />
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════
          BOTÓN FLOTANTE — Volver al sitio
      ══════════════════════════════════════════════ */}
      <Box
        component={RouterLink}
        to="/"
        sx={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#444444',
          color: '#EEEEEE',
          borderRadius: '8px',
          px: 2.5,
          py: 1.4,
          textDecoration: 'none',
          fontFamily: 'monospace',
          fontSize: '0.78rem',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          letterSpacing: 0.5,
          '&:hover': { bgcolor: '#222222' },
          transition: 'background-color 0.2s',
        }}
      >
        ← Volver al sitio real
      </Box>

    </Box>
  );
}
