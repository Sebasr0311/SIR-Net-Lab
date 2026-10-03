# SIR-Net Lab 🔬💻

[![CI](https://github.com/Sebasr0311/SIR-Net-Lab/actions/workflows/ci.yml/badge.svg)](https://github.com/Sebasr0311/SIR-Net-Lab/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/Sebasr0311/SIR-Net-Lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/Sebasr0311/SIR-Net-Lab/actions/workflows/deploy.yml)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Sebasr0311/SIR-Net-Lab/releases/tag/v1.0.0)
[![Coverage](https://img.shields.io/badge/coverage-%E2%89%A595%25-brightgreen.svg)](#verificación-y-calidad)
[![A11y WCAG 2.1 AA](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-success.svg)](#accesibilidad-y-rendimiento)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Laboratorio Interactivo de Simulación Epidémica de Malware en Redes Complejas mediante Ecuaciones Diferenciales no Lineales y Simulación Estocástica de Gillespie.**  
> Desarrollado para la asignatura **Ecuaciones Diferenciales Ordinarias (EDO)** — Semestre 2026-II.

🌐 **Demostrador en Vivo:** [https://sebasr0311.github.io/SIR-Net-Lab/](https://sebasr0311.github.io/SIR-Net-Lab/)

---

## 📋 Resumen del Proyecto

**SIR-Net Lab** es una plataforma científica web de código abierto que modela la propagación de software malicioso (gusanos, ransomware, botnets) en infraestructuras de red heterogéneas. La plataforma combina:

1. **Modelos continuos compartimentales (SIR, SEIR, SEIS)** con deducción analítica de invariantes ($R_0$, integral primera de movimiento en el plano de fase $S\text{--}I$, pico epidémico $I_{\max}$ y tamaño final trascendente $S_\infty$).
2. **Teoría de redes complejas** (topologías Erdős–Rényi, Watts–Strogatz y Barabási–Albert) y campo medio por grado, evaluando la divergencia de $\langle k^2 \rangle$ y la desaparición del umbral epidémico ($T_c \to 0$).
3. **Simulación estocástica continua exacta** mediante el algoritmo directo de saltos de **Gillespie** sobre grafos de hasta 2000 nodos a 60 FPS en un Web Worker dedicado.
4. **Control y optimización defensiva:** Parcheo preventivo continuo e impulsivo, análisis comparativo de estrategias (Uniforme vs. Dirigida a _hubs_ vs. Inmunización de vecinos) y **Modo Reto** interactivo con presupuesto cerrado.
5. **Calibración inversa y sensibilidad:** Estimación de parámetros por simplex Nelder–Mead acotado con bootstrap residual ($B = 200$), diagramas de tornado y muestreo estratificado por Hipercubo Latino (LHS) con $M = 1000$ corridas Monte Carlo.

---

## ✨ Características Principales

- **Simulador EDO Multi-modelo:** Permite alternar entre SIR, SEIR y SEIS con integración en tiempo real vía Web Worker (`ode.worker.ts`) en menos de 50 ms.
- **Solucionadores Numéricos Verificados:** Euler explícito ($O(h)$), Runge–Kutta clásico de 4.º orden RK4 ($O(h^4)$) y Dormand–Prince adaptativo dopri5 ($O(h^5)$, tolerancias $rtol = 10^{-8}, atol = 10^{-10}$).
- **Plano de Fase $S\text{--}I$ Interactivo:** Campo de direcciones vectorial y cálculo de órbitas por clic que verifican rigurosamente la integral primera del sistema.
- **Topologías de Red en Canvas 2D:** Visualización reactiva con código cromático Okabe-Ito accesible y patrones de línea diferenciados.
- **Modo Presentación y Exportación Limpia:**
  - Presiona la tecla `F` para activar el modo de proyección a pantalla completa con tipografías y gráficos escalados para auditorios.
  - Exportación de series completas en CSV y gráficos de alta resolución en PNG.
  - Reglas `@media print` optimizadas para generación de informes limpios en PDF.
- **Accesibilidad y Rendimiento de Grado Profesional:**
  - 100% de cumplimiento WCAG 2.1 AA auditado mediante `@axe-core/playwright` (0 violaciones).
  - Tiempos de carga casi instantáneos (Lighthouse ≥ 98/100, FCP < 0.4s).
  - Cero dependencias CDN en producción (KaTeX y fuentes autoalojadas).

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js:** Versión 20 LTS o superior.
- **NPM:** Versión 10 o superior.

### Instalación y Ejecución Local

```bash
# Clonar el repositorio
git clone https://github.com/Sebasr0311/SIR-Net-Lab.git
cd SIR-Net-Lab

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con Hot Module Replacement (HMR)
npm run dev
```

Abra su navegador en [http://localhost:5173/SIR-Net-Lab/](http://localhost:5173/SIR-Net-Lab/).

---

## 🛠️ Scripts Disponibles

| Comando                 | Acción                                                                            |
| ----------------------- | --------------------------------------------------------------------------------- |
| `npm run dev`           | Inicia el servidor de desarrollo local en el puerto 5173                          |
| `npm run build`         | Compila y optimiza la aplicación para producción en `dist/` con code-splitting    |
| `npm run preview`       | Previsualiza el bundle compilado de producción localmente                         |
| `npm run lint`          | Ejecuta ESLint sobre el código TypeScript y hojas de estilo                       |
| `npm run typecheck`     | Comprueba tipos estrictos de TypeScript (`tsc --noEmit`) sin `any`                |
| `npm test`              | Ejecuta la suite de pruebas unitarias interactivas con Vitest                     |
| `npm run test:coverage` | Genera reporte de cobertura de código (exigencia: $\ge 90\%$ en `core/` y `sim/`) |
| `npm run e2e`           | Ejecuta las pruebas automatizadas End-to-End y accesibilidad con Playwright       |

---

## 📂 Arquitectura del Proyecto

```
SIR-Net-Lab/
├── src/
│   ├── core/                  # Núcleo matemático puro (Cero acceso al DOM)
│   │   ├── analysis/          # R₀, pico analítico, tamaño final, equilibrios y Jacobiano
│   │   ├── calibration/       # Estimación Nelder-Mead, bootstrap residual y métricas
│   │   ├── models/            # RHS deterministas: SIR, SEIR, SEIS
│   │   ├── sensitivity/       # Tornado local, barrido 2D e Hipercubo Latino (LHS)
│   │   ├── solvers/           # Euler, RK4, Dormand-Prince dopri5 y control por impulsos
│   │   └── rng.ts             # Generador pseudoaleatorio determinista sfc32 con semilla
│   ├── sim/                   # Simulación estocástica y teoría de grafos
│   │   ├── graphs/            # Generadores ER, WS, BA y métricas de grado ⟨k⟩, ⟨k²⟩
│   │   ├── gillespie.ts       # Algoritmo de saltos continuos de Gillespie sobre grafos
│   │   └── strategies.ts      # Estrategias de remediación: Aleatoria, Hubs, Vecinos
│   ├── workers/               # Hilos secundarios Web Workers (ODE, Red, Sensibilidad)
│   ├── state/                 # Store pub/sub reactivo, sincronización hash URL y escenarios
│   └── ui/                    # Capa de presentación (Vanilla TS + Web Components ligeros)
│       ├── components/        # Sliders, KpiCards, TimeChart, PhasePlot, NetworkCanvas
│       ├── pages/             # Vistas: Simulador, Red, Control, Calibración, Sensibilidad, etc.
│       └── styles/            # Tokens de diseño Okabe-Ito, base, componentes y print.css
├── tests/
│   ├── unit/                  # 103 pruebas unitarias matemáticas y de simulación
│   └── e2e/                   # 34 pruebas de integración de flujos completos y a11y axe-core
├── docs/
│   ├── adr/                   # Registros de Decisiones Arquitectónicas (ADR-001 al 004)
│   └── informe/               # Documentación académica y de evaluación
│       ├── informe-academico.md # Informe técnico formal (5 secciones, deducciones, tablas)
│       ├── presentacion.md    # Guion cronometrado de diapositivas y demo de 4 min
│       └── lighthouse-report.md # Reporte de auditoría de rendimiento y bundles
└── .github/workflows/         # Pipelines de CI automatizado y despliegue a GitHub Pages
```

---

## 🧪 Verificación y Calidad

El proyecto implementa una rigurosa gobernanza de calidad de software científico:

- **103 pruebas unitarias** pasando en Vitest (cobertura superior al $95\%$ en módulos matemáticos).
- **34 pruebas End-to-End** en Playwright con Chromium headless.
- **Cero violaciones** críticas o serias en auditorías automatizadas de accesibilidad con `@axe-core/playwright`.
- **Integración Continua (CI):** Cada commit y pull request ejecuta `lint`, `typecheck`, `test:coverage`, `build` y `e2e` en GitHub Actions bajo Node.js 22.

---

## 📚 Documentación Académica

- 📄 **[Informe Académico Completo (Markdown)](docs/informe/informe-academico.md):** Contiene la derivación matemática detallada de las 24 ecuaciones del sistema, análisis de estabilidad por Jacobiano, deducción de la integral primera, teoremas de redes complejas y discusión de resultados.
- 🎤 **[Guion de Exposición y Diapositivas (Markdown)](docs/informe/presentacion.md):** Estructura temporal para defensa oral de 10-12 minutos, guion de demo de 4 minutos y banco de respuestas a preguntas de examinadores.
- ⚡ **[Reporte de Rendimiento y Lighthouse (Markdown)](docs/informe/lighthouse-report.md):** Desglose de tamaños de bundles compilados, métricas Core Web Vitals y verificación de contraste de color.

---

## ⚠️ Aviso Ético de Ciberseguridad

> **NOTA INFORMATIVA:** Este simulador fue desarrollado exclusivamente con propósitos académicos y de investigación en modelado matemático. Las simulaciones utilizan datos y parámetros hipotéticos/didácticos. La plataforma **no contiene código malicioso ejecutable**, no realiza escaneos hacia redes externas reales ni fomenta actividades ilícitas. Su propósito es brindar soporte cuantitativo a la educación en ecuaciones diferenciales y a la investigación defensiva en ciberseguridad.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT** — ver el archivo [LICENSE](LICENSE) para más detalles.

**Autor:** Sebastián R. · Facultad de Ingeniería de Sistemas e Informática · 2026
