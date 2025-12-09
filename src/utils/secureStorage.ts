/**
 * Secure Storage Utility
 * حماية البيانات المخزنة في localStorage
 */

// مفتاح التشفير (يجب تغييره لكل مستخدم)
const ENCRYPTION_KEY = 'AN_AI_SECURE_KEY_2024';

/**
 * تشفير البيانات باستخدام Base64 + XOR
 */
function encrypt(data: string): string {
  try {
    // Convert to Base64 first
    const base64 = btoa(encodeURIComponent(data));
    
    // XOR encryption with key
    let encrypted = '';
    for (let i = 0; i < base64.length; i++) {
      const charCode = base64.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      encrypted += String.fromCharCode(charCode);
    }
    
    // Base64 encode again
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    return data; // Fallback to unencrypted
  }
}

/**
 * فك تشفير البيانات
 */
function decrypt(encryptedData: string): string {
  try {
    // Decode from Base64
    const decoded = atob(encryptedData);
    
    // XOR decryption
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    
    // Decode from Base64
    return decodeURIComponent(atob(decrypted));
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData; // Fallback to encrypted data
  }
}

/**
 * حفظ بيانات مشفرة في localStorage
 */
export function secureSetItem(key: string, value: any): void {
  try {
    const jsonString = JSON.stringify(value);
    const encrypted = encrypt(jsonString);
    
    // Add timestamp and checksum
    const dataWithMetadata = {
      data: encrypted,
      timestamp: Date.now(),
      checksum: generateChecksum(encrypted)
    };
    
    localStorage.setItem(key, JSON.stringify(dataWithMetadata));
  } catch (error) {
    console.error('secureSetItem error:', error);
    // Fallback to regular localStorage
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * قراءة بيانات مشفرة من localStorage
 */
export function secureGetItem<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const metadata = JSON.parse(stored);
    
    // Verify checksum
    if (metadata.checksum !== generateChecksum(metadata.data)) {
      console.warn('Data integrity check failed for key:', key);
      return defaultValue;
    }
    
    const decrypted = decrypt(metadata.data);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error('secureGetItem error:', error);
    // Fallback to regular localStorage
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
}

/**
 * حذف عنصر من localStorage
 */
export function secureRemoveItem(key: string): void {
  localStorage.removeItem(key);
}

/**
 * مسح كل البيانات
 */
export function secureClear(): void {
  localStorage.clear();
}

/**
 * توليد checksum للتحقق من سلامة البيانات
 */
function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * التحقق من صلاحية البيانات (عمرها)
 */
export function isDataExpired(key: string, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): boolean {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return true;
    
    const metadata = JSON.parse(stored);
    const age = Date.now() - metadata.timestamp;
    
    return age > maxAgeMs;
  } catch {
    return true;
  }
}

/**
 * تنظيف البيانات القديمة
 */
export function cleanupOldData(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): void {
  const keys = Object.keys(localStorage);
  
  for (const key of keys) {
    if (isDataExpired(key, maxAgeMs)) {
      secureRemoveItem(key);
      console.log('Removed expired data:', key);
    }
  }
}

/**
 * تصدير البيانات (للنسخ الاحتياطي)
 */
export function exportSecureData(): string {
  const allData: Record<string, any> = {};
  const keys = Object.keys(localStorage);
  
  for (const key of keys) {
    try {
      allData[key] = secureGetItem(key);
    } catch (error) {
      console.error('Error exporting key:', key, error);
    }
  }
  
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    data: allData
  }, null, 2);
}

/**
 * استيراد البيانات (من النسخ الاحتياطي)
 */
export function importSecureData(jsonString: string): boolean {
  try {
    const imported = JSON.parse(jsonString);
    
    if (!imported.data) {
      throw new Error('Invalid import format');
    }
    
    for (const [key, value] of Object.entries(imported.data)) {
      secureSetItem(key, value);
    }
    
    console.log('Data imported successfully from:', imported.exportDate);
    return true;
  } catch (error) {
    console.error('Import error:', error);
    return false;
  }
}
