/**
 * ═══════════════════════════════════════════════════════════════
 * 📊 Schedule Parser - محلل جداول التشطيبات والتسليح الذكي
 * ═══════════════════════════════════════════════════════════════
 * 
 * القدرات:
 * ✅ تحليل جداول التشطيبات المعمارية
 * ✅ تحليل جداول التسليح الإنشائية
 * ✅ استخراج السماكات والأبعاد
 * ✅ فهم المقايسات (BOQ)
 * ✅ قراءة ملفات Excel
 * ✅ ربط الجداول بالعناصر 3D
 * ✅ توليد مخططات تنفيذية
 * ✅ حساب الكميات التلقائي
 * ═══════════════════════════════════════════════════════════════
 */

class ScheduleParser {
    constructor() {
        this.finishesSchedules = [];
        this.reinforcementSchedules = [];
        this.thicknessSchedules = [];
        this.boqSchedules = [];
        
        this.logger = new Logger('ScheduleParser');
        
        this.patterns = this.initializePatterns();
        this.materials = this.initializeMaterials();
    }
    
    /**
     * تهيئة أنماط التعرف
     */
    initializePatterns() {
        return {
            // أنماط جداول التشطيبات
            finishes: {
                headers: [
                    /تشطيب|finish|material/i,
                    /غرفة|room|space/i,
                    /أرضية|floor|flooring/i,
                    /جدار|wall/i,
                    /سقف|ceiling/i,
                    /نوع|type|specification/i
                ],
                materials: [
                    'بورسلان', 'porcelain', 'سيراميك', 'ceramic',
                    'جرانيت', 'granite', 'رخام', 'marble',
                    'بلاط', 'tiles', 'موكيت', 'carpet',
                    'باركيه', 'parquet', 'خشب', 'wood',
                    'دهان', 'paint', 'ورق جدران', 'wallpaper',
                    'جبس', 'gypsum', 'معلق', 'suspended'
                ]
            },
            
            // أنماط جداول التسليح
            reinforcement: {
                headers: [
                    /تسليح|reinforcement|rebar/i,
                    /قطر|diameter|dia/i,
                    /عدد|number|qty/i,
                    /طول|length/i,
                    /وزن|weight/i,
                    /نوع|type|grade/i
                ],
                grades: [
                    'B280C', 'B420C', 'B500B',
                    'Grade 40', 'Grade 60',
                    'Fe360', 'Fe500'
                ],
                diameters: [
                    '6', '8', '10', '12', '14', '16', '18',
                    '20', '22', '25', '28', '32'
                ]
            },
            
            // أنماط جداول السماكات
            thickness: {
                headers: [
                    /سماكة|thickness|depth/i,
                    /عنصر|element|member/i,
                    /بلاطة|slab/i,
                    /جدار|wall/i,
                    /كمرة|beam/i,
                    /عمود|column/i
                ],
                elements: [
                    'slab', 'wall', 'beam', 'column', 'foundation',
                    'بلاطة', 'جدار', 'كمرة', 'عمود', 'أساس'
                ]
            },
            
            // أنماط جداول الكميات (BOQ)
            boq: {
                headers: [
                    /بند|item|description/i,
                    /كمية|quantity|qty/i,
                    /وحدة|unit|u\.m/i,
                    /سعر|rate|price/i,
                    /إجمالي|total|amount/i
                ],
                units: [
                    'م', 'm', 'meter',
                    'م²', 'm2', 'sqm', 'square meter',
                    'م³', 'm3', 'cum', 'cubic meter',
                    'طن', 'ton', 'kg',
                    'عدد', 'no', 'pcs', 'number'
                ]
            }
        };
    }
    
