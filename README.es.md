<div align="center">
    <img src="public/icons/icon-128x128.png" width="128" height="128"> 
    <h3>UnitGol</h3>

[![en](https://img.shields.io/badge/lang-en-17a2b8.svg)](https://github.com/Jose26398/unitgol/blob/master/README.md)
[![es](https://img.shields.io/badge/lang-es-ffc107.svg)](https://github.com/Jose26398/unitgol/blob/master/README.es.md)

[![onrender](https://img.shields.io/badge/onrender-online-1eb854?labelColor=black&logo=render&style=flat-square)](https://unitgol.onrender.com)
[![release](https://img.shields.io/github/v/release/Jose26398/unitgol?labelColor=black&logo=github&style=flat-square)](https://github.com/Jose26398/unitgol/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffc107.svg)](https://opensource.org/licenses/MIT)

</div>

<div align="center">
    <h4>Gestionar partidos de fútbol entre amigos y peñas.</h4>

Sigue los partidos, las estadísticas de los jugadores y genera automáticamente equipos equilibrados basados en los datos de los jugadores.

</div>

## 📸 Capturas de pantalla

![players](https://github.com/user-attachments/assets/3ccbd11d-3676-4719-a77e-3a45a994bcb1)
<div style="display: flex; justify-content: space-between;">

| ![Matches](https://github.com/user-attachments/assets/54d51da2-a17d-4cf9-b5f8-b63629b65db5) | ![Match](https://github.com/user-attachments/assets/244ec828-2f6e-4ad0-ab8c-21d20930012a) | ![Generator](https://github.com/user-attachments/assets/d5ab2d69-cefa-4813-b78b-0597694e1a57) |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |

</div>

## 🌟 Características

| **Categoría**                         | **Descripción**                                                                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gestión de partidos**               | - Registra resultados de partidos y viajes.<br>- Seguimiento de goles, asistencias y datos históricos de partidos.                                             |
| **Estadísticas de jugadores**         | - Perfiles de jugadores individuales.<br>- Estadísticas detalladas:<br>  - Goles y asistencias.<br>  - Tasas de victorias y derrotas.                          |
| **Generador de equipos inteligentes** | - Equipos automáticamente equilibrados basados en:<br>  - Tasa de victorias.<br>  - Goles y asistencias por partido.<br>  - Métricas de rendimiento generales. |
| **Aplicación web progresiva**         | - Compatible con instalación en cualquier dispositivo.<br>- Actualizaciones automáticas.<br>- Persistencia de datos local.                                     |

## 🚀 Empezando

### Requisitos previos

- [Node.js 24 LTS](https://nodejs.org/en/) (24.15.0 o superior; `.nvmrc` selecciona Node 24).
- [pnpm 12.21.0](https://pnpm.io/), fijado en `package.json`.

### Instalación

1. Clona el repositorio

   ```bash
   git clone https://github.com/Jose26398/unitgol.git
   ```

2. Instala las dependencias

   ```bash
   cd unitgol
   pnpm install --frozen-lockfile
   ```

3. Copia `.env.example` a `.env.local` y configura `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` con la URL y la clave pública anon de tu proyecto
   Supabase. Aplica las migraciones de `supabase/migrations/` a un proyecto
   Supabase vacío antes de utilizar la aplicación.

4. Inicia el servidor de desarrollo

   ```bash
   pnpm dev
   ```

5. Compila para producción (incluye la comprobación de TypeScript)

   ```bash
   pnpm build
   ```

### Comprobaciones del proyecto

```bash
pnpm lint           # Comprobaciones de Biome
pnpm lint:fix       # Aplicar correcciones seguras de lint y formato
pnpm typecheck      # Comprobar aplicación, pruebas y configuración de build
pnpm test:run       # Ejecutar las pruebas una vez
pnpm test:coverage  # Ejecutar las pruebas con umbrales de cobertura
pnpm preview       # Previsualizar la compilación de producción en local
```

### Arquitectura y alcance actual

Se mantienen las pantallas cargadas bajo demanda, los diálogos compartidos, la puntuación en contexto de React y las mejoras de formularios, gráficos y generación de equipos.

La autenticación y los repositorios usan el contrato anterior de Supabase. No hay que activar Auth anónimo ni aplicar migraciones nuevas para probar esta versión. La renovación de autenticación, RLS y escrituras transaccionales queda guardada aparte en el stash `auth-db-refactor`.

Las pruebas cubren la lógica y la interfaz con Node/jsdom, y mantienen los tests de los repositorios anteriores. Las operaciones del backend conservan las limitaciones y permisos del despliegue actual.

### CI y releases

Los pull requests y los pushes a `master` o `develop` ejecutan los jobs
independientes `Lint`, `Test` y `Build`. `Build` incluye la comprobación de
TypeScript. Los informes de cobertura se conservan como artefactos durante
siete días, también cuando fallan las pruebas si se ha generado un informe.
Los títulos de PR se comprueban al crearlos, editarlos, reabrirlos y añadir
commits.

Cuando estos checks se hayan ejecutado en GitHub, configura reglas para
`master` y `develop` que exijan un pull request y los checks `Lint`, `Test`,
`Build` y `Validate PR title` antes de fusionar. Estas reglas son ajustes del
repositorio; los workflows no las activan. Usa squash merge con el título del
PR como mensaje del commit para conservar Conventional Commits en release-please.

La automatización de releases solo se ejecuta tras aprobar los tres jobs de CI
en un push a `master`. Las releases se ejecutan de una en una y un nuevo push
no cancela una release en curso. CI llama al workflow reutilizable de release.

Por defecto, las releases usan `GITHUB_TOKEN`. Para este modo, activa **Allow
GitHub Actions to create and approve pull requests** en los ajustes de Actions
del repositorio. El CI de los PR de release puede necesitar que un mantenedor
pulse **Approve workflows to run**. Para ejecutar ese CI automáticamente,
instala una GitHub App en este repositorio con permisos **Contents: read and
write** y **Pull requests: read and write**, y configura la variable de Actions
`RELEASE_APP_CLIENT_ID` y el secreto `RELEASE_APP_PRIVATE_KEY`. El job de release
creará un token temporal limitado a este repositorio y lo revocará al terminar.

### Archivos públicos e indexación

`public/` contiene los iconos estáticos que Vite copia sin transformar. El
manifiesto PWA y el service worker se generan al compilar. Vite también genera
`robots.txt` con el mismo criterio que la etiqueta meta robots del HTML: los
builds de producción permiten la indexación y los demás modos la desactivan.
Para un despliegue de desarrollo compilado en modo producción, configura
`VITE_ENV=development` (también se admite `develop`). No hace falta descargar
herramientas ni generar plantillas adicionales. Las variables `VITE_*` se incluyen
en el código del navegador y deben contener únicamente configuración pública.

### Fotos de jugadores

Antes de desplegar esta versión, aplica la migración
`supabase/migrations/20261114000000_player_avatars_and_team_limit.sql` en tu
proyecto Supabase. La migración configura el bucket de fotos (con lectura
pública), limita cada foto a 2 MB, solo JPG, PNG o WebP. La base de
datos también limita cada equipo a 100 jugadores.

## 📁 Estructura del proyecto

```text
config/               # Utilidades de compilación de Vite
public/               # Iconos estáticos
src/
├── app/              # Aplicación principal y estructura visual
├── components/       # Componentes de React compartidos
├── db/               # Repositorios y mapeos de base de datos
├── features/         # Funcionalidades de la aplicación
├── hooks/            # Hooks de React compartidos
├── types/            # Definiciones de tipos de TypeScript
├── utils/            # Funciones de utilidad compartidas
├── __tests__/        # Pruebas y configuración de Vitest
└── main.tsx          # Punto de entrada de la aplicación
supabase/             # Configuración local y migraciones SQL
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Siéntete libre de hacer tu Pull Request. Para cambios mayores, por favor abra primero una issue para discutir lo que deseas cambiar.

1. Haz un Fork del proyecto
2. Crea tu rama con tu feature (`git checkout -b feature/AmazingFeature`)
3. Commitea tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Sube a la rama (`git push origin feature/AmazingFeature`)
5. Abre un nuevo Pull Request

### Guías de contribución

- Escribe commits claros y descriptivos
- Actualiza la documentación según sea necesario
- Sigue el estilo de código existente
- Mantenga los Pull Requests enfocados en una característica única

## 📝 Licencia

Este proyecto está licenciado bajo la licencia MIT - consulta el archivo [LICENSE](LICENSE) para obtener detalles.

## 🙋‍♂️ Soporte

Si UnitGol te ha sido útil, considera apoyar el proyecto mediante:

- Darle una ⭐ en GitHub
- Compartirlo con amigos
- Contribuir con código, pruebas o ideas.

Si utilizas este proyecto, por favor proporciona atribución enlazando de nuevo a este repositorio.

## 📧 Contacto

Correo electrónico: <jsg26398@gmail.com>

X (anteriormente Twitter) - [@Jose26398](https://x.com/Jose26398)

Enlace del proyecto: [https://github.com/Jose26398/unitgol](https://github.com/Jose26398/unitgol)

---

_Creado con ❤️ por Jose26398. Juega limpio y disfruta!_
