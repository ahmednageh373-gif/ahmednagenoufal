from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')

base_url = 'https://3000-i8ngr18dc7uqtnynq0d23-b9b802c4.sandbox.novita.ai'

try:
    driver = webdriver.Chrome(options=chrome_options)
    driver.set_window_size(1920, 1080)
    
    print('📸 Opening main page...')
    driver.get(base_url)
    time.sleep(5)
    
    driver.save_screenshot('/tmp/screenshot_main.png')
    print('✅ Main page screenshot saved: /tmp/screenshot_main.png')
    
    driver.quit()
    print('✅ Done!')
    
except Exception as e:
    print(f'❌ Error: {e}')
