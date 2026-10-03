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
          Simulador interactivo para comprender cómo se propaga el malware en redes informáticas.
          Experimentá con modelos matemáticos en tiempo real, observá el contagio nodo a nodo y probá estrategias de ciberseguridad para contener brotes.
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

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--space-4);">
          
          <!-- Módulo 1 -->
          <article class="card module-card" style="padding: var(--space-4); border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 2rem; margin-bottom: var(--space-2);">📈</div>
              <h3 style="font-size: var(--step-1); margin: 0 0 var(--space-2) 0;">Simulador EDO</h3>
              <p style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.6; margin: 0 0 var(--space-3) 0;">
                Simulá la propagación de malware con modelos compartimentales clásicos (SIR, SEIR, SEIS). Ajustá tasas de infección y recuperación, compará métodos numéricos y observá las curvas de contagio y el umbral de propagación (R₀).
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
                Observá el contagio en tiempo real sobre redes de computadoras con diferentes topologías (aleatorias, mundos pequeños y libres de escala). Mirá cómo los equipos más conectados actúan como superpropagadores.
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
                Diseñá defensas contra malware: aislamiento de equipos infectados y campañas de actualización o parcheo. Compará qué tan efectivo es proteger equipos al azar versus los más conectados.
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
                Poné a prueba tus habilidades de defensa. Gestioná un presupuesto limitado en créditos para aplicar parches, segmentar la red y contener un ataque antes de que comprometa tus servidores críticos.
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
                Aprendé a deducir los parámetros de un ataque a partir de datos observados. Subí tus propios registros o usá casos de ejemplo para encontrar la velocidad de contagio y recuperación que mejor explican el brote.
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
                Descubrí qué variables tienen mayor impacto en la gravedad de la epidemia. Analizá cómo pequeñas variaciones en las defensas marcan la diferencia entre un brote controlado y una epidemia masiva.
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
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: var(--space-4);">
          <div>
            <div style="font-weight: bold; font-size: var(--step-0); color: var(--accent); margin-bottom: 4px;">Paso 1: Seleccioná un escenario</div>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 0; line-height: 1.5;">
              Cargá un perfil preconfigurado como "Gusano de red local" o "Ransomware con latencia" en el Simulador EDO.
            </p>
          </div>
          <div>
            <div style="font-weight: bold; font-size: var(--step-0); color: var(--accent); margin-bottom: 4px;">Paso 2: Compará con la red</div>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 0; line-height: 1.5;">
              Observá la diferencia entre la teoría matemática promedio y lo que ocurre realmente cuando las computadoras están interconectadas en una red.
            </p>
          </div>
          <div>
            <div style="font-weight: bold; font-size: var(--step-0); color: var(--accent); margin-bottom: 4px;">Paso 3: Evaluá mitigaciones</div>
            <p style="font-size: var(--step--1); color: var(--ink-2); margin: 0; line-height: 1.5;">
              Diseñá campañas de actualización o aislamiento y descubrí por qué proteger a los nodos más conectados salva a toda la red.
            </p>
          </div>
        </div>
      </section>

    </div>
  `

  const style = document.createElement('style')
  style.textContent = `
    @media (max-width: 640px) {
      .home-layout {
        padding: var(--space-4) var(--space-3) !important;
      }
    }
  `
  page.appendChild(style)

  return page
}
