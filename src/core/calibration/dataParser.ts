/**
 * @fileoverview Parser y validador de datos CSV y texto pegado para calibración (SIR-Net Lab).
 * Soporta delimitadores por coma, punto y coma o tabulador, detección automática de columnas
 * y validaciones de consistencia temporal y numérica.
 *
 * @see docs/06-plan-de-trabajo.md T6.2
 */

import type { Observation } from './syntheticData.ts'

export interface ParseResult {
  data: Observation[]
  error?: string
}

const TIME_HEADERS = ['t', 'tiempo', 'time', 'dia', 'day', 'fecha', 'dias', 'days']
const INFECTED_HEADERS = [
  'i',
  'infectados',
  'infected',
  'infectadas',
  'casos',
  'cases',
  'activos',
  'active',
]

/**
 * Parsea y valida una cadena CSV o texto con observaciones temporales de infectados.
 */
export function parseDataCsv(csvText: string): ParseResult {
  const trimmed = csvText.trim()
  if (!trimmed) {
    return { data: [], error: 'El archivo o texto está vacío.' }
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length < 3) {
    return {
      data: [],
      error: 'Se requieren al menos 3 puntos de observación para calibrar el modelo.',
    }
  }

  // Detectar delimitador: coma, punto y coma o tabulador
  const firstLine = lines[0] ?? ''
  let delimiter = ','
  if (firstLine.includes('\t')) delimiter = '\t'
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';'

  let startRow = 0
  let tCol = 0
  let iCol = 1

  // Detectar si la primera fila es encabezado
  const firstTokens = firstLine.split(delimiter).map((s) => s.trim().toLowerCase())
  const hasTimeHeader = firstTokens.some((t) => TIME_HEADERS.includes(t))
  const hasInfHeader = firstTokens.some((t) => INFECTED_HEADERS.includes(t))

  if (hasTimeHeader || hasInfHeader) {
    startRow = 1
    // Determinar qué columna es cada una
    firstTokens.forEach((header, colIdx) => {
      if (TIME_HEADERS.includes(header)) tCol = colIdx
      if (INFECTED_HEADERS.includes(header)) iCol = colIdx
    })
  }

  const observations: Observation[] = []
  let lastTime = -Infinity

  for (let r = startRow; r < lines.length; r++) {
    const line = lines[r]
    if (!line) continue

    const tokens = line.split(delimiter).map((s) => s.trim())
    if (tokens.length < 2) {
      return {
        data: [],
        error: `Fila ${r + 1} inválida: se esperan al menos 2 columnas separadas por "${delimiter}".`,
      }
    }

    const tVal = Number(tokens[tCol])
    const iVal = Number(tokens[iCol])

    if (isNaN(tVal) || isNaN(iVal)) {
      return {
        data: [],
        error: `Fila ${r + 1}: valores no numéricos detectados (t="${tokens[tCol]}", I="${tokens[iCol]}").`,
      }
    }

    if (tVal < 0 || iVal < 0) {
      return {
        data: [],
        error: `Fila ${r + 1}: tiempo e infectados deben ser no negativos (t=${tVal}, I=${iVal}).`,
      }
    }

    if (tVal <= lastTime) {
      return {
        data: [],
        error: `Fila ${r + 1}: el tiempo t=${tVal} debe ser estrictamente creciente (anterior=${lastTime}).`,
      }
    }

    lastTime = tVal
    observations.push({ t: tVal, I: iVal })
  }

  if (observations.length < 3) {
    return {
      data: [],
      error: 'El archivo contiene menos de 3 observaciones válidas. Se requieren al menos 3.',
    }
  }

  return { data: observations }
}
