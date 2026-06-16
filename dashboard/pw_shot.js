const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  const BASE = "c:\\Users\\ryan.e\\Documents\\world_cup_2026_prediction\\dashboard\\src\\assets";

  await page.goto("http://localhost:5173", { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(2500);

  // 1. Title Odds (default)
  await page.screenshot({ path: BASE + "\\screenshot-predictions.png" });

  // 2. Groups
  await page.click("button:text('Groups')");
  await page.waitForTimeout(900);
  await page.screenshot({ path: BASE + "\\screenshot-groups.png" });

  // 3. Match Predictor - click Predict to load result
  await page.click("button:text('Match Predictor')");
  await page.waitForTimeout(400);
  await page.click(".predict-btn");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: BASE + "\\screenshot-match.png" });

  // 4. Tournament Sim
  await page.click("button:text('Simulate Tournament')");
  await page.waitForTimeout(400);
  await page.click(".sim-btn");
  await page.waitForTimeout(4000);
  await page.screenshot({ path: BASE + "\\screenshot-tournament.png" });

  // 5. Team Ratings
  await page.click("button:text('Team Ratings')");
  await page.waitForTimeout(900);
  await page.screenshot({ path: BASE + "\\screenshot-ratings.png" });

  // Hero / dashboard-screenshot (full page, predictions tab)
  await page.click("button:text('Title Odds')");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: BASE + "\\dashboard-screenshot.png", fullPage: true });

  await browser.close();
  console.log("ALL SCREENSHOTS DONE");
})();
