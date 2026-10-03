/**
 * @fileoverview Algoritmo de optimización Simplex de Nelder–Mead con restricciones de cota.
 * Minimiza funciones no lineales f: ℝⁿ → ℝ sin requerir cálculo de derivadas.
 * Implementa las operaciones estándar: reflexión, expansión, contracción interna/externa y reducción (shrink).
 *
 * @see Nelder, J. A., & Mead, R. (1965). A simplex method for function minimization.
 * @see docs/02-modelo-matematico.md §2.6
 * @see docs/06-plan-de-trabajo.md T6.1
 */

export interface OptimizationOptions {
  /** Tolerancia de parada sobre la variación de la función y del simplex */
  tol?: number
  /** Número máximo de iteraciones */
  maxIterations?: number
  /** Cotas inferiores para cada dimensión (opcional) */
  lowerBounds?: number[]
  /** Cotas superiores para cada dimensión (opcional) */
  upperBounds?: number[]
  /** Parámetro de reflexión α (default 1.0) */
  alpha?: number
  /** Parámetro de expansión γ (default 2.0) */
  gamma?: number
  /** Parámetro de contracción ρ (default 0.5) */
  rho?: number
  /** Parámetro de reducción σ (default 0.5) */
  sigma?: number
  /** Tamaño del paso inicial para construir el simplex inicial */
  stepSize?: number
}

export interface OptimizationResult {
  /** Punto óptimo encontrado x* */
  point: number[]
  /** Valor mínimo de la función f(x*) */
  cost: number
  /** Cantidad de iteraciones ejecutadas */
  iterations: number
  /** Si convergió dentro de la tolerancia */
  converged: boolean
}

/**
 * Aplica una función de barrera cuadrática para imponer cotas estrictas sin discontinuidades.
 */
function applyBoundsPenalty(x: number[], lowerBounds?: number[], upperBounds?: number[]): number {
  let penalty = 0
  const PENALTY_WEIGHT = 1e8

  if (lowerBounds) {
    for (let i = 0; i < x.length; i++) {
      const lb = lowerBounds[i]
      const val = x[i]
      if (lb !== undefined && val !== undefined && val < lb) {
        const diff = lb - val
        penalty += PENALTY_WEIGHT * (diff * diff + diff)
      }
    }
  }

  if (upperBounds) {
    for (let i = 0; i < x.length; i++) {
      const ub = upperBounds[i]
      const val = x[i]
      if (ub !== undefined && val !== undefined && val > ub) {
        const diff = val - ub
        penalty += PENALTY_WEIGHT * (diff * diff + diff)
      }
    }
  }

  return penalty
}

/**
 * Minimiza una función objetivo fn(x) usando el algoritmo de Nelder–Mead.
 */
