/**
 * ═══════════════════════════════════════════════════════════════
 * 🔄 2D to 3D Converter - محول 2D إلى 3D الذكي
 * ═══════════════════════════════════════════════════════════════
 * 
 * القدرات:
 * ✅ تحويل خطوط 2D إلى جدران 3D
 * ✅ تحويل دوائر إلى أعمدة 3D
 * ✅ تحويل Polylines إلى بلاطات 3D
 * ✅ كشف تلقائي للأبواب والنوافذ
 * ✅ تطبيق سماكات من الجداول
 * ✅ تطبيق ارتفاعات ذكية
 * ✅ دمج التشطيبات والمواد
 * ═══════════════════════════════════════════════════════════════
 */

class TwoDToThreeDConverter {
    constructor(engine, layerExtractor) {
        this.engine = engine;
        this.layerExtractor = layerExtractor;
        this.conversionRules = this.initializeRules();
        this.defaultParameters = this.initializeDefaults();
        this.generatedElements = [];
    }

    /**
     * تهيئة قواعد التحويل
     */
    initializeRules() {
        return {
            // قواعد تحويل الجدران
            walls: {
                entityTypes: ['LINE', 'POLYLINE', 'LWPOLYLINE'],
                minLength: 500, // ملم
                defaultHeight: 3000,
                defaultThickness: 200,
                detectOpenings: true
            },
            
            // قواعد تحويل الأعمدة
            columns: {
                entityTypes: ['CIRCLE', 'INSERT'],
                minDiameter: 200,
                maxDiameter: 1000,
                defaultHeight: 3000,
                shape: 'circular'
            },
            
            // قواعد تحويل البلاطات
            slabs: {
                entityTypes: ['POLYLINE', 'LWPOLYLINE'],
                closed: true,
                minArea: 1000000, // مم²
                defaultThickness: 200,
                elevation: 0
            },
            
            // قواعد الأبواب
            doors: {
                detectInWalls: true,
                minWidth: 600,
                maxWidth: 2000,
                defaultHeight: 2100
            },
            
            // قواعد النوافذ
            windows: {
                detectInWalls: true,
                minWidth: 500,
                maxWidth: 3000,
                defaultHeight: 1200,
                defaultSillHeight: 900
            }
        };
    }

    /**
     * تهيئة المعاملات الافتراضية
     */
    initializeDefaults() {
        return {
            units: 'mm',
            floorHeight: 3000,
            foundationDepth: -1000,
            
            // سماكات افتراضية
            thickness: {
                exteriorWall: 250,
                interiorWall: 150,
                slab: 200,
                foundation: 400
            },
            
            // ارتفاعات افتراضية
            heights: {
                floor: 3000,
                parapet: 1000,
                door: 2100,
                window: 1200
            },
            
            // مواد افتراضية
            materials: {
                concrete: { color: 0xCCCCCC, roughness: 0.8 },
                brick: { color: 0xB87333, roughness: 0.9 },
                glass: { color: 0x88CCFF, opacity: 0.3 },
                wood: { color: 0x8B4513, roughness: 0.6 }
            }
        };
    }

    /**
     * ══════════════════════════════════════════════════════════
     * 🎯 التحويل الرئيسي من 2D إلى 3D
     * ══════════════════════════════════════════════════════════
     */
    async convertAll(dwgParser, options = {}) {
        console.log('🔄 بدء التحويل من 2D إلى 3D...');
        
        // دمج الخيارات
        const conversionOptions = { ...this.defaultParameters, ...options };
        
        // مرحلة 1: تحليل الطبقات
        const classifiedLayers = this.layerExtractor.analyzeAndClassifyLayers();
        console.log('✅ المرحلة 1: تحليل الطبقات مكتمل');
        
        // مرحلة 2: تحويل العناصر الإنشائية
        await this.convertStructuralElements(classifiedLayers, conversionOptions);
        console.log('✅ المرحلة 2: تحويل العناصر الإنشائية مكتمل');
        
        // مرحلة 3: تحويل العناصر المعمارية
        await this.convertArchitecturalElements(classifiedLayers, conversionOptions);
        console.log('✅ المرحلة 3: تحويل العناصر المعمارية مكتمل');
        
        // مرحلة 4: كشف وإضافة الفتحات (أبواب/نوافذ)
        await this.detectAndAddOpenings(conversionOptions);
        console.log('✅ المرحلة 4: كشف الفتحات مكتمل');
        
        // مرحلة 5: تطبيق المواد والتشطيبات
        await this.applyMaterialsAndFinishes(conversionOptions);
        console.log('✅ المرحلة 5: تطبيق المواد مكتمل');
        
        console.log(`✅ التحويل الكامل مكتمل: ${this.generatedElements.length} عنصر`);
        
        return {
            success: true,
            elements: this.generatedElements,
            statistics: this.getConversionStatistics()
        };
    }

