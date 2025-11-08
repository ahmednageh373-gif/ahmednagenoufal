import React, { useState, useCallback, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  X, 
  Download, 
  Search, 
  Filter, 
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  FileCheck,
  Table,
  BarChart3,
  Eye,
  Loader2,
  FolderOpen,
  FileDown
} from 'lucide-react';

interface DocumentFile {
  id: string;
  name: string;
  type: 'pdf' | 'xlsx' | 'xls';
  size: number;
  category: 'contract' | 'boq' | 'schedule';
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  uploadedAt: Date;
  analysis?: {
    title: string;
    summary: string;
    documentType: string;
    extractedTables: Array<{
      name: string;
      headers: string[];
      rowCount: number;
      data: any[][];
      summary: string;
    }>;
    keyFindings: string[];
    totalAmount?: number;
    startDate?: string;
    endDate?: string;
    duration?: number;
    parties?: string[];
    majorItems?: Array<{
      item: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      total: number;
    }>;
    milestones?: Array<{
      name: string;
      startDate: string;
      endDate: string;
      duration: number;
      status: string;
    }>;
    issues: string[];
    recommendations: string[];
  };
}

interface CategoryConfig {
  id: 'contract' | 'boq' | 'schedule';
  name: string;
  nameEn: string;
  icon: any;
  color: string;
  description: string;
  acceptedTypes: string[];
}

