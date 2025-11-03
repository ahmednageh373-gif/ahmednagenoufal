const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const baseUrl = 'https://3000-i8ngr18dc7uqtnynq0d23-b9b802c4.sandbox.novita.ai';
  
  console.log('📸 Capturing screenshots...');
  
  // Main Dashboard
  await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/screenshot_dashboard.png', fullPage: true });
  console.log('✅ Dashboard screenshot saved');
  
  await browser.close();
  console.log('✅ All screenshots captured!');
})();
