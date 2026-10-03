/**
 * @fileoverview Modo Reto — Juego interactivo de ciberdefensa y contención de malware.
 * El usuario actúa como líder de ciberseguridad con un presupuesto limitado de créditos,
 * debiendo balancear estrategias de inmunización y aislamiento para contener la epidemia.
 * (docs/03 RF-15, docs/06 T5.4)
 */

import { generateBarabasiAlbert } from '../../sim/graphs/ba.ts'
import { generateWattsStrogatz } from '../../sim/graphs/ws.ts'
import { generateErdosRenyi } from '../../sim/graphs/er.ts'
import { selectHubNodes, selectAcquaintanceNodes, selectRandomNodes } from '../../sim/strategies.ts'
import { simulateGillespie } from '../../sim/gillespie.ts'
import { createRng } from '../../core/rng.ts'

interface TacticalAction {
  id: string
  name: string
  cost: number
  description: string
  icon: string
}

const ACTIONS: TacticalAction[] = [
  {
    id: 'hubs',
    name: 'Proteger Servidores Hubs',
    cost: 350,
    description:
      'Aplica parches prioritarios a los servidores centrales y equipos con más conexiones en la red.',
    icon: '🛡️',
  },
  {
    id: 'acquaintance',
    name: 'Inmunización por Vecinos',
    cost: 200,
    description:
      'Elige computadoras al azar y vacuna a sus contactos directos (estrategia rápida y altamente efectiva).',
    icon: '👥',
  },
  {
    id: 'random',
    name: 'Parcheo Masivo Aleatorio',
    cost: 150,
    description: 'Distribuye actualizaciones de seguridad al azar en toda la red de computadoras.',
    icon: '🎲',
  },
  {
    id: 'segmentation',
    name: 'Micro-segmentación de Red',
    cost: 300,
    description:
      'Separa subredes y cierra puertos sospechosos para frenar la velocidad de contagio a la mitad.',
    icon: '🚧',
  },
]

