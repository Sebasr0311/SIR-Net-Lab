/**
 * @fileoverview Página de Teoría Matemática y Glosario (SIR-Net Lab).
 * Contiene el desarrollo analítico exhaustivo y riguroso del modelo SIR/SEIR de Kermack–McKendrick,
 * la integral primera de las trayectorias en el espacio fase, deducción analítica del pico e inmunidad
 * de rebaño, ecuación trascendente del tamaño final, teoría de redes complejas y glosario interactivo KaTeX.
 *
 * @see docs/02-modelo-matematico.md
 * @see docs/06-plan-de-trabajo.md T8.1 & T8.2
 */

import { renderMathBlock, renderMathInline } from '../katexHelper.ts'
import { GLOSSARY, type GlossaryEntry } from '../glossary.ts'

export function pageTheory(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'theory-page'

  page.innerHTML = `
    <div class="theory-layout" style="max-width: 1000px; margin: 0 auto; padding: var(--space-4);">
      <header class="theory-header" style="margin-bottom: var(--space-6); border-bottom: 2px solid var(--line); padding-bottom: var(--space-4);">
        <h1 style="font-size: var(--step-3); margin-bottom: var(--space-2); color: var(--accent);">
          Fundamentos Matemáticos de Modelado Epidémico
        </h1>
        <p class="text-muted" style="color: var(--ink-2); font-size: var(--step-0); line-height: 1.6;">
          Marco teórico y fundamentos matemáticos del laboratorio. Explicaciones paso a paso, derivaciones claras y glosario interactivo para comprender las fórmulas detrás del simulador.
        </p>
      </header>

      <!-- Tabla de Contenidos -->
      <nav class="card" aria-label="Tabla de contenidos de teoría" style="padding: var(--space-4); margin-bottom: var(--space-6); background: var(--surface);">
        <h2 style="font-size: var(--step-1); margin-top: 0; margin-bottom: var(--space-2);">📑 Contenido del marco teórico</h2>
        <ul style="margin: 0; padding-left: var(--space-4); line-height: 1.8; font-size: var(--step--1);">
          <li><a href="#sec-sir-base" style="color: var(--accent); text-decoration: underline;">1. Planteamiento del modelo SIR clásico de Kermack–McKendrick</a></li>
          <li><a href="#sec-integral-primera" style="color: var(--accent); text-decoration: underline;">2. Reducción a una EDO e Integral Primera en el Plano de Fase</a></li>
          <li><a href="#sec-r0-estabilidad" style="color: var(--accent); text-decoration: underline;">3. Número reproductivo básico R₀ y Estabilidad de Equilibrios</a></li>
          <li><a href="#sec-pico-maximo" style="color: var(--accent); text-decoration: underline;">4. Deducción Analítica del Pico de Infección I_max y Cobertura Crítica</a></li>
          <li><a href="#sec-tamano-final" style="color: var(--accent); text-decoration: underline;">5. Ecuación Trascendente del Tamaño Final del Brote (S_∞)</a></li>
          <li><a href="#sec-seir-impulsos" style="color: var(--accent); text-decoration: underline;">6. Extensión SEIR con Latencia y Campañas por Impulsos</a></li>
          <li><a href="#sec-redes-heterogeneas" style="color: var(--accent); text-decoration: underline;">7. Dinámica en Redes Complejas y Umbral Heterogéneo</a></li>
          <li><a href="#sec-glosario" style="color: var(--accent); text-decoration: underline;">8. Glosario Técnico Interactivo y Fórmulas KaTeX</a></li>
        </ul>
      </nav>

      <!-- Sección 1 -->
      <section id="sec-sir-base" class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-2); margin-top: 0; color: var(--ink);">
          1. Planteamiento del modelo SIR clásico de Kermack–McKendrick
        </h2>
        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          En 1927, W. O. Kermack y A. G. McKendrick formularon el modelo compartimental determinista fundamental para la transmisión de agentes patógenos. 
          En el contexto de la ciberseguridad computacional, consideramos una población constante de <strong>N</strong> dispositivos conectados donde cada nodo se clasifica en uno de tres compartimentos disyuntos:
        </p>
        <ul style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          <li><strong>S(t) [Susceptibles]:</strong> Dispositivos vulnerables no infectados ni inmunizados contra la carga maliciosa.</li>
          <li><strong>I(t) [Infecciosos / Infectados]:</strong> Equipos comprometidos con el malware activo, capaces de propagarlo a través de aristas o conexiones de red.</li>
          <li><strong>R(t) [Removidos / Recuperados]:</strong> Equipos que han sido aislados, parcheados, formateados o inmunizados permanentemente.</li>
        </ul>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          El sistema continuo de ecuaciones diferenciales ordinarias (EDO) no lineales con ley de acción de masas estándar se expresa como:
        </p>

        <div style="background: var(--bg); padding: var(--space-4); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`\\begin{aligned}
            \\frac{dS}{dt} &= -\\frac{\\beta S I}{N} \\\\[8pt]
            \\frac{dI}{dt} &= \\frac{\\beta S I}{N} - \\gamma I \\\\[8pt]
            \\frac{dR}{dt} &= \\gamma I
          \\end{aligned}`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Sumando las tres ecuaciones miembro a miembro obtenemos la conservación estricta de la masa o población:
        </p>

        <div style="background: var(--bg); padding: var(--space-3); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`\\frac{d}{dt}(S + I + R) = -\\frac{\\beta S I}{N} + \\left(\\frac{\\beta S I}{N} - \\gamma I\\right) + \\gamma I = 0 \\implies S(t) + I(t) + R(t) = N, \\quad \\forall t \\ge 0`)}
        </div>
      </section>

      <!-- Sección 2 -->
      <section id="sec-integral-primera" class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-2); margin-top: 0; color: var(--ink);">
          2. Reducción a una EDO e Integral Primera en el Plano de Fase
        </h2>
        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Una propiedad matemática notable del sistema SIR es que no admite solución analítica en términos de funciones elementales para <em>S(t)</em> e <em>I(t)</em> en el tiempo. 
          No obstante, eliminando la variable temporal <em>t</em> mediante la regla de la cadena, podemos reducir el sistema 2D de <em>(S, I)</em> a una única ecuación diferencial ordinaria separable:
        </p>

        <div style="background: var(--bg); padding: var(--space-4); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`\\frac{dI}{dS} = \\frac{dI/dt}{dS/dt} = \\frac{\\frac{\\beta S I}{N} - \\gamma I}{-\\frac{\\beta S I}{N}} = -1 + \\frac{\\gamma N}{\\beta S} = -1 + \\frac{N}{R_0 S}`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Integrando directamente ambos miembros respecto a <em>S</em>:
        </p>

        <div style="background: var(--bg); padding: var(--space-4); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`\\int dI = \\int \\left(-1 + \\frac{N}{R_0 S}\\right) dS \\implies I + S - \\frac{N}{R_0} \\ln S = C`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Evaluando la constante de integración en las condiciones iniciales <em>(S₀, I₀)</em>:
        </p>

        <div style="background: var(--bg); padding: var(--space-3); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`I(t) + S(t) - \\frac{N}{R_0} \\ln S(t) = I_0 + S_0 - \\frac{N}{R_0} \\ln S_0`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Esta es la <strong>integral primera del movimiento</strong> en el plano de fase <em>S–I</em>. Demuestra de manera concluyente que todas las trayectorias dinámicas son curvas invariantes de nivel, impidiendo órbitas caóticas o ciclos límite en el SIR homogéneo.
        </p>
      </section>

      <!-- Sección 3 -->
      <section id="sec-r0-estabilidad" class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-2); margin-top: 0; color: var(--ink);">
          3. Número reproductivo básico R₀ y Estabilidad de Equilibrios
        </h2>
        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Analizando la segunda ecuación diferencial del sistema:
        </p>

        <div style="background: var(--bg); padding: var(--space-3); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`\\frac{dI}{dt} = \\left(\\frac{\\beta S}{N} - \\gamma\\right) I = \\gamma \\left(\\frac{\\beta}{\\gamma} \\frac{S}{N} - 1\\right) I = \\gamma \\big(R_{ef}(t) - 1\\big) I`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Al inicio del brote, cuando casi la totalidad de la población es susceptible (${renderMathInline('S_0 \\approx N')}):
        </p>

        <div style="background: var(--bg); padding: var(--space-3); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`\\left.\\frac{dI}{dt}\\right|_{t=0} > 0 \\iff R_0 = \\frac{\\beta}{\\gamma} > 1`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          <strong>Estabilidad lineal (Jacobiano):</strong> En el conjunto de equilibrios libres de infección ${renderMathInline('(S^*, 0)')}, la matriz jacobiana evaluada resulta:
        </p>

        <div style="background: var(--bg); padding: var(--space-4); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`J(S^*, 0) = \\begin{pmatrix} 0 & -\\frac{\\beta S^*}{N} \\\\[6pt] 0 & \\frac{\\beta S^*}{N} - \\gamma \\end{pmatrix}`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Sus autovalores son ${renderMathInline('\\lambda_1 = 0')} (asociado a la línea de equilibrios) y ${renderMathInline('\\lambda_2 = \\gamma (R_0 S^*/N - 1)')}. Si ${renderMathInline('R_0 < 1')}, ${renderMathInline('\\lambda_2 < 0')} y el equilibrio es asintóticamente estable (el malware se extingue exponencialmente sin propagarse). Si ${renderMathInline('R_0 > 1')}, ${renderMathInline('\\lambda_2 > 0')}, indicando inestabilidad y el surgimiento de una onda epidémica.
        </p>
      </section>

      <!-- Sección 4 -->
      <section id="sec-pico-maximo" class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-2); margin-top: 0; color: var(--ink);">
          4. Deducción Analítica del Pico de Infección I_max y Cobertura Crítica
        </h2>
        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          El pico máximo de infectados activos ${renderMathInline('I_{\\max}')} se produce en el punto crítico en que ${renderMathInline('dI/dt = 0')}:
        </p>

        <div style="background: var(--bg); padding: var(--space-3); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`\\frac{dI}{dt} = 0 \\implies \\frac{\\beta S_{pico}}{N} - \\gamma = 0 \\implies S_{pico} = \\frac{N}{R_0}`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Sustituyendo ${renderMathInline('S = N/R_0')} en la integral primera de la sección 2:
        </p>

        <div style="background: var(--bg); padding: var(--space-4); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`I_{\\max} + \\frac{N}{R_0} - \\frac{N}{R_0} \\ln\\left(\\frac{N}{R_0}\\right) = I_0 + S_0 - \\frac{N}{R_0} \\ln S_0`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Despejando directamente ${renderMathInline('I_{\\max}')}:
        </p>

        <div style="background: var(--bg); padding: var(--space-4); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`I_{\\max} = I_0 + S_0 - \\frac{N}{R_0}\\left[1 + \\ln\\left(\\frac{R_0 S_0}{N}\\right)\\right]`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          <strong>Umbral de Inmunidad y Cobertura Crítica (${renderMathInline('p_c')}):</strong> Para evitar que el brote inicie, se debe reducir la fracción de susceptibles ${renderMathInline('S_0/N')} hasta que ${renderMathInline('R_{ef} \\le 1')}. Inmunizando una fracción ${renderMathInline('p')} de la población con una efectividad de parcheo ${renderMathInline('e')}:
        </p>

        <div style="background: var(--bg); padding: var(--space-3); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`R_0 (1 - e \\cdot p) \\le 1 \\implies p_c = \\frac{1 - 1/R_0}{e}`)}
        </div>
      </section>

      <!-- Sección 5 -->
      <section id="sec-tamano-final" class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-2); margin-top: 0; color: var(--ink);">
          5. Ecuación Trascendente del Tamaño Final del Brote (S_∞)
        </h2>
        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Cuando el tiempo tiende a infinito (${renderMathInline('t \\to \\infty')}), la epidemia cesa por completo debido al agotamiento de susceptibles, por lo que ${renderMathInline('I_\\infty = 0')}. 
          Evaluando la integral primera en ${renderMathInline('t = \\infty')}:
        </p>

        <div style="background: var(--bg); padding: var(--space-4); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`S_\\infty - \\frac{N}{R_0} \\ln S_\\infty = I_0 + S_0 - \\frac{N}{R_0} \\ln S_0`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Reorganizando algebraicamente con ${renderMathInline("N' = S_0 + I_0")}:
        </p>

        <div style="background: var(--bg); padding: var(--space-4); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`\\ln\\left(\\frac{S_\\infty}{S_0}\\right) = -\\frac{R_0}{N}(N' - S_\\infty)`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Esta es una <strong>ecuación trascendente no lineal</strong> que no posee despeje elemental y se resuelve computacionalmente en SIR-Net Lab mediante el método de bisección o Newton–Raphson. 
          Un resultado fundamental es que ${renderMathInline('S_\\infty > 0')}: <em>una epidemia nunca infecta al 100% de la población susceptible homogénea</em>.
        </p>
      </section>

      <!-- Sección 6 -->
      <section id="sec-seir-impulsos" class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-2); margin-top: 0; color: var(--ink);">
          6. Extensión SEIR con Latencia y Campañas por Impulsos
        </h2>
        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          En muchos tipos de malware moderno (como gusanos con fase de reconocimiento o ransomware con cifrado diferido), los equipos comprometidos no infectan de inmediato. 
          El modelo SEIR incorpora el estado <strong>E(t) [Expuesto / Latente]</strong>:
        </p>

        <div style="background: var(--bg); padding: var(--space-4); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`\\begin{aligned}
            \\frac{dS}{dt} &= -\\frac{\\beta S I}{N} - \\nu(t) S \\\\[6pt]
            \\frac{dE}{dt} &= \\frac{\\beta S I}{N} - \\sigma E \\\\[6pt]
            \\frac{dI}{dt} &= \\sigma E - \\gamma I \\\\[6pt]
            \\frac{dR}{dt} &= \\gamma I + \\nu(t) S
          \\end{aligned}`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          <strong>Campañas por impulsos:</strong> Cuando se despliegan parches masivos de seguridad en instantes discretos ${renderMathInline('t_k')}, el sistema se modela con operadores de salto:
        </p>

        <div style="background: var(--bg); padding: var(--space-3); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`S(t_k^+) = S(t_k^-)(1 - p_k), \\quad R(t_k^+) = R(t_k^-) + p_k S(t_k^-)`)}
        </div>
      </section>

      <!-- Sección 7 -->
      <section id="sec-redes-heterogeneas" class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <h2 style="font-size: var(--step-2); margin-top: 0; color: var(--ink);">
          7. Dinámica en Redes Complejas y Umbral Heterogéneo
        </h2>
        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          En redes de comunicaciones reales, el grado de los nodos ${renderMathInline('k')} no es uniforme. 
          Siguiendo el marco analítico de Pastor-Satorras & Vespignani (2001) y Newman (2002), el umbral epidémico de transmisibilidad ${renderMathInline('T_c')} para el modelo SIR en una red heterogénea está regido por los momentos de la distribución de grado:
        </p>

        <div style="background: var(--bg); padding: var(--space-4); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`T_c = \\frac{\\langle k \\rangle}{\\langle k^2 \\rangle - \\langle k \\rangle}`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          En redes de escala libre (Barabási–Albert con ${renderMathInline('P(k) \\sim k^{-\\gamma}')} y ${renderMathInline('\\gamma \\le 3')}), el segundo momento ${renderMathInline('\\langle k^2 \\rangle \\to \\infty')} cuando ${renderMathInline('N \\to \\infty')}, lo que conduce al resultado paradigmático:
        </p>

        <div style="background: var(--bg); padding: var(--space-3); border-radius: var(--radius); margin: var(--space-4) 0; overflow-x: auto;">
          ${renderMathBlock(`\\lim_{N \\to \\infty} T_c = 0`)}
        </div>

        <p style="line-height: 1.7; font-size: var(--step-0); color: var(--ink-2);">
          Esto significa que cualquier malware, por débil que sea su tasa de infección, puede desencadenar una epidemia en redes libres de escala debido a la existencia de <em>hubs</em> ultrasensibles. 
          Por ende, las estrategias de inmunización dirigida (hubs o vecinos aprovechando la Paradoja de la Amistad) son drásticamente superiores al parcheo uniforme.
        </p>
      </section>

      <!-- Sección 8: Glosario Interactivo -->
      <section id="sec-glosario" class="card" style="padding: var(--space-6); margin-bottom: var(--space-6);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-4);">
          <div>
            <h2 style="font-size: var(--step-2); margin: 0; color: var(--ink);">
              8. Glosario Técnico Interactivo
            </h2>
            <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1); margin: 0;">
              Definiciones formales, unidades y fórmulas analíticas de cada concepto
            </p>
          </div>
          <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
            <input type="search" id="glossary-search" placeholder="🔍 Buscar término o símbolo..." aria-label="Buscar en el glosario" style="padding: 6px 12px; border-radius: 6px; border: 1px solid var(--line); font-size: var(--step--1);" />
            <select id="glossary-category" aria-label="Filtrar glosario por categoría" style="padding: 6px 10px; border-radius: 6px; border: 1px solid var(--line); font-size: var(--step--1);">
              <option value="all">Todas las categorías</option>
              <option value="parametros">Parámetros</option>
              <option value="metricas">Métricas</option>
              <option value="redes">Redes complejas</option>
              <option value="metodos">Métodos numéricos</option>
            </select>
          </div>
        </div>

        <div id="glossary-cards-container" style="display: grid; grid-template-columns: 1fr; gap: var(--space-3);">
          <!-- Se renderiza dinámicamente -->
        </div>
      </section>

    </div>
  `

  // Lógica del glosario interactivo
  const container = page.querySelector<HTMLDivElement>('#glossary-cards-container')!
  const searchInput = page.querySelector<HTMLInputElement>('#glossary-search')!
  const categorySelect = page.querySelector<HTMLSelectElement>('#glossary-category')!

  function renderGlossaryList(entries: GlossaryEntry[]): void {
    if (entries.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: var(--space-6); color: var(--ink-2); font-size: var(--step--1);">
          No se encontraron conceptos que coincidan con la búsqueda.
        </div>
      `
      return
    }

    container.innerHTML = entries
      .map(
        (e) => `
        <article class="card" style="padding: var(--space-4); border: 1px solid var(--line); background: var(--surface);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-2); margin-bottom: var(--space-2); flex-wrap: wrap;">
            <div>
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; font-weight: bold; background: rgba(31, 78, 121, 0.1); color: var(--accent); margin-bottom: 4px;">
                ${e.category}
              </span>
              <h3 style="margin: 0; font-size: var(--step-0); color: var(--ink);">
                ${e.term} <span style="font-family: var(--font-mono); color: var(--accent); font-weight: normal;">(${renderMathInline(e.symbol)})</span>
              </h3>
            </div>
            <span style="font-size: var(--step--1); font-family: var(--font-mono); color: var(--ink-2);">
              Unidad: <strong>${e.unit}</strong>
            </span>
          </div>
          <p style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.6; margin: 0 0 ${e.formula ? 'var(--space-2)' : '0'} 0;">
            ${e.definition}
          </p>
          ${
            e.formula
              ? `<div style="background: var(--bg); padding: var(--space-2); border-radius: 4px; overflow-x: auto;">
                  ${renderMathBlock(e.formula)}
                </div>`
              : ''
          }
        </article>
      `
      )
      .join('')
  }

  function filterGlossary(): void {
    const query = searchInput.value.toLowerCase().trim()
    const cat = categorySelect.value

    const filtered = GLOSSARY.filter((e) => {
      const matchCat = cat === 'all' || e.category === cat
      const matchQuery =
        !query ||
        e.term.toLowerCase().includes(query) ||
        e.symbol.toLowerCase().includes(query) ||
        e.definition.toLowerCase().includes(query)
      return matchCat && matchQuery
    })

    renderGlossaryList(filtered)
  }

  searchInput.addEventListener('input', filterGlossary)
  categorySelect.addEventListener('change', filterGlossary)

  // Render inicial del glosario
  renderGlossaryList(GLOSSARY)

  return page
}
