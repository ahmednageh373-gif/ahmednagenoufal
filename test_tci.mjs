import puppeteer from 'puppeteer';

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
    const title = await page.title();
    console.log('📄 Title:', title);
    
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
      const tciBtn = buttons.find(btn => btn.textContent.includes('ربط المقايسات بالجدول') || btn.textContent.includes('TCI'));
      if (tciBtn) {
        tciBtn.click();
        return true;
      }
      return false;
    });
    
    if (tciButton) {
      console.log('✅ TCI button clicked');
      
      // Wait for TCI component to load
      await page.waitForTimeout(3000);
      
      // Take screenshot of TCI page
      await page.screenshot({ path: 'screenshot_tci.png', fullPage: true });
      console.log('📸 TCI screenshot saved: screenshot_tci.png');
      
      // Get TCI statistics
      const content = await page.evaluate(() => {
        const h2 = document.querySelector('h2');
        const cards = Array.from(document.querySelectorAll('.rounded-lg.p-4, .rounded-lg.p-6'))
          .map(card => card.textContent.trim().substring(0, 100));
        
        return { 
          heading: h2 ? h2.textContent : 'No heading found',
          cardsCount: cards.length,
          cards: cards.slice(0, 5)
        };
      });
      
      console.log('\n📊 TCI Component Content:');
      console.log('Heading:', content.heading);
      console.log('Cards found:', content.cardsCount);
      console.log('Sample cards:', content.cards);
      console.log('\n✅ TCI Component loaded successfully!');
    } else {
      console.log('❌ TCI button not found');
      
      // List all buttons
      const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(btn => btn.textContent.trim());
      });
      console.log('Available buttons:', buttons);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await browser.close();
  }
})();
