/**
 * @fileoverview Componente de cabecera principal (SIR-Net Lab).
 *
 * Incluye logo, navegación principal, conmutador de tema y enlace a GitHub.
 * Maneja menú hamburguesa en móvil (≤ 768px).
 */

import { toggleTheme, getActiveTheme } from '../theme.ts'

/** Enlace de navegación. */
interface NavLink {
  label: string
  href: string
}

const NAV_LINKS: NavLink[] = [
  { label: 'Inicio', href: '#/' },
  { label: 'Simulador', href: '#/simulator' },
  { label: 'Red', href: '#/network' },
  { label: 'Control', href: '#/control' },
  { label: 'Calibración', href: '#/calibration' },
  { label: 'Sensibilidad', href: '#/sensitivity' },
  { label: 'Teoría', href: '#/theory' },
  { label: 'Reto', href: '#/challenge' },
  { label: 'Acerca', href: '#/about' },
]

/** Actualiza el texto/ícono del botón de tema según el tema activo. */
function updateThemeButton(btn: HTMLButtonElement): void {
  const isDark = getActiveTheme() === 'dark'
  btn.textContent = isDark ? '☀️' : '🌙'
  btn.setAttribute('aria-label', isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro')
}

/**
 * Crea y retorna el elemento `<header>` de la aplicación.
 */
export function createAppHeader(): HTMLElement {
  const header = document.createElement('header')
  header.id = 'site-header'
  header.setAttribute('role', 'banner')

  header.innerHTML = `
    <div class="header-inner">
      <a href="#/" class="header-logo" aria-label="SIR-Net Lab — inicio">
        <span class="header-logo__icon" aria-hidden="true">🧬</span>
        <span class="header-logo__text">SIR-Net Lab</span>
      </a>

      <button
        class="header-menu-btn btn btn--ghost"
        aria-label="Abrir menú de navegación"
        aria-expanded="false"
        aria-controls="main-nav"
        id="menu-toggle"
        hidden
      >☰</button>

      <nav id="main-nav" role="navigation" aria-label="Navegación principal">
        <ul class="header-nav__list" role="list">
          ${NAV_LINKS.map(
            (link) => `<li><a href="${link.href}" class="header-nav__link">${link.label}</a></li>`
          ).join('')}
        </ul>
      </nav>

      <div class="header-actions">
        <button
          class="btn btn--ghost header-theme-btn"
          id="theme-toggle"
          aria-label="Cambiar tema"
          type="button"
        >🌙</button>

        <a
          href="https://github.com/Sebasr0311/SIR-Net-Lab"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn--ghost header-github-link"
          aria-label="Ver repositorio en GitHub (abre en nueva pestaña)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  `

  // Inyectar estilos del header
  const style = document.createElement('style')
  style.textContent = `
    #site-header {
      position: sticky;
      top: 0;
      z-index: 200;
      background: var(--surface);
      border-bottom: 1px solid var(--line);
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
    }
    .header-inner {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--space-6);
      height: 56px;
    }
    .header-logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 700;
      font-size: var(--step-1);
      color: var(--ink);
      text-decoration: none;
      white-space: nowrap;
    }
    .header-logo:hover { color: var(--accent); }
    .header-logo__icon { font-size: 1.4rem; }

    .header-nav__list {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      list-style: none;
      flex-wrap: wrap;
    }
    .header-nav__link {
      display: block;
      padding: var(--space-2) var(--space-3);
      border-radius: 6px;
      font-size: var(--step--1);
      color: var(--ink-2);
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.12s, color 0.12s;
    }
    .header-nav__link:hover,
    .header-nav__link[aria-current="page"] {
      background: var(--line);
      color: var(--ink);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-left: auto;
    }
    .header-theme-btn,
    .header-github-link {
      font-size: var(--step--1);
    }
    .header-menu-btn {
      display: none;
    }

    @media (max-width: 768px) {
      .header-menu-btn { display: flex !important; }
      #main-nav {
        position: fixed;
        top: 56px;
        left: 0;
        right: 0;
        background: var(--surface);
        border-bottom: 1px solid var(--line);
        padding: var(--space-4) var(--space-6);
        display: none;
        z-index: 199;
        box-shadow: var(--shadow);
      }
      #main-nav.is-open { display: block; }
      .header-nav__list { flex-direction: column; align-items: flex-start; }
      .header-nav__link { width: 100%; padding: var(--space-3) var(--space-4); }
    }
  `
  document.head.appendChild(style)

  // Botón de tema
  const themeBtn = header.querySelector<HTMLButtonElement>('#theme-toggle')
  if (themeBtn) {
    updateThemeButton(themeBtn)
    themeBtn.addEventListener('click', () => {
      toggleTheme()
      updateThemeButton(themeBtn)
    })
  }

  // Menú hamburguesa
  const menuToggle = header.querySelector<HTMLButtonElement>('#menu-toggle')
  const nav = header.querySelector<HTMLElement>('#main-nav')

  if (menuToggle && nav) {
    // Mostrar botón hamburguesa en móvil
    menuToggle.hidden = false

    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('is-open')
      nav.classList.toggle('is-open', !isOpen)
      menuToggle.setAttribute('aria-expanded', String(!isOpen))
      menuToggle.setAttribute(
        'aria-label',
        isOpen ? 'Abrir menú de navegación' : 'Cerrar menú de navegación'
      )
    })

    // Cerrar al navegar
    nav.querySelectorAll('.header-nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open')
        menuToggle.setAttribute('aria-expanded', 'false')
        menuToggle.setAttribute('aria-label', 'Abrir menú de navegación')
      })
    })
  }

  // Resaltar enlace activo según el hash actual
  function updateActiveLink(): void {
    const currentHash = window.location.hash || '#/'
    header.querySelectorAll<HTMLAnchorElement>('.header-nav__link').forEach((a) => {
      if (a.getAttribute('href') === currentHash) {
        a.setAttribute('aria-current', 'page')
      } else {
        a.removeAttribute('aria-current')
      }
    })
  }

  updateActiveLink()
  window.addEventListener('hashchange', updateActiveLink)

  return header
}
