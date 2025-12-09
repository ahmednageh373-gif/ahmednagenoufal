/**
 * ═══════════════════════════════════════════════════════════════
 * 🔧 Enhanced DWG/DXF Parser - الإصدار المحسّن
 * ═══════════════════════════════════════════════════════════════
 * 
 * التحسينات الجديدة:
 * ✅ نظام Validation كامل
 * ✅ Unit Converter متكامل
 * ✅ Cache System للأداء
 * ✅ Enhanced Table Extraction
 * ✅ Progress Tracking
 * ✅ Error Handling محسّن
 * ✅ Logger System احترافي
 * ✅ استخراج جداول TABLE الحقيقية
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
// 📝 نظام Logging احترافي
// ═══════════════════════════════════════════════════════════════

class Logger {
    constructor(name) {
        this.name = name;
        this.logs = [];
        this.level = 'INFO'; // DEBUG, INFO, WARN, ERROR
    }
    
    log(level, message, data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: level,
            module: this.name,
            message: message,
            data: data
        };
        
        this.logs.push(entry);
        
        const icons = {
            'DEBUG': '🔍',
            'INFO': 'ℹ️',
            'WARN': '⚠️',
            'ERROR': '❌'
        };
        
        const colors = {
            'DEBUG': 'color: #999',
            'INFO': 'color: #0af',
            'WARN': 'color: #fa0',
            'ERROR': 'color: #f00'
        };
        
        console.log(
            `%c${icons[level]} [${this.name}] ${message}`,
            colors[level],
            data || ''
        );
    }
    
    debug(message, data) { this.log('DEBUG', message, data); }
    info(message, data) { this.log('INFO', message, data); }
    warn(message, data) { this.log('WARN', message, data); }
    error(message, data) { this.log('ERROR', message, data); }
    
    export() {
        return this.logs;
    }
    
    exportCSV() {
        const headers = 'Timestamp,Level,Module,Message\n';
        const rows = this.logs.map(log =>
            `${log.timestamp},${log.level},${log.module},"${log.message}"`
        ).join('\n');
        
        return headers + rows;
    }
}

// ═══════════════════════════════════════════════════════════════
// 📏 نظام تحويل الوحدات الكامل
// ═══════════════════════════════════════════════════════════════

class UnitConverter {
    constructor() {
        // معاملات التحويل إلى مليمتر (القاعدة)
        this.toMM = {
            'Unitless': 1,
            'Millimeters': 1,
            'Centimeters': 10,
            'Decimeters': 100,
            'Meters': 1000,
            'Kilometers': 1000000,
            'Inches': 25.4,
            'Feet': 304.8,
            'Yards': 914.4,
            'Miles': 1609344,
            'Microinches': 0.0000254,
            'Mils': 0.0254,
            'Angstroms': 0.0000001,
            'Nanometers': 0.000001,
            'Microns': 0.001
        };
        
        this.logger = new Logger('UnitConverter');
    }
    
    /**
     * تحويل قيمة من وحدة إلى أخرى
     */
    convert(value, fromUnit, toUnit = 'Millimeters') {
        if (!this.isValidUnit(fromUnit)) {
            this.logger.warn(`وحدة غير صالحة: ${fromUnit}، استخدام Millimeters`);
            fromUnit = 'Millimeters';
        }
        
        if (!this.isValidUnit(toUnit)) {
            this.logger.warn(`وحدة غير صالحة: ${toUnit}، استخدام Millimeters`);
            toUnit = 'Millimeters';
        }
        
        if (fromUnit === toUnit) return value;
        
        // تحويل إلى مليمتر أولاً
        const valueInMM = value * this.toMM[fromUnit];
        
        // ثم تحويل إلى الوحدة المطلوبة
        return valueInMM / this.toMM[toUnit];
    }
    
    /**
     * تحويل نقطة
     */
    convertPoint(point, fromUnit, toUnit = 'Millimeters') {
        if (!point) return { x: 0, y: 0, z: 0 };
        
        return {
            x: this.convert(point.x || 0, fromUnit, toUnit),
            y: this.convert(point.y || 0, fromUnit, toUnit),
            z: this.convert(point.z || 0, fromUnit, toUnit)
        };
    }
    
    /**
     * التحقق من صحة الوحدة
     */
    isValidUnit(unit) {
        return this.toMM.hasOwnProperty(unit);
    }
    
    /**
     * توحيد جميع البيانات في ملف
     */
    normalizeEntities(entities, fromUnit, toUnit = 'Millimeters') {
        if (fromUnit === toUnit) return entities;
        
        this.logger.info(`تحويل من ${fromUnit} إلى ${toUnit}...`);
        
        return entities.map(entity => {
            const normalized = { ...entity };
            
            // تحويل الـ vertices
            if (entity.geometry?.vertices) {
                normalized.geometry = { ...entity.geometry };
                normalized.geometry.vertices = entity.geometry.vertices.map(v =>
                    this.convertPoint(v, fromUnit, toUnit)
                );
            }
            
            // تحويل المركز
            if (entity.geometry?.center) {
                normalized.geometry = normalized.geometry || { ...entity.geometry };
                normalized.geometry.center = this.convertPoint(
                    entity.geometry.center,
                    fromUnit,
                    toUnit
                );
            }
            
            // تحويل نصف القطر
            if (entity.geometry?.radius) {
                normalized.geometry = normalized.geometry || { ...entity.geometry };
                normalized.geometry.radius = this.convert(
                    entity.geometry.radius,
                    fromUnit,
                    toUnit
                );
            }
            
            // تحويل الموقع
            if (entity.geometry?.position) {
                normalized.geometry = normalized.geometry || { ...entity.geometry };
                normalized.geometry.position = this.convertPoint(
                    entity.geometry.position,
                    fromUnit,
                    toUnit
                );
            }
            
            // إعادة حساب الأبعاد
            if (entity.geometry?.dimensions) {
                normalized.geometry.dimensions = this.convertDimensions(
                    entity.geometry.dimensions,
                    fromUnit,
                    toUnit
                );
            }
            
            return normalized;
        });
    }
    
    /**
     * تحويل الأبعاد
     */
    convertDimensions(dimensions, fromUnit, toUnit) {
        const converted = {};
        
        for (const [key, value] of Object.entries(dimensions)) {
            if (typeof value === 'number') {
                converted[key] = this.convert(value, fromUnit, toUnit);
            } else {
                converted[key] = value;
            }
        }
        
        return converted;
    }
}