    /**
     * ══════════════════════════════════════════════════════════
     * 🏗️ تحويل العناصر الإنشائية
     * ══════════════════════════════════════════════════════════
     */
    async convertStructuralElements(classifiedLayers, options) {
        const structuralLayers = this.layerExtractor.layerCategories.structural;
        
        for (const layer of structuralLayers) {
            const entities = this.layerExtractor.parser.getEntitiesByLayer(layer.name);
            
            for (const entity of entities) {
                // تحويل الأعمدة
                if (this.isColumn(entity, layer)) {
                    await this.convertToColumn(entity, options);
                }
                
                // تحويل الكمرات
                if (this.isBeam(entity, layer)) {
                    await this.convertToBeam(entity, options);
                }
                
                // تحويل البلاطات
                if (this.isSlab(entity, layer)) {
                    await this.convertToSlab(entity, options);
                }
            }
        }
    }

    /**
     * التحقق من كون العنصر عمود
     */
    isColumn(entity, layer) {
        // دوائر بقطر مناسب
        if (entity.type === 'CIRCLE') {
            const diameter = entity.geometry.radius * 2 * 1000; // تحويل إلى ملم
            return diameter >= this.conversionRules.columns.minDiameter &&
                   diameter <= this.conversionRules.columns.maxDiameter;
        }
        
        // كتل أعمدة
        if (entity.type === 'INSERT' && 
            layer.name.toLowerCase().includes('column')) {
            return true;
        }
        
        // مربعات صغيرة
        if (entity.type === 'LWPOLYLINE' && entity.geometry.closed) {
            const vertices = entity.geometry.vertices;
            if (vertices.length === 4) {
                const width = Math.abs(vertices[1].x - vertices[0].x) * 1000;
                const depth = Math.abs(vertices[2].y - vertices[1].y) * 1000;
                return width >= 200 && width <= 1000 && 
                       depth >= 200 && depth <= 1000;
            }
        }
        
        return false;
    }

    /**
     * تحويل إلى عمود 3D
     */
    async convertToColumn(entity, options) {
        let width, depth, x, z;
        
        if (entity.type === 'CIRCLE') {
            const diameter = entity.geometry.radius * 2 * 1000;
            width = depth = diameter;
            x = entity.geometry.center.x * 1000;
            z = entity.geometry.center.y * 1000;
        } else if (entity.type === 'LWPOLYLINE') {
            const vertices = entity.geometry.vertices;
            width = Math.abs(vertices[1].x - vertices[0].x) * 1000;
            depth = Math.abs(vertices[2].y - vertices[1].y) * 1000;
            x = (vertices[0].x + vertices[1].x) / 2 * 1000;
            z = (vertices[0].y + vertices[2].y) / 2 * 1000;
        } else {
            return null;
        }
        
        const height = options.heights.floor || this.conversionRules.columns.defaultHeight;
        
        const element = this.engine.addColumn(
            x / 1000,
            z / 1000,
            width / 1000,
            depth / 1000,
            height / 1000,
            0x888888
        );
        
        element.source2D = entity;
        element.layer = entity.layer;
        this.generatedElements.push(element);
        
        return element;
    }

    /**
     * التحقق من كون العنصر كمرة
     */
    isBeam(entity, layer) {
        if (entity.type !== 'LINE' && entity.type !== 'LWPOLYLINE') {
            return false;
        }
        
        return layer.name.toLowerCase().includes('beam') ||
               layer.name.toLowerCase().includes('كمر');
    }

    /**
     * تحويل إلى كمرة 3D
     */
    async convertToBeam(entity, options) {
        if (!entity.geometry.vertices || entity.geometry.vertices.length < 2) {
            return null;
        }
        
        const start = entity.geometry.vertices[0];
        const end = entity.geometry.vertices[entity.geometry.vertices.length - 1];
        
        // كمرة = جدار بسماكة أقل وارتفاع محدد
        const height = 500; // 50 سم ارتفاع الكمرة
        const thickness = 250; // 25 سم عرض الكمرة
        const elevation = (options.heights.floor || 3000) - height; // أسفل السقف
        
        const element = this.engine.addWall(
            start.x * 1000 / 1000,
            start.y * 1000 / 1000,
            end.x * 1000 / 1000,
            end.y * 1000 / 1000,
            height / 1000,
            thickness / 1000,
            0x666666
        );
        
        // رفع الكمرة إلى الارتفاع المناسب
        element.mesh.position.y = elevation / 1000 + (height / 2) / 1000;
        element.type = 'beam';
        element.source2D = entity;
        element.layer = entity.layer;
        
        this.generatedElements.push(element);
        return element;
    }

