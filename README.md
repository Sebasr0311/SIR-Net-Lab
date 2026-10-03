# SIR-Net Lab

Simulador interactivo de modelos epidemiológicos SIR/SEIR sobre redes complejas, desarrollado para la materia Ecuaciones Diferenciales 2026-II.

**Demo en vivo:** [https://sebasr0311.github.io/SIR-Net-Lab/](https://sebasr0311.github.io/SIR-Net-Lab/)

## Instalación

```bash
npm install
npm run dev
```

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Verificación ESLint sobre `src/` y `tests/` |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm test` | Ejecuta Vitest en modo watch |
| `npm run test:coverage` | Tests con cobertura (umbral: 90 %) |
| `npm run e2e` | Tests end-to-end con Playwright |

## Estructura de carpetas

```
SIR-Net-Lab/
├── src/
│   ├── core/
│   │   ├── models/       # Modelos SIR, SEIR, SIS
│   │   ├── solvers/      # Integración numérica (RK4, etc.)
│   │   ├── analysis/     # R₀, umbrales, análisis
│   │   ├── calibration/  # Ajuste de parámetros
│   │   └── sensitivity/  # Análisis de sensibilidad
│   ├── sim/
│   │   └── graphs/       # Modelos de red (ER, BA, WS)
│   ├── workers/          # Web Workers para simulación
│   ├── state/            # Estado global de la aplicación
│   └── ui/
│       ├── components/   # Componentes de UI reutilizables
│       ├── pages/        # Páginas principales
│       ├── styles/       # CSS global y variables
│       └── i18n/         # Internacionalización (ES)
├── tests/
│   ├── unit/             # Tests unitarios (Vitest)
│   ├── e2e/              # Tests E2E (Playwright)
│   └── fixtures/         # Datos de prueba
├── docs/
│   ├── adr/              # Architecture Decision Records
│   └── informe/          # Informe académico
└── .github/
    └── workflows/        # CI y deploy a GitHub Pages
```

## Stack tecnológico

- **Build:** Vite + TypeScript strict
- **UI:** HTML/CSS nativo (sin framework)
- **Visualización:** Chart.js · d3-force · KaTeX
- **Concurrencia:** Web Workers
- **Testing:** Vitest · Playwright · axe-core
- **Calidad:** ESLint · Prettier · Husky · commitlint
- **CI/CD:** GitHub Actions → GitHub Pages

## Licencia

MIT — © 2026 Sebastián R.
