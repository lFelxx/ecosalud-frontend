# Ecosalud — Frontend

Aplicación web de página única (SPA) para la plataforma **Ecosalud**, un centro de salud integral que ofrece terapias alternativas, agendamiento de citas en línea y gestión administrativa completa. Desarrollada con React 19, TypeScript 6 y Material UI v7.

---

## Descripción del proyecto

Ecosalud es una plataforma digital que conecta pacientes con servicios de salud integral: acupuntura, ozonoterapia, sueroterapia dirigida, biopuntura, terapia neural, homeopatía, entre otros. El frontend provee:

- **Página de inicio** con presentación del especialista, catálogo de servicios y publicaciones del blog.
- **Agendamiento de citas** en línea con selección de servicio, fecha y franja horaria disponible.
- **Panel del paciente** (Mis Terapias): terapias activas con progreso, historial de sesiones y recomendaciones personalizadas.
- **Panel de administración** completo: gestión de citas, planes de terapia multi-sesión, usuarios, servicios, publicaciones, galería de medios y perfil del especialista.
- Autenticación por roles: Paciente, Editor y Administrador.

---

## Arquitectura general

El proyecto sigue una arquitectura de **presentación por capas** dentro de `src/presentation/`:

```
ecosalud-frontend/
├── public/                    # Archivos estáticos públicos
├── src/
│   └── presentation/
│       ├── components/        # Componentes reutilizables
│       │   └── common/        # ScrollToTop, loaders, guards compartidos
│       ├── context/           # Estado global con React Context API
│       │   ├── AuthContext.tsx        # Sesión del usuario (rol, token JWT)
│       │   └── AdminDataContext.tsx   # Datos del panel admin (localStorage)
│       ├── pages/             # Vistas organizadas por módulo
│       │   ├── home/          # LandingPage, HomePage
│       │   ├── auth/          # LoginPage, RegisterPage
│       │   ├── appointments/  # AppointmentsPage, BookAppointmentPage
│       │   ├── services/      # ServicesPage
│       │   ├── publications/  # PublicationsPage, PublicationDetailPage
│       │   ├── specialist/    # SpecialistProfilePage
│       │   └── admin/         # Panel administrativo completo
│       │       ├── appointments/  # Citas y planes de terapia
│       │       ├── services/      # Gestión de servicios
│       │       ├── posts/         # Editor de publicaciones
│       │       ├── media/         # Galería de medios
│       │       ├── users/         # Gestión de usuarios
│       │       └── specialist/    # Perfil del especialista
│       ├── router/            # AppRouter.tsx — rutas privadas y de admin
│       └── theme/             # Configuración del tema MUI (paleta verde)
├── .env.example               # Plantilla de variables de entorno
├── vercel.json                # Configuración de despliegue en Vercel
└── vite.config.ts             # Configuración del bundler
```

### Flujo de datos

- `AdminDataContext` actúa como fuente única de verdad para los datos administrativos, con sincronización automática a `localStorage`.
- `AuthContext` gestiona la sesión activa y expone `user`, `isAuthenticated` y callbacks de login/logout.
- Las rutas privadas (`PrivateRoute`, `AdminRoute`) redirigen automáticamente según el rol del usuario.
- `ScrollToTop` preserva la posición de scroll al navegar con el botón Atrás del navegador y restablece al inicio en navegaciones nuevas.

---

## Tecnologías utilizadas

| Categoría       | Tecnología                  | Versión |
|-----------------|-----------------------------|---------|
| Framework UI    | React                       | 19.x    |
| Lenguaje        | TypeScript                  | 6.x     |
| Bundler         | Vite (motor Rolldown)       | 8.x     |
| Componentes UI  | Material UI (MUI)           | 9.x     |
| Iconos          | @mui/icons-material         | 9.x     |
| Routing         | React Router DOM            | 7.x     |
| Cliente HTTP    | Axios                       | 1.x     |
| Linting         | ESLint + typescript-eslint  | 10.x    |
| Despliegue      | Vercel                      | —       |

---

## Requisitos previos

- **Node.js** 20 o superior — [descargar](https://nodejs.org/)
- **npm** 9 o superior (incluido con Node.js)
- Backend de Ecosalud en ejecución (ver repositorio `ecosalud-backend`)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/ecosalud-frontend.git
cd ecosalud-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

Editar el archivo `.env` recién creado:

```env
VITE_API_URL=http://localhost:8080/api
```

---

## Ejecución local

```bash
# Servidor de desarrollo con recarga en caliente (Hot Module Replacement)
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

```bash
# Verificar tipos TypeScript sin compilar
npm run build

# Vista previa del build de producción (requiere ejecutar build primero)
npm run preview
```

---

## Variables de entorno

| Variable        | Descripción                          | Valor por defecto            |
|-----------------|--------------------------------------|------------------------------|
| `VITE_API_URL`  | URL base del API REST del backend    | `http://localhost:8080/api`  |

> **Vercel:** configurar esta variable en **Project Settings → Environment Variables** apuntando a la URL del backend desplegado.

---

## Despliegue en Vercel

El repositorio incluye `vercel.json` preconfigurado:

- **Rewrites:** todas las rutas redirigen a `index.html` para que React Router funcione en producción.
- **Cache de assets:** archivos estáticos con `Cache-Control: max-age=31536000, immutable`.

El despliegue se activa automáticamente al hacer push a `main`:

```bash
git push origin main
```

---

## Estructura de ramas

| Rama      | Propósito                                            |
|-----------|------------------------------------------------------|
| `main`    | Producción — solo versiones revisadas y aprobadas    |
| `develop` | Desarrollo activo — integración de nuevas funciones  |

---

## Roles del sistema

| Rol      | Acceso                                                           |
|----------|------------------------------------------------------------------|
| Paciente | Agendamiento, historial personal, publicaciones y servicios      |
| Editor   | Todo lo anterior + gestión de publicaciones y catálogo           |
| Admin    | Acceso completo al panel administrativo                          |

---

## Autores

Proyecto académico desarrollado para la asignatura **Proyecto de Software** — Universidad IBERO.
