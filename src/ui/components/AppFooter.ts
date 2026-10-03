/**
 * @fileoverview Componente de pie de página (SIR-Net Lab).
 *
 * Muestra aviso legal, créditos y año de publicación.
 */

/**
 * Crea y retorna el elemento `<footer>` de la aplicación.
 */
export function createAppFooter(): HTMLElement {
  const currentYear = new Date().getFullYear()

  const footer = document.createElement('footer')
  footer.id = 'site-footer'
  footer.setAttribute('role', 'contentinfo')

  footer.innerHTML = `
    <div class="footer-inner">
      <p class="footer-disclaimer">
        ⚠️ <strong>Aviso:</strong> Modelo matemático con datos hipotéticos.
        No contiene código malicioso. Sólo con fines educativos.
      </p>
      <p class="footer-credits">
        SIR-Net Lab &copy; ${currentYear} &mdash;
        <a href="https://github.com/Sebasr0311/SIR-Net-Lab" target="_blank" rel="noopener noreferrer">
          Sebastián R.
        </a>
        &mdash; MIT License
      </p>
    </div>
  `

  const style = document.createElement('style')
  style.textContent = `
    #site-footer {
      border-top: 1px solid var(--line);
      background: var(--surface);
      margin-top: auto;
    }
    .footer-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      align-items: center;
      text-align: center;
    }
    .footer-disclaimer {
      font-size: var(--step--1);
      color: var(--ink-2);
    }
    .footer-credits {
      font-size: var(--step--1);
      color: var(--ink-2);
    }
    .footer-credits a {
      color: var(--accent);
    }
  `
  document.head.appendChild(style)

  return footer
}