export default function SiteDocuments() {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: CategoryConfig[] = [
    {
      id: 'contract',
      name: 'عقد الأساسات',
      nameEn: 'Foundation Contract',
      icon: FileCheck,
      color: 'bg-blue-500',
      description: 'عقود المقاولات والشروط التعاقدية',
      acceptedTypes: ['.pdf', '.xlsx', '.xls']
    },
    {
      id: 'boq',
      name: 'جدول المقايسة والكميات',
      nameEn: 'Bill of Quantities',
      icon: Table,
      color: 'bg-green-500',
      description: 'جداول الكميات المعتمدة والمقايسات',
      acceptedTypes: ['.pdf', '.xlsx', '.xls']
    },
    {
      id: 'schedule',
      name: 'الجدول الزمني',
      nameEn: 'Project Schedule',
      icon: Calendar,
      color: 'bg-purple-500',
      description: 'الجداول الزمنية المعتمدة للمشروع',
      acceptedTypes: ['.pdf', '.xlsx', '.xls']
    }
  ];

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const detectCategory = (fileName: string): 'contract' | 'boq' | 'schedule' => {
    const lowerName = fileName.toLowerCase();
    
    // Contract keywords
    if (lowerName.includes('عقد') || lowerName.includes('contract') || 
        lowerName.includes('اتفاق') || lowerName.includes('agreement')) {
      return 'contract';
    }
    
    // BOQ keywords
    if (lowerName.includes('مقايس') || lowerName.includes('كميات') || 
        lowerName.includes('boq') || lowerName.includes('quantities') ||
        lowerName.includes('bill')) {
      return 'boq';
    }
    
    // Schedule keywords
    if (lowerName.includes('زمني') || lowerName.includes('جدول') || 
        lowerName.includes('schedule') || lowerName.includes('timeline') ||
        lowerName.includes('program')) {
      return 'schedule';
    }
    
    // Default to contract if unclear
    return 'contract';
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return ['.pdf', '.xlsx', '.xls'].includes(ext);
    });

    if (validFiles.length === 0) {
      alert('يرجى تحميل ملفات PDF أو Excel فقط');
      return;
    }

    const newDocuments: DocumentFile[] = validFiles.map(file => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.name.endsWith('.pdf') ? 'pdf' : (file.name.endsWith('.xlsx') ? 'xlsx' : 'xls'),
      size: file.size,
      category: detectCategory(file.name),
      file: file,
      status: 'uploading',
      uploadedAt: new Date()
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    // Process each document
    for (const doc of newDocuments) {
      await analyzeDocument(doc);
    }
  };

  const analyzeDocument = async (doc: DocumentFile) => {
    // Update status to processing
    setDocuments(prev => prev.map(d => 
      d.id === doc.id ? { ...d, status: 'processing' } : d
    ));

    // Simulate AI analysis with realistic delay
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

    // Generate analysis based on document category
    let analysis: DocumentFile['analysis'];

    if (doc.category === 'contract') {
      analysis = {
        title: 'عقد مقاولة أعمال الأساسات والقواعد',
        summary: 'عقد مقاولة بين المالك والمقاول لتنفيذ أعمال الأساسات والقواعد الخرسانية للمشروع',
        documentType: 'عقد مقاولة',
        extractedTables: [
          {
            name: 'بنود العقد الرئيسية',
            headers: ['البند', 'الوصف', 'القيمة'],
            rowCount: 8,
            data: [
              ['الطرف الأول', 'شركة البناء المتقدم', '-'],
              ['الطرف الثاني', 'مؤسسة الأساسات الحديثة', '-'],
              ['قيمة العقد', 'أعمال الأساسات الخرسانية', '850,000 ريال'],
              ['مدة التنفيذ', '90 يوم عمل', '-'],
              ['الضمان البنكي', '10% من قيمة العقد', '85,000 ريال'],
              ['الدفعة المقدمة', '20% من قيمة العقد', '170,000 ريال'],
              ['نظام الدفع', 'دفعات مرحلية حسب الإنجاز', '-'],
              ['فترة الضمان', '12 شهر من تاريخ الاستلام', '-']
            ],
            summary: 'بنود العقد الأساسية تشمل الأطراف المتعاقدة والقيمة والمدة'
          }
        ],
        keyFindings: [
          'قيمة العقد الإجمالية: 850,000 ريال سعودي',
          'مدة التنفيذ المتفق عليها: 90 يوم عمل',
          'يشمل العقد ضمان بنكي بنسبة 10%',
          'يتم الدفع على دفعات مرحلية حسب الإنجاز',
          'فترة ضمان للأعمال لمدة 12 شهر'
        ],
        totalAmount: 850000,
        startDate: '2025-01-15',
        endDate: '2025-04-15',
        duration: 90,
        parties: ['شركة البناء المتقدم (المالك)', 'مؤسسة الأساسات الحديثة (المقاول)'],
        issues: [
          'يجب التأكد من تقديم الضمان البنكي قبل بدء العمل',
          'ضرورة تحديد آلية احتساب الغرامات في حالة التأخير'
        ],
        recommendations: [
          'مراجعة شروط الدفع والتأكد من وضوح الدفعات المرحلية',
          'إضافة بند لآلية حل النزاعات',
          'تحديد جهة الإشراف والاستشاري المعتمد',
          'إرفاق مواصفات فنية تفصيلية للأعمال المطلوبة'
        ]
      };
    } else if (doc.category === 'boq') {
      analysis = {
        title: 'جدول الكميات المعتمد - أعمال الهيكل الإنشائي',
        summary: 'جدول تفصيلي لكميات الأعمال الإنشائية مع الأسعار والقيم',
        documentType: 'جدول مقايسة وكميات',
        extractedTables: [
          {
            name: 'بنود أعمال الخرسانة المسلحة',
            headers: ['رقم البند', 'الوصف', 'الكمية', 'الوحدة', 'سعر الوحدة', 'الإجمالي'],
            rowCount: 12,
            data: [
              ['1.1', 'خرسانة عادية للأساسات', '45', 'م³', '300', '13,500'],
              ['1.2', 'خرسانة مسلحة للقواعد', '120', 'م³', '450', '54,000'],
              ['1.3', 'خرسانة مسلحة للأعمدة', '85', 'م³', '480', '40,800'],
              ['1.4', 'خرسانة مسلحة للجسور', '95', 'م³', '470', '44,650'],
              ['1.5', 'خرسانة مسلحة للبلاطات', '180', 'م³', '440', '79,200'],
              ['2.1', 'حديد تسليح عادي', '28,500', 'كجم', '4.5', '128,250'],
              ['2.2', 'حديد تسليح عالي المقاومة', '12,000', 'كجم', '5.2', '62,400'],
              ['3.1', 'أعمال الحفر والردم', '850', 'م³', '35', '29,750'],
              ['3.2', 'أعمال الدك والتسوية', '650', 'م²', '18', '11,700'],
              ['4.1', 'فرم خشبي للقواعد والأعمدة', '2,400', 'م²', '55', '132,000'],
              ['4.2', 'فرم معدني للبلاطات', '1,800', 'م²', '42', '75,600'],
              ['5.1', 'عزل مائي للأساسات', '450', 'م²', '65', '29,250']
            ],
            summary: 'جدول تفصيلي يشمل جميع بنود الأعمال الإنشائية'
          },
          {
            name: 'ملخص التكاليف',
            headers: ['القسم', 'الإجمالي (ريال)'],
            rowCount: 6,
            data: [
              ['أعمال الخرسانة', '232,150'],
              ['أعمال حديد التسليح', '190,650'],
              ['أعمال الحفر والردم', '41,450'],
              ['أعمال الفرم والشدات', '207,600'],
              ['أعمال العزل', '29,250'],
              ['الإجمالي الكلي', '701,100']
            ],
            summary: 'ملخص إجمالي التكاليف حسب الأقسام'
          }
        ],
        keyFindings: [
          'إجمالي قيمة الأعمال: 701,100 ريال سعودي',
          'كمية الخرسانة المسلحة الإجمالية: 525 م³',
          'كمية حديد التسليح: 40.5 طن',
          'أعمال الفرم والشدات تمثل 29.6% من التكلفة',
          'يشمل الجدول جميع بنود الأعمال الإنشائية الرئيسية'
        ],
        totalAmount: 701100,
        majorItems: [
          {
            item: 'أعمال الخرسانة المسلحة',
            quantity: 525,
            unit: 'م³',
            unitPrice: 442,
            total: 232150
          },
          {
            item: 'أعمال حديد التسليح',
            quantity: 40500,
            unit: 'كجم',
            unitPrice: 4.71,
            total: 190650
          },
          {
            item: 'أعمال الفرم والشدات',
            quantity: 4200,
            unit: 'م²',
            unitPrice: 49.43,
            total: 207600
          }
        ],
        issues: [
          'بعض الأسعار قد تحتاج تحديث حسب أسعار السوق الحالية',
          'لم يتم تضمين بند للأعمال الإضافية المحتملة'
        ],
        recommendations: [
          'إضافة بند احتياطي بنسبة 5-10% للأعمال غير المتوقعة',
          'مراجعة أسعار الوحدات مع أسعار السوق الحالية',
          'تحديد آلية تسعير الأعمال الإضافية مسبقاً',
          'إضافة جدول للمواصفات الفنية لكل بند'
        ]
      };
    } else { // schedule
      analysis = {
        title: 'الجدول الزمني المعتمد للمشروع - المرحلة الإنشائية',
        summary: 'جدول زمني تفصيلي لجميع أنشطة المشروع مع المدد والتواريخ',
        documentType: 'جدول زمني (Schedule)',
        extractedTables: [
          {
            name: 'جدول الأنشطة الرئيسية',
            headers: ['رقم النشاط', 'اسم النشاط', 'المدة (يوم)', 'تاريخ البدء', 'تاريخ الانتهاء', 'النسبة المئوية'],
            rowCount: 15,
            data: [
              ['1', 'التحضير والتجهيز', '7', '15/01/2025', '22/01/2025', '100%'],
              ['2', 'أعمال الحفر والتسوية', '10', '23/01/2025', '02/02/2025', '85%'],
              ['3', 'صب الخرسانة العادية', '5', '03/02/2025', '08/02/2025', '60%'],
              ['4', 'أعمال حديد القواعد', '12', '09/02/2025', '21/02/2025', '40%'],
              ['5', 'صب خرسانة القواعد', '8', '22/02/2025', '02/03/2025', '20%'],
              ['6', 'أعمال حديد الأعمدة - الدور الأرضي', '10', '03/03/2025', '13/03/2025', '0%'],
              ['7', 'صب خرسانة الأعمدة - الدور الأرضي', '6', '14/03/2025', '20/03/2025', '0%'],
              ['8', 'أعمال حديد الجسور والبلاطات - الدور الأرضي', '14', '21/03/2025', '04/04/2025', '0%'],
              ['9', 'صب خرسانة البلاطات - الدور الأرضي', '7', '05/04/2025', '12/04/2025', '0%'],
              ['10', 'أعمال حديد الأعمدة - الدور الأول', '10', '13/04/2025', '23/04/2025', '0%'],
              ['11', 'صب خرسانة الأعمدة - الدور الأول', '6', '24/04/2025', '30/04/2025', '0%'],
              ['12', 'أعمال حديد الجسور والبلاطات - الدور الأول', '14', '01/05/2025', '15/05/2025', '0%'],
              ['13', 'صب خرسانة البلاطات - الدور الأول', '7', '16/05/2025', '23/05/2025', '0%'],
              ['14', 'أعمال التشطيب الخارجي', '20', '24/05/2025', '13/06/2025', '0%'],
              ['15', 'الاستلام النهائي', '5', '14/06/2025', '19/06/2025', '0%']
            ],
            summary: 'جدول تفصيلي لجميع الأنشطة مع التواريخ ونسب الإنجاز'
          },
          {
            name: 'المعالم الرئيسية (Milestones)',
            headers: ['المعلم', 'التاريخ المتوقع', 'الحالة'],
            rowCount: 5,
            data: [
              ['اكتمال أعمال الأساسات', '02/03/2025', 'قيد التنفيذ'],
              ['اكتمال الهيكل الإنشائي - الدور الأرضي', '12/04/2025', 'لم يبدأ'],
              ['اكتمال الهيكل الإنشائي - الدور الأول', '23/05/2025', 'لم يبدأ'],
              ['اكتمال التشطيبات الخارجية', '13/06/2025', 'لم يبدأ'],
              ['الاستلام النهائي للمشروع', '19/06/2025', 'لم يبدأ']
            ],
            summary: 'المعالم الرئيسية للمشروع مع التواريخ المستهدفة'
          }
        ],
        keyFindings: [
          'إجمالي مدة المشروع: 156 يوم عمل (حوالي 5.2 شهر)',
          'تاريخ البدء: 15 يناير 2025',
          'تاريخ الانتهاء المتوقع: 19 يونيو 2025',
          'نسبة الإنجاز الحالية: 41% من المشروع',
          'عدد الأنشطة الحرجة: 8 أنشطة على المسار الحرج'
        ],
        startDate: '2025-01-15',
        endDate: '2025-06-19',
        duration: 156,
        milestones: [
          {
            name: 'اكتمال أعمال الأساسات',
            startDate: '2025-01-15',
            endDate: '2025-03-02',
            duration: 47,
            status: 'قيد التنفيذ'
          },
          {
            name: 'اكتمال الهيكل الإنشائي - الدور الأرضي',
            startDate: '2025-03-03',
            endDate: '2025-04-12',
            duration: 40,
            status: 'لم يبدأ'
          },
          {
            name: 'اكتمال الهيكل الإنشائي - الدور الأول',
            startDate: '2025-04-13',
            endDate: '2025-05-23',
            duration: 40,
            status: 'لم يبدأ'
          },
          {
            name: 'اكتمال التشطيبات الخارجية',
            startDate: '2025-05-24',
            endDate: '2025-06-13',
            duration: 20,
            status: 'لم يبدأ'
          },
          {
            name: 'الاستلام النهائي',
            startDate: '2025-06-14',
            endDate: '2025-06-19',
            duration: 5,
            status: 'لم يبدأ'
          }
        ],
        issues: [
          'يوجد تأخير طفيف في أعمال الحفر والتسوية (5 أيام)',
          'قد تتأثر الأنشطة اللاحقة إذا استمر التأخير',
          'لم يتم تحديد الأنشطة الاحتياطية (Float)'
        ],
        recommendations: [
          'تسريع أعمال الحفر لتعويض التأخير الحالي',
          'إضافة موارد إضافية للأنشطة الحرجة',
          'إعداد خطة طوارئ للظروف الجوية السيئة',
          'تحديث الجدول الزمني أسبوعياً لمتابعة التقدم',
          'تحديد buffer time بين الأنشطة الحرجة'
        ]
      };
    }

    // Update document with analysis
    setDocuments(prev => prev.map(d => 
      d.id === doc.id ? { ...d, status: 'completed', analysis } : d
    ));
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const downloadReport = (doc: DocumentFile) => {
    if (!doc.analysis) return;

    let reportContent = `تقرير تحليل المستند: ${doc.analysis.title}\n`;
    reportContent += `${'='.repeat(60)}\n\n`;
    reportContent += `📋 معلومات المستند\n`;
    reportContent += `${'-'.repeat(60)}\n`;
    reportContent += `• اسم الملف: ${doc.name}\n`;
    reportContent += `• نوع المستند: ${doc.analysis.documentType}\n`;
    reportContent += `• الفئة: ${categories.find(c => c.id === doc.category)?.name}\n`;
    reportContent += `• تاريخ الرفع: ${doc.uploadedAt.toLocaleString('ar-SA')}\n`;
    reportContent += `• حجم الملف: ${(doc.size / 1024 / 1024).toFixed(2)} MB\n\n`;

    reportContent += `📝 الملخص\n`;
    reportContent += `${'-'.repeat(60)}\n`;
    reportContent += `${doc.analysis.summary}\n\n`;

    if (doc.analysis.parties && doc.analysis.parties.length > 0) {
      reportContent += `🤝 الأطراف المتعاقدة\n`;
      reportContent += `${'-'.repeat(60)}\n`;
      doc.analysis.parties.forEach((party, idx) => {
        reportContent += `${idx + 1}. ${party}\n`;
      });
      reportContent += `\n`;
    }

    if (doc.analysis.totalAmount) {
      reportContent += `💰 القيمة المالية\n`;
      reportContent += `${'-'.repeat(60)}\n`;
      reportContent += `• المبلغ الإجمالي: ${doc.analysis.totalAmount.toLocaleString('ar-SA')} ريال سعودي\n\n`;
    }

    if (doc.analysis.startDate && doc.analysis.endDate) {
      reportContent += `📅 المدة الزمنية\n`;
      reportContent += `${'-'.repeat(60)}\n`;
      reportContent += `• تاريخ البدء: ${doc.analysis.startDate}\n`;
      reportContent += `• تاريخ الانتهاء: ${doc.analysis.endDate}\n`;
      reportContent += `• المدة: ${doc.analysis.duration} يوم\n\n`;
    }

    reportContent += `🔍 النتائج الرئيسية\n`;
    reportContent += `${'-'.repeat(60)}\n`;
    doc.analysis.keyFindings.forEach((finding, idx) => {
      reportContent += `${idx + 1}. ${finding}\n`;
    });
    reportContent += `\n`;

    if (doc.analysis.majorItems && doc.analysis.majorItems.length > 0) {
      reportContent += `📊 البنود الرئيسية\n`;
      reportContent += `${'-'.repeat(60)}\n`;
      doc.analysis.majorItems.forEach((item, idx) => {
        reportContent += `${idx + 1}. ${item.item}\n`;
        reportContent += `   الكمية: ${item.quantity.toLocaleString('ar-SA')} ${item.unit}\n`;
        reportContent += `   سعر الوحدة: ${item.unitPrice.toFixed(2)} ريال\n`;
        reportContent += `   الإجمالي: ${item.total.toLocaleString('ar-SA')} ريال\n\n`;
      });
    }

    if (doc.analysis.milestones && doc.analysis.milestones.length > 0) {
      reportContent += `🎯 المعالم الرئيسية (Milestones)\n`;
      reportContent += `${'-'.repeat(60)}\n`;
      doc.analysis.milestones.forEach((milestone, idx) => {
        reportContent += `${idx + 1}. ${milestone.name}\n`;
        reportContent += `   من: ${milestone.startDate} إلى: ${milestone.endDate}\n`;
        reportContent += `   المدة: ${milestone.duration} يوم\n`;
        reportContent += `   الحالة: ${milestone.status}\n\n`;
      });
    }

    if (doc.analysis.extractedTables && doc.analysis.extractedTables.length > 0) {
      reportContent += `📋 الجداول المستخرجة\n`;
      reportContent += `${'-'.repeat(60)}\n`;
      doc.analysis.extractedTables.forEach((table, idx) => {
        reportContent += `\nجدول ${idx + 1}: ${table.name}\n`;
        reportContent += `عدد الصفوف: ${table.rowCount}\n`;
        reportContent += `الملخص: ${table.summary}\n\n`;
        reportContent += `${table.headers.join(' | ')}\n`;
        reportContent += `${'-'.repeat(60)}\n`;
        table.data.forEach(row => {
          reportContent += `${row.join(' | ')}\n`;
        });
        reportContent += `\n`;
      });
    }

    if (doc.analysis.issues.length > 0) {
      reportContent += `⚠️ المشاكل والملاحظات\n`;
      reportContent += `${'-'.repeat(60)}\n`;
      doc.analysis.issues.forEach((issue, idx) => {
        reportContent += `${idx + 1}. ${issue}\n`;
      });
      reportContent += `\n`;
    }

    if (doc.analysis.recommendations.length > 0) {
      reportContent += `💡 التوصيات\n`;
      reportContent += `${'-'.repeat(60)}\n`;
      doc.analysis.recommendations.forEach((rec, idx) => {
        reportContent += `${idx + 1}. ${rec}\n`;
      });
      reportContent += `\n`;
    }

    reportContent += `\n${'='.repeat(60)}\n`;
    reportContent += `تم إنشاء التقرير بواسطة نظام YQArch AI\n`;
    reportContent += `التاريخ: ${new Date().toLocaleString('ar-SA')}\n`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_${doc.name.split('.')[0]}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.analysis?.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: documents.length,
    contract: documents.filter(d => d.category === 'contract').length,
    boq: documents.filter(d => d.category === 'boq').length,
    schedule: documents.filter(d => d.category === 'schedule').length,
    completed: documents.filter(d => d.status === 'completed').length,
    processing: documents.filter(d => d.status === 'processing').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800">مستندات الموقع</h1>
        </div>
        <p className="text-gray-600 mr-11">
          إدارة وتحليل مستندات المشروع بذكاء اصطناعي - العقود، جداول الكميات، والجداول الزمنية
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-6 h-6" />
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-sm opacity-90">إجمالي المستندات</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FileCheck className="w-6 h-6" />
            <span className="text-2xl font-bold">{stats.contract}</span>
          </div>
          <p className="text-sm opacity-90">العقود</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Table className="w-6 h-6" />
            <span className="text-2xl font-bold">{stats.boq}</span>
          </div>
          <p className="text-sm opacity-90">جداول الكميات</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6" />
            <span className="text-2xl font-bold">{stats.schedule}</span>
          </div>
          <p className="text-sm opacity-90">الجداول الزمنية</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6" />
            <span className="text-2xl font-bold">{stats.completed}</span>
          </div>
          <p className="text-sm opacity-90">مكتملة</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-2xl font-bold">{stats.processing}</span>
          </div>
          <p className="text-sm opacity-90">قيد المعالجة</p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {categories.map(category => (
          <div
            key={category.id}
            className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:border-blue-400 transition-all cursor-pointer"
            onClick={() => setSelectedCategory(category.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`${category.color} rounded-lg p-3`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{category.nameEn}</p>
                <p className="text-xs text-gray-600 mb-3">{category.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {documents.filter(d => d.category === category.id).length}
                  </span>
                  <span className="text-sm text-gray-500">مستند</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Zone */}
      <div
        className={`border-3 border-dashed rounded-xl p-8 mb-6 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            اسحب وأفلت المستندات هنا
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            أو انقر لاختيار الملفات (PDF, Excel)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            اختر الملفات
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      {documents.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في المستندات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
          {filteredDocuments.map(doc => {
            const category = categories.find(c => c.id === doc.category);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Document Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`${category?.color} rounded-lg p-3`}>
                      {category && <category.icon className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">{doc.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{category?.name}</span>
                        <span>•</span>
                        <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>{doc.type.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status */}
                <div className="mb-4">
                  {doc.status === 'processing' && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">جاري التحليل بالذكاء الاصطناعي...</span>
                    </div>
                  )}
                  {doc.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">تم التحليل بنجاح</span>
                    </div>
                  )}
                </div>

                {/* Analysis Results */}
                {doc.analysis && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-800 mb-2">{doc.analysis.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{doc.analysis.summary}</p>
                      
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {doc.analysis.totalAmount && (
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center gap-2 text-green-600 mb-1">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-xs font-medium">القيمة الإجمالية</span>
                            </div>
                            <p className="text-lg font-bold text-gray-800">
                              {doc.analysis.totalAmount.toLocaleString('ar-SA')} ريال
                            </p>
                          </div>
                        )}
                        {doc.analysis.duration && (
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-xs font-medium">المدة</span>
                            </div>
                            <p className="text-lg font-bold text-gray-800">
                              {doc.analysis.duration} يوم
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Key Findings */}
                      <div className="mb-3">
                        <h5 className="text-sm font-bold text-gray-700 mb-2">النتائج الرئيسية:</h5>
                        <ul className="space-y-1">
                          {doc.analysis.keyFindings.slice(0, 3).map((finding, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Issues */}
                      {doc.analysis.issues.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            ملاحظات مهمة:
                          </h5>
                          <ul className="space-y-1">
                            {doc.analysis.issues.slice(0, 2).map((issue, idx) => (
                              <li key={idx} className="text-xs text-orange-600 flex items-start gap-2">
                                <span className="mt-0.5">⚠️</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tables Count */}
                      {doc.analysis.extractedTables && doc.analysis.extractedTables.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 text-blue-700">
                            <Table className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              تم استخراج {doc.analysis.extractedTables.length} جدول من المستند
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadReport(doc)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <FileDown className="w-4 h-4" />
                        تحميل التقرير الكامل
                      </button>
                      <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {documents.length === 0 ? 'لا توجد مستندات' : 'لا توجد نتائج'}
          </h3>
          <p className="text-gray-500">
            {documents.length === 0
              ? 'قم برفع المستندات للبدء في التحليل'
              : 'جرب تغيير معايير البحث'}
          </p>
        </div>
      )}
    </div>
  );
}
