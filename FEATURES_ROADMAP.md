# Ecosalud Market — Roadmap de Funcionalidades

> **Plataforma:** Ecosalud Market SaaS  
> **Propietarios:** Ing. Félix Castro · Ing. Elkin Chaparro  
> **Stack:** React 19 + Spring Boot 4 + PostgreSQL (schema per tenant)

---

## ✅ Fase 1 — Implementado (costo $0)

- [x] Autenticación JWT (login / registro)
- [x] Panel de administración por clínica
- [x] Gestión de servicios / terapias
- [x] Agendamiento de citas
- [x] Planes de terapia multi-sesión
- [x] Perfil de especialista editable
- [x] Publicaciones / blog por clínica
- [x] Panel de citas admin (Citas + Planes de Terapia)
- [x] Scroll restoration entre páginas
- [x] Modales de confirmación, recomendaciones, cancelación
- [x] Despliegue en Vercel + rama develop/main

---

## 🚧 En Construcción — Fase 2 SaaS

### Multi-tenancy (schema por tenant)
- [ ] Entidad `Tenant` en schema público
- [ ] Switching de schema por subdominio/dominio
- [ ] Onboarding de nuevas clínicas
- [ ] Panel super-admin de plataforma

### Suscripciones y planes
- [ ] Planes STARTER / PRO / CLINIC / FOUNDER
- [ ] Feature flags por plan
- [ ] Pricing page pública
- [ ] Guía de dominio propio (Plan Pro+)
- [ ] Gestión de clientes fundadores (exentos de pago)

### Landing pages por tenant
- [ ] Template personalizable por clínica
- [ ] Colores, logo, especialidades por tenant
- [ ] SEO dinámico por tenant (meta tags, JSON-LD, sitemap)
- [ ] Subdominio automático (`clinica.ecosaludmarket.com`)

### Historia clínica básica (Res. 1995/1999)
- [ ] Registro de motivo de consulta
- [ ] Diagnóstico y plan de tratamiento
- [ ] Integridad de datos (hash SHA-256)
- [ ] Bloqueo de edición post 24h
- [ ] Exportación PDF por paciente

### Consentimientos informados
- [ ] Formulario digital por servicio
- [ ] Firma digital desde móvil
- [ ] Registro de IP y timestamp

### Notificaciones (Resend — free tier)
- [ ] Email de confirmación de cita
- [ ] Email de recordatorio 24h antes
- [ ] Email de credenciales al registrarse
- [ ] Email de cancelación

---

## 📅 Fase 3 — Próximas inversiones

> Documentadas para implementación cuando haya presupuesto o inversión.

### Pagos en plataforma (PayU)
- [ ] Suscripciones recurrentes por clínica
- [ ] Precio en USD con equivalente COP en tiempo real
- [ ] Historial de facturación por tenant
- [ ] Códigos promocionales y descuentos
- [ ] Pago online de citas por paciente (requiere DIAN)
  > **Nota:** Requiere facturación electrónica DIAN.
  > Estimado de implementación: 3–4 semanas + habilitación DIAN.

### WhatsApp Business API (Meta Cloud API)
- [ ] Recordatorio de cita por WhatsApp (24h y 2h antes)
- [ ] Confirmación de cita al paciente
- [ ] Notificación de nueva cita al especialista
- [ ] Bienvenida al nuevo paciente con credenciales
  > **Costo:** Gratis hasta 1,000 conversaciones/mes.
  > Requiere: verificación de empresa en Meta Business.

### Teleconsulta nativa
- [ ] Videollamada integrada (WebRTC / Daily.co)
- [ ] Sala privada por cita
- [ ] Grabación opcional de sesión
  > **Costo:** Daily.co free tier: 10,000 min/mes gratis.

### NPS y satisfacción
- [ ] Encuesta automática post-cita (1–5 estrellas + comentario)
- [ ] Rating público en landing page de la clínica
- [ ] Schema `Review` de Google para estrellas en buscador

### Dominio propio automatizado
- [ ] Panel de configuración de dominio (Plan Clínica)
- [ ] Verificación CNAME automática
- [ ] SSL Let's Encrypt por dominio
- [ ] Integración con Vercel API para custom domains

---

## 🔬 Fase 4 — Largo plazo (alto impacto)

> Para cuando la plataforma tenga 50+ tenants activos.

### Integración Historia Clínica — Gobernación / SISPRO
- [ ] Modelo de datos conforme a Resolución 2654/2019
- [ ] Formato HL7 FHIR para interoperabilidad
- [ ] Habilitación como software de HCE (Historia Clínica Electrónica)
- [ ] Certificación ante MinSalud
  > **Requiere:** Norma específica de la Gobernación (pendiente por el cliente).
  > Estimado: 6–12 meses de desarrollo + proceso de habilitación.

### IA y recomendaciones
- [ ] Sugerencia de terapia según síntomas del paciente
- [ ] Predicción de no-show (citas que serán canceladas)
- [ ] Optimización automática de agenda del especialista
  > **Costo:** OpenAI API / AWS Bedrock (~$50–200/mes según volumen).

### App móvil nativa
- [ ] React Native (iOS + Android)
- [ ] Notificaciones push nativas
- [ ] Acceso offline a historial de citas
  > **Estimado:** 3–4 meses de desarrollo. Reutiliza 70% del código React.

### Multi-idioma
- [ ] Español / Inglés (para clínicas que atienden extranjeros)
- [ ] i18n con react-i18next

### Programa de referidos
- [ ] Link único por paciente
- [ ] Dashboard de referidos en panel de clínica
- [ ] Descuento automático por referido exitoso

### Marketplace interno
- [ ] Clínicas pueden referir pacientes a otras clínicas de la red
- [ ] Comisión configurable por referido

---

## 🔐 Seguridad y Compliance (continuo)

- [ ] Auditoría de accesos por tenant (quién vio qué historia clínica)
- [ ] Backup automático por schema de tenant
- [ ] Encriptación de datos sensibles en reposo (AES-256)
- [ ] Política de retención de datos (15 años — Res. 1995/1999)
- [ ] CAPTCHA en formularios públicos
- [ ] Rate limiting por IP en endpoints de auth

---

*Última actualización: Junio 2026*  
*Ecosalud Market · Desarrollado por Ing. Félix Castro & Ing. Elkin Chaparro*
