/**
 * YQArch Library - مكتبة البلوكات المعمارية
 * تحتوي على أكثر من 60 بلوك معماري جاهز للاستخدام
 * مصنفة حسب الفئات لسهولة الوصول
 */

export interface ArchBlock {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  dimensions?: string;
  description: string;
  dwgFile?: string;
  previewImage?: string;
  tags: string[];
  specifications?: {
    material?: string;
    dimensions?: {
      width?: number;
      height?: number;
      depth?: number;
    };
    unit?: string;
  };
}

export interface BlockCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  description: string;
  count: number;
}

export const blockCategories: BlockCategory[] = [
  {
    id: 'furniture',
    nameAr: 'الأثاث',
    nameEn: 'Furniture',
    icon: '🛋️',
    description: 'قطع الأثاث المختلفة للمنزل والمكتب',
    count: 12
  },
  {
    id: 'doors',
    nameAr: 'الأبواب',
    nameEn: 'Doors',
    icon: '🚪',
    description: 'أنواع مختلفة من الأبواب الداخلية والخارجية',
    count: 10
  },
  {
    id: 'windows',
    nameAr: 'النوافذ',
    nameEn: 'Windows',
    icon: '🪟',
    description: 'تصاميم متنوعة للنوافذ والشبابيك',
    count: 8
  },
  {
    id: 'walls',
    nameAr: 'الجدران والحوائط',
    nameEn: 'Walls',
    icon: '🧱',
    description: 'أنواع الجدران والحوائط المختلفة',
    count: 6
  },
  {
    id: 'stairs',
    nameAr: 'السلالم',
    nameEn: 'Stairs',
    icon: '🪜',
    description: 'تصاميم السلالم الداخلية والخارجية',
    count: 7
  },
  {
    id: 'bathroom',
    nameAr: 'الحمامات',
    nameEn: 'Bathrooms',
    icon: '🚿',
    description: 'أدوات صحية وتجهيزات الحمامات',
    count: 9
  },
  {
    id: 'kitchen',
    nameAr: 'المطابخ',
    nameEn: 'Kitchens',
    icon: '🍳',
    description: 'أجهزة وتجهيزات المطابخ',
    count: 8
  },
  {
    id: 'landscape',
    nameAr: 'الأعمال الخارجية',
    nameEn: 'Landscape',
    icon: '🌳',
    description: 'عناصر تنسيق الحدائق والمواقع',
    count: 6
  }
];

