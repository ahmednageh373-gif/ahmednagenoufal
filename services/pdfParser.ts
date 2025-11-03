/**
 * PDF Parser Service
 * قارئ ملفات PDF لاستخراج بنود المقايسة
 */

import type { FinancialItem } from '../types';

export interface PDFParseResult {
  success: boolean;
  items: FinancialItem[];
  rawText?: string;
  error?: string;
}

/**
 * استخراج بنود المقايسة من ملف PDF
 */
export async function parsePDFFile(file: File): Promise<PDFParseResult> {
  try {
    console.log('📄 Parsing PDF file:', file.name);
    
    // قراءة الملف كـ ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // استخدام pdfjs-dist لاستخراج النص
    const pdfjsLib = await import('pdfjs-dist');
    
    // تعيين worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    // تحميل PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log(`📄 PDF loaded: ${pdf.numPages} pages`);
    
    // استخراج النص من جميع الصفحات
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('✅ PDF text extracted:', fullText.length, 'characters');
    
    // تحليل النص لاستخراج البنود
    const items = extractItemsFromText(fullText);
    
    return {
      success: true,
      items,
      rawText: fullText
    };
  } catch (error) {
    console.error('❌ PDF parsing error:', error);
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * استخراج البنود من النص المستخرج
 */
function extractItemsFromText(text: string): FinancialItem[] {
  const items: FinancialItem[] = [];
  
  // تقسيم النص إلى أسطر
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // البحث عن أنماط البنود
  // نمط 1: رقم | وصف | كمية | وحدة | سعر | إجمالي
  const patterns = [
    // نمط جدول منظم
    /^(\d+)\s+(.+?)\s+(\d+\.?\d*)\s+(م[²³]?|طن|عدد|كجم|مط)\s+(\d+\.?\d*)\s+(\d+\.?\d*)$/,
    // نمط مرن
    /(\d+)[.\s]+(.+?)\s+(\d+\.?\d*)\s+(م[²³]?|طن|عدد|كجم|مط)/
  ];
  
  let currentCategory = 'عام';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // التحقق من وجود فئة جديدة
    if (isCategory(line)) {
      currentCategory = line;
      continue;
    }
    
    // محاولة مطابقة أنماط البنود
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const [, itemNo, description, quantity, unit, price, total] = match;
        
        const item: FinancialItem = {
          id: itemNo || `item-${items.length + 1}`,
          itemNumber: itemNo || '',
          description: description.trim(),
          quantity: parseFloat(quantity),
          unit: unit,
          unitPrice: parseFloat(price || '0'),
          totalPrice: parseFloat(total || '0') || (parseFloat(quantity) * parseFloat(price || '0')),
          category: currentCategory
        };
        
        // التحقق من صحة البيانات
        if (item.quantity > 0 && item.description.length > 0) {
          items.push(item);
        }
        
        break;
      }
    }
  }
  
  console.log(`✅ Extracted ${items.length} items from PDF`);
  return items;
}

/**
 * التحقق من أن السطر يمثل فئة
 */
function isCategory(line: string): boolean {
  const categoryPatterns = [
    /^الباب\s+/,
    /^الفصل\s+/,
    /^القسم\s+/,
    /^أعمال\s+/,
    /^Chapter\s+/i,
    /^Section\s+/i
  ];
  
  return categoryPatterns.some(pattern => pattern.test(line));
}

/**
 * محاولة استخراج الجداول من PDF
 */
export async function extractTablesFromPDF(file: File): Promise<PDFParseResult> {
  try {
    console.log('📊 Extracting tables from PDF:', file.name);
    
    // استخدام نفس منطق parsePDFFile لكن مع تركيز على الجداول
    const result = await parsePDFFile(file);
    
    if (result.success && result.items.length === 0 && result.rawText) {
      // محاولة تحليل أكثر ذكاءً
      const smartItems = smartExtractItems(result.rawText);
      return {
        success: true,
        items: smartItems,
        rawText: result.rawText
      };
    }
    
    return result;
  } catch (error) {
    console.error('❌ Table extraction error:', error);
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * استخراج ذكي للبنود باستخدام تحليل سياقي
 */
function smartExtractItems(text: string): FinancialItem[] {
  const items: FinancialItem[] = [];
  
  // تقسيم النص إلى كتل
  const blocks = text.split(/\n\s*\n/);
  
  let itemNumber = 1;
  let currentCategory = 'عام';
  
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length === 0) continue;
    
    // محاولة اكتشاف الفئة
    if (isCategory(lines[0])) {
      currentCategory = lines[0];
      continue;
    }
    
    // محاولة بناء بند من الكتلة
    const description = lines.find(l => l.length > 10 && !/^\d+\.?\d*$/.test(l));
    const numbers = lines.filter(l => /^\d+\.?\d*$/.test(l)).map(n => parseFloat(n));
    const units = lines.filter(l => /^(م[²³]?|طن|عدد|كجم|مط)$/i.test(l));
    
    if (description && numbers.length >= 1) {
      const item: FinancialItem = {
        id: `item-${itemNumber}`,
        itemNumber: String(itemNumber),
        description: description,
        quantity: numbers[0] || 0,
        unit: units[0] || 'عدد',
        unitPrice: numbers[1] || 0,
        totalPrice: numbers[2] || (numbers[0] * (numbers[1] || 0)),
        category: currentCategory
      };
      
      if (item.quantity > 0) {
        items.push(item);
        itemNumber++;
      }
    }
  }
  
  console.log(`✅ Smart extraction: ${items.length} items`);
  return items;
}

/**
 * محاولة استخراج بيانات منظمة من PDF باستخدام مكتبة pdf-parse
 */
export async function parsePDFWithPdfParse(file: File): Promise<PDFParseResult> {
  try {
    console.log('📄 Parsing PDF with pdf-parse:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // استيراد pdf-parse
    const pdfParse = (await import('pdf-parse')).default;
    
    // استخراج البيانات
    const data = await pdfParse(buffer);
    
    console.log('✅ PDF parsed:', data.numpages, 'pages,', data.text.length, 'characters');
    
    // استخراج البنود
    const items = extractItemsFromText(data.text);
    
    return {
      success: true,
      items,
      rawText: data.text
    };
  } catch (error) {
    console.error('❌ pdf-parse error:', error);
    // التراجع إلى pdfjs-dist
    return parsePDFFile(file);
  }
}