// ═══════════════════════════════════════════════════════════════
// ✅ نظام Validation الكامل
// ═══════════════════════════════════════════════════════════════

class DataValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.logger = new Logger('DataValidator');
    }
    
    /**
     * التحقق من صحة نقطة
     */
    validatePoint(point, defaultValue = { x: 0, y: 0, z: 0 }) {
        if (!point) {
            this.warnings.push('نقطة مفقودة، استخدام القيمة الافتراضية');
            return { ...defaultValue };
        }
        
        return {
            x: this.validateNumber(point.x, 0),
            y: this.validateNumber(point.y, 0),
            z: this.validateNumber(point.z, 0)
        };
    }
    
    /**
     * التحقق من صحة رقم
     */
    validateNumber(value, defaultValue = 0) {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            return defaultValue;
        }
        return value;
    }
    
    /**
     * التحقق من صحة كائن
     */
    validateEntity(entity) {
        if (!entity) {
            this.errors.push('كائن مفقود');
            return null;
        }
        
        if (!entity.type) {
            this.errors.push(`كائن بدون نوع: ${entity.id || 'unknown'}`);
            return null;
        }
        
        // التحقق من الهندسة
        if (!entity.geometry) {
            this.warnings.push(`كائن ${entity.type} بدون هندسة`);
            entity.geometry = { type: entity.type };
        }
        
        return entity;
    }
    
    /**
     * التحقق من صحة vertices
     */
    validateVertices(vertices, minCount = 2) {
        if (!Array.isArray(vertices)) {
            this.errors.push('vertices ليست مصفوفة');
            return [];
        }
        
        if (vertices.length < minCount) {
            this.warnings.push(`عدد نقاط غير كافي: ${vertices.length} < ${minCount}`);
            return [];
        }
        
        return vertices.map(v => this.validatePoint(v));
    }
    
    /**
     * الحصول على التقرير
     */
    getReport() {
        return {
            errors: this.errors,
            warnings: this.warnings,
            hasErrors: this.errors.length > 0,
            hasWarnings: this.warnings.length > 0
        };
    }
    
    /**
     * مسح السجلات
     */
    reset() {
        this.errors = [];
        this.warnings = [];
    }
}