export function nelderMead(
  fn: (x: number[]) => number,
  initialPoint: number[],
  opts: OptimizationOptions = {}
): OptimizationResult {
  const {
    tol = 1e-6,
    maxIterations = 1000,
    lowerBounds,
    upperBounds,
    alpha = 1.0,
    gamma = 2.0,
    rho = 0.5,
    sigma = 0.5,
    stepSize = 0.05,
  } = opts

  const dim = initialPoint.length
  if (dim === 0) {
    return { point: [], cost: 0, iterations: 0, converged: true }
  }

  // Función objetivo envuelta con penalización de cotas
  const objective = (p: number[]): number => {
    const penalty = applyBoundsPenalty(p, lowerBounds, upperBounds)
    if (penalty > 0) return 1e12 + penalty
    const val = fn(p)
    return isNaN(val) || !isFinite(val) ? 1e12 : val
  }

  // 1. Inicializar el simplex con (dim + 1) vértices
  const simplex: Array<{ point: number[]; value: number }> = []

  // Vértice 0: punto inicial
  const p0 = [...initialPoint]
  simplex.push({ point: p0, value: objective(p0) })

  // Vértices 1..dim: perturbar cada coordenada
  for (let i = 0; i < dim; i++) {
    const p = [...initialPoint]
    const delta = Math.abs(p[i] ?? 0) > 1e-4 ? (p[i] ?? 0) * stepSize : stepSize
    p[i] = (p[i] ?? 0) + delta
    simplex.push({ point: p, value: objective(p) })
  }

  let iterations = 0
  let converged = false

  while (iterations < maxIterations) {
    iterations++

    // 2. Ordenar vértices de menor a mayor valor de función
    simplex.sort((a, b) => a.value - b.value)

    const best = simplex[0]
    const worst = simplex[dim]
    const secondWorst = simplex[dim - 1]

    if (!best || !worst || !secondWorst) break

    // Criterio de parada: diámetro del simplex y diferencia de función
    let maxCoordDiff = 0
    for (let i = 1; i <= dim; i++) {
      const v = simplex[i]
      if (v) {
        for (let d = 0; d < dim; d++) {
          const diff = Math.abs((v.point[d] ?? 0) - (best.point[d] ?? 0))
          if (diff > maxCoordDiff) maxCoordDiff = diff
        }
      }
    }

    const funcDiff = Math.abs(worst.value - best.value)
    if (funcDiff < tol && maxCoordDiff < tol) {
      converged = true
      break
    }

    // 3. Centroide de los mejores n vértices (excluyendo el peor)
    const centroid = new Array<number>(dim).fill(0)
    for (let i = 0; i < dim; i++) {
      const v = simplex[i]
      if (v) {
        for (let d = 0; d < dim; d++) {
          centroid[d] = (centroid[d] ?? 0) + (v.point[d] ?? 0)
        }
      }
    }
    for (let d = 0; d < dim; d++) {
      centroid[d] = (centroid[d] ?? 0) / dim
    }

    // 4. Reflexión: x_r = centroid + alpha * (centroid - worst)
    const xr = new Array<number>(dim)
    for (let d = 0; d < dim; d++) {
      xr[d] = (centroid[d] ?? 0) + alpha * ((centroid[d] ?? 0) - (worst.point[d] ?? 0))
    }
    const fxr = objective(xr)

    if (fxr >= best.value && fxr < secondWorst.value) {
      // Aceptar reflexión
      simplex[dim] = { point: xr, value: fxr }
      continue
    }

    // 5. Expansión: si la reflexión es el mejor punto hasta ahora
    if (fxr < best.value) {
      const xe = new Array<number>(dim)
      for (let d = 0; d < dim; d++) {
        xe[d] = (centroid[d] ?? 0) + gamma * ((xr[d] ?? 0) - (centroid[d] ?? 0))
      }
      const fxe = objective(xe)
      if (fxe < fxr) {
        simplex[dim] = { point: xe, value: fxe }
      } else {
        simplex[dim] = { point: xr, value: fxr }
      }
      continue
    }

    // 6. Contracción
    if (fxr < worst.value) {
      // Contracción externa
      const xc = new Array<number>(dim)
      for (let d = 0; d < dim; d++) {
        xc[d] = (centroid[d] ?? 0) + rho * ((xr[d] ?? 0) - (centroid[d] ?? 0))
      }
      const fxc = objective(xc)
      if (fxc <= fxr) {
        simplex[dim] = { point: xc, value: fxc }
        continue
      }
    } else {
      // Contracción interna
      const xc = new Array<number>(dim)
      for (let d = 0; d < dim; d++) {
        xc[d] = (centroid[d] ?? 0) - rho * ((centroid[d] ?? 0) - (worst.point[d] ?? 0))
      }
      const fxc = objective(xc)
      if (fxc < worst.value) {
        simplex[dim] = { point: xc, value: fxc }
        continue
      }
    }

    // 7. Reducción (Shrink): contraer todos los puntos hacia el mejor
    for (let i = 1; i <= dim; i++) {
      const v = simplex[i]
      if (v) {
        const newPoint = new Array<number>(dim)
        for (let d = 0; d < dim; d++) {
          newPoint[d] = (best.point[d] ?? 0) + sigma * ((v.point[d] ?? 0) - (best.point[d] ?? 0))
        }
        simplex[i] = { point: newPoint, value: objective(newPoint) }
      }
    }
  }

  simplex.sort((a, b) => a.value - b.value)
  const finalBest = simplex[0] ?? { point: initialPoint, value: Infinity }

  return {
    point: finalBest.point,
    cost: finalBest.value,
    iterations,
    converged,
  }
}
