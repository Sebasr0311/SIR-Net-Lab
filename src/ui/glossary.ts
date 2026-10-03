/**
 * @fileoverview Glosario técnico y matemático unificado para SIR-Net Lab.
 * Provee definiciones rigurosas, fórmulas analíticas KaTeX y unidades para cada
 * parámetro, métrica y concepto de propagación de malware en redes.
 *
 * @see docs/02-modelo-matematico.md
 * @see docs/06-plan-de-trabajo.md T8.2
 */

export interface GlossaryEntry {
  id: string
  term: string
  symbol: string
  unit: string
  category: 'parametros' | 'metricas' | 'redes' | 'metodos'
  definition: string
  formula?: string
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: 'beta',
    term: 'Tasa de transmisión / contacto efectivo',
    symbol: '\\beta',
    unit: 'días⁻¹ (o tiempo⁻¹)',
    category: 'parametros',
    definition:
      'Frecuencia con la que un nodo infectado entra en contacto y transmite exitosamente la carga maliciosa a un nodo susceptible en una población homogénea.',
    formula: '\\frac{dS}{dt} = -\\frac{\\beta S I}{N}',
  },
  {
    id: 'gamma',
    term: 'Tasa de recuperación / desinfección',
    symbol: '\\gamma',
    unit: 'días⁻¹ (o tiempo⁻¹)',
    category: 'parametros',
    definition:
      'Tasa a la cual los equipos infectados son detectados, aislados, formateados o parcheados. Su recíproco 1/γ representa el tiempo medio en que un nodo permanece infeccioso.',
    formula: '\\tau_{\\text{inf}} = \\frac{1}{\\gamma}',
  },
  {
    id: 'sigma',
    term: 'Tasa de latencia / incubación (SEIR)',
    symbol: '\\sigma',
    unit: 'días⁻¹ (o tiempo⁻¹)',
    category: 'parametros',
    definition:
      'Tasa de transición del estado Expuesto (nodo infectado con malware latente que aún no transmite) a Infeccioso. Su inverso 1/σ es el tiempo medio de incubación.',
    formula: '\\frac{dE}{dt} = \\frac{\\beta S I}{N} - \\sigma E',
  },
  {
    id: 'nu',
    term: 'Tasa de parcheo preventivo',
    symbol: '\\nu',
    unit: 'días⁻¹ (o tiempo⁻¹)',
    category: 'parametros',
    definition:
      'Tasa de inmunización masiva aplicada a nodos susceptibles antes de que entren en contacto con la infección, transfiriéndolos directamente al compartimento R.',
    formula: '\\frac{dS}{dt} = -\\frac{\\beta S I}{N} - \\nu S',
  },
  {
    id: 'r0',
    term: 'Número reproductivo básico',
    symbol: 'R_0',
    unit: 'Adimensional',
    category: 'metricas',
    definition:
      'Número promedio de infecciones secundarias producidas por un único nodo infectado en una población donde todos los demás nodos son susceptibles. Si R₀ > 1, el malware se propaga epidémicamente.',
    formula: 'R_0 = \\frac{\\beta}{\\gamma}',
  },
  {
    id: 'reff',
    term: 'Número reproductivo efectivo',
    symbol: 'R_{ef}(t)',
    unit: 'Adimensional',
    category: 'metricas',
    definition:
      'Número de infecciones secundarias que genera un nodo infectado en el instante t considerando el agotamiento progresivo del reservorio de susceptibles.',
    formula: 'R_{ef}(t) = R_0 \\frac{S(t)}{N}',
  },
  {
    id: 'imax',
    term: 'Pico de infección máximo',
    symbol: 'I_{\\max}',
    unit: 'Nodos (equipos)',
    category: 'metricas',
    definition:
      'Carga máxima de equipos infectados simultáneamente a lo largo del brote. Se alcanza en el instante exacto en que R_ef(t) = 1 (es decir, cuando S(t) = N / R₀).',
    formula:
      'I_{\\max} = I_0 + S_0 - \\frac{N}{R_0}\\left(1 + \\ln\\left(\\frac{R_0 S_0}{N}\\right)\\right)',
  },
  {
    id: 'pc',
    term: 'Cobertura crítica de vacunación / inmunización',
    symbol: 'p_c',
    unit: 'Fracción [0, 1] o %',
    category: 'metricas',
    definition:
      'Porcentaje mínimo de la población que debe ser parcheada o aislada previamente con una eficacia e para impedir que se produzca una epidemia (umbral de rebaño).',
    formula: 'p_c = \\frac{1 - 1/R_0}{e}',
  },
  {
    id: 'attack_rate',
    term: 'Tasa de ataque final',
    symbol: 'AR',
    unit: 'Fracción [0, 1] o %',
    category: 'metricas',
    definition:
      'Fracción acumulada de la población que resultó infectada desde el inicio hasta la extinción completa del brote: (N - S∞) / N.',
    formula: '\\ln\\left(\\frac{S_\\infty}{S_0}\\right) = -\\frac{R_0}{N}(N - S_\\infty)',
  },
  {
    id: 'tc',
    term: 'Umbral epidémico en redes heterogéneas',
    symbol: 'T_c',
    unit: 'Adimensional',
    category: 'redes',
    definition:
      'Transmisibilidad crítica en un grafo heterogéneo. En redes de escala libre donde el segundo momento ⟨k²⟩ diverge, el umbral tiende a 0, haciendo a la red extremadamente vulnerable.',
    formula: 'T_c = \\frac{\\langle k \\rangle}{\\langle k^2 \\rangle - \\langle k \\rangle}',
  },
  {
    id: 'friendship_paradox',
    term: 'Paradoja de la amistad (Inmunización por vecinos)',
    symbol: '\\mathbb{E}[k_{\\text{vecino}}] > \\mathbb{E}[k]',
    unit: 'Concepto topológico',
    category: 'redes',
    definition:
      'En cualquier red no regular, los vecinos de un nodo elegido al azar tienen, en promedio, un grado de conectividad mayor que el nodo seleccionado. Permite inmunizar hubs sin conocer la topología global.',
    formula:
      '\\langle k_{\\text{vecino}} \\rangle = \\frac{\\langle k^2 \\rangle}{\\langle k \\rangle} \\ge \\langle k \\rangle',
  },
  {
    id: 'rk4',
    term: 'Método de Runge–Kutta de 4.º orden',
    symbol: '\\mathcal{O}(h^4)',
    unit: 'Algoritmo numérico',
    category: 'metodos',
    definition:
      'Integrador numérico explícito para sistemas de EDO que evalúa 4 pendientes intermedias ponderadas (k₁, k₂, k₃, k₄) para alcanzar un error de truncamiento local de orden 5 y global de orden 4.',
    formula: 'y_{n+1} = y_n + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)',
  },
  {
    id: 'gillespie',
    term: 'Algoritmo de simulación estocástica de Gillespie',
    symbol: 'SSA',
    unit: 'Algoritmo estocástico',
    category: 'metodos',
    definition:
      'Método exacto de Monte Carlo de tiempo continuo que muestrea el tiempo hasta el siguiente evento según una distribución exponencial con tasa total Σ a_i, y selecciona la reacción específica proporcionalmente a su propensión.',
    formula: '\\Delta t = \\frac{1}{a_0} \\ln\\left(\\frac{1}{u_1}\\right), \\quad a_0 = \\sum a_i',
  },
  {
    id: 'nelder_mead',
    term: 'Optimizador Simplex de Nelder–Mead',
    symbol: '\\min \\text{SSE}(\\theta)',
    unit: 'Algoritmo de optimización',
    category: 'metodos',
    definition:
      'Algoritmo de búsqueda directa multidimensional que mantiene un símplex de d + 1 vértices en el espacio de parámetros, aplicando transformaciones geométricas de reflexión, expansión, contracción y reducción.',
  },
  {
    id: 'lhs',
    term: 'Muestreo por Hipercubo Latino (LHS)',
    symbol: '\\text{LHS}(M, d)',
    unit: 'Técnica de muestreo',
    category: 'metodos',
    definition:
      'Estrategia de muestreo cuasi-aleatorio que divide el rango de cada variable en M estratos equiprobables y asegura que cada estrato sea muestreado exactamente una vez, reduciendo la varianza del estimador.',
  },
]