// ═══════════════════════════════════════════════════════════════
// 💾 نظام Cache للأداء
// ═══════════════════════════════════════════════════════════════

class DWGParserCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 5; // عدد الملفات المحفوظة
        this.logger = new Logger('Cache');
    }
    
    /**
     * حفظ في الكاش
     */
    set(key, data) {
        // إزالة أقدم ملف إذا امتلأ
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.logger.info(`إزالة ${firstKey} من الكاش`);
        }
        
        this.cache.set(key, {
            data: data,
            timestamp: Date.now(),
            accessCount: 0
        });
        
        this.logger.info(`حفظ ${key} في الكاش`);
    }
    
    /**
     * استرجاع من الكاش
     */
    get(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            this.logger.debug(`${key} غير موجود في الكاش`);
            return null;
        }
        
        // تحديث الإحصائيات
        cached.timestamp = Date.now();
        cached.accessCount++;
        
        this.logger.info(`استرجاع ${key} من الكاش (${cached.accessCount} مرات)`);
        
        return cached.data;
    }
    
    /**
     * حساب hash للملف
     */
    async calculateFileHash(file) {
        try {
            // قراءة جزء من الملف فقط (أول 1KB + آخر 1KB)
            const start = file.slice(0, 1024);
            const end = file.slice(-1024);
            
            const startBuffer = await start.arrayBuffer();
            const endBuffer = await end.arrayBuffer();
            
            // دمج البيانات
            const combined = new Uint8Array(startBuffer.byteLength + endBuffer.byteLength);
            combined.set(new Uint8Array(startBuffer), 0);
            combined.set(new Uint8Array(endBuffer), startBuffer.byteLength);
            
            // حساب hash
            const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            // إضافة معلومات الملف للتفرد
            return `${hash}_${file.size}_${file.name}`;
            
        } catch (error) {
            this.logger.error('فشل حساب hash', error);
            // fallback: استخدام معلومات الملف فقط
            return `${file.name}_${file.size}_${file.lastModified}`;
        }
    }
    
    /**
     * مسح الكاش
     */
    clear() {
        this.cache.clear();
        this.logger.info('تم مسح الكاش');
    }
    
    /**
     * الحصول على إحصائيات
     */
    getStats() {
        const stats = {
            size: this.cache.size,
            maxSize: this.maxSize,
            items: []
        };
        
        for (const [key, value] of this.cache.entries()) {
            stats.items.push({
                key: key,
                accessCount: value.accessCount,
                age: Date.now() - value.timestamp
            });
        }
        
        return stats;
    }
}

// ═══════════════════════════════════════════════════════════════
// 🔧 Enhanced DWG Parser - الإصدار المحسّن
// ═══════════════════════════════════════════════════════════════

class EnhancedDWGParser {
    constructor() {
        this.supportedFormats = ['dxf', 'dwg'];
        this.parsedData = null;
        this.entities = [];
        this.layers = [];
        this.blocks = [];
        this.tables = [];
        this.units = 'Millimeters';
        
        // الأنظمة المساعدة
        this.logger = new Logger('DWGParser');
        this.unitConverter = new UnitConverter();
        this.validator = new DataValidator();
        this.cache = new DWGParserCache();
        
        // خيارات المعالجة
        this.options = {
            useCache: true,
            validateData: true,
            normalizeUnits: true,
            targetUnit: 'Millimeters',
            extractTables: true,
            extractBlocks: true,
            extractText: true
        };
        
        this.initializeParsers();
    }
    