    /**
     * التحقق من كون العنصر بلاطة
     */
    isSlab(entity, layer) {
        if (entity.type !== 'LWPOLYLINE' && entity.type !== 'POLYLINE') {
            return false;
        }
        
        if (!entity.geometry.closed) {
            return false;
        }
        
        // حساب المساحة
        const area = entity.geometry.dimensions?.area || 0;
        
        return (layer.name.toLowerCase().includes('slab') ||
                layer.name.toLowerCase().includes('بلاطة')) &&
                area * 1000000 >= this.conversionRules.slabs.minArea;
    }

    /**
     * تحويل إلى بلاطة 3D
     */
    async convertToSlab(entity, options) {
        const vertices = entity.geometry.vertices;
        if (!vertices || vertices.length < 3) {
            return null;
        }
        
        // حساب المركز والأبعاد
        const bounds = this.calculateBounds(vertices);
        const width = (bounds.maxX - bounds.minX) * 1000;
        const length = (bounds.maxY - bounds.minY) * 1000;
        const centerX = (bounds.maxX + bounds.minX) / 2 * 1000;
        const centerZ = (bounds.maxY + bounds.minY) / 2 * 1000;
        
        const thickness = options.thickness.slab || this.conversionRules.slabs.defaultThickness;
        const elevation = options.heights.floor || 3000;
        
        const element = this.engine.addSlab(
            centerX / 1000,
            centerZ / 1000,
            width / 1000,
            length / 1000,
            thickness / 1000,
            0xAAAAAA
        );
        
        // رفع البلاطة إلى أعلى الطابق
        element.mesh.position.y = elevation / 1000 - (thickness / 2) / 1000;
        element.source2D = entity;
        element.layer = entity.layer;
        
        this.generatedElements.push(element);
        return element;
    }

    /**
     * ══════════════════════════════════════════════════════════
     * 🏛️ تحويل العناصر المعمارية
     * ══════════════════════════════════════════════════════════
     */
    async convertArchitecturalElements(classifiedLayers, options) {
        const architecturalLayers = this.layerExtractor.layerCategories.architectural;
        
        for (const layer of architecturalLayers) {
            const entities = this.layerExtractor.parser.getEntitiesByLayer(layer.name);
            
            for (const entity of entities) {
                // تحويل الجدران
                if (this.isWall(entity, layer)) {
                    await this.convertToWall(entity, layer, options);
                }
            }
        }
    }

    /**
     * التحقق من كون العنصر جدار
     */
    isWall(entity, layer) {
        // خطوط طويلة
        if (entity.type === 'LINE') {
            const length = entity.geometry.dimensions?.length || 0;
            return length * 1000 >= this.conversionRules.walls.minLength;
        }
        
        // Polylines مفتوحة أو مغلقة
        if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
            return layer.name.toLowerCase().includes('wall') ||
                   layer.name.toLowerCase().includes('جدار');
        }
        
