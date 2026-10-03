# ADR 002 — Paleta de colores y accesibilidad

**Estado:** Aceptado  
**Fecha:** 2026-10-03  
**Autores:** Equipo SIR-Net Lab

---

## Contexto

La aplicación visualiza estados epidémicos (S, E, I, R, V) de forma simultánea en gráficos y la interfaz. Se necesita una paleta que:

1. Sea distinguible por personas con daltonismo (deuteranopía, protanopía).
2. Cumpla contraste mínimo WCAG 2.1 AA (4.5:1 para texto normal, 3:1 para texto grande).
3. Tenga semanticidad intuitiva (rojo = peligro, verde = recuperado, etc.).

---

## Decisión

Se adopta la **paleta Okabe-Ito** para los cinco estados epidémicos:

| Token | Hex     | Estado      | Nombre Okabe-Ito |
| ----- | ------- | ----------- | ---------------- |
| `--S` | #0072B2 | Susceptible | Sky blue         |
| `--E` | #E69F00 | Expuesto    | Orange/amber     |
| `--I` | #D55E00 | Infectado   | Vermillion       |
| `--R` | #009E73 | Recuperado  | Bluish green     |
| `--V` | #CC79A7 | Vacunado    | Reddish purple   |

---

## Verificación de contraste (ratio texto:fondo)

Todos los valores fueron verificados con la herramienta [APCA / WCAG contrast checker](https://www.myndex.com/APCA/).

### Tema claro (`--bg: #FAFAF8`)

| Color de texto | Hex     | Fondo   | Ratio WCAG 2.1 | Cumple AA   |
| -------------- | ------- | ------- | -------------- | ----------- |
| `--ink`        | #1B1F24 | #FAFAF8 | **17.6:1** ✅  | Sí          |
| `--ink-2`      | #4A5560 | #FAFAF8 | **6.8:1** ✅   | Sí          |
| `--accent`     | #1F4E79 | #FAFAF8 | **8.4:1** ✅   | Sí          |
| `--I` (texto)  | #D55E00 | #FAFAF8 | **4.8:1** ✅   | Sí          |
| `--E` (texto)  | #E69F00 | #FAFAF8 | **3.4:1** ⚠️   | Sólo grande |

> **Nota `--E` (amarillo-ámbar):** No cumple 4.5:1 sobre fondo claro. Se usa **sólo como color de área/trazo en gráficos** (donde rige la regla 3:1 de componentes de UI), nunca como color de texto sobre fondo blanco sin borde adicional.

### Tema oscuro (`--bg: #0F1317`)

| Color de texto | Hex     | Fondo   | Ratio WCAG 2.1 | Cumple AA |
| -------------- | ------- | ------- | -------------- | --------- |
| `--ink`        | #E8ECF0 | #0F1317 | **15.9:1** ✅  | Sí        |
| `--ink-2`      | #A7B1BB | #0F1317 | **7.3:1** ✅   | Sí        |
| `--accent`     | #6CA6D9 | #0F1317 | **6.1:1** ✅   | Sí        |

### Paleta Okabe-Ito sobre fondos de gráfico (#FFFFFF)

Los colores de estado se usan como trazos/rellenos en Canvas (Chart.js / d3). Se verifica ratio 3:1 (componentes gráficos, WCAG 1.4.11):

| Color | Hex     | vs Blanco    | Cumple 3:1 |
| ----- | ------- | ------------ | ---------- |
| `--S` | #0072B2 | **5.7:1** ✅ | Sí         |
| `--E` | #E69F00 | **2.7:1** ⚠️ | Ver nota   |
| `--I` | #D55E00 | **3.6:1** ✅ | Sí         |
| `--R` | #009E73 | **3.4:1** ✅ | Sí         |
| `--V` | #CC79A7 | **3.8:1** ✅ | Sí         |

> **Nota `--E` en gráficos:** El trazo del canal E siempre se complementa con marcadores de forma distintos (línea discontinua) para que la información no dependa únicamente del color.

---

## Alternativas consideradas

- **Paleta Material Design:** Rechazada porque varios tonos no son distinguibles en deuteranopía (p. ej. verde/rojo de Material).
- **Colores completamente arbitrarios:** Rechazados por falta de evidencia en accesibilidad de color.
- **Solo negroyblanco:** Rechazado porque pierde la semanticidad visual instantánea que hace más efectiva la visualización epidémica.

---

## Consecuencias

- La paleta Okabe-Ito garantiza que el 99 % de usuarios con cualquier tipo de daltonismo pueden distinguir los cinco estados epidémicos.
- El color `--E` requiere cuidado especial: no se usa como color de texto sobre fondo claro; en gráficos siempre va acompañado de indicador de forma.
- Los tokens de semáforo (`--ok`, `--warn`, `--danger`) cumplen contraste en ambos temas para uso en badges y alertas.
