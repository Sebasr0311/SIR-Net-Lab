/**
 * @fileoverview Página de Inicio (Home) de SIR-Net Lab.
 * Presenta el hero interactivo, el aviso ético de ciberseguridad,
 * accesos directos a los módulos analíticos y tutorial de inicio rápido.
 *
 * @see docs/01-vision-y-alcance.md
 * @see docs/06-plan-de-trabajo.md T8.3
 */

export function pageHome(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'home-page'

  page.innerHTML = `
    <div class="home-layout" style="max-width: 1100px; margin: 0 auto; padding: var(--space-4);">
      
      <!-- Hero Section -->
      <section class="card hero-section" style="padding: var(--space-8) var(--space-6); text-align: center; margin-bottom: var(--space-6); background: linear-gradient(180deg, var(--surface) 0%, rgba(31, 78, 121, 0.04) 100%);">
        <span style="display: inline-block; padding: 4px 14px; border-radius: 999px; font-size: var(--step--1); font-weight: 600; background: rgba(31, 78, 121, 0.12); color: var(--accent); margin-bottom: var(--space-3);">
          Laboratorio de Ecuaciones Diferenciales 2026-II
        </span>
        <h1 style="font-size: var(--step-3); margin-top: 0; margin-bottom: var(--space-2); color: var(--accent);">
          SIR-Net Lab
        </h1>
        <p style="font-size: var(--step-1); color: var(--ink-2); max-width: 780px; margin: 0 auto var(--space-6); line-height: 1.6;">
          Simulador interactivo de propagación de malware en redes complejas. 
          Explorá la confluencia entre sistemas de EDO no lineales, procesos estocásticos de Gillespie, topologías de grafos y estrategias de control óptimo.
        </p>

        <div style="display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap;">
          <a href="#/simulator" class="btn btn--accent" style="padding: 12px 24px; font-size: var(--step-0);">
            🚀 Abrir Simulador EDO
          </a>
          <a href="#/network" class="btn btn--ghost" style="padding: 12px 24px; font-size: var(--step-0);">
            🕸️ Simulación en Red
          </a>
          <a href="#/challenge" class="btn btn--secondary" style="padding: 12px 24px; font-size: var(--step-0);">
            🎯 Jugar Modo Reto
          </a>
        </div>
      </section>

      <!-- Aviso Ético de Ciberseguridad Obligatorio -->
      <section class="card warning-banner" style="padding: var(--space-4); margin-bottom: var(--space-6); border-left: 5px solid var(--warn); background: rgba(230, 159, 0, 0.08);">
        <div style="display: flex; gap: var(--space-3); align-items: flex-start;">
          <span style="font-size: 1.8rem;" aria-hidden="true">⚠️</span>
          <div>
            <h2 style="font-size: var(--step-0); margin: 0 0 6px 0; color: var(--ink); font-weight: bold;">
              Aviso académico y de ciberseguridad
            </h2>
            <p style="font-size: var(--step--1); line-height: 1.6; color: var(--ink-2); margin: 0;">
              SIR-Net Lab es una plataforma estrictamente pedagógica y de simulación científica desarrollada para el estudio de modelos matemáticos. 
              <strong>No genera, aloja ni distribuye código malicioso.</strong> Todos los parámetros, tasas de contagio y escenarios modelan comportamientos abstractos 
              con fines formativos bajo principios de divulgación responsable.
            </p>
          </div>
        </div>
      </section>

      <!-- Módulos Principales del Laboratorio -->
      <section style="margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-2); margin-top: 0; margin-bottom: var(--space-4); text-align: center;">
          Módulos del Laboratorio
        </h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-4);">
          
          <!-- Módulo 1 -->
          <article class="card module-card" style="padding: var(--space-4); border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 2rem; margin-bottom: var(--space-2);">📈</div>
              <h3 style="font-size: var(--step-1); margin: 0 0 var(--space-2) 0;">Simulador EDO</h3>
              <p style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.6; margin: 0 0 var(--space-3) 0;">
                Integración numérica de modelos SIR, SEIR y SEIS mediante Euler, RK4 y Dormand–Prince adaptativo (RK45). 
                Visualización de series temporales, plano de fase S–I con trayectorias interactivas y semáforo R₀.
              </p>
            </div>
            <a href="#/simulator" style="font-size: var(--step--1); font-weight: bold; color: var(--accent); text-decoration: underline;">
              Ir al simulador EDO →
            </a>
          </article>

          <!-- Módulo 2 -->
          <article class="card module-card" style="padding: var(--space-4); border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 2rem; margin-bottom: var(--space-2);">🕸️</div>
              <h3 style="font-size: var(--step-1); margin: 0 0 var(--space-2) 0;">Simulación en Redes</h3>
              <p style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.6; margin: 0 0 var(--space-3) 0;">
                Simulación estocástica exacta con el algoritmo de Gillespie sobre topologías Erdős–Rényi, Watts–Strogatz y Barabási–Albert con hasta 2000 nodos en Canvas 2D acelerado.
              </p>
            </div>
            <a href="#/network" style="font-size: var(--step--1); font-weight: bold; color: var(--accent); text-decoration: underline;">
              Explorar dinámica en red →
            </a>
          </article>

          <!-- Módulo 3 -->
          <article class="card module-card" style="padding: var(--space-4); border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 2rem; margin-bottom: var(--space-2);">🛡️</div>
              <h3 style="font-size: var(--step-1); margin: 0 0 var(--space-2) 0;">Control y Estrategias</h3>
              <p style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.6; margin: 0 0 var(--space-3) 0;">
                Campañas de inmunización por impulsos y contención en redes. Comparación rigurosa bajo presupuesto fijo entre parcheo aleatorio, hubs y vecinos (Paradoja de la Amistad).
              </p>
            </div>
            <a href="#/control" style="font-size: var(--step--1); font-weight: bold; color: var(--accent); text-decoration: underline;">
              Diseñar estrategias de control →
            </a>
          </article>

          <!-- Módulo 4 -->
          <article class="card module-card" style="padding: var(--space-4); border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 2rem; margin-bottom: var(--space-2);">🎯</div>
              <h3 style="font-size: var(--step-1); margin: 0 0 var(--space-2) 0;">Modo Reto</h3>
              <p style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.6; margin: 0 0 var(--space-3) 0;">
                Entorno de simulación gamificado. Administrá un presupuesto limitado en créditos para detener un ciberataque agresivo antes de que infecte a la infraestructura crítica.
              </p>
            </div>
            <a href="#/challenge" style="font-size: var(--step--1); font-weight: bold; color: var(--accent); text-decoration: underline;">
              Aceptar el reto →
            </a>
          </article>

          <!-- Módulo 5 -->
          <article class="card module-card" style="padding: var(--space-4); border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 2rem; margin-bottom: var(--space-2);">📐</div>
              <h3 style="font-size: var(--step-1); margin: 0 0 var(--space-2) 0;">Calibración de Modelos</h3>
              <p style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.6; margin: 0 0 var(--space-3) 0;">
                Ajuste no lineal por mínimos cuadrados con Nelder–Mead, soporte para CSV de brotes reales, intervalos de confianza al 95% por Bootstrap residual y paisajes de identificabilidad 2D.
              </p>
            </div>
            <a href="#/calibration" style="font-size: var(--step--1); font-weight: bold; color: var(--accent); text-decoration: underline;">
              Calibrar parámetros →
            </a>
          </article>

          <!-- Módulo 6 -->
          <article class="card module-card" style="padding: var(--space-4); border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 2rem; margin-bottom: var(--space-2);">🌪️</div>
              <h3 style="font-size: var(--step-1); margin: 0 0 var(--space-2) 0;">Sensibilidad y Bifurcación</h3>
              <p style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.6; margin: 0 0 var(--space-3) 0;">
                Ranking de elasticidades locales (gráfico tornado), mapa de calor de bifurcación transcrítica R₀=1 y propagación de incertidumbre Monte Carlo con Hipercubo Latino (LHS) en Web Worker.
              </p>
            </div>
            <a href="#/sensitivity" style="font-size: var(--step--1); font-weight: bold; color: var(--accent); text-decoration: underline;">
              Analizar sensibilidad →
            </a>
          </article>

        </div>
      </section>

      <!-- Guía Rápida de Uso -->
      <section class="card" style="padding: var(--space-6); margin-bottom: var(--space-4); background: var(--surface);">
        <h2 style="font-size: var(--step-1); margin-top: 0; margin-bottom: var(--space-3);">
          ⚡ Inicio Rápido en 3 Pasos
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-4);">
          <div>
            <div style="font-weight: bold; font-size: var(--step-0); color: var(--accent); margin-bottom: 4px;">Paso 1: Seleccioná un escenario</div>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 0; line-height: 1.5;">
              Cargá un perfil preconfigurado como "Gusano de red local" o "Ransomware con latencia" en el Simulador EDO.
            </p>
          </div>
          <div>
            <div style="font-weight: bold; font-size: var(--step-0); color: var(--accent); margin-bottom: 4px;">Paso 2: Compará con la red</div>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 0; line-height: 1.5;">
              Activá el comparador EDO vs. Red y observá cómo la heterogeneidad de los hubs altera el pico respecto a la teoría de campo medio.
            </p>
          </div>
          <div>
            <div style="font-weight: bold; font-size: var(--step-0); color: var(--accent); margin-bottom: 4px;">Paso 3: Evaluá mitigaciones</div>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 0; line-height: 1.5;">
              Diseñá campañas de impulsos de parcheo y descubrí la eficiencia superior de la inmunización por conocidos.
            </p>
          </div>
        </div>
      </section>

    </div>
  `

  return page
}
