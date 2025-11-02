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
                        
                        if (rowText.includes('الرقم') && 
                            rowText.includes('البند') && 
                            rowText.includes('المواصفات')) {
                            headerRow = i;
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
                        
                        if (header.includes('رقم') || header.includes('تسلسل')) {
                            columnMap['serialNumber'] = col;
                        } else if (header.includes('فئة') || header.includes('category')) {
                            columnMap['category'] = col;
                        } else if (header === 'البند' || header === 'item') {
                            columnMap['itemName'] = col;
                        } else if (header.includes('وصف') || header.includes('description')) {
                            columnMap['description'] = col;
                        } else if (header.includes('مواصفات') || header.includes('specification')) {
                            columnMap['specifications'] = col;
                        } else if (header.includes('وحدة') || header.includes('unit')) {
                            columnMap['unit'] = col;
                        } else if (header.includes('كمية') || header.includes('quantity')) {
                            columnMap['quantity'] = col;
                        } else if (header.includes('سعر') && header.includes('وحدة')) {
                            columnMap['unitPrice'] = col;
                        } else if (header.includes('إجمالي') || header.includes('total')) {
                            if (!columnMap['total']) {  // first total column
                                columnMap['total'] = col;
                            }
                        }
                    }

                    console.log('خريطة الأعمدة:', columnMap);

                    // التحقق من وجود الأعمدة الأساسية
                    if (!columnMap['serialNumber'] || !columnMap['itemName']) {
                        throw new Error('لم يتم العثور على الأعمدة الأساسية (الرقم التسلسلي، البند)');
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
                        const description = String(row[columnMap['description']] || '').trim();
                        const specifications = String(row[columnMap['specifications']] || '').trim();
                        const unit = String(row[columnMap['unit']] || '').trim();
                        const quantity = this.parseNumber(row[columnMap['quantity']]);
                        const unitPrice = this.parseNumber(row[columnMap['unitPrice']]);
                        const total = this.parseNumber(row[columnMap['total']]) || (quantity * unitPrice);

                        if (itemName && quantity > 0) {
                            items.push({
                                serialNumber,
                                category,
                                itemName,
                                description,
                                specifications: specifications || description,  // إذا لم توجد مواصفات نستخدم الوصف
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
