# ADR-001 · Stack tecnológico
- Fecha: 2026-10-03
- Estado: aceptado
## Contexto
Proyecto académico SIR-Net Lab para Ecuaciones Diferenciales 2026-II.
## Decisión
Vite + TypeScript strict · HTML/CSS sin framework · Chart.js · d3-force · KaTeX · Web Workers · Vitest · Playwright · ESLint + Prettier · GitHub Actions → GitHub Pages.
## Alternativas consideradas
- React: mayor peso y complejidad innecesaria para un proyecto académico.
- Plotly.js: menos control sobre la animación del grafo.
## Consecuencias
Sin backend. Sin dependencias CDN en producción. Cobertura ≥ 90 % exigida en core/sim.
