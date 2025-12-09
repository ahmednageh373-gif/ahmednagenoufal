# Navisworks 4D Viewer Components

مكونات React لعرض نماذج Navisworks ثلاثية الأبعاد باستخدام Three.js

## المكونات

### 1. Navisworks4DViewer (المكون الرئيسي)
المكون الرئيسي الذي يحتوي على جميع المكونات الأخرى.

**الاستخدام:**
```tsx
import { Navisworks4DViewer } from './components/Navisworks';

function App() {
  return (
    <Navisworks4DViewer
      projectId="project-123"
      modelId="model-456"
      className="h-screen"
    />
  );
}
```

**Props:**
- `projectId: string` - معرف المشروع
- `modelId: string` - معرف النموذج
- `className?: string` - CSS classes إضافية

---

### 2. NavisworksScene
مكون Three.js للمشهد ثلاثي الأبعاد.

**الميزات:**
- ✅ عرض الأشكال الهندسية (Geometry rendering)
- ✅ اختيار العناصر (Element selection)
- ✅ تظليل العناصر (Element highlighting)
- ✅ OrbitControls للتحكم بالكاميرا
- ✅ Grid و Axes helpers
- ✅ Sky و Environment
- ✅ Shadows و ContactShadows

---

### 3. PropertiesPanel
لوحة عرض خصائص العنصر المحدد.

**الميزات:**
- ✅ عرض جميع PropertyCategories
- ✅ عرض Bounding Box
- ✅ عرض معلومات Geometry
- ✅ عرض Material و Color
- ✅ نسخ القيم إلى Clipboard
- ✅ طي/فتح الفئات

---

### 4. ViewerToolbar
شريط الأدوات للتحكم بالعارض.

**الميزات:**
- ✅ التحكم بالكاميرا (Reset, Zoom, Fit)
- ✅ التحكم بالعرض (Grid, Axes)
- ✅ الإعدادات (Lighting, Camera, Background)
- ✅ تصدير صورة
- ✅ فتح لوحات الطبقات والتصفية

---

### 5. ElementsPanel
لوحة قائمة العناصر.

**الميزات:**
- ✅ بحث في العناصر
- ✅ تصفية حسب Category
- ✅ عرض List أو Tree
- ✅ إظهار/إخفاء العناصر
- ✅ تظليل عند Hover
- ✅ عرض إحصائيات

---

## الأنواع (Types)

### ElementData
```typescript
interface ElementData {
  id: string;
  name: string;
  category: string;
  path: string;
  boundingBox?: BoundingBox;
  properties: Record<string, Record<string, PropertyValue>>;
  geometry?: GeometryData;
  material?: MaterialData;
  metadata?: ElementMetadata;
}
```

### GeometryData
```typescript
interface GeometryData {
  vertices: number[];       // [x1, y1, z1, x2, y2, z2, ...]
  indices: number[];        // [i1, i2, i3, ...]
  normals: number[];        // [nx1, ny1, nz1, ...]
  uvs?: number[];          // [u1, v1, u2, v2, ...]
  transform: number[];      // 4x4 matrix (16 elements)
  triangleCount: number;
  vertexCount: number;
}
```

### ViewerSettings
```typescript
interface ViewerSettings {
  showGrid: boolean;
  showAxes: boolean;
  backgroundColor: string;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  enableShadows: boolean;
  cameraFov: number;
  cameraNear: number;
  cameraFar: number;
  orbitControlsEnabled: boolean;
}
```

---

## Hooks

### useNavisworksModel
```typescript
const { modelData, elements, isLoading, error, refetch } = useNavisworksModel({
  projectId: 'project-123',
  modelId: 'model-456',
  enabled: true,
});
```

### useElementFilter
```typescript
const { 
  filteredElements, 
  filters, 
  updateFilter, 
  resetFilters 
} = useElementFilter(elements);
```

### useElementCategories
```typescript
const categories = useElementCategories(elements);
```

---

## التفاعل مع العارض

### اختيار عنصر
- انقر على عنصر في المشهد ثلاثي الأبعاد
- أو انقر على عنصر في ElementsPanel
- ستفتح PropertiesPanel تلقائياً

