/**
 * @fileoverview Punto de entrada de la aplicación SIR-Net Lab.
 * Inicializa el tema, monta la cabecera/pie, configura el enrutador y
 * arranca la sincronización de estado con la URL.
 */

import './ui/styles/tokens.css'
import './ui/styles/fonts.css'
import './ui/styles/base.css'
import './ui/styles/components.css'
import './ui/styles/print.css'

import { initTheme } from './ui/theme.ts'
import { createAppHeader } from './ui/components/AppHeader.ts'
import { createAppFooter } from './ui/components/AppFooter.ts'
import { Router } from './ui/router.ts'
import { initUrlState } from './state/urlState.ts'
import {
  pageHome,
  pageCalibration,
  pageSensitivity,
  pageTheory,
  pageAbout,
} from './ui/pages/placeholders.ts'
import { pageSimulator } from './ui/pages/simulator.ts'
import { pageNetwork } from './ui/pages/network.ts'
import { pageControl } from './ui/pages/control.ts'
import { pageChallenge } from './ui/pages/challenge.ts'
import { pageUiKit } from './ui/pages/uiKit.ts'

// Inicializar tema temprano para evitar destellos (FOUC)
initTheme()

// Montar la cabecera
const headerSlot = document.getElementById('site-header')
if (headerSlot) {
  const header = createAppHeader()
  headerSlot.replaceWith(header)
}

// Montar el pie de página
const footerSlot = document.getElementById('site-footer')
if (footerSlot) {
  const footer = createAppFooter()
  footerSlot.replaceWith(footer)
}

// Configurar el enrutador de hash
const router = new Router()
router.register('/', pageHome)
router.register('/simulator', pageSimulator)
router.register('/network', pageNetwork)
router.register('/control', pageControl)
router.register('/calibration', pageCalibration)
router.register('/sensitivity', pageSensitivity)
router.register('/theory', pageTheory)
router.register('/challenge', pageChallenge)
router.register('/about', pageAbout)
router.register('/ui-kit', pageUiKit)

// Inicializar sincronización bidireccional de estado con la URL
initUrlState()

// Iniciar resolución de rutas
router.start()
