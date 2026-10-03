/**
 * @fileoverview Exportador profesional de plantillas Excel (.xls) y CSV estructurado.
 * Genera reportes formateados para Microsoft Excel, Google Sheets y LibreOffice Calc
 * con diseño corporativo/académico, metadatos, parámetros, KPIs y series temporales.
 *
 * @see docs/06-plan-de-trabajo.md T3.6
 */

export interface ExportableSeries {
  t: ArrayLike<number>
  S: ArrayLike<number>
  E?: ArrayLike<number>
  I: ArrayLike<number>
  R: ArrayLike<number>
  V?: ArrayLike<number>
}

export interface SimulationExportMeta {
  scenarioName?: string
  model?: string
  solver?: string
  beta?: number
  gamma?: number
  sigma?: number
  nu?: number
  i0?: number
  dt?: number
  tMax?: number
  r0?: number
  peakI?: number
  peakTime?: number
  criticalCoverage?: number
  sInfinity?: number
  finalAttackRate?: number
}

/**
 * Genera una plantilla completa en formato HTML Spreadsheet compatible nativamente con Microsoft Excel.
 */
export function buildExcelSpreadsheetXml(
  series: ExportableSeries,
  r0: number,
  N: number,
  meta?: SimulationExportMeta
): string {
  const modelName = (meta?.model ?? 'SIR').toUpperCase()
  const solverName = (meta?.solver ?? 'RK4').toUpperCase()
  const dateStr = new Date().toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'medium',
  })

  const beta = meta?.beta ?? 0.6
  const gamma = meta?.gamma ?? 0.2
  const sigma = meta?.sigma
  const nu = meta?.nu ?? 0
  const i0 = meta?.i0 ?? 1
  let calcMaxI = 0
  for (let k = 0; k < series.I.length; k++) {
    const val = series.I[k] ?? 0
    if (val > calcMaxI) calcMaxI = val
  }
  const peakI = meta?.peakI ?? Math.round(calcMaxI)
  const peakTime = meta?.peakTime ?? 0
  const criticalCov = meta?.criticalCoverage ?? (r0 > 1 ? (1 - 1 / r0) * 100 : 0)
  const finalAttackRate = meta?.finalAttackRate ?? 0

  const hasE = Boolean(series.E && series.E.length > 0)

  // Filas de datos
  const dataRows: string[] = []
  for (let idx = 0; idx < series.t.length; idx++) {
    const t = series.t[idx] ?? 0
    const s = series.S[idx] ?? 0
    const i = series.I[idx] ?? 0
    const r = series.R[idx] ?? 0
    const e = hasE && series.E ? (series.E[idx] ?? 0) : 0
    const totalPop = s + (hasE ? e : 0) + i + r
    const rEff = (r0 * s) / N

    let rowHtml = `<tr>
      <td class="num-dec" style="text-align: left;">${t.toFixed(2)}</td>
      <td class="num-dec">${s.toFixed(2)}</td>`

    if (hasE) {
      rowHtml += `<td class="num-dec">${e.toFixed(2)}</td>`
    }

    rowHtml += `
      <td class="num-dec">${i.toFixed(2)}</td>
      <td class="num-dec">${r.toFixed(2)}</td>
      <td class="num-dec" style="color: #64748B;">${totalPop.toFixed(2)}</td>
      <td class="num-dec3">${rEff.toFixed(3)}</td>
    </tr>`

    dataRows.push(rowHtml)
  }

  const colsSpan = hasE ? 7 : 6

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Simulación SIR-Net</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:Selected/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #1B1F24; background-color: #FFFFFF; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
    th, td { padding: 8px 12px; font-size: 10pt; }
    .title-banner { background-color: #1F4E79; color: #FFFFFF; font-size: 16pt; font-weight: bold; text-align: left; padding: 14px 12px; }
    .subtitle-banner { background-color: #2F669A; color: #E2E8F0; font-size: 10pt; font-style: italic; padding: 6px 12px; }
    .sec-header { background-color: #F1F5F9; color: #0F172A; font-size: 12pt; font-weight: bold; text-align: left; border-top: 2px solid #1F4E79; border-bottom: 1px solid #CBD5E1; padding: 8px 12px; }
    .param-label { background-color: #F8FAFC; color: #334155; font-weight: 600; border: 1px solid #E2E8F0; text-align: left; }
    .param-val { background-color: #FFFFFF; color: #0F172A; border: 1px solid #E2E8F0; text-align: right; }
    .kpi-card { background-color: #F0FDF4; border: 1px solid #86EFAC; color: #166534; font-weight: bold; text-align: center; }
    .kpi-warn { background-color: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; font-weight: bold; text-align: center; }
    
    /* Encabezados de serie temporal */
    .th-t { background-color: #334155; color: #FFFFFF; font-weight: bold; text-align: left; border: 1px solid #1E293B; }
    .th-s { background-color: #0072B2; color: #FFFFFF; font-weight: bold; text-align: right; border: 1px solid #005A8C; }
    .th-e { background-color: #E69F00; color: #FFFFFF; font-weight: bold; text-align: right; border: 1px solid #B87F00; }
    .th-i { background-color: #D55E00; color: #FFFFFF; font-weight: bold; text-align: right; border: 1px solid #A64900; }
    .th-r { background-color: #009E73; color: #FFFFFF; font-weight: bold; text-align: right; border: 1px solid #007A59; }
    .th-n { background-color: #475569; color: #FFFFFF; font-weight: bold; text-align: right; border: 1px solid #334155; }
    .th-ref { background-color: #64748B; color: #FFFFFF; font-weight: bold; text-align: right; border: 1px solid #475569; }

    .num-dec { mso-number-format:"0.00"; text-align: right; border: 1px solid #E2E8F0; }
    .num-dec3 { mso-number-format:"0.000"; text-align: right; border: 1px solid #E2E8F0; }
    .num-int { mso-number-format:"#,##0"; text-align: right; border: 1px solid #E2E8F0; }
    .num-pct { mso-number-format:"0.0%"; text-align: right; border: 1px solid #E2E8F0; }
  </style>
</head>
<body>

  <!-- BANNER INSTITUCIONAL -->
  <table>
    <tr>
      <td colspan="${colsSpan}" class="title-banner">
        SIR-Net Lab · Reporte de Simulación Epidemiológica
      </td>
    </tr>
    <tr>
      <td colspan="${colsSpan}" class="subtitle-banner">
        Generado automáticamente: ${dateStr} · Modelo: ${modelName} · Método Numérico: ${solverName}
      </td>
    </tr>
  </table>

  <!-- SECCIÓN 1: PARÁMETROS DEL MODELO -->
  <table>
    <tr>
      <th colspan="${colsSpan}" class="sec-header">
        1. Configuración de Parámetros y Condiciones Iniciales
      </th>
    </tr>
    <tr>
      <td class="param-label" style="width: 25%;">Población Total (N):</td>
      <td class="param-val num-int">${N}</td>
      <td class="param-label" style="width: 25%;">Tasa de Transmisión (β):</td>
      <td class="param-val num-dec">${beta.toFixed(3)} días⁻¹</td>
      <td class="param-label" style="width: 25%;">Tasa de Recuperación (γ):</td>
      <td class="param-val num-dec" colspan="${colsSpan - 5}">${gamma.toFixed(3)} días⁻¹</td>
    </tr>
    <tr>
      <td class="param-label">Infectados Iniciales (I₀):</td>
      <td class="param-val num-int">${i0}</td>
      <td class="param-label">Susceptibles Iniciales (S₀):</td>
      <td class="param-val num-int">${N - i0}</td>
      <td class="param-label">Tiempo Medio Infeccioso (1/γ):</td>
      <td class="param-val num-dec" colspan="${colsSpan - 5}">${(1 / gamma).toFixed(1)} días</td>
    </tr>
    <tr>
      <td class="param-label">Tasa de Latencia (σ):</td>
      <td class="param-val num-dec">${sigma !== undefined ? sigma.toFixed(3) : 'N/A'}</td>
      <td class="param-label">Tasa Parcheo Preventivo (ν):</td>
      <td class="param-val num-dec">${nu.toFixed(3)}</td>
      <td class="param-label">Paso de Integración (Δt):</td>
      <td class="param-val num-dec" colspan="${colsSpan - 5}">${(meta?.dt ?? 0.1).toFixed(2)} días</td>
    </tr>
  </table>

  <!-- SECCIÓN 2: INDICADORES CLAVE (KPIS) -->
  <table>
    <tr>
      <th colspan="${colsSpan}" class="sec-header">
        2. Resultados Analíticos y Métricas Clave (KPIs)
      </th>
    </tr>
    <tr>
      <td class="param-label">Número Reproductivo Básico (R₀):</td>
      <td class="param-val num-dec3" style="font-weight: bold; font-size: 11pt; color: ${r0 > 1 ? '#D55E00' : '#009E73'};">${r0.toFixed(3)}</td>
      <td class="param-label">Diagnóstico Epidemiológico:</td>
      <td class="param-val" colspan="${colsSpan - 3}" style="text-align: left; font-weight: bold; color: ${r0 > 1 ? '#D55E00' : '#009E73'};">
        ${r0 > 1 ? '⚠️ Brote Epidémico Expansivo (R₀ > 1)' : '✅ Brote Contenido / Estable (R₀ ≤ 1)'}
      </td>
    </tr>
    <tr>
      <td class="param-label">Pico Máximo de Infección (I_max):</td>
      <td class="param-val num-dec" style="font-weight: bold;">${peakI.toFixed(1)} nodos</td>
      <td class="param-label">Tiempo al Pico (t_pico):</td>
      <td class="param-val num-dec">${peakTime > 0 ? `${peakTime.toFixed(1)} días` : 'Inmediato (t=0)'}</td>
      <td class="param-label">Cobertura Crítica Inmunidad (p_c):</td>
      <td class="param-val num-pct" colspan="${colsSpan - 5}">${(criticalCov / 100).toFixed(3)}</td>
    </tr>
    <tr>
      <td class="param-label">Susceptibles en Pico (N/R₀):</td>
      <td class="param-val num-dec">${(N / r0).toFixed(1)} nodos</td>
      <td class="param-label">Tasa de Ataque Final:</td>
      <td class="param-val num-pct" colspan="${colsSpan - 3}">${finalAttackRate.toFixed(3)}</td>
    </tr>
  </table>

  <!-- SECCIÓN 3: SERIE TEMPORAL DETALLADA -->
  <table>
    <thead>
      <tr>
        <th colspan="${colsSpan}" class="sec-header">
          3. Evolución Dinámica por Compartimento (Serie Temporal)
        </th>
      </tr>
      <tr>
        <th class="th-t">t (días)</th>
        <th class="th-s">S(t) [Susceptibles]</th>
        ${hasE ? '<th class="th-e">E(t) [Expuestos]</th>' : ''}
        <th class="th-i">I(t) [Infectados]</th>
        <th class="th-r">R(t) [Recuperados]</th>
        <th class="th-n">Total Activo (N)</th>
        <th class="th-ref">R_ef(t) [Efectivo]</th>
      </tr>
    </thead>
    <tbody>
      ${dataRows.join('\n')}
    </tbody>
  </table>

</body>
</html>`
}

/**
 * Genera un archivo CSV profesional con prefijo UTF-8 BOM y bloque de metadatos.
 */
export function buildStructuredCsv(
  series: ExportableSeries,
  r0: number,
  N: number,
  meta?: SimulationExportMeta
): string {
  const hasE = Boolean(series.E && series.E.length > 0)
  const lines: string[] = []

  // UTF-8 BOM para apertura impecable en Excel
  lines.push('\uFEFF# ========================================================')
  lines.push('# SIR-Net Lab — Reporte de Simulación Epidemiológica')
  lines.push(`# Fecha de Generación: ${new Date().toISOString()}`)
  lines.push(`# Modelo: ${(meta?.model ?? 'SIR').toUpperCase()}`)
  lines.push(`# Solver: ${(meta?.solver ?? 'RK4').toUpperCase()}`)
  lines.push(
    `# Parametros: N=${N}, beta=${(meta?.beta ?? 0.6).toFixed(3)}, gamma=${(meta?.gamma ?? 0.2).toFixed(3)}, nu=${(meta?.nu ?? 0).toFixed(3)}`
  )
  lines.push(
    `# Metricas: R0=${r0.toFixed(3)}, I_max=${(meta?.peakI ?? 0).toFixed(1)}, t_pico=${(meta?.peakTime ?? 0).toFixed(1)} dias, Cobertura_Critica=${((meta?.criticalCoverage ?? 0) / 100).toFixed(3)}`
  )
  lines.push('# ========================================================')

  // Cabecera CSV
  const header = hasE
    ? 't_dias,S_susceptibles,E_expuestos,I_infectados,R_recuperados,N_total,R_ef'
    : 't_dias,S_susceptibles,I_infectados,R_recuperados,N_total,R_ef'
  lines.push(header)

  for (let i = 0; i < series.t.length; i++) {
    const t = (series.t[i] ?? 0).toFixed(2)
    const s = (series.S[i] ?? 0).toFixed(2)
    const inf = (series.I[i] ?? 0).toFixed(2)
    const r = (series.R[i] ?? 0).toFixed(2)
    const e = hasE && series.E ? (series.E[i] ?? 0).toFixed(2) : '0.00'
    const total = (
      (series.S[i] ?? 0) +
      (hasE && series.E ? (series.E[i] ?? 0) : 0) +
      (series.I[i] ?? 0) +
      (series.R[i] ?? 0)
    ).toFixed(2)
    const rEff = ((r0 * (series.S[i] ?? 0)) / N).toFixed(3)

    if (hasE) {
      lines.push(`${t},${s},${e},${inf},${r},${total},${rEff}`)
    } else {
      lines.push(`${t},${s},${inf},${r},${total},${rEff}`)
    }
  }

  return lines.join('\r\n')
}

/**
 * Descarga en el navegador un archivo Excel (.xls).
 */
export function triggerExcelDownload(
  xmlContent: string,
  filename = 'sir-net-lab-simulacion.xls'
): void {
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/**
 * Descarga en el navegador un archivo CSV con soporte UTF-8.
 */
export function triggerCsvDownload(csvContent: string, filename = 'sir-net-lab-series.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/**
 * Genera una plantilla Excel para la comparación de estrategias de control.
 */
export function buildStrategyExcelSpreadsheetXml(report: {
  topology?: string
  results: Record<
    string,
    {
      name: string
      immunizedCount: number
      peakI: number
      peakTime: number
      outbreakInfected: number
      attackRate: number
      reductionPercent: number
    }
  >
}): string {
  const dateStr = new Date().toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'medium',
  })

  const results = Object.values(report.results)
  const rowsHtml = results
    .map(
      (r) => `<tr>
        <td style="font-weight: 600; text-align: left; border: 1px solid #E2E8F0;">${r.name}</td>
        <td class="num-int" style="border: 1px solid #E2E8F0;">${r.immunizedCount}</td>
        <td class="num-dec" style="font-weight: bold; border: 1px solid #E2E8F0;">${r.peakI.toFixed(1)}</td>
        <td class="num-dec" style="border: 1px solid #E2E8F0;">${r.peakTime.toFixed(1)}</td>
        <td class="num-int" style="border: 1px solid #E2E8F0;">${r.outbreakInfected}</td>
        <td class="num-pct" style="border: 1px solid #E2E8F0;">${r.attackRate.toFixed(3)}</td>
        <td class="num-pct" style="font-weight: bold; color: ${r.reductionPercent > 0 ? '#166534' : '#991B1B'}; border: 1px solid #E2E8F0;">${(r.reductionPercent / 100).toFixed(3)}</td>
      </tr>`
    )
    .join('\n')

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Estrategias Inmunización</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #1B1F24; background-color: #FFFFFF; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
    th, td { padding: 8px 12px; font-size: 10pt; }
    .title-banner { background-color: #1F4E79; color: #FFFFFF; font-size: 16pt; font-weight: bold; text-align: left; padding: 14px 12px; }
    .subtitle-banner { background-color: #2F669A; color: #E2E8F0; font-size: 10pt; font-style: italic; padding: 6px 12px; }
    .th-col { background-color: #334155; color: #FFFFFF; font-weight: bold; text-align: right; border: 1px solid #1E293B; }
    .th-col-left { background-color: #334155; color: #FFFFFF; font-weight: bold; text-align: left; border: 1px solid #1E293B; }
    .num-dec { mso-number-format:"0.00"; text-align: right; }
    .num-int { mso-number-format:"#,##0"; text-align: right; }
    .num-pct { mso-number-format:"0.0%"; text-align: right; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="7" class="title-banner">SIR-Net Lab · Comparativa de Estrategias de Inmunización</td>
    </tr>
    <tr>
      <td colspan="7" class="subtitle-banner">Generado: ${dateStr} · Topología de Red: ${report.topology ?? 'Red Compleja'}</td>
    </tr>
  </table>
  <table>
    <thead>
      <tr>
        <th class="th-col-left">Estrategia</th>
        <th class="th-col">Nodos Inmunizados</th>
        <th class="th-col">Pico Infectados (I_max)</th>
        <th class="th-col">Tiempo al Pico (días)</th>
        <th class="th-col">Infectados Totales</th>
        <th class="th-col">Tasa de Ataque</th>
        <th class="th-col">Reducción del Brote (%)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`
}
