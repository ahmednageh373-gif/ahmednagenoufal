import React, { useState, useRef, useCallback } from 'react';
import {
  FolderOpen,
  Upload,
  File,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Download,
  Trash2,
  Eye,
  Box,
  Home,
  Building2,
  Zap,
  Wrench,
  Search,
  Filter,
  Grid3x3,
  List
} from 'lucide-react';

interface DrawingFile {
  id: string;
  name: string;
  type: 'dwg' | 'dxf' | 'pdf';
  size: number;
  category: 'architectural' | 'structural' | 'mechanical' | 'electrical';
  file: File;
  preview?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  analysis?: {
    title: string;
    description: string;
    elements: string[];
    layers: string[];
    dimensions: {
      length: number;
      width: number;
      height?: number;
    };
    issues: string[];
    recommendations: string[];
    tableData?: any[];
  };
  uploadedAt: Date;
}

type Category = 'architectural' | 'structural' | 'mechanical' | 'electrical';

export const ApprovedExecutionDrawings: React.FC = () => {
  const [drawings, setDrawings] = useState<DrawingFile[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [show3DView, setShow3DView] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all' as const, name: 'الكل', icon: Grid3x3, color: 'bg-gray-500' },
    { id: 'architectural' as const, name: 'معماري', icon: Home, color: 'bg-blue-500' },
    { id: 'structural' as const, name: 'إنشائي', icon: Building2, color: 'bg-green-500' },
    { id: 'mechanical' as const, name: 'ميكانيكا', icon: Wrench, color: 'bg-orange-500' },
    { id: 'electrical' as const, name: 'كهرباء', icon: Zap, color: 'bg-yellow-500' },
  ];

  // Drag and Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  // Detect category from filename
  const detectCategory = (filename: string): Category => {
    const lower = filename.toLowerCase();
    if (lower.includes('arch') || lower.includes('معماري')) return 'architectural';
    if (lower.includes('struct') || lower.includes('إنشائي')) return 'structural';
    if (lower.includes('mech') || lower.includes('ميكانيكا')) return 'mechanical';
    if (lower.includes('elec') || lower.includes('كهرباء')) return 'electrical';
    return 'architectural'; // default
  };

  // Process uploaded files
  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ext === 'dwg' || ext === 'dxf' || ext === 'pdf';
    });

    if (validFiles.length === 0) {
      alert('يرجى رفع ملفات AutoCAD (.dwg, .dxf) أو PDF فقط');
      return;
    }

    const newDrawings: DrawingFile[] = validFiles.map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() as 'dwg' | 'dxf' | 'pdf',
      size: file.size,
      category: detectCategory(file.name),
      file,
      status: 'uploading',
      uploadedAt: new Date()
    }));

    setDrawings(prev => [...newDrawings, ...prev]);

    // Process each file
    newDrawings.forEach(drawing => analyzeDrawing(drawing));
  };

  // Analyze drawing with AI
  const analyzeDrawing = async (drawing: DrawingFile) => {
    setDrawings(prev =>
      prev.map(d => d.id === drawing.id ? { ...d, status: 'processing' as const } : d)
    );

    try {
      // Simulate AI analysis - في الإنتاج، استخدم understand_images أو analyze_media_content
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockAnalysis = {
        title: drawing.type === 'pdf' ? 'مخطط تنفيذي - الدور الأرضي' : 'Ground Floor Layout',
        description: 'مخطط تفصيلي للدور الأرضي يتضمن توزيع الغرف والمرافق الرئيسية',
        elements: [
          'غرف نوم (4)',
          'صالة رئيسية',
          'مطبخ',
          'حمامات (3)',
          'مدخل رئيسي',
          'مواقف سيارات (2)'
        ],
        layers: [
          'Walls',
          'Doors',
          'Windows',
          'Furniture',
          'Dimensions',
          'Text',
          'Electrical',
          'Plumbing'
        ],
        dimensions: {
          length: 15.5,
          width: 12.3,
          height: 3.2
        },
        issues: [
          'بعض الأبعاد غير واضحة في الزاوية الشمالية',
          'تعارض محتمل بين أنابيب المياه والكهرباء في منطقة المطبخ',
          'عرض الممر الرئيسي أقل من المطلوب (100 سم بدلاً من 120 سم)'
        ],
        recommendations: [
          'مراجعة وتوضيح الأبعاد في الزاوية الشمالية',
          'التنسيق بين المعماري والكهروميكانيكي لحل التعارضات',
          'توسيع الممر الرئيسي ليصبح 120 سم',
          'إضافة مخرج طوارئ إضافي حسب كود البناء'
        ],
        tableData: drawing.type === 'pdf' ? [
          { item: 'أعمال الحفر', unit: 'م³', quantity: 150.5, rate: 45, amount: 6772.5 },
          { item: 'أعمال الخرسانة المسلحة', unit: 'م³', quantity: 85.3, rate: 850, amount: 72505 },
          { item: 'أعمال البلوك', unit: 'م²', quantity: 320.0, rate: 65, amount: 20800 },
        ] : undefined
      };

      setDrawings(prev =>
        prev.map(d =>
          d.id === drawing.id
            ? { ...d, status: 'completed' as const, analysis: mockAnalysis }
            : d
        )
      );
    } catch (error) {
      setDrawings(prev =>
        prev.map(d => d.id === drawing.id ? { ...d, status: 'error' as const } : d)
      );
    }
  };

  // Handle file input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  // Handle folder upload
  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  // Delete drawing
  const deleteDrawing = (id: string) => {
    setDrawings(prev => prev.filter(d => d.id !== id));
  };

  // Generate 3D view
  const generate3DView = () => {
    setShow3DView(true);
    // هنا يمكن دمج مكتبة Three.js لعرض 3D حقيقي
  };

  // Export report
  const exportReport = () => {
    const report = `
تقرير المخططات التنفيذية المعتمدة
====================================
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
عدد المخططات: ${drawings.length}

المخططات حسب التخصص:
- معماري: ${drawings.filter(d => d.category === 'architectural').length}
- إنشائي: ${drawings.filter(d => d.category === 'structural').length}
- ميكانيكا: ${drawings.filter(d => d.category === 'mechanical').length}
- كهرباء: ${drawings.filter(d => d.category === 'electrical').length}

${drawings.map((d, i) => `
مخطط ${i + 1}: ${d.name}
---------------------------
التصنيف: ${
  d.category === 'architectural' ? 'معماري' :
  d.category === 'structural' ? 'إنشائي' :
  d.category === 'mechanical' ? 'ميكانيكا' : 'كهرباء'
}
النوع: ${d.type.toUpperCase()}
الحجم: ${(d.size / 1024 / 1024).toFixed(2)} MB
الحالة: ${d.status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}

${d.analysis ? `
التحليل:
${d.analysis.description}

العناصر الرئيسية:
${d.analysis.elements.map(e => `• ${e}`).join('\n')}

الأبعاد:
- الطول: ${d.analysis.dimensions.length} م
- العرض: ${d.analysis.dimensions.width} م
${d.analysis.dimensions.height ? `- الارتفاع: ${d.analysis.dimensions.height} م` : ''}

المشاكل:
${d.analysis.issues.map(i => `⚠️ ${i}`).join('\n')}

التوصيات:
${d.analysis.recommendations.map(r => `✓ ${r}`).join('\n')}

${d.analysis.tableData ? `
بيانات الجداول:
${d.analysis.tableData.map(row => 
  `${row.item}: ${row.quantity} ${row.unit} × ${row.rate} = ${row.amount} ريال`
).join('\n')}
` : ''}
` : 'التحليل قيد التقدم...'}
`).join('\n==============================\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution_drawings_report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter drawings
  const filteredDrawings = drawings.filter(d => {
    const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get statistics
  const stats = {
    total: drawings.length,
    completed: drawings.filter(d => d.status === 'completed').length,
    processing: drawings.filter(d => d.status === 'processing').length,
    architectural: drawings.filter(d => d.category === 'architectural').length,
    structural: drawings.filter(d => d.category === 'structural').length,
    mechanical: drawings.filter(d => d.category === 'mechanical').length,
    electrical: drawings.filter(d => d.category === 'electrical').length,
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <FolderOpen className="w-8 h-8" />
          المخططات التنفيذية المعتمدة
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          رفع وتحليل مخططات AutoCAD و PDF بالذكاء الاصطناعي
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            اسحب وأفلت الملفات هنا
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            أو انقر لاختيار الملفات (AutoCAD: .dwg, .dxf | PDF)
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <File className="w-5 h-5" />
              رفع ملفات
            </button>
            <button
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FolderOpen className="w-5 h-5" />
              رفع مجلد كامل
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".dwg,.dxf,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        webkitdirectory=""
        directory=""
        onChange={handleFolderSelect}
        className="hidden"
      />

      {/* Statistics */}
      {drawings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المخططات</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">قيد المعالجة</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
              </div>
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">مكتمل</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <button
              onClick={generate3DView}
              className="w-full h-full flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Box className="w-8 h-8 text-purple-500 mb-1" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">عرض 3D</p>
            </button>
          </div>
        </div>
      )}

      {/* Category Tabs & Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              const count = cat.id === 'all' ? stats.total : stats[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeCategory === cat.id
                      ? `${cat.color} text-white`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{cat.name}</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* View Mode */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Export */}
            {drawings.length > 0 && (
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                تحميل التقرير
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drawings Display */}
      {filteredDrawings.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrawings.map(drawing => {
              const CategoryIcon = categories.find(c => c.id === drawing.category)?.icon || File;
              const categoryColor = categories.find(c => c.id === drawing.category)?.color || 'bg-gray-500';
              
              return (
                <div key={drawing.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  {/* Header */}
                  <div className={`${categoryColor} p-4 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <CategoryIcon className="w-6 h-6" />
                      <span className="text-xs font-semibold px-2 py-1 bg-white/20 rounded">
                        {drawing.type.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-bold truncate">{drawing.name}</h3>
                    <p className="text-xs opacity-90">
                      {(drawing.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Status */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      {drawing.status === 'completed' && (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-green-600">تحليل مكتمل</span>
                        </>
                      )}
                      {drawing.status === 'processing' && (
                        <>
                          <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                          <span className="text-sm font-medium text-yellow-600">جاري التحليل...</span>
                        </>
                      )}
                      {drawing.status === 'error' && (
                        <>
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <span className="text-sm font-medium text-red-600">خطأ في التحليل</span>
                        </>
                      )}
                    </div>

                    {/* Analysis Preview */}
                    {drawing.analysis && (
                      <div className="space-y-3 text-sm">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                            {drawing.analysis.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            {drawing.analysis.description}
                          </p>
                        </div>

                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                            الأبعاد:
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {drawing.analysis.dimensions.length} × {drawing.analysis.dimensions.width}
                            {drawing.analysis.dimensions.height && ` × ${drawing.analysis.dimensions.height}`} م
                          </p>
                        </div>

                        {drawing.analysis.issues.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-900/20 rounded p-2">
                            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                              ⚠️ مشاكل ({drawing.analysis.issues.length})
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">عرض</span>
                      </button>
                      <button
                        onClick={() => deleteDrawing(drawing.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    التصنيف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    الحجم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDrawings.map(drawing => (
                  <tr key={drawing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {drawing.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {drawing.category === 'architectural' ? 'معماري' :
                       drawing.category === 'structural' ? 'إنشائي' :
                       drawing.category === 'mechanical' ? 'ميكانيكا' : 'كهرباء'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {drawing.type.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {(drawing.size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        drawing.status === 'completed' ? 'bg-green-100 text-green-800' :
                        drawing.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {drawing.status === 'completed' ? 'مكتمل' :
                         drawing.status === 'processing' ? 'قيد المعالجة' : 'خطأ'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDrawing(drawing.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            لا توجد مخططات بعد
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            ابدأ برفع المخططات التنفيذية المعتمدة للحصول على تحليل شامل
          </p>
        </div>
      )}

      {/* 3D View Modal */}
      {show3DView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Box className="w-6 h-6" />
                عرض المبنى ثلاثي الأبعاد
              </h3>
              <button
                onClick={() => setShow3DView(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                ×
              </button>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <Box className="w-24 h-24 mx-auto mb-4 animate-pulse" />
                <p className="text-lg font-medium">عرض 3D قيد التطوير</p>
                <p className="text-sm mt-2">سيتم دمج Three.js لعرض تفاعلي ثلاثي الأبعاد</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedExecutionDrawings;