        return false;
    }

    /**
     * تحويل إلى جدار 3D
     */
    async convertToWall(entity, layer, options) {
        const vertices = entity.geometry.vertices;
        if (!vertices || vertices.length < 2) {
            return null;
        }
        
        // تحديد السماكة حسب نوع الجدار
        let thickness;
        const layerName = layer.name.toLowerCase();
        if (layerName.includes('external') || layerName.includes('خارجي')) {
            thickness = options.thickness.exteriorWall;
        } else {
            thickness = options.thickness.interiorWall;
        }
        
        const height = options.heights.floor || this.conversionRules.walls.defaultHeight;
        
        // إنشاء جدران لكل segment
        const wallElements = [];
        
        for (let i = 0; i < vertices.length - 1; i++) {
            const start = vertices[i];
            const end = vertices[i + 1];
            
            const element = this.engine.addWall(
                start.x * 1000 / 1000,
                start.y * 1000 / 1000,
                end.x * 1000 / 1000,
                end.y * 1000 / 1000,
                height / 1000,
                thickness / 1000,
                0xCCCCCC
            );
            
            element.source2D = entity;
            element.layer = entity.layer;
            element.isExterior = layerName.includes('external') || 
                                 layerName.includes('خارجي');
            
            wallElements.push(element);
            this.generatedElements.push(element);
        }
        
        // إذا كان Polyline مغلق، إضافة الجدار الأخير
        if (entity.geometry.closed && vertices.length > 2) {
            const start = vertices[vertices.length - 1];
            const end = vertices[0];
            
            const element = this.engine.addWall(
                start.x * 1000 / 1000,
                start.y * 1000 / 1000,
                end.x * 1000 / 1000,
                end.y * 1000 / 1000,
                height / 1000,
                thickness / 1000,
                0xCCCCCC
            );
            
            element.source2D = entity;
            element.layer = entity.layer;
            wallElements.push(element);
            this.generatedElements.push(element);
        }
        
        return wallElements;
    }

    /**
     * ══════════════════════════════════════════════════════════
     * 🚪 كشف وإضافة الفتحات
     * ══════════════════════════════════════════════════════════
     */
    async detectAndAddOpenings(options) {
        console.log('🔍 كشف الأبواب والنوافذ...');
        
        // البحث عن طبقات الأبواب والنوافذ
        const doorLayers = this.layerExtractor.parser.layers.filter(l => 
            l.name.toLowerCase().includes('door') || 
            l.name.toLowerCase().includes('باب')
        );
        
        const windowLayers = this.layerExtractor.parser.layers.filter(l => 
            l.name.toLowerCase().includes('window') || 
            l.name.toLowerCase().includes('نافذة')
        );
        
        // معالجة الأبواب
        for (const layer of doorLayers) {
            const entities = this.layerExtractor.parser.getEntitiesByLayer(layer.name);
            for (const entity of entities) {
                await this.addDoorFromEntity(entity, options);
            }
        }
        
        // معالجة النوافذ
        for (const windowLayers of windowLayers) {
            const entities = this.layerExtractor.parser.getEntitiesByLayer(windowLayers.name);
            for (const entity of entities) {
                await this.addWindowFromEntity(entity, options);
            }
        }
    }

    /**
     * إضافة باب من كائن 2D
     */
    async addDoorFromEntity(entity, options) {
        if (entity.type !== 'INSERT' && entity.type !== 'ARC') {
            return null;
        }
        
        let position, width = 800, wallElement = null;
        
        if (entity.type === 'INSERT') {
            position = {
                x: entity.geometry.position.x * 1000 / 1000,
                z: entity.geometry.position.y * 1000 / 1000
            };
            
            // محاولة استخراج العرض من scale
            if (entity.geometry.scale) {
                width = entity.geometry.scale.x * 800;
            }
        } else if (entity.type === 'ARC') {
            // الباب يُرسم كقوس
            position = {
                x: entity.geometry.center.x * 1000 / 1000,
                z: entity.geometry.center.y * 1000 / 1000
            };
            width = entity.geometry.radius * 2 * 1000;
        }
        
        // البحث عن أقرب جدار
        wallElement = this.findNearestWall(position);
        
        if (!wallElement) {
            console.warn('⚠️ لم يتم العثور على جدار لوضع الباب');
            return null;
        }
        
        // تحديد نوع وحجم الباب
        let doorType = 'single';
        let size = 'd80';
        
        if (width >= 1400) {
            doorType = 'double';
            if (width <= 1400) size = 'd140';
            else if (width <= 1600) size = 'd160';
            else size = 'd180';
        } else {
            if (width <= 700) size = 'd70';
            else if (width <= 800) size = 'd80';
            else if (width <= 900) size = 'd90';
            else size = 'd100';
        }
        
        // إضافة الباب باستخدام YQArch
        if (window.yqarch) {
            const door = window.yqarch.addSmartDoor(
                wallElement,
                position,
                doorType,
                size
            );
            
            if (door) {
                door.source2D = entity;
                this.generatedElements.push(door);
                return door;
            }
        }
        
        return null;
    }

    /**
     * إضافة نافذة من كائن 2D
     */
    async addWindowFromEntity(entity, options) {
        if (entity.type !== 'INSERT' && entity.type !== 'LINE' && 
            entity.type !== 'LWPOLYLINE') {
            return null;
        }
        
        let position, width = 1200, wallElement = null;
        
        if (entity.type === 'INSERT') {
            position = {
                x: entity.geometry.position.x * 1000 / 1000,
                y: 1.2, // ارتفاع افتراضي
                z: entity.geometry.position.y * 1000 / 1000
            };
            
            if (entity.geometry.scale) {
                width = entity.geometry.scale.x * 1200;
            }
        } else if (entity.type === 'LINE') {
            const start = entity.geometry.vertices[0];
            const end = entity.geometry.vertices[1];
            position = {
                x: (start.x + end.x) / 2 * 1000 / 1000,
                y: 1.2,
                z: (start.y + end.y) / 2 * 1000 / 1000
            };
            width = entity.geometry.dimensions.length * 1000;
        }
        
        // البحث عن أقرب جدار
        wallElement = this.findNearestWall(position);
        
        if (!wallElement) {
            console.warn('⚠️ لم يتم العثور على جدار لوضع النافذة');
            return null;
        }
        
        // تحديد نوع وحجم النافذة
        let windowType = 'simple';
        let size = 'w120';
        
        if (width >= 1200) {
            windowType = 'double';
            if (width <= 1200) size = 'w120';
            else if (width <= 1500) size = 'w150';
            else size = 'w180';
        } else {
            if (width <= 800) size = 'w80';
            else if (width <= 1000) size = 'w100';
            else if (width <= 1200) size = 'w120';
            else size = 'w150';
        }
        
        // إضافة النافذة باستخدام YQArch
        if (window.yqarch) {
            const window_element = window.yqarch.addSmartWindow(
                wallElement,
                position,
                windowType,
                size
            );
            
            if (window_element) {
                window_element.source2D = entity;
                this.generatedElements.push(window_element);
                return window_element;
            }
        }
        
        return null;
    }

    /**
     * البحث عن أقرب جدار لموقع معين
     */
    findNearestWall(position) {
        const walls = this.generatedElements.filter(e => e.type === 'wall');
        if (walls.length === 0) return null;
        
        let nearestWall = null;
        let minDistance = Infinity;
        
        walls.forEach(wall => {
            const wallPos = wall.mesh.position;
            const distance = Math.sqrt(
                Math.pow(wallPos.x - position.x, 2) +
                Math.pow(wallPos.z - position.z, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestWall = wall;
            }
        });
        
        return nearestWall;
    }

    /**
     * ══════════════════════════════════════════════════════════
     * 🎨 تطبيق المواد والتشطيبات
     * ══════════════════════════════════════════════════════════
     */
    async applyMaterialsAndFinishes(options) {
        console.log('🎨 تطبيق المواد والتشطيبات...');
        
        this.generatedElements.forEach(element => {
            if (!element.mesh) return;
            
            let material;
            
            switch (element.type) {
                case 'wall':
                    if (element.isExterior) {
                        // جدار خارجي - لون فاتح
                        material = new THREE.MeshPhongMaterial({
                            color: 0xE8E8E8,
                            roughness: 0.8
                        });
                    } else {
                        // جدار داخلي - لون أفتح
                        material = new THREE.MeshPhongMaterial({
                            color: 0xF5F5F5,
                            roughness: 0.7
                        });
                    }
                    break;
                    
                case 'column':
                    // أعمدة - رمادي داكن
                    material = new THREE.MeshPhongMaterial({
                        color: 0x888888,
                        roughness: 0.9
                    });
                    break;
                    
                case 'slab':
                    // بلاطات - رمادي فاتح
                    material = new THREE.MeshPhongMaterial({
                        color: 0xBBBBBB,
                        roughness: 0.8
                    });
                    break;
                    
                case 'beam':
                    // كمرات - رمادي متوسط
                    material = new THREE.MeshPhongMaterial({
                        color: 0x999999,
                        roughness: 0.85
                    });
                    break;
                    
                default:
                    material = element.mesh.material;
            }
            
            if (material) {
                element.mesh.material = material;
            }
        });
    }

    /**
     * ══════════════════════════════════════════════════════════
     * 📊 دوال مساعدة
     * ══════════════════════════════════════════════════════════
     */
    
    calculateBounds(vertices) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        vertices.forEach(v => {
            minX = Math.min(minX, v.x);
            minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x);
            maxY = Math.max(maxY, v.y);
        });
        
        return { minX, minY, maxX, maxY };
    }

    getConversionStatistics() {
        const stats = {
            total: this.generatedElements.length,
            byType: {}
        };
        
        this.generatedElements.forEach(element => {
            stats.byType[element.type] = (stats.byType[element.type] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * ══════════════════════════════════════════════════════════
     * 🔄 إعادة التعيين
     * ══════════════════════════════════════════════════════════
     */
    reset() {
        this.generatedElements = [];
    }
}

// ═══════════════════════════════════════════════════════════════
// 🌍 تصدير
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.TwoDToThreeDConverter = TwoDToThreeDConverter;
}
