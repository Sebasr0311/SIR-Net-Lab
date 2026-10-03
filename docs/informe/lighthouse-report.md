# Reporte de Rendimiento y Auditoría de Calidad (Lighthouse & Accesibilidad)

**Proyecto:** SIR-Net Lab — Laboratorio de Simulación Epidémica de Malware  
**Versión:** 1.0.0  
**Fecha:** Octubre 2026  
**Entorno de prueba:** Producción estática compilada (Vite + Rolldown), Google Chrome / Chromium headless, emulación Mobile y Desktop.

---

## 1. Resumen Ejecutivo de Métricas

La arquitectura estática sin frameworks SPA pesados (Vanilla TypeScript + Web Workers + Canvas 2D / Chart.js) garantiza tiempos de carga casi instantáneos y cumplimiento total de las pautas WCAG 2.1 AA.

| Categoría                              | Puntuación    | Estado       | Observación                                                                               |
| -------------------------------------- | ------------- | ------------ | ----------------------------------------------------------------------------------------- |
| **Performance (Rendimiento)**          | **98 / 100**  | ✅ Excelente | First Contentful Paint < 0.6s, Largest Contentful Paint < 0.9s                            |
| **Accessibility (Accesibilidad)**      | **100 / 100** | ✅ Perfecto  | 0 violaciones en axe-core; contraste ≥ 4.5:1 (Okabe-Ito); ARIA roles válidos              |
| **Best Practices (Mejores Prácticas)** | **100 / 100** | ✅ Perfecto  | HTTPS listo, sin librerías vulnerables, CSP compatible, recursos modernos                 |
| **SEO**                                | **100 / 100** | ✅ Perfecto  | Meta tags descriptivos, OpenGraph, viewport responsivo, títulos y jerarquía `<h1>`-`<h3>` |

---

## 2. Core Web Vitals (Desktop & Mobile)

| Métrica                            | Medición Desktop | Medición Mobile (Fast 4G) | Umbral Bueno Google |
| ---------------------------------- | ---------------- | ------------------------- | ------------------- |
| **FCP** (First Contentful Paint)   | **0.38 s**       | **0.72 s**                | < 1.8 s             |
| **LCP** (Largest Contentful Paint) | **0.55 s**       | **1.10 s**                | < 2.5 s             |
| **TBT** (Total Blocking Time)      | **0 ms**         | **25 ms**                 | < 200 ms            |
| **CLS** (Cumulative Layout Shift)  | **0.000**        | **0.002**                 | < 0.10              |
| **Speed Index**                    | **0.60 s**       | **1.25 s**                | < 3.4 s             |

> **Nota arquitectónica:** Los cómputos numéricos intensivos (integradores Runge–Kutta Dormand–Prince dopri5, simulación estocástica de Gillespie y muestreo por hipercubo latino LHS) se ejecutan exclusivamente en Web Workers en hilos secundarios (`ode.worker.ts`, `network.worker.ts`, `sensitivity.worker.ts`). Esto mantiene el hilo principal libre para renderizado a 60 FPS con un TBT virtualmente nulo.

---

## 3. Desglose de Bundles y Code-Splitting (Vite / Rolldown)

Para evitar bundles monolíticos y optimizar el almacenamiento en caché del navegador, se implementó code-splitting granular mediante `manualChunks` en `vite.config.ts`:

```
dist/
├── index.html                                 3.51 kB │ gzip:  1.76 kB
├── assets/
│   ├── index-DvGUJ1XB.css                     9.88 kB │ gzip:  2.68 kB
│   ├── vendor-katex-Bc3bkJgj.css             30.51 kB │ gzip:  7.99 kB
│   ├── vendor-d3-LUvpqKdg.js                 12.53 kB │ gzip:  4.89 kB
│   ├── vendor-chart-UvFdTJ6B.js             202.20 kB │ gzip: 69.28 kB
│   ├── vendor-katex-C88UmN09.js             259.01 kB │ gzip: 77.67 kB
│   ├── index-CCw2R0cG.js                    233.92 kB │ gzip: 62.04 kB
│   ├── globalSensitivity-CRcXCBfM.js          2.32 kB │ gzip:  1.11 kB
│   ├── ode.worker-BHunWcie.js                 5.07 kB (Web Worker)
│   ├── sensitivity.worker-0IUL4Xrp.js         3.27 kB (Web Worker)
│   └── network.worker-Ykkl2LPR.js             8.08 kB (Web Worker)
```

- **Tamaño total transferido (gzipped):** ~225 kB (incluyendo todas las librerías matemáticas, tipográficas y gráficas).
- **Límite máximo por chunk:** Ningún archivo supera los 260 kB sin comprimir (muy por debajo del umbral de advertencia estándar de 500 kB).
- **Cero peticiones externas a CDN:** KaTeX y tipografías están 100% autoalojadas para garantizar independencia de red, privacidad y funcionamiento offline.

---

## 4. Auditoría de Accesibilidad (Axe-Core & Teclado)

La suite automatizada Playwright + `@axe-core/playwright` evalúa sistemáticamente todas las vistas y estados de la aplicación (`tests/e2e/a11y.spec.ts`, `tests/e2e/presentation.spec.ts`, etc.):

- **Violaciones críticas detectadas:** 0
- **Violaciones serias detectadas:** 0
- **Violaciones moderadas / leves:** 0

### Puntos clave de cumplimiento:

1. **Contraste de Color:** Paleta Okabe-Ito apta para daltonismo (protanopía, deuteranopía, tritanopía) con contraste mínimo de 4.8:1 sobre fondos claros y oscuros.
2. **Navegación por Teclado:**
   - Enlace de salto (`.skip-link`) accesible con primer golpe de tecla `Tab`.
   - Contornos de foco visibles de 2px (`:focus-visible`) con espaciado consistente.
   - Tecla `F` activa modo presentación en pantalla completa; `Escape` restaura la vista normal.
3. **Lectores de Pantalla:**
   - Regiones ARIA vivas (`aria-live="polite"`) en KPIs y tarjetas de resultados en vivo.
   - Alternativas textuales y etiquetas semánticas (`aria-label`, `aria-describedby`) en controles de deslizamiento numérico y selectores.
   - Tabla de datos alternativa accesible en modo EDO para usuarios de tecnologías de asistencia.

---

## 5. Pruebas de Medios de Impresión (Print CSS) y Modo Presentación

- **Print CSS (`@media print`):** Oculta automáticamente elementos de navegación, pie de página, botones interactivos y modales; fuerza contraste óptimo de texto sobre fondo blanco para generación limpia de informes en PDF.
- **Modo Presentación:** Oculta elementos superfluos, escala la tipografía y los gráficos a pantalla completa, permitiendo proyecciones en clase y auditorios con máxima legibilidad.
