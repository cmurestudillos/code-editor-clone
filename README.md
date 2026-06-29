# Code Editor Clone

Editor de código en el navegador para probar snippets de HTML, CSS y JavaScript con vista previa en tiempo real.
Inspirado en CodePen.

## Demo

🔗 **[code-simple-editor.vercel.app](https://code-simple-editor.vercel.app)**

## Características

- **Editor triple** — HTML, CSS y JavaScript con syntax highlighting (CodeMirror 6)
- **Vista previa en tiempo real** — iframe sandboxed con debounce de 300ms
- **Consola integrada** — captura `console.log/error/warn/info` del iframe; muestra objetos como JSON; separador visual
  entre ejecuciones
- **Compartir vía URL** — el estado se codifica en el hash de la URL (base64 + UTF-8); botón "Compartir" copia el link
  al portapapeles
- **Persistencia** — código, tema y configuración guardados en localStorage
- **Plantillas** — En Blanco, Ejemplo Básico, Calculadora
- **Guardar / Cargar** — exporta e importa proyectos como JSON
- **Exportar HTML** — descarga el proyecto como archivo HTML completo
- **Temas** — dark / light con cambio en caliente
- **Atajos de teclado** — `Ctrl+Enter`, `Ctrl+S`, `Ctrl+Shift+R`, `Ctrl+D`, `Ctrl+,`

## Stack

| Capa            | Tecnología                                                            |
| --------------- | --------------------------------------------------------------------- |
| UI              | React 19 + TypeScript                                                 |
| Build           | Vite 7                                                                |
| Editor          | CodeMirror 6                                                          |
| Estilos         | Tailwind CSS 3                                                        |
| Fuentes         | @fontsource/raleway + @fontsource/fira-code (self-hosted, solo latin) |
| Iconos          | Lucide React                                                          |
| Package manager | pnpm 11                                                               |
| Linting         | ESLint 9 flat config + Prettier 3                                     |
| Git hooks       | Husky 9 + lint-staged                                                 |
| Deploy          | Vercel (SPA)                                                          |

## Instalación

```bash
# Clonar
git clone https://github.com/cmurestudillos/code-editor-clone.git
cd code-editor-clone

# Instalar dependencias
pnpm install

# Desarrollo (puerto 3000)
pnpm dev
```

## Scripts

| Script            | Descripción                                |
| ----------------- | ------------------------------------------ |
| `pnpm dev`        | Servidor de desarrollo en `localhost:3000` |
| `pnpm build`      | Build de producción en `/dist`             |
| `pnpm preview`    | Previsualiza el build                      |
| `pnpm lint`       | Analiza con ESLint                         |
| `pnpm lint:fix`   | Corrige errores de ESLint                  |
| `pnpm format`     | Formatea con Prettier                      |
| `pnpm type-check` | Verifica tipos TypeScript                  |

## Estructura

```
src/
├── App.tsx                    # Estado global, lógica, layout
├── main.tsx                   # Entry point + imports de fuentes
├── vite-env.d.ts
├── assets/
│   └── index.css              # Tailwind + estilos globales
└── components/
    ├── Editor.tsx             # CodeMirror 6 (dark/light, sync bidireccional)
    ├── ConsolePanel.tsx       # Consola con separadores y JSON stringify
    └── KeyboardShortcuts.tsx  # Hook de atajos globales
```

## Atajos de teclado

| Atajo                  | Acción                     |
| ---------------------- | -------------------------- |
| `Ctrl/Cmd + Enter`     | Ejecutar código            |
| `Ctrl/Cmd + S`         | Guardar proyecto como JSON |
| `Ctrl/Cmd + Shift + R` | Reset del código           |
| `Ctrl/Cmd + D`         | Cambiar tema               |
| `Ctrl/Cmd + ,`         | Abrir configuración        |

## Compartir proyectos

La URL incluye el estado completo codificado en base64 en el hash:

```
https://code-simple-editor.vercel.app/#eyJodG1sIjoiPGgxPkhvbGE8...
```

Al abrir el link, el estado se carga automáticamente con prioridad sobre localStorage. El hash se actualiza en tiempo
real mientras escribes (debounce 500ms, sin crear entradas en el historial).

## Seguridad del iframe

El iframe usa `sandbox="allow-scripts allow-modals allow-forms allow-popups"` sin `allow-same-origin`, por lo que el
código del usuario corre en un origen nulo y no puede acceder al DOM del editor. La comunicación de la consola usa
`postMessage`.

## Licencia

MIT