    /**
     * تهيئة قاعدة بيانات المواد
     */
    initializeMaterials() {
        return {
            // تشطيبات الأرضيات
            flooring: {
                'بورسلان': { cost: 80, unit: 'م²', quality: 'high', durability: 'excellent' },
                'سيراميك': { cost: 50, unit: 'م²', quality: 'medium', durability: 'good' },
                'جرانيت': { cost: 150, unit: 'م²', quality: 'premium', durability: 'excellent' },
                'رخام': { cost: 200, unit: 'م²', quality: 'premium', durability: 'excellent' },
                'باركيه': { cost: 120, unit: 'م²', quality: 'high', durability: 'good' },
                'موكيت': { cost: 60, unit: 'م²', quality: 'medium', durability: 'fair' }
            },
            
            // تشطيبات الجدران
            walls: {
                'دهان بلاستيك': { cost: 25, unit: 'م²', quality: 'standard' },
                'دهان جوتن': { cost: 35, unit: 'م²', quality: 'high' },
                'ورق جدران': { cost: 45, unit: 'م²', quality: 'medium' },
                'حجر طبيعي': { cost: 180, unit: 'م²', quality: 'premium' },
                'سيراميك': { cost: 70, unit: 'م²', quality: 'medium' }
            },
            
            // تشطيبات الأسقف
            ceiling: {
                'دهان': { cost: 20, unit: 'م²', quality: 'standard' },
                'جبس عادي': { cost: 40, unit: 'م²', quality: 'medium' },
                'جبس بورد': { cost: 60, unit: 'م²', quality: 'high' },
                'معلق معدني': { cost: 80, unit: 'م²', quality: 'high' }
            },
            
            // حديد التسليح
            rebar: {
                '6': { weight: 0.222, unit: 'كجم/م', grade: 'B420C' },
                '8': { weight: 0.395, unit: 'كجم/م', grade: 'B420C' },
                '10': { weight: 0.617, unit: 'كجم/م', grade: 'B420C' },
                '12': { weight: 0.888, unit: 'كجم/م', grade: 'B420C' },
                '14': { weight: 1.208, unit: 'كجم/م', grade: 'B420C' },
                '16': { weight: 1.578, unit: 'كجم/م', grade: 'B420C' },
                '18': { weight: 2.000, unit: 'كجم/م', grade: 'B420C' },
                '20': { weight: 2.466, unit: 'كجم/م', grade: 'B420C' },
                '22': { weight: 2.984, unit: 'كجم/م', grade: 'B420C' },
                '25': { weight: 3.850, unit: 'كجم/م', grade: 'B420C' },
                '28': { weight: 4.830, unit: 'كجم/م', grade: 'B420C' },
                '32': { weight: 6.310, unit: 'كجم/م', grade: 'B420C' }
            }
        };
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 📊 تحليل جميع الجداول
     * ══════════════════════════════════════════════════════════
     */
    async parseAllSchedules(tables, options = {}) {
        this.logger.info('🔍 بدء تحليل الجداول...');
        
        for (const table of tables) {
            // تصنيف الجدول
            const classification = this.classifyTable(table);
            
            this.logger.info(`تحليل جدول: ${classification.type} (ثقة: ${classification.confidence})`);
            
            // تحليل حسب النوع
            switch (classification.type) {
                case 'finishes':
                    const finishSchedule = this.parseFinishesSchedule(table);
                    if (finishSchedule) {
                        this.finishesSchedules.push(finishSchedule);
                    }
                    break;
                    
                case 'reinforcement':
                    const rebarSchedule = this.parseReinforcementSchedule(table);
                    if (rebarSchedule) {
                        this.reinforcementSchedules.push(rebarSchedule);
                    }
                    break;
                    
                case 'thickness':
                    const thicknessSchedule = this.parseThicknessSchedule(table);
                    if (thicknessSchedule) {
                        this.thicknessSchedules.push(thicknessSchedule);
                    }
                    break;
                    
                case 'boq':
                    const boqSchedule = this.parseBOQSchedule(table);
                    if (boqSchedule) {
                        this.boqSchedules.push(boqSchedule);
                    }
                    break;
            }
        }
        
        this.logger.info('✅ اكتمل تحليل الجداول', {
            finishes: this.finishesSchedules.length,
            reinforcement: this.reinforcementSchedules.length,
            thickness: this.thicknessSchedules.length,
            boq: this.boqSchedules.length
        });
        
        return {
            finishes: this.finishesSchedules,
            reinforcement: this.reinforcementSchedules,
            thickness: this.thicknessSchedules,
            boq: this.boqSchedules
        };
    }
    
    /**
     * تصنيف الجدول
     */
    classifyTable(table) {
        const headers = table.data?.headers || [];
        const headersText = headers.join(' ').toLowerCase();
        
        let bestMatch = {
            type: 'unknown',
            confidence: 0
        };
        
        // فحص كل نوع
        for (const [type, patterns] of Object.entries(this.patterns)) {
            let matches = 0;
            let total = patterns.headers.length;
            
            patterns.headers.forEach(pattern => {
                if (pattern.test(headersText)) {
                    matches++;
                }
            });
            
            const confidence = matches / total;
            
            if (confidence > bestMatch.confidence) {
                bestMatch = { type, confidence };
            }
        }
        
        return bestMatch;
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 🎨 تحليل جدول التشطيبات
     * ══════════════════════════════════════════════════════════
     */
    parseFinishesSchedule(table) {
        try {
            const schedule = {
                type: 'finishes',
                source: table.source,
                rooms: []
            };
            
            const headers = table.data.headers;
            const rows = table.data.rows;
            
            // تحديد الأعمدة
            const columnMap = this.identifyFinishesColumns(headers);
            
            // تحليل كل صف
            rows.forEach(row => {
                const roomFinish = {
                    room: row[columnMap.room] || '',
                    floor: row[columnMap.floor] || '',
                    wall: row[columnMap.wall] || '',
                    ceiling: row[columnMap.ceiling] || '',
                    notes: row[columnMap.notes] || '',
                    costs: {}
                };
                
                // حساب التكاليف
                if (roomFinish.floor) {
                    roomFinish.costs.floor = this.getMaterialCost('flooring', roomFinish.floor);
                }
                if (roomFinish.wall) {
                    roomFinish.costs.wall = this.getMaterialCost('walls', roomFinish.wall);
                }
                if (roomFinish.ceiling) {
                    roomFinish.costs.ceiling = this.getMaterialCost('ceiling', roomFinish.ceiling);
                }
                
                schedule.rooms.push(roomFinish);
            });
            
            this.logger.info(`✅ تحليل جدول تشطيبات: ${schedule.rooms.length} غرفة`);
            
            return schedule;
            
        } catch (error) {
            this.logger.error('فشل تحليل جدول التشطيبات', error);
            return null;
        }
    }
    
    /**
     * تحديد أعمدة جدول التشطيبات
     */
    identifyFinishesColumns(headers) {
        const map = {
            room: -1,
            floor: -1,
            wall: -1,
            ceiling: -1,
            notes: -1
        };
        
        headers.forEach((header, index) => {
            const h = header.toLowerCase();
            
            if (h.includes('غرفة') || h.includes('room') || h.includes('space')) {
                map.room = index;
            } else if (h.includes('أرضية') || h.includes('floor')) {
                map.floor = index;
            } else if (h.includes('جدار') || h.includes('wall')) {
                map.wall = index;
            } else if (h.includes('سقف') || h.includes('ceiling')) {
                map.ceiling = index;
            } else if (h.includes('ملاحظة') || h.includes('note')) {
                map.notes = index;
            }
        });
        
        return map;
    }
    
    /**
     * الحصول على تكلفة المادة
     */
    getMaterialCost(category, materialName) {
        const material = Object.entries(this.materials[category] || {})
            .find(([key]) => materialName.includes(key));
        
        if (material) {
            return {
                name: material[0],
                cost: material[1].cost,
                unit: material[1].unit,
                quality: material[1].quality
            };
        }
        
        return {
            name: materialName,
            cost: 0,
            unit: 'م²',
            quality: 'unknown'
        };
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 🔩 تحليل جدول التسليح
     * ══════════════════════════════════════════════════════════
     */
    parseReinforcementSchedule(table) {
        try {
            const schedule = {
                type: 'reinforcement',
                source: table.source,
                bars: [],
                summary: {
                    totalWeight: 0,
                    totalLength: 0,
                    byDiameter: {}
                }
            };
            
            const headers = table.data.headers;
            const rows = table.data.rows;
            
            // تحديد الأعمدة
            const columnMap = this.identifyReinforcementColumns(headers);
            
            // تحليل كل صف
            rows.forEach(row => {
                const barData = this.extractRebarData(row, columnMap);
                
                if (barData) {
                    schedule.bars.push(barData);
                    
                    // تحديث الملخص
                    schedule.summary.totalWeight += barData.weight;
                    schedule.summary.totalLength += barData.length;
                    
                    if (!schedule.summary.byDiameter[barData.diameter]) {
                        schedule.summary.byDiameter[barData.diameter] = {
                            count: 0,
                            length: 0,
                            weight: 0
                        };
                    }
                    
                    schedule.summary.byDiameter[barData.diameter].count += barData.number;
                    schedule.summary.byDiameter[barData.diameter].length += barData.length;
                    schedule.summary.byDiameter[barData.diameter].weight += barData.weight;
                }
            });
            
            this.logger.info(`✅ تحليل جدول تسليح: ${schedule.bars.length} قضيب، وزن إجمالي: ${schedule.summary.totalWeight.toFixed(2)} كجم`);
            
            return schedule;
            
        } catch (error) {
            this.logger.error('فشل تحليل جدول التسليح', error);
            return null;
        }
    }
    
    /**
     * تحديد أعمدة جدول التسليح
     */
    identifyReinforcementColumns(headers) {
        const map = {
            mark: -1,
            diameter: -1,
            number: -1,
            length: -1,
            shape: -1,
            location: -1
        };
        
        headers.forEach((header, index) => {
            const h = header.toLowerCase();
            
            if (h.includes('mark') || h.includes('رمز') || h.includes('ref')) {
                map.mark = index;
            } else if (h.includes('قطر') || h.includes('dia') || h.includes('ø')) {
                map.diameter = index;
            } else if (h.includes('عدد') || h.includes('number') || h.includes('qty')) {
                map.number = index;
            } else if (h.includes('طول') || h.includes('length')) {
                map.length = index;
            } else if (h.includes('شكل') || h.includes('shape') || h.includes('type')) {
                map.shape = index;
            } else if (h.includes('موقع') || h.includes('location') || h.includes('element')) {
                map.location = index;
            }
        });
        
        return map;
    }
    
    /**
     * استخراج بيانات حديد التسليح
     */
    extractRebarData(row, columnMap) {
        try {
            // استخراج القطر
            const diameterText = row[columnMap.diameter] || '';
            const diameter = this.extractDiameter(diameterText);
            
            if (!diameter) return null;
            
            // استخراج العدد
            const numberText = row[columnMap.number] || '1';
            const number = parseInt(numberText) || 1;
            
            // استخراج الطول
            const lengthText = row[columnMap.length] || '0';
            const length = parseFloat(lengthText) || 0;
            
            // حساب الوزن
            const unitWeight = this.materials.rebar[diameter]?.weight || 0;
            const totalLength = number * length;
            const weight = totalLength * unitWeight;
            
            return {
                mark: row[columnMap.mark] || '',
                diameter: diameter,
                number: number,
                length: length,
                totalLength: totalLength,
                weight: weight,
                unitWeight: unitWeight,
                shape: row[columnMap.shape] || '',
                location: row[columnMap.location] || '',
                grade: this.materials.rebar[diameter]?.grade || 'B420C'
            };
            
        } catch (error) {
            this.logger.warn('فشل استخراج بيانات التسليح', error);
            return null;
        }
    }
    
    /**
     * استخراج القطر من النص
     */
    extractDiameter(text) {
        // البحث عن أرقام
        const match = text.match(/(\d+)/);
        if (match) {
            const diameter = match[1];
            // التحقق من أنه قطر صحيح
            if (this.patterns.reinforcement.diameters.includes(diameter)) {
                return diameter;
            }
        }
        return null;
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 📏 تحليل جدول السماكات
     * ══════════════════════════════════════════════════════════
     */
    parseThicknessSchedule(table) {
        try {
            const schedule = {
                type: 'thickness',
                source: table.source,
                elements: {}
            };
            
            const headers = table.data.headers;
            const rows = table.data.rows;
            
            // تحديد الأعمدة
            const columnMap = this.identifyThicknessColumns(headers);
            
            // تحليل كل صف
            rows.forEach(row => {
                const elementType = row[columnMap.element] || '';
                const thickness = parseFloat(row[columnMap.thickness]) || 0;
                const location = row[columnMap.location] || '';
                
                if (elementType && thickness > 0) {
                    const elementKey = this.normalizeElementType(elementType);
                    
                    if (!schedule.elements[elementKey]) {
                        schedule.elements[elementKey] = [];
                    }
                    
                    schedule.elements[elementKey].push({
                        location: location,
                        thickness: thickness,
                        unit: 'mm',
                        notes: row[columnMap.notes] || ''
                    });
                }
            });
            
            this.logger.info(`✅ تحليل جدول سماكات: ${Object.keys(schedule.elements).length} نوع عنصر`);
            
            return schedule;
            
        } catch (error) {
            this.logger.error('فشل تحليل جدول السماكات', error);
            return null;
        }
    }
    
    /**
     * تحديد أعمدة جدول السماكات
     */
    identifyThicknessColumns(headers) {
        const map = {
            element: -1,
            thickness: -1,
            location: -1,
            notes: -1
        };
        
        headers.forEach((header, index) => {
            const h = header.toLowerCase();
            
            if (h.includes('عنصر') || h.includes('element') || h.includes('member')) {
                map.element = index;
            } else if (h.includes('سماكة') || h.includes('thickness') || h.includes('depth')) {
                map.thickness = index;
            } else if (h.includes('موقع') || h.includes('location')) {
                map.location = index;
            } else if (h.includes('ملاحظة') || h.includes('note')) {
                map.notes = index;
            }
        });
        
        return map;
    }
    
    /**
     * توحيد نوع العنصر
     */
    normalizeElementType(type) {
        const t = type.toLowerCase();
        
        if (t.includes('slab') || t.includes('بلاطة')) return 'slab';
        if (t.includes('wall') || t.includes('جدار')) return 'wall';
        if (t.includes('beam') || t.includes('كمرة')) return 'beam';
        if (t.includes('column') || t.includes('عمود')) return 'column';
        if (t.includes('foundation') || t.includes('أساس')) return 'foundation';
        
        return type;
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 💰 تحليل جدول الكميات (BOQ)
     * ══════════════════════════════════════════════════════════
     */
    parseBOQSchedule(table) {
        try {
            const schedule = {
                type: 'boq',
                source: table.source,
                items: [],
                summary: {
                    totalCost: 0,
                    itemCount: 0
                }
            };
            
            const headers = table.data.headers;
            const rows = table.data.rows;
            
            // تحديد الأعمدة
            const columnMap = this.identifyBOQColumns(headers);
            
            // تحليل كل صف
            rows.forEach(row => {
                const item = {
                    description: row[columnMap.description] || '',
                    quantity: parseFloat(row[columnMap.quantity]) || 0,
                    unit: row[columnMap.unit] || '',
                    rate: parseFloat(row[columnMap.rate]) || 0,
                    amount: 0
                };
                
                // حساب الإجمالي
                item.amount = item.quantity * item.rate;
                
                schedule.items.push(item);
                schedule.summary.totalCost += item.amount;
                schedule.summary.itemCount++;
            });
            
            this.logger.info(`✅ تحليل جدول كميات: ${schedule.items.length} بند، تكلفة إجمالية: ${schedule.summary.totalCost.toLocaleString('ar-SA')} ريال`);
            
            return schedule;
            
        } catch (error) {
            this.logger.error('فشل تحليل جدول الكميات', error);
            return null;
        }
    }
    
    /**
     * تحديد أعمدة جدول الكميات
     */
    identifyBOQColumns(headers) {
        const map = {
            item: -1,
            description: -1,
            quantity: -1,
            unit: -1,
            rate: -1,
            amount: -1
        };
        
        headers.forEach((header, index) => {
            const h = header.toLowerCase();
            
            if (h.includes('بند') || h.includes('item') || h.includes('no')) {
                map.item = index;
            } else if (h.includes('وصف') || h.includes('description') || h.includes('particular')) {
                map.description = index;
            } else if (h.includes('كمية') || h.includes('quantity') || h.includes('qty')) {
                map.quantity = index;
            } else if (h.includes('وحدة') || h.includes('unit')) {
                map.unit = index;
            } else if (h.includes('سعر') || h.includes('rate') || h.includes('price')) {
                map.rate = index;
            } else if (h.includes('إجمالي') || h.includes('total') || h.includes('amount')) {
                map.amount = index;
            }
        });
        
        return map;
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 📄 قراءة ملف Excel
     * ══════════════════════════════════════════════════════════
     */
    async parseExcelFile(file) {
        try {
            this.logger.info(`قراءة ملف Excel: ${file.name}`);
            
            // استخدام مكتبة SheetJS (xlsx)
            if (typeof XLSX === 'undefined') {
                throw new Error('مكتبة XLSX غير متوفرة');
            }
            
            const data = await this.readExcelFile(file);
            const tables = this.convertExcelToTables(data);
            
            this.logger.info(`✅ تم استخراج ${tables.length} جدول من Excel`);
            
            return tables;
            
        } catch (error) {
            this.logger.error('فشل قراءة ملف Excel', error);
            throw error;
        }
    }
    
    /**
     * قراءة ملف Excel
     */
    readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    resolve(workbook);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('فشل قراءة الملف'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * تحويل Excel إلى جداول
     */
    convertExcelToTables(workbook) {
        const tables = [];
        
        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            if (jsonData.length > 1) {
                const table = {
                    name: sheetName,
                    source: 'EXCEL',
                    data: {
                        headers: jsonData[0],
                        rows: []
                    }
                };
                
                for (let i = 1; i < jsonData.length; i++) {
                    if (jsonData[i].length > 0) {
                        const rowObject = {};
                        table.data.headers.forEach((header, index) => {
                            rowObject[header] = jsonData[i][index] || '';
                        });
                        table.data.rows.push(rowObject);
                    }
                }
                
                tables.push(table);
            }
        });
        
        return tables;
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 🔗 ربط الجداول بالعناصر 3D
     * ══════════════════════════════════════════════════════════
     */
    applySchedulesToElements(elements) {
        this.logger.info('🔗 ربط الجداول بالعناصر 3D...');
        
        let appliedCount = 0;
        
        elements.forEach(element => {
            // تطبيق السماكات
            if (this.thicknessSchedules.length > 0) {
                const thickness = this.findThicknessForElement(element);
                if (thickness) {
                    element.properties.thickness = thickness.thickness;
                    element.properties.thicknessSource = 'schedule';
                    appliedCount++;
                }
            }
            
            // تطبيق التشطيبات
            if (this.finishesSchedules.length > 0 && element.room) {
                const finishes = this.findFinishesForRoom(element.room);
                if (finishes) {
                    element.properties.finishes = finishes;
                    appliedCount++;
                }
            }
            
            // تطبيق التسليح
            if (this.reinforcementSchedules.length > 0) {
                const rebar = this.findRebarForElement(element);
                if (rebar) {
                    element.properties.reinforcement = rebar;
                    appliedCount++;
                }
            }
        });
        
        this.logger.info(`✅ تم تطبيق البيانات على ${appliedCount} عنصر`);
        
        return appliedCount;
    }
    
    /**
     * البحث عن سماكة للعنصر
     */
    findThicknessForElement(element) {
        for (const schedule of this.thicknessSchedules) {
            const elementType = element.type;
            const thicknessData = schedule.elements[elementType];
            
            if (thicknessData && thicknessData.length > 0) {
                // إرجاع أول سماكة مطابقة
                return thicknessData[0];
            }
        }
        
        return null;
    }
    
    /**
     * البحث عن تشطيبات للغرفة
     */
    findFinishesForRoom(roomName) {
        for (const schedule of this.finishesSchedules) {
            const room = schedule.rooms.find(r => 
                r.room.toLowerCase().includes(roomName.toLowerCase())
            );
            
            if (room) {
                return room;
            }
        }
        
        return null;
    }
    
    /**
     * البحث عن تسليح للعنصر
     */
    findRebarForElement(element) {
        for (const schedule of this.reinforcementSchedules) {
            const bars = schedule.bars.filter(bar =>
                bar.location.toLowerCase().includes(element.type)
            );
            
            if (bars.length > 0) {
                return {
                    bars: bars,
                    totalWeight: bars.reduce((sum, bar) => sum + bar.weight, 0)
                };
            }
        }
        
        return null;
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 📊 توليد التقارير
     * ══════════════════════════════════════════════════════════
     */
    generateReport() {
        return {
            finishes: {
                count: this.finishesSchedules.length,
                rooms: this.finishesSchedules.reduce((sum, s) => sum + s.rooms.length, 0)
            },
            reinforcement: {
                count: this.reinforcementSchedules.length,
                totalWeight: this.reinforcementSchedules.reduce((sum, s) => sum + s.summary.totalWeight, 0),
                totalLength: this.reinforcementSchedules.reduce((sum, s) => sum + s.summary.totalLength, 0)
            },
            thickness: {
                count: this.thicknessSchedules.length,
                elements: Object.keys(this.thicknessSchedules.reduce((all, s) => ({...all, ...s.elements}), {})).length
            },
            boq: {
                count: this.boqSchedules.length,
                totalCost: this.boqSchedules.reduce((sum, s) => sum + s.summary.totalCost, 0),
                items: this.boqSchedules.reduce((sum, s) => sum + s.summary.itemCount, 0)
            }
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// 🌍 تصدير
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.ScheduleParser = ScheduleParser;
}