### تظليل عنصر
- مرر الماوس فوق عنصر في ElementsPanel
- سيتم تظليله بالأصفر في المشهد

### إخفاء/إظهار عنصر
- انقر على أيقونة العين في ElementsPanel
- العنصر سيختفي/يظهر في المشهد

### التحكم بالكاميرا
- **سحب الماوس**: تدوير المشهد
- **عجلة الماوس**: تكبير/تصغير
- **Shift + سحب**: تحريك المشهد
- **أزرار Toolbar**: Reset, Zoom In/Out, Fit to View

---

## الإعدادات

### تغيير الإضاءة
```typescript
settings={{
  ambientLightIntensity: 0.6,
  directionalLightIntensity: 0.8,
}}
```

### تغيير الكاميرا
```typescript
settings={{
  cameraFov: 60,
  cameraNear: 0.1,
  cameraFar: 10000,
}}
```

### تغيير الخلفية
```typescript
settings={{
  backgroundColor: '#1a1a2e',
}}
```

---

## الأداء

### تحسين الأداء للنماذج الكبيرة

1. **تقليل عدد المثلثات:**
```typescript
// في GeometryExtractor.cs
geometry = SimplifyGeometry(geometry, tolerance: 0.01);
```

2. **استخدام LOD (Level of Detail):**
```typescript
// عرض geometry مبسطة للعناصر البعيدة
```

3. **Frustum Culling:**
```typescript
// Three.js يطبق هذا تلقائياً
```

4. **Instancing للعناصر المتكررة:**
```typescript
// استخدام InstancedMesh للعناصر المتشابهة
```

---

## التكامل مع API

### جلب بيانات النموذج
```typescript
GET /api/projects/:projectId/navisworks/models/:modelId

Response:
{
  "success": true,
  "data": {
    "fileName": "Building.nwf",
    "title": "Main Building",
    "elements": [...],
    ...
  }
}
```

### جلب عنصر واحد
```typescript
GET /api/projects/:projectId/navisworks/models/:modelId/elements/:elementId

Response:
{
  "success": true,
  "data": {
    "id": "element-123",
    "name": "Wall-001",
    ...
  }
}
```

---

## أمثلة متقدمة

### تخصيص الألوان حسب Category
```typescript
const getCategoryColor = (category: string) => {
  const colors = {
    Wall: 0xcccccc,
    Door: 0x8b4513,
    Window: 0x87ceeb,
    Column: 0x808080,
    // ...
  };
  return colors[category] || 0x808080;
};
```

### فلترة حسب خاصية
```typescript
const filteredElements = elements.filter(el => {
  const level = el.properties['Identity Data']?.['Level']?.value;
  return level === 'Level 1';
});
```

### تجميع حسب خاصية
```typescript
const groupedByLevel = elements.reduce((groups, el) => {
  const level = el.properties['Identity Data']?.['Level']?.value || 'Unknown';
  if (!groups[level]) groups[level] = [];
  groups[level].push(el);
  return groups;
}, {} as Record<string, ElementData[]>);
```

---

## حل المشاكل

### المشكلة: العارض لا يظهر
**الحل:**
1. تحقق من أن Three.js و @react-three/fiber مثبتين
2. تحقق من أن البيانات محملة (`isLoading === false`)
3. تحقق من Console للأخطاء

### المشكلة: الأشكال لا تظهر
**الحل:**
1. تحقق من أن `element.geometry` موجود
2. تحقق من `vertices.length > 0` و `indices.length > 0`
3. تحقق من transform matrix

### المشكلة: الأداء بطيء
**الحل:**
1. قلل عدد المثلثات في Geometry
2. استخدم `SimplifyGeometry`
3. أخف العناصر غير المرئية
4. استخدم LOD للعناصر البعيدة

---

## المتطلبات

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "three": "^0.181.0",
    "@react-three/fiber": "^8.17.0",
    "@react-three/drei": "^9.120.0",
    "@tanstack/react-query": "^5.90.7",
    "lucide-react": "^0.400.0"
  }
}
```

---

## الترخيص

Copyright © NOUFAL 2024