export function pageChallenge(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'challenge-page'

  page.innerHTML = `
    <div class="challenge-layout" style="max-width: 1000px; margin: 0 auto; padding: var(--space-4);">
      <header class="challenge-header" style="margin-bottom: var(--space-4);">
        <h1 style="font-size: var(--step-2); margin-bottom: var(--space-1);">Reto</h1>
        <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1);">
          Modo Reto: Contén el ciberataque antes de que colapse la infraestructura
        </p>
      </header>

      <!-- Estado del juego: Selección y Presupuesto -->
      <div id="challenge-setup-card" class="card" style="padding: var(--space-6); margin-bottom: var(--space-4);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-4);">
          <div>
            <h2 style="font-size: var(--step-1); margin: 0 0 4px 0;">Sala de Operaciones de Ciberdefensa</h2>
            <p class="text-muted" style="font-size: var(--step--1); color: var(--ink-2); margin: 0;">
              Elige tu nivel de amenaza y administra tu presupuesto de créditos
            </p>
          </div>
          <div style="background: var(--bg); padding: 8px 16px; border-radius: 8px; border: 1px solid var(--line); text-align: right;">
            <div style="font-size: var(--step--1); color: var(--ink-2);">Presupuesto disponible</div>
            <div id="challenge-budget-display" style="font-size: var(--step-2); font-weight: bold; font-family: var(--font-mono); color: var(--ok);">
              1000 <span style="font-size: var(--step-0);">créditos</span>
            </div>
          </div>
        </div>

        <!-- Dificultad / Escenario -->
        <div style="margin-bottom: var(--space-4);">
          <label style="font-weight: 600; font-size: var(--step--1); display: block; margin-bottom: 6px;">
            Nivel de escenario y topología:
          </label>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3);">
            <label class="card-radio" style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 1px solid var(--line); border-radius: 6px; cursor: pointer; background: var(--surface);">
              <input type="radio" name="difficulty" value="level1" />
              <div>
                <strong>Nivel 1: Empresa Local</strong>
                <div style="font-size: var(--step--1); color: var(--ink-2);">Red uniforme de oficinas (200 equipos conectados al azar)</div>
              </div>
            </label>

            <label class="card-radio" style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 1px solid var(--line); border-radius: 6px; cursor: pointer; background: var(--surface);">
              <input type="radio" name="difficulty" value="level2" />
              <div>
                <strong>Nivel 2: Campus Universitario</strong>
                <div style="font-size: var(--step--1); color: var(--ink-2);">Red comunitaria con enlaces rápidos entre áreas (300 equipos)</div>
              </div>
            </label>

            <label class="card-radio" style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 1px solid var(--accent); border-radius: 6px; cursor: pointer; background: var(--surface);">
              <input type="radio" name="difficulty" value="level3" checked />
              <div>
                <strong>Nivel 3: Infraestructura Crítica</strong>
                <div style="font-size: var(--step--1); color: var(--ink-2);">Red jerárquica con servidores centrales clave (400 equipos)</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Catálogo de Acciones Tácticas -->
        <div style="margin-bottom: var(--space-4);">
          <h3 style="font-size: var(--step-0); margin-bottom: var(--space-2);">Medidas de defensa disponibles</h3>
          <div id="actions-catalog" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-3);"></div>
        </div>

        <!-- Botón de ejecución -->
        <button id="btn-start-defense" class="btn btn--primary" type="button" style="width: 100%; font-size: var(--step-0); padding: 12px;">
          🚀 Ejecutar Estrategia de Defensa
        </button>
      </div>

      <!-- Pantalla de Resultados del Reto -->
      <div id="challenge-results-card" class="card" style="padding: var(--space-6); display: none;">
        <div style="text-align: center; margin-bottom: var(--space-6);">
          <div id="res-badge-icon" style="font-size: 3.5rem; margin-bottom: var(--space-2);">🏆</div>
          <h2 id="res-title" style="font-size: var(--step-2); margin-bottom: var(--space-1);">¡Brote Contenido con Éxito!</h2>
          <p id="res-subtitle" style="font-size: var(--step-0); color: var(--ink-2); margin: 0;"></p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
          <div class="card" style="text-align: center; padding: var(--space-3); background: var(--bg);">
            <div style="font-size: var(--step--1); color: var(--ink-2);">Puntuación Final</div>
            <div id="res-score" style="font-size: var(--step-3); font-weight: bold; font-family: var(--font-mono); color: var(--accent);">0</div>
            <div style="font-size: var(--step--1); color: var(--ink-2);">de 100 puntos</div>
          </div>

          <div class="card" style="text-align: center; padding: var(--space-3); background: var(--bg);">
            <div style="font-size: var(--step--1); color: var(--ink-2);">Equipos Salvados</div>
            <div id="res-saved-pct" style="font-size: var(--step-3); font-weight: bold; font-family: var(--font-mono); color: var(--ok);">0%</div>
            <div id="res-saved-cnt" style="font-size: var(--step--1); color: var(--ink-2);">0 equipos</div>
          </div>

          <div class="card" style="text-align: center; padding: var(--space-3); background: var(--bg);">
            <div style="font-size: var(--step--1); color: var(--ink-2);">Presupuesto Ahorrado</div>
            <div id="res-credits-left" style="font-size: var(--step-3); font-weight: bold; font-family: var(--font-mono); color: var(--ink);">0</div>
            <div style="font-size: var(--step--1); color: var(--ink-2);">créditos libres</div>
          </div>
        </div>

        <div class="card" style="margin-bottom: var(--space-4); border-left: 4px solid var(--accent); background: var(--bg);">
          <h4 style="font-size: var(--step-0); margin-bottom: var(--space-1);">Análisis post-incidente</h4>
          <p id="res-explanation" style="font-size: var(--step--1); line-height: 1.6; color: var(--ink-2); margin: 0;"></p>
        </div>

        <button id="btn-replay" class="btn btn--secondary" type="button" style="width: 100%; font-size: var(--step-0); padding: 12px;">
          🔄 Jugar de nuevo / Cambiar táctica
        </button>
      </div>
    </div>
  `

  const budgetDisplay = page.querySelector<HTMLElement>('#challenge-budget-display')
  const actionsCatalog = page.querySelector<HTMLElement>('#actions-catalog')
  const btnStartDefense = page.querySelector<HTMLButtonElement>('#btn-start-defense')
  const setupCard = page.querySelector<HTMLElement>('#challenge-setup-card')
  const resultsCard = page.querySelector<HTMLElement>('#challenge-results-card')
  const btnReplay = page.querySelector<HTMLButtonElement>('#btn-replay')

  const resBadgeIcon = page.querySelector<HTMLElement>('#res-badge-icon')
  const resTitle = page.querySelector<HTMLElement>('#res-title')
  const resSubtitle = page.querySelector<HTMLElement>('#res-subtitle')
  const resScore = page.querySelector<HTMLElement>('#res-score')
  const resSavedPct = page.querySelector<HTMLElement>('#res-saved-pct')
  const resSavedCnt = page.querySelector<HTMLElement>('#res-saved-cnt')
  const resCreditsLeft = page.querySelector<HTMLElement>('#res-credits-left')
  const resExplanation = page.querySelector<HTMLElement>('#res-explanation')

  const INITIAL_BUDGET = 1000
  let currentBudget = INITIAL_BUDGET
  const selectedActions = new Set<string>()

  // Renderizar catálogo de acciones
  if (actionsCatalog) {
    ACTIONS.forEach((action) => {
      const card = document.createElement('div')
      card.className = 'card action-card'
      card.setAttribute('data-action-id', action.id)
      card.style.cssText =
        'padding: var(--space-3); border: 2px solid var(--line); border-radius: 8px; cursor: pointer; transition: border-color 0.2s, background 0.2s;'
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <span style="font-size: 1.5rem;" aria-hidden="true">${action.icon}</span>
          <span style="font-family: var(--font-mono); font-size: var(--step--1); font-weight: bold; background: var(--bg); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--line);">
            ${action.cost} cr
          </span>
        </div>
        <strong style="font-size: var(--step--1); display: block; margin-bottom: 4px;">${action.name}</strong>
        <p style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.4; margin: 0;">${action.description}</p>
      `

      card.addEventListener('click', () => {
        if (selectedActions.has(action.id)) {
          selectedActions.delete(action.id)
          currentBudget += action.cost
          card.style.borderColor = 'var(--line)'
          card.style.background = 'var(--surface)'
        } else {
          if (currentBudget >= action.cost) {
            selectedActions.add(action.id)
            currentBudget -= action.cost
            card.style.borderColor = 'var(--accent)'
            card.style.background = 'rgba(31, 78, 121, 0.05)'
          }
        }
        updateBudgetDisplay()
      })

      actionsCatalog.appendChild(card)
    })
  }

  function updateBudgetDisplay(): void {
    if (budgetDisplay) {
      budgetDisplay.innerHTML = `${currentBudget} <span style="font-size: var(--step-0);">créditos</span>`
      budgetDisplay.style.color = currentBudget < 200 ? 'var(--warn)' : 'var(--ok)'
    }
  }

  // Ejecución de la partida
  btnStartDefense?.addEventListener('click', () => {
    const diffEl = page.querySelector<HTMLInputElement>('input[name="difficulty"]:checked')
    const difficulty = diffEl?.value || 'level3'

    let n: number
    let beta: number
    const gamma = 0.2
    let graph
    const seed = 12345

    if (difficulty === 'level1') {
      n = 200
      beta = 0.4
      graph = generateErdosRenyi({ n, p: 4 / n, seed })
    } else if (difficulty === 'level2') {
      n = 300
      beta = 0.5
      graph = generateWattsStrogatz({ n, k: 4, p: 0.1, seed })
    } else {
      // Level 3: Barabási-Albert
      n = 400
      beta = 0.6
      graph = generateBarabasiAlbert({ n, m: 2, seed })
    }

    // Efecto de Micro-segmentación: reduce beta un 50%
    if (selectedActions.has('segmentation')) {
      beta *= 0.5
    }

    // Nodos a inmunizar según acciones seleccionadas
    const immunizedSet = new Set<number>()
    const rng = createRng(seed + 99)
    const budgetCountPerAction = Math.round(n * 0.1) // 10% por acción

    if (selectedActions.has('hubs')) {
      const hubs = selectHubNodes(graph, budgetCountPerAction, immunizedSet)
      hubs.forEach((id) => immunizedSet.add(id))
    }

    if (selectedActions.has('acquaintance')) {
      const acq = selectAcquaintanceNodes(graph, budgetCountPerAction, rng, immunizedSet)
      acq.forEach((id) => immunizedSet.add(id))
    }

    if (selectedActions.has('random')) {
      const rand = selectRandomNodes(n, budgetCountPerAction, rng, immunizedSet)
      rand.forEach((id) => immunizedSet.add(id))
    }

    const removedArray = Array.from(immunizedSet)

    // Simulación del ataque
    const sim = simulateGillespie({
      graph,
      beta,
      gamma,
      i0: 2,
      seed,
      tMax: 50,
      dt: 0.2,
      initialRemoved: removedArray,
    })

    const infectedDuringOutbreak = sim.totalInfected
    const savedNodes = n - infectedDuringOutbreak
    const savedPct = (savedNodes / n) * 100

    // Cálculo de puntuación (0 - 100)
    const scoreFrac = savedPct / 100
    const budgetFrac = currentBudget / INITIAL_BUDGET
    const rawScore = Math.round(scoreFrac * 80 + budgetFrac * 20)
    const finalScore = Math.max(10, Math.min(100, rawScore))

    // Calificación y veredicto
    let icon = '🛡️'
    let title = 'Defensor Senior — Brote Neutralizado'
    let subtitle = 'Tu combinación táctica contuvo el brote salvando la mayoría de la red.'

    if (finalScore >= 90) {
      icon = '🌟'
      title = 'CISO Legendario — Resiliencia Total'
      subtitle =
        '¡Excelente gestión estratégica! Desarmaste la propagación con mínimo costo operativo.'
    } else if (finalScore < 50) {
      icon = '🚨'
      title = 'Alerta Crítica — Infraestructura Comprometida'
      subtitle =
        'El malware alcanzó a demasiados equipos antes de que tus medidas surtieran efecto.'
    } else if (finalScore < 75) {
      icon = '⚠️'
      title = 'Operador Junior — Daño Moderado'
      subtitle = 'Se evitó el colapso total, pero hubo pérdidas significativas de equipos.'
    }

    if (resBadgeIcon) resBadgeIcon.textContent = icon
    if (resTitle) resTitle.textContent = title
    if (resSubtitle) resSubtitle.textContent = subtitle
    if (resScore) resScore.textContent = finalScore.toString()
    if (resSavedPct) resSavedPct.textContent = savedPct.toFixed(1) + '%'
    if (resSavedCnt) resSavedCnt.textContent = `${savedNodes} de ${n} equipos preservados`
    if (resCreditsLeft) resCreditsLeft.textContent = currentBudget.toString()

    if (resExplanation) {
      if (difficulty === 'level3') {
        resExplanation.textContent = selectedActions.has('hubs')
          ? 'Al blindar los servidores centrales (hubs), cortaste las vías críticas del ataque. En redes jerárquicas, proteger estos pocos puntos neurálgicos frena la propagación de forma mucho más eficaz y económica que parchar máquinas al azar.'
          : 'Al no proteger los servidores centrales (hubs), el malware los aprovechó para dispersarse masivamente a toda la organización. En redes jerárquicas, dejar desprotegidos los centros clave hace que cualquier otra medida pierda fuerza.'
      } else {
        resExplanation.textContent =
          'La combinación de parches y micro-segmentación logró reducir la velocidad de contagio por debajo del ritmo de contención, permitiendo que el brote se extinguiera antes de colapsar la infraestructura.'
      }
    }

    if (setupCard) setupCard.style.display = 'none'
    if (resultsCard) resultsCard.style.display = 'block'
  })

  // Botón para reiniciar y jugar de nuevo
  btnReplay?.addEventListener('click', () => {
    currentBudget = INITIAL_BUDGET
    selectedActions.clear()
    const actionCards = page.querySelectorAll<HTMLElement>('.action-card')
    actionCards.forEach((c) => {
      c.style.borderColor = 'var(--line)'
      c.style.background = 'var(--surface)'
    })
    updateBudgetDisplay()

    if (resultsCard) resultsCard.style.display = 'none'
    if (setupCard) setupCard.style.display = 'block'
  })

  return page
}
