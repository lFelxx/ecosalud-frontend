/**
 * useJsonLd — Inyecta un bloque JSON-LD (schema.org) en el <head> del documento.
 *
 * Diseñado para SEO multi-tenant: cada clínica puede tener sus propios datos
 * estructurados (MedicalClinic, LocalBusiness, Physician) sin SSR.
 *
 * Uso:
 *   useJsonLd({
 *     "@context": "https://schema.org",
 *     "@type": ["MedicalClinic", "LocalBusiness"],
 *     "name": "Clínica Ecosalud",
 *     ...
 *   });
 *
 * El bloque se elimina automáticamente al desmontar el componente.
 * Si `data` es null, no hace nada (útil mientras carga la data).
 */
import { useEffect } from 'react';

const SCRIPT_ID = 'ecosalud-jsonld';

export function useJsonLd(data: Record<string, unknown> | null) {
  useEffect(() => {
    if (!data) return;

    // Eliminar cualquier bloque previo del mismo componente
    document.getElementById(SCRIPT_ID)?.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id   = SCRIPT_ID;
    script.text = JSON.stringify(data, null, 0);
    document.head.appendChild(script);

    return () => {
      document.getElementById(SCRIPT_ID)?.remove();
    };
  }, [data]);
}
