/**
 * useSeo — Actualiza dinámicamente el <title> y <meta name="description">
 * de la página actual.
 *
 * Diseñado para páginas públicas multi-tenant: cada clínica puede tener
 * su propio título y descripción sin SSR.
 *
 * Uso:
 *   useSeo('Dra. Angélica Camacho | Ecosalud', 'Medicina integrativa en Bogotá');
 */
import { useEffect } from 'react';

export function useSeo(title: string, description?: string) {
  useEffect(() => {
    // Título
    document.title = title;

    // Meta description — buscar o crear el tag
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description ?? '';

    // Open Graph — mínimo viable para compartir en redes
    setOgMeta('og:title', title);
    if (description) setOgMeta('og:description', description);

    // Restaurar al desmontar (opcional — evita que el título anterior
    // quede si el usuario navega a una página sin useSeo)
    return () => {
      document.title = 'Ecosalud';
    };
  }, [title, description]);
}

/** Crea o actualiza una meta Open Graph. */
function setOgMeta(property: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}
