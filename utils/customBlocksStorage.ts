/**
 * Custom Blocks Storage using LocalStorage
 * نظام حفظ البلوكات المخصصة في المتصفح
 */

interface CustomBlock {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  dimensions: string;
  description: string;
  geometry: {
    type: 'rectangle' | 'circle' | 'polyline' | 'composite';
    width?: number;
    height?: number;
    radius?: number;
    paths?: Array<{
      type: 'line' | 'arc' | 'circle' | 'rectangle';
      points: Array<{ x: number; y: number }>;
      radius?: number;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cad-custom-blocks';

/**
 * Get all custom blocks from LocalStorage
 */
export function getCustomBlocks(): CustomBlock[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading custom blocks:', error);
    return [];
  }
}

/**
 * Save a new custom block
 */
export function saveCustomBlock(block: Omit<CustomBlock, 'id' | 'createdAt' | 'updatedAt'>): CustomBlock {
  const blocks = getCustomBlocks();
  
  const newBlock: CustomBlock = {
    ...block,
    id: `custom-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  blocks.push(newBlock);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  
  console.log(`✅ Custom block saved: ${newBlock.nameAr}`);
  return newBlock;
}

/**
 * Update an existing custom block
 */
export function updateCustomBlock(id: string, updates: Partial<Omit<CustomBlock, 'id' | 'createdAt'>>): CustomBlock | null {
  const blocks = getCustomBlocks();
  const index = blocks.findIndex(b => b.id === id);
  
  if (index === -1) {
    console.error('Block not found:', id);
    return null;
  }
  
  blocks[index] = {
    ...blocks[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  
  console.log(`✅ Custom block updated: ${blocks[index].nameAr}`);
  return blocks[index];
}

/**
 * Delete a custom block
 */
export function deleteCustomBlock(id: string): boolean {
  const blocks = getCustomBlocks();
  const filtered = blocks.filter(b => b.id !== id);
  
  if (filtered.length === blocks.length) {
    console.error('Block not found:', id);
    return false;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  
  console.log(`✅ Custom block deleted: ${id}`);
  return true;
}

/**
 * Get a specific custom block by ID
 */
export function getCustomBlockById(id: string): CustomBlock | null {
  const blocks = getCustomBlocks();
  return blocks.find(b => b.id === id) || null;
}

/**
 * Search custom blocks
 */
export function searchCustomBlocks(query: string): CustomBlock[] {
  const blocks = getCustomBlocks();
  const lowerQuery = query.toLowerCase();
  
  return blocks.filter(block =>
    block.nameAr.toLowerCase().includes(lowerQuery) ||
    block.nameEn.toLowerCase().includes(lowerQuery) ||
    block.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get custom blocks by category
 */
export function getCustomBlocksByCategory(category: string): CustomBlock[] {
  const blocks = getCustomBlocks();
  return blocks.filter(b => b.category === category);
}

/**
 * Export custom blocks to JSON file
 */
export function exportCustomBlocks(): void {
  const blocks = getCustomBlocks();
  const dataStr = JSON.stringify(blocks, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `custom-blocks-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  console.log(`✅ Custom blocks exported: ${blocks.length} blocks`);
}

/**
 * Import custom blocks from JSON file
 */
export function importCustomBlocks(file: File, overwrite: boolean = false): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedBlocks: CustomBlock[] = JSON.parse(e.target?.result as string);
        
        if (!Array.isArray(importedBlocks)) {
          throw new Error('Invalid format: Expected array of blocks');
        }
        
        let blocks = overwrite ? [] : getCustomBlocks();
        
        // Add imported blocks with new IDs to avoid conflicts
        importedBlocks.forEach(block => {
          const newBlock: CustomBlock = {
            ...block,
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          blocks.push(newBlock);
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
        
        console.log(`✅ Custom blocks imported: ${importedBlocks.length} blocks`);
        resolve(importedBlocks.length);
      } catch (error) {
        console.error('Error importing custom blocks:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Clear all custom blocks (with confirmation)
 */
export function clearCustomBlocks(): boolean {
  if (confirm('هل أنت متأكد من حذف جميع البلوكات المخصصة؟ لا يمكن التراجع عن هذا الإجراء.')) {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ All custom blocks cleared');
    return true;
  }
  return false;
}
