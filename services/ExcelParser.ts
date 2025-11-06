/**
 * Excel Parser - قارئ ملفات Excel المتقدم
 * يقرأ ملفات Excel مع المواصفات التفصيلية
 */

import { FinancialItem } from '../types';

declare var XLSX: any;

export interface ParsedBOQItem {
    serialNumber: string;
    category: string;
    itemName: string;
    description: string;
    specifications: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export class ExcelParser {
    /**
     * قراءة ملف Excel مع المواصفات الكاملة
     */
    static parseExcelWithSpecs(file: File): Promise<ParsedBOQItem[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                    const items: ParsedBOQItem[] = [];

                    // البحث عن صف العناوين
                    let headerRow = -1;
                    for (let i = 0; i < Math.min(20, json.length); i++) {
                        const row = json[i];
                        const rowText = row.join(' ').toLowerCase();
                        
                        // البحث عن العناوين الأساسية
                        // يجب أن يحتوي الصف على "رقم" أو "تسلسل" AND "بند"
                        if ((rowText.includes('رقم') || rowText.includes('تسلسل')) && 
                            rowText.includes('بند')) {
                            headerRow = i;
                            console.log(`✓ وجدت صف العناوين في السطر ${i + 1}`);
                            console.log(`محتوى الصف:`, row.filter((c: any) => c).slice(0, 10));
                            break;
                        }
                    }

                    if (headerRow === -1) {
                        throw new Error('لم يتم العثور على صف العناوين في الملف');
                    }

                    console.log(`✓ تم العثور على العناوين في السطر ${headerRow + 1}`);

                    // تحديد مواقع الأعمدة
                    const headers = json[headerRow];
                    const columnMap: { [key: string]: number } = {};

                    for (let col = 0; col < headers.length; col++) {
                        const header = String(headers[col]).toLowerCase().trim();
                        
                        // تحسين البحث عن الأعمدة
                        if ((header.includes('رقم') && header.includes('تسلسل')) || header === 'الرقم التسلسلي') {
                            columnMap['serialNumber'] = col;
                        } else if (header.includes('فئة') || header.includes('category')) {
                            columnMap['category'] = col;
                        } else if (header === 'البند' || header.includes('item name') || header === 'item') {
                            columnMap['itemName'] = col;
                        } else if (header.includes('وصف البند') || header.includes('وصف') || header.includes('description')) {
                            columnMap['description'] = col;
                        } else if (header === 'المواصفات' || header.includes('مواصفات') || header.includes('specification')) {
                            columnMap['specifications'] = col;
                        } else if (header.includes('وحدة') || header.includes('unit')) {
                            columnMap['unit'] = col;
                        } else if (header.includes('كمية') || header.includes('quantity')) {
                            columnMap['quantity'] = col;
                        } else if (header.includes('سعر') || header === 'سعر الوحدة' || header.includes('unit price')) {
                            // تحقق من أنه ليس "سعر الوحدة" المكرر في عمود مختلف
                            if (columnMap['unitPrice'] === undefined) {
                                columnMap['unitPrice'] = col;
                            }
                        } else if (header.includes('إجمالي') || header.includes('total')) {
                            if (columnMap['total'] === undefined) {  // first total column
                                columnMap['total'] = col;
                            }
                        }
                    }

                    console.log('✅ خريطة الأعمدة:', columnMap);
                    console.log('📊 العناوين المكتشفة:', {
                        serialNumber: columnMap['serialNumber'] !== undefined ? `العمود ${columnMap['serialNumber'] + 1}` : 'غير موجود',
                        category: columnMap['category'] !== undefined ? `العمود ${columnMap['category'] + 1}` : 'غير موجود',
                        itemName: columnMap['itemName'] !== undefined ? `العمود ${columnMap['itemName'] + 1}` : 'غير موجود',
                        description: columnMap['description'] !== undefined ? `العمود ${columnMap['description'] + 1}` : 'غير موجود',
                        specifications: columnMap['specifications'] !== undefined ? `العمود ${columnMap['specifications'] + 1}` : 'غير موجود',
                        unit: columnMap['unit'] !== undefined ? `العمود ${columnMap['unit'] + 1}` : 'غير موجود',
                        quantity: columnMap['quantity'] !== undefined ? `العمود ${columnMap['quantity'] + 1}` : 'غير موجود',
                        unitPrice: columnMap['unitPrice'] !== undefined ? `العمود ${columnMap['unitPrice'] + 1}` : 'غير موجود'
                    });

                    // التحقق من وجود الأعمدة الأساسية
                    if (columnMap['serialNumber'] === undefined || columnMap['itemName'] === undefined) {
                        const missing = [];
                        if (columnMap['serialNumber'] === undefined) missing.push('الرقم التسلسلي');
                        if (columnMap['itemName'] === undefined) missing.push('البند');
                        throw new Error(`لم يتم العثور على الأعمدة الأساسية: ${missing.join(', ')}\n\nالعناوين الموجودة: ${headers.filter((h: any) => h).join(', ')}`);
                    }

                    // قراءة البيانات
                    for (let i = headerRow + 1; i < json.length; i++) {
                        const row = json[i];
                        
                        const serialNumber = String(row[columnMap['serialNumber']] || '').trim();
                        const itemName = String(row[columnMap['itemName']] || '').trim();
                        
                        // تجاهل الأسطر الفارغة أو صفوف العناوين المكررة
                        if (!serialNumber || !itemName || 
                            serialNumber === 'الرقم التسلسلي' || 
                            itemName === 'البند') {
                            continue;
                        }

                        const category = String(row[columnMap['category']] || '').trim();
                        const description = columnMap['description'] !== undefined 
                            ? String(row[columnMap['description']] || '').trim() 
                            : '';
                        const specifications = columnMap['specifications'] !== undefined 
                            ? String(row[columnMap['specifications']] || '').trim() 
                            : '';
                        const unit = columnMap['unit'] !== undefined 
                            ? String(row[columnMap['unit']] || '').trim() 
                            : '';
                        const quantity = columnMap['quantity'] !== undefined 
                            ? this.parseNumber(row[columnMap['quantity']]) 
                            : 0;
                        const unitPrice = columnMap['unitPrice'] !== undefined 
                            ? this.parseNumber(row[columnMap['unitPrice']]) 
                            : 0;
                        const total = columnMap['total'] !== undefined 
                            ? this.parseNumber(row[columnMap['total']]) || (quantity * unitPrice)
                            : (quantity * unitPrice);

                        if (itemName && quantity > 0) {
                            items.push({
                                serialNumber,
                                category,
                                itemName,
                                description,
                                // استخدام المواصفات إذا كانت موجودة، وإلا الوصف، وإلا اسم البند
                                specifications: specifications || description || itemName,
                                unit,
                                quantity,
                                unitPrice,
                                total
                            });
                        }
                    }

                    if (items.length === 0) {
                        throw new Error('لم يتم العثور على بنود صالحة في الملف');
                    }

                    console.log(`✅ تم قراءة ${items.length} بند بنجاح`);
                    resolve(items);

                } catch (error: any) {
                    console.error('خطأ في تحليل الملف:', error);
                    reject(new Error(`فشل في تحليل ملف Excel: ${error.message}`));
                }
            };

            reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * تحويل النص إلى رقم
     */
    private static parseNumber(value: any): number {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            // إزالة الفواصل والرموز
            const cleaned = value.replace(/[,،\s]/g, '');
            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
        }
        return 0;
    }

    /**
     * تحويل ParsedBOQItem إلى FinancialItem
     */
    static convertToFinancialItems(parsedItems: ParsedBOQItem[]): FinancialItem[] {
        return parsedItems.map(item => ({
            id: `BOQ-${item.serialNumber}`,
            item: item.itemName,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
        }));
    }
}

export default ExcelParser;
