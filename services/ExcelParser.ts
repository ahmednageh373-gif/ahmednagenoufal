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

                    // البحث عن صف العناوين (محسّن)
                    let headerRow = -1;
                    for (let i = 0; i < Math.min(30, json.length); i++) {
                        const row = json[i];
                        const rowText = row.join(' ').toLowerCase();
                        
                        // البحث عن العناوين الأساسية بمرونة أكبر
                        // يكفي وجود "رقم" أو "تسلسل" أو "م" أو "no" 
                        // AND أي من: "بند" أو "item" أو "وصف" أو "description"
                        const hasNumber = rowText.includes('رقم') || rowText.includes('تسلسل') || 
                                         rowText.includes('م') || rowText.includes('no') ||
                                         rowText.includes('serial');
                        const hasItem = rowText.includes('بند') || rowText.includes('item') || 
                                       rowText.includes('وصف') || rowText.includes('description') ||
                                       rowText.includes('اسم');
                        
                        if (hasNumber && hasItem) {
                            headerRow = i;
                            console.log(`✅ وجدت صف العناوين في السطر ${i + 1}`);
                            console.log(`محتوى الصف:`, row.filter((c: any) => c).slice(0, 15));
                            break;
                        }
                    }

                    if (headerRow === -1) {
                        // محاولة أخيرة: البحث عن أي صف يحتوي على "كمية" و "وحدة"
                        for (let i = 0; i < Math.min(30, json.length); i++) {
                            const row = json[i];
                            const rowText = row.join(' ').toLowerCase();
                            if (rowText.includes('كمية') && rowText.includes('وحدة')) {
                                headerRow = i;
                                console.log(`✅ وجدت صف العناوين (محاولة ثانية) في السطر ${i + 1}`);
                                break;
                            }
                        }
                    }

                    if (headerRow === -1) {
                        throw new Error('لم يتم العثور على صف العناوين في الملف. الرجاء التأكد من وجود عناوين الأعمدة.');
                    }

                    console.log(`✅ تم العثور على العناوين في السطر ${headerRow + 1}`);

                    // تحديد مواقع الأعمدة
                    const headers = json[headerRow];
                    const columnMap: { [key: string]: number } = {};

                    for (let col = 0; col < headers.length; col++) {
                        const header = String(headers[col]).toLowerCase().trim();
                        
                        // تحسين البحث عن الأعمدة بمرونة أكبر
                        // رقم تسلسلي
                        if (columnMap['serialNumber'] === undefined) {
                            if (header.includes('رقم') || header.includes('تسلسل') || 
                                header === 'م' || header === 'no' || header === 'serial' ||
                                header.includes('serial')) {
                                columnMap['serialNumber'] = col;
                            }
                        }
                        
                        // فئة
                        if (columnMap['category'] === undefined) {
                            if (header.includes('فئة') || header.includes('category') ||
                                header.includes('قسم') || header.includes('section')) {
                                columnMap['category'] = col;
                            }
                        }
                        
                        // اسم البند
                        if (columnMap['itemName'] === undefined) {
                            if (header === 'البند' || header.includes('بند') || 
                                header.includes('item') || header === 'اسم البند' ||
                                header.includes('name')) {
                                columnMap['itemName'] = col;
                            }
                        }
                        
                        // الوصف
                        if (columnMap['description'] === undefined) {
                            if (header.includes('وصف') || header.includes('description')) {
                                columnMap['description'] = col;
                            }
                        }
                        
                        // المواصفات
                        if (columnMap['specifications'] === undefined) {
                            if (header.includes('مواصفات') || header.includes('specification') ||
                                header.includes('specs') || header === 'المواصفات') {
                                columnMap['specifications'] = col;
                            }
                        }
                        
                        // الوحدة
                        if (columnMap['unit'] === undefined) {
                            if (header.includes('وحدة') || header.includes('unit') ||
                                header === 'الوحدة') {
                                columnMap['unit'] = col;
                            }
                        }
                        
                        // الكمية
                        if (columnMap['quantity'] === undefined) {
                            if (header.includes('كمية') || header.includes('quantity') ||
                                header.includes('qty') || header === 'الكمية') {
                                columnMap['quantity'] = col;
                            }
                        }
                        
                        // سعر الوحدة
                        if (columnMap['unitPrice'] === undefined) {
                            if (header.includes('سعر') || header.includes('unit price') ||
                                header.includes('price') || header === 'سعر الوحدة') {
                                columnMap['unitPrice'] = col;
                            }
                        }
                        
                        // الإجمالي
                        if (columnMap['total'] === undefined) {
                            if (header.includes('إجمالي') || header.includes('total') ||
                                header.includes('amount') || header === 'الإجمالي') {
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

                    // التحقق من وجود الأعمدة الأساسية (مرن)
                    // على الأقل نحتاج: (serialNumber أو itemName) AND quantity
                    if (columnMap['serialNumber'] === undefined && columnMap['itemName'] === undefined) {
                        throw new Error(`لم يتم العثور على عمود أساسي (رقم تسلسلي أو اسم البند)\n\nالعناوين الموجودة: ${headers.filter((h: any) => h).slice(0, 15).join(', ')}`);
                    }
                    
                    if (columnMap['quantity'] === undefined) {
                        throw new Error(`لم يتم العثور على عمود الكمية\n\nالعناوين الموجودة: ${headers.filter((h: any) => h).slice(0, 15).join(', ')}`);
                    }
                    
                    // إذا لم نجد serialNumber، سنستخدم رقم السطر
                    if (columnMap['serialNumber'] === undefined) {
                        console.log('⚠️ لم يتم العثور على عمود الرقم التسلسلي، سيتم استخدام رقم السطر');
                    }
                    
                    // إذا لم نجد itemName، سنستخدم description
                    if (columnMap['itemName'] === undefined && columnMap['description'] !== undefined) {
                        console.log('⚠️ لم يتم العثور على عمود البند، سيتم استخدام الوصف');
                        columnMap['itemName'] = columnMap['description'];
                    }

                    // قراءة البيانات (محسّن)
                    let rowCounter = 1; // عداد لتوليد أرقام تسلسلية
                    console.log(`📖 بدء قراءة البيانات من السطر ${headerRow + 2}...`);
                    
                    for (let i = headerRow + 1; i < json.length; i++) {
                        const row = json[i];
                        
                        // التحقق من أن السطر ليس فارغاً تماماً
                        const rowHasData = row.some((cell: any) => 
                            cell !== null && cell !== undefined && String(cell).trim() !== ''
                        );
                        
                        if (!rowHasData) {
                            continue; // تجاهل الأسطر الفارغة تماماً
                        }
                        
                        // قراءة البيانات مع معالجة الأعمدة المفقودة
                        const serialNumber = columnMap['serialNumber'] !== undefined 
                            ? String(row[columnMap['serialNumber']] || rowCounter).trim() 
                            : String(rowCounter);
                        
                        const itemName = columnMap['itemName'] !== undefined 
                            ? String(row[columnMap['itemName']] || '').trim() 
                            : '';
                        
                        // تجاهل صفوف العناوين المكررة
                        if (serialNumber === 'الرقم التسلسلي' || itemName === 'البند' ||
                            itemName === 'item' || itemName.toLowerCase().includes('item name')) {
                            continue;
                        }

                        const category = columnMap['category'] !== undefined 
                            ? String(row[columnMap['category']] || '99').trim() 
                            : '99';
                        
                        const description = columnMap['description'] !== undefined 
                            ? String(row[columnMap['description']] || '').trim() 
                            : '';
                        
                        const specifications = columnMap['specifications'] !== undefined 
                            ? String(row[columnMap['specifications']] || '').trim() 
                            : '';
                        
                        const unit = columnMap['unit'] !== undefined 
                            ? String(row[columnMap['unit']] || 'م').trim() 
                            : 'م';
                        
                        const quantity = columnMap['quantity'] !== undefined 
                            ? this.parseNumber(row[columnMap['quantity']]) 
                            : 0;
                        
                        const unitPrice = columnMap['unitPrice'] !== undefined 
                            ? this.parseNumber(row[columnMap['unitPrice']]) 
                            : 0;
                        
                        const total = columnMap['total'] !== undefined 
                            ? this.parseNumber(row[columnMap['total']]) || (quantity * unitPrice)
                            : (quantity * unitPrice);

                        // شرط القبول: لديه اسم بند AND كمية > 0
                        if (itemName && quantity > 0) {
                            items.push({
                                serialNumber: serialNumber || String(rowCounter),
                                category: category || '99',
                                itemName,
                                description,
                                // استخدام المواصفات إذا كانت موجودة، وإلا الوصف، وإلا اسم البند
                                specifications: specifications || description || itemName,
                                unit: unit || 'م',
                                quantity,
                                unitPrice,
                                total
                            });
                            
                            // طباعة تقدم كل 100 بند
                            if (items.length % 100 === 0) {
                                console.log(`📊 تمت قراءة ${items.length} بند...`);
                            }
                            
                            rowCounter++;
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