    /**
     * تهيئة المحللات
     */
    initializeParsers() {
        try {
            // محاولة تحميل dxf-parser
            if (typeof DxfParser !== 'undefined') {
                this.dxfParser = new DxfParser();
                this.logger.info('تم تحميل dxf-parser');
            } else {
                this.logger.warn('dxf-parser غير متوفر، استخدام المحلل البديل');
                this.dxfParser = null;
            }
        } catch (error) {
            this.logger.error('فشل تهيئة المحللات', error);
        }
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 📂 استيراد ملف مع جميع التحسينات
     * ══════════════════════════════════════════════════════════
     */
    async importFile(file, options = {}) {
        try {
            this.logger.info(`بدء استيراد: ${file.name}`, {
                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                type: file.type
            });
            
            // دمج الخيارات
            const opts = { ...this.options, ...options };
            
            // التحقق من الكاش
            if (opts.useCache && !opts.forceReparse) {
                const fileHash = await this.cache.calculateFileHash(file);
                const cached = this.cache.get(fileHash);
                
                if (cached) {
                    this.logger.info('✅ استرجاع من الكاش');
                    Object.assign(this, cached);
                    
                    return {
                        success: true,
                        fromCache: true,
                        ...this.getImportResult()
                    };
                }
            }
            
            // التحقق من الصيغة
            const extension = file.name.split('.').pop().toLowerCase();
            if (!this.supportedFormats.includes(extension)) {
                throw new Error(`❌ الصيغة ${extension} غير مدعومة`);
            }
            
            // قراءة الملف مع Progress
            const fileContent = await this.readFileWithProgress(
                file,
                opts.onProgress
            );
            
            // التحليل
            let parsedData;
            if (extension === 'dxf') {
                parsedData = await this.parseDXF(fileContent, opts);
            } else {
                parsedData = await this.parseDWG(fileContent, opts);
            }
            
            // استخراج البيانات
            await this.extractAllData(parsedData, opts);
            
            // توحيد الوحدات
            if (opts.normalizeUnits && this.units !== opts.targetUnit) {
                this.normalizeUnits(opts.targetUnit);
            }
            
            // التحقق من البيانات
            if (opts.validateData) {
                this.validateAllData();
            }
            
            // حفظ في الكاش
            if (opts.useCache) {
                const fileHash = await this.cache.calculateFileHash(file);
                this.cache.set(fileHash, this.getImportResult());
            }
            
            this.logger.info('✅ اكتمل الاستيراد بنجاح', this.getStatistics());
            
            return {
                success: true,
                fromCache: false,
                ...this.getImportResult()
            };
            
        } catch (error) {
            this.logger.error('❌ فشل الاستيراد', {
                error: error.message,
                stack: error.stack
            });
            
            return {
                success: false,
                error: error.message,
                logs: this.logger.export()
            };
        }
    }
    
    /**
     * قراءة ملف مع تتبع التقدم
     */
    async readFileWithProgress(file, onProgress) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                if (onProgress) onProgress(30, 'تم قراءة الملف');
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('فشل قراءة الملف'));
            };
            
            reader.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    const progress = (e.loaded / e.total) * 30; // 30% للقراءة
                    onProgress(progress, 'قراءة الملف...');
                }
            };
            
            if (file.name.endsWith('.dxf')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }
    
    /**
     * تحليل DXF
     */
    async parseDXF(fileContent, options) {
        try {
            this.logger.info('🔍 تحليل DXF...');
            
            if (options.onProgress) {
                options.onProgress(40, 'تحليل DXF...');
            }
            
            if (this.dxfParser) {
                const dxf = this.dxfParser.parseSync(fileContent);
                this.parsedData = dxf;
                return dxf;
            } else {
                throw new Error('dxf-parser غير متوفر');
            }
            
        } catch (error) {
            this.logger.error('فشل تحليل DXF', error);
            throw new Error(`فشل تحليل DXF: ${error.message}`);
        }
    }
    
    /**
     * تحليل DWG
     */
    async parseDWG(fileContent, options) {
        this.logger.warn('⚠️ ملفات DWG تحتاج تحويل إلى DXF');
        
        throw new Error(
            'ملفات DWG غير مدعومة حالياً.\n\n' +
            '📝 الحلول المتاحة:\n' +
            '1️⃣ قم بتصدير الملف كـ DXF من AutoCAD:\n' +
            '   File > Save As > AutoCAD DXF (*.dxf)\n\n' +
            '2️⃣ استخدم محول مجاني عبر الإنترنت:\n' +
            '   - https://www.zamzar.com/convert/dwg-to-dxf/\n' +
            '   - https://cloudconvert.com/dwg-to-dxf\n\n' +
            '3️⃣ للدعم الكامل لـ DWG، يمكن استخدام Autodesk Forge API'
        );
    }
    
    /**
     * استخراج جميع البيانات
     */
    async extractAllData(dxf, options) {
        this.logger.info('📦 استخراج البيانات...');
        
        // استخراج الطبقات
        if (options.onProgress) options.onProgress(50, 'استخراج الطبقات...');
        this.layers = this.extractLayers(dxf);
        this.logger.info(`✅ ${this.layers.length} طبقة`);
        
        // استخراج الكائنات
        if (options.onProgress) options.onProgress(60, 'استخراج الكائنات...');
        this.entities = this.extractEntities(dxf);
        this.logger.info(`✅ ${this.entities.length} كائن`);
        
        // استخراج الكتل
        if (options.extractBlocks) {
            if (options.onProgress) options.onProgress(70, 'استخراج الكتل...');
            this.blocks = this.extractBlocks(dxf);
            this.logger.info(`✅ ${this.blocks.length} كتلة`);
        }
        
        // استخراج الجداول
        if (options.extractTables) {
            if (options.onProgress) options.onProgress(80, 'استخراج الجداول...');
            this.tables = await this.extractTablesEnhanced(dxf);
            this.logger.info(`✅ ${this.tables.length} جدول`);
        }
        
        // استخراج الوحدات
        this.units = this.extractUnits(dxf);
        this.logger.info(`✅ الوحدات: ${this.units}`);
        
        if (options.onProgress) options.onProgress(90, 'الانتهاء...');
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 📊 استخراج جداول محسّن
     * ══════════════════════════════════════════════════════════
     */
    async extractTablesEnhanced(dxf) {
        const tables = [];
        
        try {
            // 1️⃣ استخراج من كائنات TABLE الحقيقية
            const tableEntities = this.entities.filter(e => e.type === 'ACAD_TABLE' || e.type === 'TABLE');
            
            for (const tableEntity of tableEntities) {
                const parsed = this.parseTableEntity(tableEntity);
                if (parsed) {
                    tables.push({
                        id: tableEntity.id,
                        position: tableEntity.geometry?.position,
                        type: this.detectTableType(parsed),
                        source: 'TABLE_ENTITY',
                        data: parsed,
                        confidence: 1.0
                    });
                }
            }
            
            // 2️⃣ استخراج من MTEXT
            const mtextEntities = this.entities.filter(e => e.type === 'MTEXT');
            
            for (const entity of mtextEntities) {
                const text = entity.geometry?.text;
                if (text && this.isTable(text)) {
                    const parsed = this.parseTableFromText(text);
                    if (parsed) {
                        tables.push({
                            id: entity.id,
                            position: entity.geometry?.position,
                            type: this.detectTableType(parsed),
                            source: 'MTEXT',
                            data: parsed,
                            confidence: 0.7
                        });
                    }
                }
            }
            
            // 3️⃣ استخراج من مجموعات TEXT المتجاورة
            const textGroups = this.groupAdjacentText();
            
            for (const group of textGroups) {
                if (this.isTableGroup(group)) {
                    const parsed = this.parseTableFromTextGroup(group);
                    if (parsed) {
                        tables.push({
                            id: `text_group_${group[0].id}`,
                            position: group[0].geometry?.position,
                            type: this.detectTableType(parsed),
                            source: 'TEXT_GROUP',
                            data: parsed,
                            confidence: 0.5
                        });
                    }
                }
            }
            
            this.logger.info(`استخراج ${tables.length} جدول من مصادر مختلفة`);
            
        } catch (error) {
            this.logger.error('خطأ في استخراج الجداول', error);
        }
        
        return tables;
    }
    
    /**
     * تحليل كائن TABLE
     */
    parseTableEntity(tableEntity) {
        try {
            const table = {
                headers: [],
                rows: [],
                columns: 0,
                rowCount: 0
            };
            
            // محاولة استخراج من rawData
            if (tableEntity.rawData?.rows) {
                tableEntity.rawData.rows.forEach((row, index) => {
                    if (index === 0) {
                        table.headers = row.cells?.map(cell => cell.text || cell.value || '') || [];
                        table.columns = table.headers.length;
                    } else {
                        const rowObject = {};
                        row.cells?.forEach((cell, cellIndex) => {
                            const header = table.headers[cellIndex] || `Column${cellIndex}`;
                            rowObject[header] = cell.text || cell.value || '';
                        });
                        table.rows.push(rowObject);
                    }
                });
                
                table.rowCount = table.rows.length;
            }
            
            return table.rows.length > 0 ? table : null;
            
        } catch (error) {
            this.logger.warn('فشل تحليل TABLE entity', error);
            return null;
        }
    }
    
    /**
     * تجميع النصوص المتجاورة
     */
    groupAdjacentText() {
        const textEntities = this.entities.filter(e => 
            e.type === 'TEXT' || e.type === 'MTEXT'
        );
        
        if (textEntities.length === 0) return [];
        
        const groups = [];
        const threshold = 100; // مسافة قصوى بالملم
        const visited = new Set();
        
        textEntities.forEach((entity, index) => {
            if (visited.has(index)) return;
            
            const group = [entity];
            visited.add(index);
            
            // البحث عن نصوص قريبة
            for (let i = index + 1; i < textEntities.length; i++) {
                if (visited.has(i)) continue;
                
                const other = textEntities[i];
                const minDistance = Math.min(
                    ...group.map(g => {
                        const d = this.calculateDistance(
                            g.geometry?.position,
                            other.geometry?.position
                        );
                        return d;
                    })
                );
                
                if (minDistance < threshold) {
                    group.push(other);
                    visited.add(i);
                }
            }
            
            if (group.length >= 4) {
                groups.push(group);
            }
        });
        
        return groups;
    }
    
    /**
     * التحقق من كون المجموعة جدول
     */
    isTableGroup(group) {
        if (group.length < 4) return false;
        
        // فحص التنظيم الشبكي
        const positions = group.map(e => e.geometry?.position).filter(p => p);
        if (positions.length < 4) return false;
        
        // تجميع حسب Y
        const yGroups = new Map();
        const yTolerance = 10; // ملم
        
        positions.forEach(p => {
            const yRounded = Math.round(p.y / yTolerance) * yTolerance;
            if (!yGroups.has(yRounded)) {
                yGroups.set(yRounded, []);
            }
            yGroups.get(yRounded).push(p);
        });
        
        // يجب وجود صفان على الأقل مع نقطتين لكل صف
        return yGroups.size >= 2 && 
               Array.from(yGroups.values()).every(row => row.length >= 2);
    }
    
    /**
     * تحليل جدول من مجموعة نصوص
     */
    parseTableFromTextGroup(group) {
        try {
            // ترتيب حسب Y (من الأعلى) ثم X (من اليسار)
            const sorted = group.sort((a, b) => {
                const posA = a.geometry?.position;
                const posB = b.geometry?.position;
                if (!posA || !posB) return 0;
                
                const yDiff = posB.y - posA.y;
                if (Math.abs(yDiff) > 10) return yDiff;
                return posA.x - posB.x;
            });
            
            // تقسيم إلى صفوف
            const rows = [];
            let currentRow = [];
            let lastY = sorted[0].geometry?.position?.y;
            
            sorted.forEach(entity => {
                const y = entity.geometry?.position?.y;
                if (Math.abs(y - lastY) > 10) {
                    if (currentRow.length > 0) {
                        rows.push(currentRow);
                    }
                    currentRow = [];
                    lastY = y;
                }
                currentRow.push(entity.geometry?.text || '');
            });
            
            if (currentRow.length > 0) {
                rows.push(currentRow);
            }
            
            // تحويل إلى جدول
            if (rows.length < 2) return null;
            
            const table = {
                headers: rows[0],
                rows: [],
                columns: rows[0].length,
                rowCount: rows.length - 1
            };
            
            for (let i = 1; i < rows.length; i++) {
                if (rows[i].length === table.columns) {
                    const rowObject = {};
                    table.headers.forEach((header, index) => {
                        rowObject[header] = rows[i][index];
                    });
                    table.rows.push(rowObject);
                }
            }
            
            return table;
            
        } catch (error) {
            this.logger.warn('فشل تحليل TEXT group', error);
            return null;
        }
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * ✅ توحيد الوحدات
     * ══════════════════════════════════════════════════════════
     */
    normalizeUnits(targetUnit) {
        this.logger.info(`توحيد الوحدات من ${this.units} إلى ${targetUnit}...`);
        
        this.entities = this.unitConverter.normalizeEntities(
            this.entities,
            this.units,
            targetUnit
        );
        
        this.units = targetUnit;
        this.logger.info('✅ تم توحيد الوحدات');
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * ✅ التحقق من صحة البيانات
     * ══════════════════════════════════════════════════════════
     */
    validateAllData() {
        this.logger.info('🔍 التحقق من صحة البيانات...');
        
        this.validator.reset();
        
        // التحقق من الكائنات
        this.entities = this.entities
            .map(e => this.validator.validateEntity(e))
            .filter(e => e !== null);
        
        const report = this.validator.getReport();
        
        if (report.hasErrors) {
            this.logger.warn(`${report.errors.length} أخطاء في البيانات`);
        }
        
        if (report.hasWarnings) {
            this.logger.info(`${report.warnings.length} تحذير`);
        }
        
        this.logger.info('✅ اكتمل التحقق');
        
        return report;
    }
    
    /**
     * ══════════════════════════════════════════════════════════
     * 📊 دوال مساعدة
     * ══════════════════════════════════════════════════════════
     */
    
    calculateDistance(p1, p2) {
        if (!p1 || !p2) return Infinity;
        
        const dx = (p2.x || 0) - (p1.x || 0);
        const dy = (p2.y || 0) - (p1.y || 0);
        const dz = (p2.z || 0) - (p1.z || 0);
        
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }
    
    isTable(text) {
        if (!text) return false;
        
        const indicators = [
            '|', '\\t',
            'جدول', 'table', 'schedule',
            'رقم', 'no.', 'item',
            'البند', 'الكمية', 'quantity'
        ];
        
        const lowerText = text.toLowerCase();
        return indicators.some(ind => lowerText.includes(ind.toLowerCase()));
    }
    
    parseTableFromText(text) {
        const rows = text.split('\n').filter(row => row.trim());
        if (rows.length < 2) return null;
        
        const table = {
            headers: [],
            rows: []
        };
        
        table.headers = this.splitTableRow(rows[0]);
        
        for (let i = 1; i < rows.length; i++) {
            const cells = this.splitTableRow(rows[i]);
            if (cells.length === table.headers.length) {
                const rowObject = {};
                table.headers.forEach((header, index) => {
                    rowObject[header] = cells[index];
                });
                table.rows.push(rowObject);
            }
        }
        
        return table.rows.length > 0 ? table : null;
    }
    
    splitTableRow(row) {
        if (row.includes('|')) {
            return row.split('|').map(c => c.trim()).filter(c => c);
        } else if (row.includes('\t')) {
            return row.split('\t').map(c => c.trim()).filter(c => c);
        } else {
            return row.split(/\s{2,}/).map(c => c.trim()).filter(c => c);
        }
    }
    
    detectTableType(table) {
        const headers = table.headers.map(h => h.toLowerCase());
        
        if (headers.some(h => h.includes('تشطيب') || h.includes('finish'))) {
            return 'finishes';
        }
        if (headers.some(h => h.includes('تسليح') || h.includes('reinforcement'))) {
            return 'reinforcement';
        }
        if (headers.some(h => h.includes('سماكة') || h.includes('thickness'))) {
            return 'thickness';
        }
        if (headers.some(h => h.includes('كمية') || h.includes('quantity'))) {
            return 'quantities';
        }
        
        return 'unknown';
    }
    
    extractLayers(dxf) {
        // ... (الكود السابق)
        return [];
    }
    
    extractEntities(dxf) {
        // ... (الكود السابق)
        return [];
    }
    
    extractBlocks(dxf) {
        // ... (الكود السابق)
        return [];
    }
    
    extractUnits(dxf) {
        // ... (الكود السابق)
        return 'Millimeters';
    }
    
    getStatistics() {
        return {
            entities: this.entities.length,
            layers: this.layers.length,
            blocks: this.blocks.length,
            tables: this.tables.length,
            units: this.units
        };
    }
    
    getImportResult() {
        return {
            entities: this.entities,
            layers: this.layers,
            blocks: this.blocks,
            tables: this.tables,
            units: this.units,
            statistics: this.getStatistics(),
            logs: this.logger.export()
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// 🌍 تصدير
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.EnhancedDWGParser = EnhancedDWGParser;
    window.UnitConverter = UnitConverter;
    window.DataValidator = DataValidator;
    window.Logger = Logger;
}
