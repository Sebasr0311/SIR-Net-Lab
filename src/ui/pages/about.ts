/**
 * @fileoverview Página Acerca de (About) de SIR-Net Lab.
 * Provee la información institucional del proyecto de Ecuaciones Diferenciales 2026-II,
 * detalles de arquitectura de software, stack tecnológico, referencias bibliográficas
 * exhaustivas y licencia de código abierto.
 *
 * @see docs/09-informe-y-exposicion.md
 * @see docs/10-riesgos-y-referencias.md
 * @see docs/06-plan-de-trabajo.md T8.3
 */

export function pageAbout(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'about-page'

  page.innerHTML = `
    <div class="about-layout" style="max-width: 1000px; margin: 0 auto; padding: var(--space-4);">
      
      <header class="about-header" style="margin-bottom: var(--space-6); border-bottom: 2px solid var(--line); padding-bottom: var(--space-4);">
        <h1 style="font-size: var(--step-3); margin-bottom: var(--space-2); color: var(--accent);">
          Acerca de SIR-Net Lab
        </h1>
        <p class="text-muted" style="color: var(--ink-2); font-size: var(--step-0); line-height: 1.6;">
          Plataforma de simulación científica y modelado matemático para el estudio de propagación
          de epidemias y malware en sistemas de información y redes complejas.
        </p>
      </header>

      <!-- Contexto Académico -->
      <section class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-1); margin-top: 0; color: var(--ink);">
          🎓 Contexto Académico y Objetivos
        </h2>
        <p style="line-height: 1.7; font-size: var(--step--1); color: var(--ink-2);">
          <strong>SIR-Net Lab</strong> es una plataforma interactiva y proyecto integrador para el curso universitario de 
          <strong>Ecuaciones Diferenciales (2026-II)</strong>. Su objetivo es conectar los modelos matemáticos teóricos con su aplicación práctica en la ciberseguridad a través de tres pilares:
        </p>
        <ul style="line-height: 1.7; font-size: var(--step--1); color: var(--ink-2);">
          <li><strong>Modelos epidemiológicos:</strong> comprender cómo evoluciona la propagación de malware dividiendo a los equipos en sanos, infectados y recuperados mediante ecuaciones diferenciales.</li>
          <li><strong>Simulación computacional:</strong> calcular numéricamente la evolución temporal (mediante métodos de Euler y Runge-Kutta) para analizar escenarios complejos sin requerir fórmulas cerradas.</li>
          <li><strong>Dinámica en redes y defensa:</strong> estudiar cómo la estructura de una red (conexiones entre servidores y usuarios) determina la rapidez del ataque y evaluar estrategias eficientes de vacunación y parcheo.</li>
        </ul>
      </section>

      <!-- Arquitectura y Decisiones Técnicas -->
      <section class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-1); margin-top: 0; color: var(--ink);">
          ⚙️ Arquitectura de Software y Stack Tecnológico
        </h2>
        <p style="line-height: 1.7; font-size: var(--step--1); color: var(--ink-2);">
          Diseñado bajo los más estrictos estándares de ingeniería de software, accesibilidad web y alto rendimiento computacional (ADR-001):
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: var(--space-3); margin-top: var(--space-3);">
          <div style="background: var(--bg); padding: var(--space-3); border-radius: 6px;">
            <strong style="color: var(--accent);">Vite + TypeScript Estricto</strong>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 4px 0 0 0;">Cero dependencias pesadas de UI, sin framework. Código tipado y compilado sin <code>any</code>.</p>
          </div>
          <div style="background: var(--bg); padding: var(--space-3); border-radius: 6px;">
            <strong style="color: var(--accent);">Web Workers Dedicados</strong>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 4px 0 0 0;">Desacoplamiento de cómputo para integración numérica, lotes estocásticos y Monte Carlo LHS.</p>
          </div>
          <div style="background: var(--bg); padding: var(--space-3); border-radius: 6px;">
            <strong style="color: var(--accent);">Gráficos Híbridos</strong>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 4px 0 0 0;">Chart.js para series temporales y tornados; Canvas 2D nativo optimizado con d3-force para redes de 2000 nodos.</p>
          </div>
          <div style="background: var(--bg); padding: var(--space-3); border-radius: 6px;">
            <strong style="color: var(--accent);">KaTeX Tipográfico</strong>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 4px 0 0 0;">Renderizado matemático local de ultra alta velocidad sin depender de CDNs externas.</p>
          </div>
          <div style="background: var(--bg); padding: var(--space-3); border-radius: 6px;">
            <strong style="color: var(--accent);">Accesibilidad WCAG 2.1 AA</strong>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 4px 0 0 0;">Paleta cromática Okabe-Ito, navegación por teclado completa y auditorías continuas con axe-core.</p>
          </div>
          <div style="background: var(--bg); padding: var(--space-3); border-radius: 6px;">
            <strong style="color: var(--accent);">Calidad y Testing Automatizado</strong>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 4px 0 0 0;">Vitest con &ge;90% de cobertura en núcleos analíticos y Playwright para flujos E2E completos.</p>
          </div>
        </div>
      </section>

      <!-- Referencias Bibliográficas -->
      <section class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-1); margin-top: 0; color: var(--ink);">
          📚 Referencias Bibliográficas
        </h2>
        <ol style="line-height: 1.8; font-size: var(--step--1); color: var(--ink-2); padding-left: var(--space-4); margin: 0;">
          <li>Kermack, W. O., & McKendrick, A. G. (1927). A contribution to the mathematical theory of epidemics. <em>Proceedings of the Royal Society of London. Series A</em>, 115(772), 700–721.</li>
          <li>Hethcote, H. W. (2000). The mathematics of infectious diseases. <em>SIAM Review</em>, 42(4), 599–653.</li>
          <li>Kephart, J. O., & White, S. R. (1991). Directed-graph epidemiological models of computer viruses. <em>IEEE Computer Society Symposium on Research in Security and Privacy</em>, 343–359.</li>
          <li>Pastor-Satorras, R., & Vespignani, A. (2001). Epidemic spreading in scale-free networks. <em>Physical Review Letters</em>, 86(14), 3200–3203.</li>
          <li>Newman, M. E. J. (2002). Spread of epidemic disease on networks. <em>Physical Review E</em>, 66(1), 016128.</li>
          <li>Barabási, A.-L., & Albert, R. (1999). Emergence of scaling in random networks. <em>Science</em>, 286(5439), 509–512.</li>
          <li>Watts, D. J., & Strogatz, S. H. (1998). Collective dynamics of 'small-world' networks. <em>Nature</em>, 393(6684), 440–442.</li>
          <li>Erdős, P., & Rényi, A. (1959). On random graphs I. <em>Publicationes Mathematicae Debrecen</em>, 6, 290–297.</li>
          <li>Gillespie, D. T. (1977). Exact stochastic simulation of coupled chemical reactions. <em>The Journal of Physical Chemistry</em>, 81(25), 2340–2361.</li>
          <li>Dormand, J. R., & Prince, P. J. (1980). A family of embedded Runge-Kutta formulae. <em>Journal of Computational and Applied Mathematics</em>, 6(1), 19–26.</li>
          <li>Zill, D. G. (2018). <em>Ecuaciones diferenciales con aplicaciones de modelado</em> (11.ª ed.). Cengage Learning.</li>
          <li>Strogatz, S. H. (2018). <em>Nonlinear Dynamics and Chaos: With Applications to Physics, Biology, Chemistry, and Engineering</em> (2.ª ed.). Westview Press.</li>
          <li>W3C (2018). <em>Web Content Accessibility Guidelines (WCAG) 2.1</em>. W3C Recommendation.</li>
        </ol>
      </section>

      <!-- Licencia y Repositorio -->
      <section class="card" style="padding: var(--space-6); margin-bottom: var(--space-4); text-align: center; background: var(--surface);">
        <h2 style="font-size: var(--step-0); margin-top: 0; color: var(--ink);">
          Código Abierto y Licencia MIT
        </h2>
        <p style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.6; max-width: 600px; margin: 0 auto var(--space-4);">
          Este proyecto es de código abierto bajo la Licencia MIT. El código fuente completo, documentación técnica y registros de cambios están disponibles en GitHub.
        </p>
        <a href="https://github.com/Sebasr0311/SIR-Net-Lab" target="_blank" rel="noopener noreferrer" class="btn btn--primary">
          ⭐ Ver en GitHub (Sebasr0311/SIR-Net-Lab)
        </a>
      </section>

    </div>
  `

  const style = document.createElement('style')
  style.textContent = `
    @media (max-width: 640px) {
      .about-layout {
        padding: var(--space-4) var(--space-3) !important;
      }
      .about-header h1 {
        font-size: var(--step-2) !important;
      }
    }
  `
  page.appendChild(style)

  return page
}
