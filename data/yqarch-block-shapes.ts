/**
 * YQArch Block Shapes - رسومات البلوكات المعمارية
 * تحتوي على الرسومات الهندسية البسيطة لكل بلوك
 * يمكن رسمها على Canvas أو تصديرها إلى DXF
 */

export interface BlockShape {
  id: string;
  type: 'rectangle' | 'circle' | 'polyline' | 'composite';
  // For simple shapes
  width?: number;
  height?: number;
  radius?: number;
  // For complex shapes - array of drawing commands
  paths?: Array<{
    type: 'line' | 'arc' | 'circle' | 'rectangle';
    points: Array<{ x: number; y: number }>;
    radius?: number;
  }>;
}

/**
 * مكتبة الأشكال الهندسية للبلوكات
 * جميع الأبعاد بالسنتيمتر
 */
export const blockShapes: Record<string, BlockShape> = {
  
  // === الأثاث (Furniture) ===
  
  'furn-001': { // كنبة ثلاثية
    id: 'furn-001',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 220, y: 90 }] }, // الجسم
      { type: 'rectangle', points: [{ x: 0, y: -15 }, { x: 220, y: 0 }] }, // المسند الخلفي
      { type: 'rectangle', points: [{ x: -10, y: 20 }, { x: 0, y: 70 }] }, // مسند يد يسار
      { type: 'rectangle', points: [{ x: 220, y: 20 }, { x: 230, y: 70 }] }, // مسند يد يمين
    ]
  },
  
  'furn-002': { // طاولة طعام
    id: 'furn-002',
    type: 'rectangle',
    width: 180,
    height: 90
  },
  
  'furn-003': { // سرير مزدوج
    id: 'furn-003',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 200, y: 180 }] }, // المرتبة
      { type: 'rectangle', points: [{ x: -5, y: -20 }, { x: 205, y: 0 }] }, // لوح الرأس
    ]
  },
  
  'furn-004': { // مكتب عمل
    id: 'furn-004',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 140, y: 70 }] }, // السطح
      { type: 'rectangle', points: [{ x: 0, y: 10 }, { x: 30, y: 60 }] }, // درج يسار
      { type: 'rectangle', points: [{ x: 110, y: 10 }, { x: 140, y: 60 }] }, // درج يمين
    ]
  },
  
  'furn-005': { // كرسي مكتب
    id: 'furn-005',
    type: 'composite',
    paths: [
      { type: 'circle', points: [{ x: 30, y: 30 }], radius: 25 }, // القاعدة
      { type: 'rectangle', points: [{ x: 15, y: 30 }, { x: 45, y: 75 }] }, // المسند
    ]
  },
  
  'furn-006': { // خزانة ملابس
    id: 'furn-006',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 200, y: 60 }] }, // الجسم
      { type: 'line', points: [{ x: 67, y: 0 }, { x: 67, y: 60 }] }, // فاصل 1
      { type: 'line', points: [{ x: 133, y: 0 }, { x: 133, y: 60 }] }, // فاصل 2
    ]
  },
  
  'furn-007': { // رف كتب
    id: 'furn-007',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 120, y: 35 }] }, // الإطار
      { type: 'line', points: [{ x: 0, y: 36 }, { x: 120, y: 36 }] }, // رف 1
      { type: 'line', points: [{ x: 0, y: 72 }, { x: 120, y: 72 }] }, // رف 2
      { type: 'line', points: [{ x: 0, y: 108 }, { x: 120, y: 108 }] }, // رف 3
      { type: 'line', points: [{ x: 0, y: 144 }, { x: 120, y: 144 }] }, // رف 4
    ]
  },
  
  'furn-008': { // طاولة قهوة
    id: 'furn-008',
    type: 'rectangle',
    width: 120,
    height: 60
  },
  
  'furn-009': { // كرسي استرخاء
    id: 'furn-009',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 80, y: 90 }] }, // المقعد
      { type: 'rectangle', points: [{ x: -10, y: 30 }, { x: 0, y: 80 }] }, // مسند الظهر
    ]
  },
  
  'furn-010': { // طاولة جانبية
    id: 'furn-010',
    type: 'rectangle',
    width: 50,
    height: 50
  },
  
  'furn-011': { // صوفا زاوية
    id: 'furn-011',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 250, y: 90 }] }, // الجزء الطويل
      { type: 'rectangle', points: [{ x: 250, y: 0 }, { x: 340, y: 140 }] }, // الزاوية
    ]
  },
  
  'furn-012': { // طاولة كونسول
    id: 'furn-012',
    type: 'rectangle',
    width: 120,
    height: 40
  },
  
  // === الأبواب (Doors) ===
  
  'door-001': { // باب داخلي مفرد
    id: 'door-001',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 90, y: 10 }] }, // الإطار
      { type: 'arc', points: [{ x: 0, y: 0 }, { x: 0, y: 90 }], radius: 90 }, // حركة الفتح
    ]
  },
  
  'door-002': { // باب داخلي مزدوج
    id: 'door-002',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 160, y: 10 }] }, // الإطار
      { type: 'arc', points: [{ x: 0, y: 0 }, { x: 0, y: 80 }], radius: 80 }, // باب يسار
      { type: 'arc', points: [{ x: 160, y: 0 }, { x: 160, y: 80 }], radius: 80 }, // باب يمين
    ]
  },
  
  'door-003': { // باب خارجي
    id: 'door-003',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 100, y: 15 }] }, // الإطار السميك
      { type: 'arc', points: [{ x: 0, y: 0 }, { x: 0, y: 100 }], radius: 100 }, // حركة الفتح
    ]
  },
  
  'door-004': { // باب منزلق
    id: 'door-004',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 120, y: 10 }] }, // الإطار
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 60, y: 10 }] }, // الباب (نصف العرض)
      { type: 'line', points: [{ x: 60, y: 5 }, { x: 120, y: 5 }] }, // خط الحركة
    ]
  },
  
  'door-005': { // باب زجاجي
    id: 'door-005',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 90, y: 8 }] }, // الإطار
      { type: 'arc', points: [{ x: 0, y: 0 }, { x: 0, y: 90 }], radius: 90 }, // حركة الفتح
      { type: 'line', points: [{ x: 0, y: 0 }, { x: 90, y: 0 }] }, // زجاج
    ]
  },
  
  'door-006': { // باب مطبخ
    id: 'door-006',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 70, y: 8 }] }, // الإطار
      { type: 'arc', points: [{ x: 0, y: 0 }, { x: 0, y: 70 }], radius: 70 }, // حركة الفتح
    ]
  },
  
  'door-007': { // باب جرار مزدوج
    id: 'door-007',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 200, y: 10 }] }, // الإطار
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 100, y: 10 }] }, // باب 1
      { type: 'rectangle', points: [{ x: 100, y: 0 }, { x: 200, y: 10 }] }, // باب 2
    ]
  },
  
  'door-008': { // باب طوارئ
    id: 'door-008',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 120, y: 15 }] }, // الإطار العريض
      { type: 'arc', points: [{ x: 0, y: 0 }, { x: 0, y: 120 }], radius: 120 }, // حركة الفتح
    ]
  },
  
  'door-009': { // باب أكورديون
    id: 'door-009',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 150, y: 8 }] }, // الإطار
      { type: 'line', points: [{ x: 30, y: 0 }, { x: 30, y: 8 }] }, // طية 1
      { type: 'line', points: [{ x: 60, y: 0 }, { x: 60, y: 8 }] }, // طية 2
      { type: 'line', points: [{ x: 90, y: 0 }, { x: 90, y: 8 }] }, // طية 3
      { type: 'line', points: [{ x: 120, y: 0 }, { x: 120, y: 8 }] }, // طية 4
    ]
  },
  
  'door-010': { // باب قابل للطي
    id: 'door-010',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 80, y: 10 }] }, // الإطار
      { type: 'line', points: [{ x: 40, y: 0 }, { x: 40, y: 10 }] }, // خط الطي
      { type: 'arc', points: [{ x: 0, y: 0 }, { x: 0, y: 40 }], radius: 40 }, // حركة النصف الأول
    ]
  },
  
  // === النوافذ (Windows) ===
  
  'window-001': { // نافذة مفردة
    id: 'window-001',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 100, y: 15 }] }, // الإطار
      { type: 'line', points: [{ x: 50, y: 0 }, { x: 50, y: 15 }] }, // عمود منتصف
    ]
  },
  
  'window-002': { // نافذة مزدوجة
    id: 'window-002',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 150, y: 15 }] }, // الإطار
      { type: 'line', points: [{ x: 50, y: 0 }, { x: 50, y: 15 }] }, // عمود 1
      { type: 'line', points: [{ x: 100, y: 0 }, { x: 100, y: 15 }] }, // عمود 2
    ]
  },
  
  'window-003': { // نافذة منزلقة
    id: 'window-003',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 120, y: 12 }] }, // الإطار
      { type: 'rectangle', points: [{ x: 0, y: 2 }, { x: 60, y: 10 }] }, // الجزء المتحرك
    ]
  },
  
  'window-004': { // نافذة كبيرة
    id: 'window-004',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 200, y: 15 }] }, // الإطار
      { type: 'line', points: [{ x: 0, y: 7.5 }, { x: 200, y: 7.5 }] }, // خط أفقي
      { type: 'line', points: [{ x: 100, y: 0 }, { x: 100, y: 15 }] }, // خط عمودي
    ]
  },
  
  'window-005': { // نافذة خليجية
    id: 'window-005',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 180, y: 30 }] }, // الإطار الرئيسي
      { type: 'line', points: [{ x: 60, y: 0 }, { x: 60, y: 30 }] }, // قسم 1
      { type: 'line', points: [{ x: 120, y: 0 }, { x: 120, y: 30 }] }, // قسم 2
    ]
  },
  
  'window-006': { // نافذة زاوية
    id: 'window-006',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 100, y: 15 }] }, // جزء أفقي
      { type: 'rectangle', points: [{ x: 100, y: 0 }, { x: 115, y: 100 }] }, // جزء عمودي
    ]
  },
  
  'window-007': { // نافذة مقوسة
    id: 'window-007',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 120, y: 15 }] }, // القاعدة
      { type: 'arc', points: [{ x: 0, y: 0 }, { x: 120, y: 0 }], radius: 60 }, // القوس
    ]
  },
  
  'window-008': { // نافذة علوية
    id: 'window-008',
    type: 'rectangle',
    width: 150,
    height: 8
  },
  
  // === الجدران (Walls) ===
  
  'wall-001': { // جدار بسيط
    id: 'wall-001',
    type: 'rectangle',
    width: 400,
    height: 20
  },
  
  'wall-002': { // جدار سميك
    id: 'wall-002',
    type: 'rectangle',
    width: 400,
    height: 30
  },
  
  'wall-003': { // جدار معزول
    id: 'wall-003',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 400, y: 25 }] }, // الجدار الخارجي
      { type: 'line', points: [{ x: 0, y: 12.5 }, { x: 400, y: 12.5 }] }, // خط العزل
    ]
  },
  
  'wall-004': { // جدار ستائر (Curtain Wall)
    id: 'wall-004',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 400, y: 15 }] }, // الإطار
      { type: 'line', points: [{ x: 100, y: 0 }, { x: 100, y: 15 }] }, // عمود 1
      { type: 'line', points: [{ x: 200, y: 0 }, { x: 200, y: 15 }] }, // عمود 2
      { type: 'line', points: [{ x: 300, y: 0 }, { x: 300, y: 15 }] }, // عمود 3
    ]
  },
  
  'wall-005': { // جدار بفتحة
    id: 'wall-005',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 150, y: 20 }] }, // جزء يسار
      { type: 'rectangle', points: [{ x: 250, y: 0 }, { x: 400, y: 20 }] }, // جزء يمين
      // الفتحة بينهما (150-250)
    ]
  },
  
  'wall-006': { // جدار زجاجي
    id: 'wall-006',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 400, y: 10 }] }, // الإطار النحيف
      { type: 'line', points: [{ x: 0, y: 5 }, { x: 400, y: 5 }] }, // خط الزجاج
    ]
  },
  
  // === السلالم (Stairs) ===
  
  'stair-001': { // سلم مستقيم
    id: 'stair-001',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 120, y: 300 }] }, // الإطار
      ...Array.from({ length: 15 }, (_, i) => ({
        type: 'line' as const,
        points: [{ x: 0, y: i * 20 }, { x: 120, y: i * 20 }] // 15 درجة
      }))
    ]
  },
  
  'stair-002': { // سلم حلزوني
    id: 'stair-002',
    type: 'composite',
    paths: [
      { type: 'circle', points: [{ x: 100, y: 100 }], radius: 100 }, // الدائرة الخارجية
      { type: 'circle', points: [{ x: 100, y: 100 }], radius: 30 }, // العمود المركزي
    ]
  },
  
  'stair-003': { // سلم بمنعطف
    id: 'stair-003',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 120, y: 180 }] }, // الجزء الأول
      { type: 'rectangle', points: [{ x: 120, y: 180 }, { x: 300, y: 300 }] }, // الجزء الثاني
    ]
  },
  
  'stair-004': { // سلم خارجي
    id: 'stair-004',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 150, y: 250 }] }, // الإطار
      ...Array.from({ length: 12 }, (_, i) => ({
        type: 'line' as const,
        points: [{ x: 0, y: i * 20 }, { x: 150, y: i * 20 }]
      }))
    ]
  },
  
  'stair-005': { // سلم داخلي ضيق
    id: 'stair-005',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 90, y: 280 }] }, // الإطار
      ...Array.from({ length: 14 }, (_, i) => ({
        type: 'line' as const,
        points: [{ x: 0, y: i * 20 }, { x: 90, y: i * 20 }]
      }))
    ]
  },
  
  'stair-006': { // سلم بمنصة
    id: 'stair-006',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 120, y: 150 }] }, // الجزء السفلي
      { type: 'rectangle', points: [{ x: 0, y: 150 }, { x: 120, y: 180 }] }, // المنصة
      { type: 'rectangle', points: [{ x: 0, y: 180 }, { x: 120, y: 330 }] }, // الجزء العلوي
    ]
  },
  
  'stair-007': { // سلم خشبي
    id: 'stair-007',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 100, y: 260 }] },
      ...Array.from({ length: 13 }, (_, i) => ({
        type: 'line' as const,
        points: [{ x: 0, y: i * 20 }, { x: 100, y: i * 20 }]
      }))
    ]
  },
  
  // === الحمامات (Bathrooms) ===
  
  'bath-001': { // حوض استحمام
    id: 'bath-001',
    type: 'rectangle',
    width: 170,
    height: 70
  },
  
  'bath-002': { // دش
    id: 'bath-002',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 90, y: 90 }] }, // القاعدة
      { type: 'circle', points: [{ x: 45, y: 45 }], radius: 10 }, // الصرف
    ]
  },
  
  'bath-003': { // مرحاض
    id: 'bath-003',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 40, y: 70 }] }, // القاعدة
      { type: 'circle', points: [{ x: 20, y: 50 }], radius: 15 }, // الوعاء
    ]
  },
  
  'bath-004': { // حوض مغسلة مفرد
    id: 'bath-004',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 60, y: 50 }] }, // الطاولة
      { type: 'circle', points: [{ x: 30, y: 25 }], radius: 20 }, // الحوض
    ]
  },
  
  'bath-005': { // حوض مزدوج
    id: 'bath-005',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 120, y: 50 }] }, // الطاولة
      { type: 'circle', points: [{ x: 30, y: 25 }], radius: 18 }, // الحوض 1
      { type: 'circle', points: [{ x: 90, y: 25 }], radius: 18 }, // الحوض 2
    ]
  },
  
  'bath-006': { // بيديه
    id: 'bath-006',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 35, y: 55 }] }, // القاعدة
      { type: 'circle', points: [{ x: 17.5, y: 35 }], radius: 12 }, // الوعاء
    ]
  },
  
  'bath-007': { // مرحاض معلق
    id: 'bath-007',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 38, y: 55 }] }, // الجسم
      { type: 'circle', points: [{ x: 19, y: 40 }], radius: 14 }, // الوعاء
    ]
  },
  
  'bath-008': { // يورينال
    id: 'bath-008',
    type: 'rectangle',
    width: 35,
    height: 60
  },
  
  'bath-009': { // حوض ركني
    id: 'bath-009',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 50, y: 50 }] }, // القاعدة المثلثة
      { type: 'circle', points: [{ x: 25, y: 25 }], radius: 15 }, // الحوض
    ]
  },
  
  // === المطابخ (Kitchens) ===
  
  'kitchen-001': { // حوض مطبخ مفرد
    id: 'kitchen-001',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 80, y: 50 }] }, // الطاولة
      { type: 'rectangle', points: [{ x: 15, y: 10 }, { x: 65, y: 40 }] }, // الحوض
    ]
  },
  
  'kitchen-002': { // حوض مزدوج
    id: 'kitchen-002',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 120, y: 50 }] }, // الطاولة
      { type: 'rectangle', points: [{ x: 10, y: 10 }, { x: 55, y: 40 }] }, // الحوض 1
      { type: 'rectangle', points: [{ x: 65, y: 10 }, { x: 110, y: 40 }] }, // الحوض 2
    ]
  },
  
  'kitchen-003': { // فرن
    id: 'kitchen-003',
    type: 'rectangle',
    width: 60,
    height: 60
  },
  
  'kitchen-004': { // ثلاجة
    id: 'kitchen-004',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 70, y: 70 }] }, // الجسم
      { type: 'line', points: [{ x: 0, y: 35 }, { x: 70, y: 35 }] }, // خط الفصل
    ]
  },
  
  'kitchen-005': { // غسالة صحون
    id: 'kitchen-005',
    type: 'rectangle',
    width: 60,
    height: 60
  },
  
  'kitchen-006': { // شفاط
    id: 'kitchen-006',
    type: 'rectangle',
    width: 90,
    height: 50
  },
  
  'kitchen-007': { // طاولة جزيرة
    id: 'kitchen-007',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 180, y: 90 }] }, // السطح
      { type: 'circle', points: [{ x: 90, y: 45 }], radius: 20 }, // الحوض
    ]
  },
  
  'kitchen-008': { // خزانة علوية
    id: 'kitchen-008',
    type: 'rectangle',
    width: 90,
    height: 35
  },
  
  // === الأعمال الخارجية (Landscape) ===
  
  'landscape-001': { // شجرة
    id: 'landscape-001',
    type: 'composite',
    paths: [
      { type: 'circle', points: [{ x: 0, y: 0 }], radius: 50 }, // التاج
      { type: 'rectangle', points: [{ x: -5, y: -60 }, { x: 5, y: 0 }] }, // الجذع
    ]
  },
  
  'landscape-002': { // نخلة
    id: 'landscape-002',
    type: 'composite',
    paths: [
      { type: 'circle', points: [{ x: 0, y: 0 }], radius: 40 }, // التاج
      { type: 'rectangle', points: [{ x: -3, y: -70 }, { x: 3, y: 0 }] }, // الجذع
    ]
  },
  
  'landscape-003': { // شجيرة
    id: 'landscape-003',
    type: 'circle',
    radius: 30
  },
  
  'landscape-004': { // مقعد حديقة
    id: 'landscape-004',
    type: 'composite',
    paths: [
      { type: 'rectangle', points: [{ x: 0, y: 0 }, { x: 150, y: 50 }] }, // المقعد
      { type: 'rectangle', points: [{ x: 0, y: -15 }, { x: 150, y: 0 }] }, // المسند
    ]
  },
  
  'landscape-005': { // نافورة
    id: 'landscape-005',
    type: 'composite',
    paths: [
      { type: 'circle', points: [{ x: 0, y: 0 }], radius: 80 }, // الحوض
      { type: 'circle', points: [{ x: 0, y: 0 }], radius: 20 }, // العمود المركزي
    ]
  },
  
  'landscape-006': { // مظلة
    id: 'landscape-006',
    type: 'composite',
    paths: [
      { type: 'circle', points: [{ x: 0, y: 0 }], radius: 60 }, // المظلة
      { type: 'rectangle', points: [{ x: -3, y: -80 }, { x: 3, y: 0 }] }, // العمود
    ]
  },
};

/**
 * دالة مساعدة للحصول على شكل بلوك
 */
export function getBlockShape(blockId: string): BlockShape | undefined {
  return blockShapes[blockId];
}

/**
 * دالة للتحقق من وجود شكل لبلوك معين
 */
export function hasBlockShape(blockId: string): boolean {
  return blockId in blockShapes;
}

/**
 * دالة للحصول على قائمة البلوكات التي لها أشكال
 */
export function getAvailableBlockIds(): string[] {
  return Object.keys(blockShapes);
}
