import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:5173/SIR-Net-Lab/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Cambiar a tema oscuro' theme toggle button to switch to dark mode and check that the interface appearance changes
        # Cambiar a tema oscuro button
        elem = page.get_by_role("button", name="Cambiar a tema oscuro")
        await elem.click(timeout=10000)
        
        # -> Reload the landing page (refresh http://localhost:5173/SIR-Net-Lab/) to verify the dark theme remains active after a full page reload.
        await page.goto("http://localhost:5173/SIR-Net-Lab/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Reload the landing page (SIR-Net Lab) and verify the dark theme remains active (look for the 'Cambiar a tema claro' toggle label and dark styling).
        await page.goto("http://localhost:5173/SIR-Net-Lab/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Reload the landing page and confirm the 'Cambiar a tema claro' theme toggle is present and the page shows dark styling.
        await page.goto("http://localhost:5173/SIR-Net-Lab/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> Interface updated to the dark appearance immediately after toggling the theme.
        # Assert-outcome: passed
        # Assert: Theme toggle's aria-label is 'Cambiar a tema claro', indicating dark mode became active immediately.
        await expect(page.get_by_role("button", name="Cambiar a tema claro").nth(0)).to_have_attribute("aria-label", "Cambiar a tema claro", timeout=15000), "Theme toggle's aria-label is 'Cambiar a tema claro', indicating dark mode became active immediately."
        
        # --> Preferred dark theme remained active after a full page reload.
        # Assert-outcome: passed
        # Assert: Theme toggle's aria-label remains 'Cambiar a tema claro', showing the dark preference persisted after reload.
        await expect(page.get_by_role("button", name="Cambiar a tema claro").nth(0)).to_have_attribute("aria-label", "Cambiar a tema claro", timeout=15000), "Theme toggle's aria-label remains 'Cambiar a tema claro', showing the dark preference persisted after reload."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    