export const yqArchBlocks: ArchBlock[] = [
  // === الأثاث (Furniture) - 12 Blocks ===
  {
    id: 'furn-001',
    nameAr: 'كنبة ثلاثية',
    nameEn: '3-Seater Sofa',
    category: 'furniture',
    dimensions: '220x90x85 سم',
    description: 'كنبة ثلاثية حديثة مناسبة للصالات والمجالس',
    tags: ['صالة', 'مجلس', 'راحة'],
    specifications: {
      material: 'قماش وخشب',
      dimensions: { width: 220, depth: 90, height: 85 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-002',
    nameAr: 'طاولة طعام مستطيلة',
    nameEn: 'Rectangular Dining Table',
    category: 'furniture',
    dimensions: '180x90x75 سم',
    description: 'طاولة طعام خشبية تتسع ل 6-8 أشخاص',
    tags: ['طعام', 'مطبخ', 'عائلة'],
    specifications: {
      material: 'خشب صلب',
      dimensions: { width: 180, depth: 90, height: 75 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-003',
    nameAr: 'سرير مزدوج',
    nameEn: 'Double Bed',
    category: 'furniture',
    dimensions: '200x180x120 سم',
    description: 'سرير مزدوج بتصميم عصري مع لوح رأس',
    tags: ['غرفة نوم', 'راحة', 'نوم'],
    specifications: {
      material: 'خشب وقماش',
      dimensions: { width: 200, depth: 180, height: 120 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-004',
    nameAr: 'مكتب عمل',
    nameEn: 'Office Desk',
    category: 'furniture',
    dimensions: '140x70x75 سم',
    description: 'مكتب عمل مع أدراج جانبية',
    tags: ['مكتب', 'عمل', 'دراسة'],
    specifications: {
      material: 'خشب وحديد',
      dimensions: { width: 140, depth: 70, height: 75 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-005',
    nameAr: 'كرسي مكتب دوار',
    nameEn: 'Office Swivel Chair',
    category: 'furniture',
    dimensions: '60x60x110 سم',
    description: 'كرسي مكتب قابل للتعديل بعجلات',
    tags: ['مكتب', 'راحة', 'عمل'],
    specifications: {
      material: 'بلاستيك وقماش',
      dimensions: { width: 60, depth: 60, height: 110 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-006',
    nameAr: 'خزانة ملابس',
    nameEn: 'Wardrobe',
    category: 'furniture',
    dimensions: '200x60x220 سم',
    description: 'خزانة ملابس بثلاثة أبواب مع أدراج',
    tags: ['غرفة نوم', 'تخزين', 'ملابس'],
    specifications: {
      material: 'خشب MDF',
      dimensions: { width: 200, depth: 60, height: 220 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-007',
    nameAr: 'رف كتب',
    nameEn: 'Bookshelf',
    category: 'furniture',
    dimensions: '120x35x180 سم',
    description: 'رف كتب خشبي بخمسة أرفف',
    tags: ['مكتبة', 'تخزين', 'كتب'],
    specifications: {
      material: 'خشب',
      dimensions: { width: 120, depth: 35, height: 180 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-008',
    nameAr: 'طاولة قهوة',
    nameEn: 'Coffee Table',
    category: 'furniture',
    dimensions: '120x60x45 سم',
    description: 'طاولة قهوة زجاجية مع قاعدة خشبية',
    tags: ['صالة', 'قهوة', 'استقبال'],
    specifications: {
      material: 'زجاج وخشب',
      dimensions: { width: 120, depth: 60, height: 45 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-009',
    nameAr: 'كرسي استرخاء',
    nameEn: 'Lounge Chair',
    category: 'furniture',
    dimensions: '80x90x100 سم',
    description: 'كرسي استرخاء مبطن مريح',
    tags: ['صالة', 'راحة', 'استرخاء'],
    specifications: {
      material: 'قماش وخشب',
      dimensions: { width: 80, depth: 90, height: 100 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-010',
    nameAr: 'طاولة جانبية',
    nameEn: 'Side Table',
    category: 'furniture',
    dimensions: '50x50x55 سم',
    description: 'طاولة جانبية صغيرة للمصابيح',
    tags: ['غرفة نوم', 'صالة', 'جانبي'],
    specifications: {
      material: 'خشب',
      dimensions: { width: 50, depth: 50, height: 55 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-011',
    nameAr: 'صوفا زاوية',
    nameEn: 'L-Shaped Sofa',
    category: 'furniture',
    dimensions: '280x180x85 سم',
    description: 'صوفا زاوية على شكل L للمساحات الكبيرة',
    tags: ['صالة', 'مجلس', 'زاوية'],
    specifications: {
      material: 'قماش وخشب',
      dimensions: { width: 280, depth: 180, height: 85 },
      unit: 'cm'
    }
  },
  {
    id: 'furn-012',
    nameAr: 'طاولة كونسول',
    nameEn: 'Console Table',
    category: 'furniture',
    dimensions: '120x40x90 سم',
    description: 'طاولة كونسول للمدخل أو الممرات',
    tags: ['مدخل', 'ممر', 'ديكور'],
    specifications: {
      material: 'خشب وحديد',
      dimensions: { width: 120, depth: 40, height: 90 },
      unit: 'cm'
    }
  },

  // === الأبواب (Doors) - 10 Blocks ===
  {
    id: 'door-001',
    nameAr: 'باب داخلي خشبي',
    nameEn: 'Interior Wooden Door',
    category: 'doors',
    dimensions: '90x210x4 سم',
    description: 'باب داخلي خشبي بتصميم بسيط',
    tags: ['داخلي', 'خشب', 'غرفة'],
    specifications: {
      material: 'خشب',
      dimensions: { width: 90, height: 210, depth: 4 },
      unit: 'cm'
    }
  },
  {
    id: 'door-002',
    nameAr: 'باب خارجي معدني',
    nameEn: 'Exterior Metal Door',
    category: 'doors',
    dimensions: '100x220x5 سم',
    description: 'باب خارجي معدني مزدوج الأمان',
    tags: ['خارجي', 'معدن', 'أمان'],
    specifications: {
      material: 'حديد',
      dimensions: { width: 100, height: 220, depth: 5 },
      unit: 'cm'
    }
  },
  {
    id: 'door-003',
    nameAr: 'باب زجاجي منزلق',
    nameEn: 'Sliding Glass Door',
    category: 'doors',
    dimensions: '200x220x6 سم',
    description: 'باب زجاجي منزلق مزدوج للشرفات',
    tags: ['زجاج', 'منزلق', 'شرفة'],
    specifications: {
      material: 'زجاج وألمنيوم',
      dimensions: { width: 200, height: 220, depth: 6 },
      unit: 'cm'
    }
  },
  {
    id: 'door-004',
    nameAr: 'باب مطبخ متأرجح',
    nameEn: 'Kitchen Swing Door',
    category: 'doors',
    dimensions: '80x200x3 سم',
    description: 'باب متأرجح للمطابخ',
    tags: ['مطبخ', 'متأرجح', 'خشب'],
    specifications: {
      material: 'خشب',
      dimensions: { width: 80, height: 200, depth: 3 },
      unit: 'cm'
    }
  },
  {
    id: 'door-005',
    nameAr: 'باب حمام مقاوم للماء',
    nameEn: 'Waterproof Bathroom Door',
    category: 'doors',
    dimensions: '80x210x4 سم',
    description: 'باب حمام مقاوم للرطوبة',
    tags: ['حمام', 'مقاوم للماء', 'رطوبة'],
    specifications: {
      material: 'PVC',
      dimensions: { width: 80, height: 210, depth: 4 },
      unit: 'cm'
    }
  },
  {
    id: 'door-006',
    nameAr: 'باب مزدوج فرنسي',
    nameEn: 'French Double Door',
    category: 'doors',
    dimensions: '180x220x5 سم',
    description: 'باب مزدوج بتصميم فرنسي كلاسيكي',
    tags: ['مزدوج', 'فرنسي', 'كلاسيكي'],
    specifications: {
      material: 'خشب وزجاج',
      dimensions: { width: 180, height: 220, depth: 5 },
      unit: 'cm'
    }
  },
  {
    id: 'door-007',
    nameAr: 'باب جراج أوتوماتيكي',
    nameEn: 'Automatic Garage Door',
    category: 'doors',
    dimensions: '250x220x8 سم',
    description: 'باب جراج أوتوماتيكي بريموت كنترول',
    tags: ['جراج', 'أوتوماتيكي', 'كهربائي'],
    specifications: {
      material: 'حديد',
      dimensions: { width: 250, height: 220, depth: 8 },
      unit: 'cm'
    }
  },
  {
    id: 'door-008',
    nameAr: 'باب طوارئ مضاد للحريق',
    nameEn: 'Fire-Rated Emergency Door',
    category: 'doors',
    dimensions: '100x220x5 سم',
    description: 'باب طوارئ مضاد للحريق للمباني التجارية',
    tags: ['طوارئ', 'حريق', 'أمان'],
    specifications: {
      material: 'حديد معالج',
      dimensions: { width: 100, height: 220, depth: 5 },
      unit: 'cm'
    }
  },
  {
    id: 'door-009',
    nameAr: 'باب خزانة قابل للطي',
    nameEn: 'Folding Closet Door',
    category: 'doors',
    dimensions: '120x210x3 سم',
    description: 'باب خزانة قابل للطي لتوفير المساحة',
    tags: ['خزانة', 'طي', 'مساحة'],
    specifications: {
      material: 'خشب',
      dimensions: { width: 120, height: 210, depth: 3 },
      unit: 'cm'
    }
  },
  {
    id: 'door-010',
    nameAr: 'باب دوار زجاجي',
    nameEn: 'Revolving Glass Door',
    category: 'doors',
    dimensions: '200x220x20 سم',
    description: 'باب دوار زجاجي للمباني التجارية',
    tags: ['دوار', 'زجاج', 'تجاري'],
    specifications: {
      material: 'زجاج وحديد',
      dimensions: { width: 200, height: 220, depth: 20 },
      unit: 'cm'
    }
  },

  // === النوافذ (Windows) - 8 Blocks ===
  {
    id: 'win-001',
    nameAr: 'نافذة ألمنيوم عادية',
    nameEn: 'Standard Aluminum Window',
    category: 'windows',
    dimensions: '120x150 سم',
    description: 'نافذة ألمنيوم بزجاج مزدوج',
    tags: ['ألمنيوم', 'زجاج', 'عادي'],
    specifications: {
      material: 'ألمنيوم وزجاج',
      dimensions: { width: 120, height: 150 },
      unit: 'cm'
    }
  },
  {
    id: 'win-002',
    nameAr: 'نافذة منزلقة كبيرة',
    nameEn: 'Large Sliding Window',
    category: 'windows',
    dimensions: '200x180 سم',
    description: 'نافذة منزلقة كبيرة للصالات',
    tags: ['منزلقة', 'كبيرة', 'صالة'],
    specifications: {
      material: 'ألمنيوم وزجاج',
      dimensions: { width: 200, height: 180 },
      unit: 'cm'
    }
  },
  {
    id: 'win-003',
    nameAr: 'نافذة خليجية',
    nameEn: 'Bay Window',
    category: 'windows',
    dimensions: '300x180 سم',
    description: 'نافذة خليجية بارزة للخارج',
    tags: ['خليجية', 'بارزة', 'ديكور'],
    specifications: {
      material: 'خشب وزجاج',
      dimensions: { width: 300, height: 180 },
      unit: 'cm'
    }
  },
  {
    id: 'win-004',
    nameAr: 'نافذة حمام صغيرة',
    nameEn: 'Small Bathroom Window',
    category: 'windows',
    dimensions: '60x80 سم',
    description: 'نافذة صغيرة للحمامات بزجاج معتم',
    tags: ['حمام', 'صغيرة', 'خصوصية'],
    specifications: {
      material: 'PVC وزجاج',
      dimensions: { width: 60, height: 80 },
      unit: 'cm'
    }
  },
  {
    id: 'win-005',
    nameAr: 'نافذة سقف',
    nameEn: 'Skylight Window',
    category: 'windows',
    dimensions: '120x120 سم',
    description: 'نافذة سقف للإضاءة الطبيعية',
    tags: ['سقف', 'إضاءة', 'طبيعية'],
    specifications: {
      material: 'ألمنيوم وزجاج',
      dimensions: { width: 120, height: 120 },
      unit: 'cm'
    }
  },
  {
    id: 'win-006',
    nameAr: 'نافذة ارش علوي',
    nameEn: 'Arched Top Window',
    category: 'windows',
    dimensions: '100x200 سم',
    description: 'نافذة بتصميم ارش في الأعلى',
    tags: ['ارش', 'كلاسيكي', 'ديكور'],
    specifications: {
      material: 'خشب وزجاج',
      dimensions: { width: 100, height: 200 },
      unit: 'cm'
    }
  },
  {
    id: 'win-007',
    nameAr: 'نافذة زاوية',
    nameEn: 'Corner Window',
    category: 'windows',
    dimensions: '180x180 سم',
    description: 'نافذة زاوية للإطلالات البانورامية',
    tags: ['زاوية', 'بانورامي', 'إطلالة'],
    specifications: {
      material: 'ألمنيوم وزجاج',
      dimensions: { width: 180, height: 180 },
      unit: 'cm'
    }
  },
  {
    id: 'win-008',
    nameAr: 'نافذة مطبخ علوية',
    nameEn: 'Kitchen Awning Window',
    category: 'windows',
    dimensions: '80x60 سم',
    description: 'نافذة مطبخ علوية للتهوية',
    tags: ['مطبخ', 'تهوية', 'علوية'],
    specifications: {
      material: 'ألمنيوم وزجاج',
      dimensions: { width: 80, height: 60 },
      unit: 'cm'
    }
  },

  // === الجدران والحوائط (Walls) - 6 Blocks ===
  {
    id: 'wall-001',
    nameAr: 'جدار خرساني عادي',
    nameEn: 'Standard Concrete Wall',
    category: 'walls',
    dimensions: '15 سم سماكة',
    description: 'جدار خرساني حامل بسماكة 15 سم',
    tags: ['خرسانة', 'حامل', 'إنشائي'],
    specifications: {
      material: 'خرسانة مسلحة',
      dimensions: { depth: 15 },
      unit: 'cm'
    }
  },
  {
    id: 'wall-002',
    nameAr: 'جدار طوب أحمر',
    nameEn: 'Red Brick Wall',
    category: 'walls',
    dimensions: '20 سم سماكة',
    description: 'جدار من الطوب الأحمر',
    tags: ['طوب', 'أحمر', 'تقليدي'],
    specifications: {
      material: 'طوب أحمر',
      dimensions: { depth: 20 },
      unit: 'cm'
    }
  },
  {
    id: 'wall-003',
    nameAr: 'جدار عازل صوتي',
    nameEn: 'Soundproof Wall',
    category: 'walls',
    dimensions: '12 سم سماكة',
    description: 'جدار خفيف مع عزل صوتي',
    tags: ['عازل', 'صوت', 'خفيف'],
    specifications: {
      material: 'جبس بورد وعازل',
      dimensions: { depth: 12 },
      unit: 'cm'
    }
  },
  {
    id: 'wall-004',
    nameAr: 'جدار بلوك خفيف',
    nameEn: 'Lightweight Block Wall',
    category: 'walls',
    dimensions: '10 سم سماكة',
    description: 'جدار فاصل من البلوك الخفيف',
    tags: ['بلوك', 'خفيف', 'فاصل'],
    specifications: {
      material: 'بلوك خفيف',
      dimensions: { depth: 10 },
      unit: 'cm'
    }
  },
  {
    id: 'wall-005',
    nameAr: 'جدار زجاجي',
    nameEn: 'Glass Wall',
    category: 'walls',
    dimensions: '8 سم سماكة',
    description: 'جدار زجاجي للفواصل الداخلية',
    tags: ['زجاج', 'فاصل', 'شفاف'],
    specifications: {
      material: 'زجاج مقسّى',
      dimensions: { depth: 8 },
      unit: 'cm'
    }
  },
  {
    id: 'wall-006',
    nameAr: 'جدار ساند',
    nameEn: 'Retaining Wall',
    category: 'walls',
    dimensions: '30 سم سماكة',
    description: 'جدار ساند للتربة',
    tags: ['ساند', 'خارجي', 'حماية'],
    specifications: {
      material: 'خرسانة مسلحة',
      dimensions: { depth: 30 },
      unit: 'cm'
    }
  },

  // === السلالم (Stairs) - 7 Blocks ===
  {
    id: 'stair-001',
    nameAr: 'سلم مستقيم',
    nameEn: 'Straight Staircase',
    category: 'stairs',
    dimensions: '120 سم عرض',
    description: 'سلم مستقيم بسيط',
    tags: ['مستقيم', 'داخلي', 'بسيط'],
    specifications: {
      material: 'خرسانة وبلاط',
      dimensions: { width: 120 },
      unit: 'cm'
    }
  },
  {
    id: 'stair-002',
    nameAr: 'سلم حرف L',
    nameEn: 'L-Shaped Staircase',
    category: 'stairs',
    dimensions: '120 سم عرض',
    description: 'سلم على شكل حرف L مع استراحة',
    tags: ['حرف L', 'استراحة', 'داخلي'],
    specifications: {
      material: 'خرسانة',
      dimensions: { width: 120 },
      unit: 'cm'
    }
  },
  {
    id: 'stair-003',
    nameAr: 'سلم حلزوني',
    nameEn: 'Spiral Staircase',
    category: 'stairs',
    dimensions: '140 سم قطر',
    description: 'سلم حلزوني لتوفير المساحة',
    tags: ['حلزوني', 'دائري', 'مساحة صغيرة'],
    specifications: {
      material: 'حديد',
      dimensions: { width: 140 },
      unit: 'cm'
    }
  },
  {
    id: 'stair-004',
    nameAr: 'سلم حرف U',
    nameEn: 'U-Shaped Staircase',
    category: 'stairs',
    dimensions: '240 سم طول',
    description: 'سلم على شكل حرف U مع استراحتين',
    tags: ['حرف U', 'استراحات', 'واسع'],
    specifications: {
      material: 'خرسانة',
      dimensions: { width: 120 },
      unit: 'cm'
    }
  },
  {
    id: 'stair-005',
    nameAr: 'سلم خشبي معلق',
    nameEn: 'Floating Wooden Stairs',
    category: 'stairs',
    dimensions: '100 سم عرض',
    description: 'سلم خشبي معلق بتصميم عصري',
    tags: ['خشبي', 'معلق', 'عصري'],
    specifications: {
      material: 'خشب وحديد',
      dimensions: { width: 100 },
      unit: 'cm'
    }
  },
  {
    id: 'stair-006',
    nameAr: 'سلم خارجي',
    nameEn: 'Exterior Staircase',
    category: 'stairs',
    dimensions: '150 سم عرض',
    description: 'سلم خارجي بدرابزين معدني',
    tags: ['خارجي', 'معدن', 'واسع'],
    specifications: {
      material: 'خرسانة وحديد',
      dimensions: { width: 150 },
      unit: 'cm'
    }
  },
  {
    id: 'stair-007',
    nameAr: 'سلم زجاجي',
    nameEn: 'Glass Staircase',
    category: 'stairs',
    dimensions: '110 سم عرض',
    description: 'سلم زجاجي شفاف بتصميم فاخر',
    tags: ['زجاج', 'شفاف', 'فاخر'],
    specifications: {
      material: 'زجاج مقسّى وحديد',
      dimensions: { width: 110 },
      unit: 'cm'
    }
  },

  // === الحمامات (Bathrooms) - 9 Blocks ===
  {
    id: 'bath-001',
    nameAr: 'مرحاض معلق',
    nameEn: 'Wall-Mounted Toilet',
    category: 'bathroom',
    dimensions: '53x36x40 سم',
    description: 'مرحاض معلق عصري موفر للمساحة',
    tags: ['مرحاض', 'معلق', 'عصري'],
    specifications: {
      material: 'سيراميك',
      dimensions: { width: 53, depth: 36, height: 40 },
      unit: 'cm'
    }
  },
  {
    id: 'bath-002',
    nameAr: 'حوض غسيل مفرد',
    nameEn: 'Single Basin',
    category: 'bathroom',
    dimensions: '60x45x20 سم',
    description: 'حوض غسيل يدين مفرد',
    tags: ['حوض', 'غسيل', 'يدين'],
    specifications: {
      material: 'سيراميك',
      dimensions: { width: 60, depth: 45, height: 20 },
      unit: 'cm'
    }
  },
  {
    id: 'bath-003',
    nameAr: 'حوض غسيل مزدوج',
    nameEn: 'Double Basin',
    category: 'bathroom',
    dimensions: '120x45x20 سم',
    description: 'حوض غسيل مزدوج للحمامات الرئيسية',
    tags: ['حوض', 'مزدوج', 'رئيسي'],
    specifications: {
      material: 'سيراميك',
      dimensions: { width: 120, depth: 45, height: 20 },
      unit: 'cm'
    }
  },
  {
    id: 'bath-004',
    nameAr: 'بانيو مستطيل',
    nameEn: 'Rectangular Bathtub',
    category: 'bathroom',
    dimensions: '170x75x60 سم',
    description: 'بانيو استحمام مستطيل',
    tags: ['بانيو', 'استحمام', 'راحة'],
    specifications: {
      material: 'أكريليك',
      dimensions: { width: 170, depth: 75, height: 60 },
      unit: 'cm'
    }
  },
  {
    id: 'bath-005',
    nameAr: 'دش واقف',
    nameEn: 'Standing Shower',
    category: 'bathroom',
    dimensions: '90x90x200 سم',
    description: 'كابينة دش واقف بزجاج شفاف',
    tags: ['دش', 'كابينة', 'زجاج'],
    specifications: {
      material: 'زجاج وألمنيوم',
      dimensions: { width: 90, depth: 90, height: 200 },
      unit: 'cm'
    }
  },
  {
    id: 'bath-006',
    nameAr: 'خلاط حوض',
    nameEn: 'Basin Mixer',
    category: 'bathroom',
    dimensions: '15x5x25 سم',
    description: 'خلاط حوض بتصميم كروم',
    tags: ['خلاط', 'حوض', 'كروم'],
    specifications: {
      material: 'نحاس مطلي',
      dimensions: { width: 15, depth: 5, height: 25 },
      unit: 'cm'
    }
  },
  {
    id: 'bath-007',
    nameAr: 'مرآة حمام مع إضاءة',
    nameEn: 'Illuminated Bathroom Mirror',
    category: 'bathroom',
    dimensions: '80x60x5 سم',
    description: 'مرآة حمام مع إضاءة LED مدمجة',
    tags: ['مرآة', 'إضاءة', 'LED'],
    specifications: {
      material: 'زجاج وإضاءة',
      dimensions: { width: 80, height: 60, depth: 5 },
      unit: 'cm'
    }
  },
  {
    id: 'bath-008',
    nameAr: 'خزانة حمام',
    nameEn: 'Bathroom Cabinet',
    category: 'bathroom',
    dimensions: '60x35x70 سم',
    description: 'خزانة حمام مع حوض مدمج',
    tags: ['خزانة', 'تخزين', 'حوض'],
    specifications: {
      material: 'خشب مقاوم للماء',
      dimensions: { width: 60, depth: 35, height: 70 },
      unit: 'cm'
    }
  },
  {
    id: 'bath-009',
    nameAr: 'حامل مناشف',
    nameEn: 'Towel Rack',
    category: 'bathroom',
    dimensions: '60x10x15 سم',
    description: 'حامل مناشف معدني بثلاثة قضبان',
    tags: ['حامل', 'مناشف', 'معدن'],
    specifications: {
      material: 'حديد كروم',
      dimensions: { width: 60, depth: 10, height: 15 },
      unit: 'cm'
    }
  },

  // === المطابخ (Kitchens) - 8 Blocks ===
  {
    id: 'kit-001',
    nameAr: 'خزانة مطبخ سفلية',
    nameEn: 'Base Kitchen Cabinet',
    category: 'kitchen',
    dimensions: '80x60x85 سم',
    description: 'خزانة مطبخ سفلية مع رخامة',
    tags: ['خزانة', 'سفلية', 'رخام'],
    specifications: {
      material: 'خشب MDF',
      dimensions: { width: 80, depth: 60, height: 85 },
      unit: 'cm'
    }
  },
  {
    id: 'kit-002',
    nameAr: 'خزانة مطبخ علوية',
    nameEn: 'Wall Kitchen Cabinet',
    category: 'kitchen',
    dimensions: '80x35x70 سم',
    description: 'خزانة مطبخ علوية معلقة',
    tags: ['خزانة', 'علوية', 'معلقة'],
    specifications: {
      material: 'خشب MDF',
      dimensions: { width: 80, depth: 35, height: 70 },
      unit: 'cm'
    }
  },
  {
    id: 'kit-003',
    nameAr: 'حوض مطبخ مزدوج',
    nameEn: 'Double Kitchen Sink',
    category: 'kitchen',
    dimensions: '80x45x20 سم',
    description: 'حوض مطبخ مزدوج من الستانلس ستيل',
    tags: ['حوض', 'مزدوج', 'ستانلس'],
    specifications: {
      material: 'ستانلس ستيل',
      dimensions: { width: 80, depth: 45, height: 20 },
      unit: 'cm'
    }
  },
  {
    id: 'kit-004',
    nameAr: 'شفاط مطبخ',
    nameEn: 'Kitchen Hood',
    category: 'kitchen',
    dimensions: '90x50x60 سم',
    description: 'شفاط مطبخ قوي مع إضاءة',
    tags: ['شفاط', 'تهوية', 'إضاءة'],
    specifications: {
      material: 'معدن وزجاج',
      dimensions: { width: 90, depth: 50, height: 60 },
      unit: 'cm'
    }
  },
  {
    id: 'kit-005',
    nameAr: 'موقد غاز 4 عيون',
    nameEn: '4-Burner Gas Stove',
    category: 'kitchen',
    dimensions: '60x60x10 سم',
    description: 'موقد غاز بأربع عيون',
    tags: ['موقد', 'غاز', 'طبخ'],
    specifications: {
      material: 'معدن وزجاج',
      dimensions: { width: 60, depth: 60, height: 10 },
      unit: 'cm'
    }
  },
  {
    id: 'kit-006',
    nameAr: 'فرن كهربائي',
    nameEn: 'Electric Oven',
    category: 'kitchen',
    dimensions: '60x60x60 سم',
    description: 'فرن كهربائي مدمج',
    tags: ['فرن', 'كهربائي', 'خبز'],
    specifications: {
      material: 'معدن',
      dimensions: { width: 60, depth: 60, height: 60 },
      unit: 'cm'
    }
  },
  {
    id: 'kit-007',
    nameAr: 'ثلاجة مدمجة',
    nameEn: 'Built-in Refrigerator',
    category: 'kitchen',
    dimensions: '90x70x180 سم',
    description: 'ثلاجة مدمجة في المطبخ',
    tags: ['ثلاجة', 'مدمجة', 'تبريد'],
    specifications: {
      material: 'معدن',
      dimensions: { width: 90, depth: 70, height: 180 },
      unit: 'cm'
    }
  },
  {
    id: 'kit-008',
    nameAr: 'جزيرة مطبخ',
    nameEn: 'Kitchen Island',
    category: 'kitchen',
    dimensions: '150x80x90 سم',
    description: 'جزيرة مطبخ مع رخامة وتخزين',
    tags: ['جزيرة', 'رخام', 'تخزين'],
    specifications: {
      material: 'خشب ورخام',
      dimensions: { width: 150, depth: 80, height: 90 },
      unit: 'cm'
    }
  },

  // === الأعمال الخارجية (Landscape) - 6 Blocks ===
  {
    id: 'land-001',
    nameAr: 'شجرة نخيل',
    nameEn: 'Palm Tree',
    category: 'landscape',
    dimensions: '4-6 متر ارتفاع',
    description: 'شجرة نخيل للحدائق',
    tags: ['شجرة', 'نخيل', 'حديقة'],
    specifications: {
      material: 'نبات طبيعي',
      dimensions: { height: 500 },
      unit: 'cm'
    }
  },
  {
    id: 'land-002',
    nameAr: 'نافورة حديقة',
    nameEn: 'Garden Fountain',
    category: 'landscape',
    dimensions: '150x150x200 سم',
    description: 'نافورة ماء للحدائق الخارجية',
    tags: ['نافورة', 'ماء', 'ديكور'],
    specifications: {
      material: 'حجر وماء',
      dimensions: { width: 150, depth: 150, height: 200 },
      unit: 'cm'
    }
  },
  {
    id: 'land-003',
    nameAr: 'مظلة خارجية',
    nameEn: 'Outdoor Pergola',
    category: 'landscape',
    dimensions: '400x300x270 سم',
    description: 'مظلة خشبية للجلسات الخارجية',
    tags: ['مظلة', 'جلسة', 'خارجي'],
    specifications: {
      material: 'خشب',
      dimensions: { width: 400, depth: 300, height: 270 },
      unit: 'cm'
    }
  },
  {
    id: 'land-004',
    nameAr: 'كشك حديقة',
    nameEn: 'Garden Gazebo',
    category: 'landscape',
    dimensions: '350x350x300 سم',
    description: 'كشك حديقة مغطى',
    tags: ['كشك', 'مظلة', 'حديقة'],
    specifications: {
      material: 'خشب ومعدن',
      dimensions: { width: 350, depth: 350, height: 300 },
      unit: 'cm'
    }
  },
  {
    id: 'land-005',
    nameAr: 'طريق حديقة',
    nameEn: 'Garden Path',
    category: 'landscape',
    dimensions: '120 سم عرض',
    description: 'ممر حديقة بالحجر',
    tags: ['طريق', 'ممر', 'حجر'],
    specifications: {
      material: 'حجر طبيعي',
      dimensions: { width: 120 },
      unit: 'cm'
    }
  },
  {
    id: 'land-006',
    nameAr: 'سور حديقة',
    nameEn: 'Garden Fence',
    category: 'landscape',
    dimensions: '150 سم ارتفاع',
    description: 'سور خشبي للحديقة',
    tags: ['سور', 'حديقة', 'خشب'],
    specifications: {
      material: 'خشب',
      dimensions: { height: 150 },
      unit: 'cm'
    }
  }
];

/**
 * دوال مساعدة للعمل مع البيانات
 */
export const getBlocksByCategory = (categoryId: string): ArchBlock[] => {
  return yqArchBlocks.filter(block => block.category === categoryId);
};

export const searchBlocks = (query: string): ArchBlock[] => {
  const lowerQuery = query.toLowerCase();
  return yqArchBlocks.filter(block =>
    block.nameAr.toLowerCase().includes(lowerQuery) ||
    block.nameEn.toLowerCase().includes(lowerQuery) ||
    block.description.toLowerCase().includes(lowerQuery) ||
    block.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getBlockById = (id: string): ArchBlock | undefined => {
  return yqArchBlocks.find(block => block.id === id);
};

export const getCategoryStats = (): { category: string; count: number; nameAr: string }[] => {
  const stats = blockCategories.map(cat => ({
    category: cat.id,
    nameAr: cat.nameAr,
    count: getBlocksByCategory(cat.id).length
  }));
  return stats;
};
