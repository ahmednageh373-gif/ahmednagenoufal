const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Opening application...');
    await page.goto('http://localhost:5176', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('✅ Page loaded successfully');
    console.log('📄 Title:', await page.title());
    
    // Wait for sidebar
    await page.waitForSelector('.sidebar', { timeout: 10000 });
    console.log('✅ Sidebar found');
    
    // Take screenshot of main page
    await page.screenshot({ path: 'screenshot_main.png', fullPage: true });
    console.log('📸 Screenshot saved: screenshot_main.png');
    
    // Click on TCI menu item
    console.log('🔍 Looking for TCI menu item...');
    const tciButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tciBtn = buttons.find(btn => btn.textContent.includes('ربط المقايسات بالجدول'));
      if (tciBtn) {
        tciBtn.click();
        return true;
      }
      return false;
    });
    
    if (tciButton) {
      console.log('✅ TCI button clicked');
      
      // Wait for TCI component to load
      await page.waitForTimeout(2000);
      
      // Take screenshot of TCI page
      await page.screenshot({ path: 'screenshot_tci.png', fullPage: true });
      console.log('📸 TCI screenshot saved: screenshot_tci.png');
      
      // Get page content
      const content = await page.evaluate(() => {
        const stats = Array.from(document.querySelectorAll('.bg-blue-500, .bg-green-500, .bg-red-500'))
          .map(el => el.textContent.trim());
        return { stats };
      });
      
      console.log('📊 TCI Statistics:', content);
      console.log('✅ TCI Component loaded successfully!');
    } else {
      console.log('❌ TCI button not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
