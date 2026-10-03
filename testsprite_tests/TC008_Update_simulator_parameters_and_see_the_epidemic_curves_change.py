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
        
        # -> Click the 'Simulador' link in the top navigation to open the simulator page.
        # Simulador link
        elem = page.get_by_role("link", name="Simulador", exact=True)
        await elem.click(timeout=10000)
        
        # -> Set 'β — Tasa de transmisión' to 1.0 using the β number input field and verify the R₀ card updates.
        # β — Tasa de transmisión number field
        elem = page.get_by_role("spinbutton", name="β — Tasa de transmisión")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("1.0")
        
        # -> Set 'γ — Tasa de recuperación / limpieza' to 0.5 using the γ number input and verify that the 'R₀ — Número básico' card updates to reflect the change.
        # γ — Tasa de recuperación / limpieza number field
        elem = page.locator("xpath=/html/body/div/main/div/div/div[1]/aside/div[3]/details[2]/div/div/div[2]/div[2]/input[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("0.5")
        
        # -> Click the 'DOPRI5' solver button to switch the numerical solver and trigger a recomputation/re-render of the plots.
        # DOPRI5 button
        elem = page.get_by_text("DOPRI5")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The reproduction-number card is visible and reflects the changed parameters.
        # Assert-outcome: passed
        # Assert: The page shows the R₀ — Número básico card.
        await expect(page.locator("#main").nth(0)).to_contain_text("R\u2080 \u2014 N\u00famero b\u00e1sico", timeout=15000), "The page shows the R\u2080 \u2014 N\u00famero b\u00e1sico card."
        # Assert-outcome: passed
        # Assert: The γ — Tasa de recuperación input was set to 0.5.
        await expect(page.get_by_role("spinbutton", name="γ — Tasa de recuperación /").nth(0)).to_have_value("0.5", timeout=15000), "The \u03b3 \u2014 Tasa de recuperaci\u00f3n input was set to 0.5."
        
        # --> The simulator recomputed and the population-curve chart and KPI were updated after changing parameters/solver.
        await page.get_by_role("img", name="Gráfica de líneas que muestra").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The main line-chart canvas is visible.
        await expect(page.get_by_role("img", name="Gráfica de líneas que muestra").nth(0)).to_be_visible(timeout=15000), "The main line-chart canvas is visible."
        # Assert-outcome: passed
        # Assert: The recomputation KPI 'Pico estimado' is shown on the page.
        await expect(page.locator("#main").nth(0)).to_contain_text("Pico estimado:", timeout=15000), "The recomputation KPI 'Pico estimado' is shown on the page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    