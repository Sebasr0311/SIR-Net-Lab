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
        
        # -> Click the '🚀 Abrir Simulador EDO' link in the hero area to open the simulator page.
        # 🚀 Abrir Simulador EDO link
        elem = page.get_by_role("link", name="🚀 Abrir Simulador EDO")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The simulator route loaded in the browser (navigated to the simulator URL).
        # Assert-outcome: passed
        # Assert: The page URL includes the simulator route fragment '#/simulator'.
        await expect(page).to_have_url(re.compile("\\#/simulator"), timeout=15000), "The page URL includes the simulator route fragment '#/simulator'."
        
        # --> The simulation visualization (line chart canvas) is displayed on the simulator page.
        await page.get_by_role("img", name="Gráfica de líneas que muestra").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The simulator's line chart canvas is visible on the page.
        await expect(page.get_by_role("img", name="Gráfica de líneas que muestra").nth(0)).to_be_visible(timeout=15000), "The simulator's line chart canvas is visible on the page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    