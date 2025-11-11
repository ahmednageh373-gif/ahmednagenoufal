/**
 * Enhanced CAD Library with AI Assistant, 3D Viewer, and Interactive Preview
 * مكتبة CAD محسّنة مع مساعد ذكي وعارض 3D ومعاينة تفاعلية
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Download, Eye, Grid, List, Filter, Layers, Box, 
  MessageSquare, Sparkles, Home, Ruler, Maximize2, Play,
  Image, FileText, Package, Zap, Settings, ChevronRight,
  ArrowRight, Star, TrendingUp, Clock, Users
} from 'lucide-react';
import { yqarchHatches, hatchCategories } from '../data/yqarch-hatches';
import { yqArchBlocks, blockCategories } from '../data/yqarch-library-data';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  floorPlan?: FloorPlanData;
}

interface FloorPlanData {
  area: number;
  rooms: {
    type: string;
    dimensions: { width: number; length: number };
  }[];
  style: 'modern' | 'classic' | 'minimal';
  variants: number;
}

export const EnhancedCADLibrary: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<'blocks' | 'hatches' | 'ai' | '3d'>('blocks');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [show3D, setShow3D] = useState(false);
  
  // AI Assistant State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي لتصميم المخططات المعمارية. كيف يمكنني مساعدتك اليوم؟ 🏗️',
      timestamp: new Date(),
      suggestions: [
        'أريد رسم فيلا 150 م²',
        'صمم لي شقة غرفتين وصالة',
        'أحتاج مخطط مبنى تجاري',
        'اقترح توزيع لمنزل 200 م²'
      ]
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Filtered data
  const filteredBlocks = useMemo(() => {
    let blocks = yqArchBlocks;
    
    if (selectedCategory !== 'all') {
      blocks = blocks.filter(b => b.category === selectedCategory);
    }
    
    if (searchQuery) {
      blocks = blocks.filter(b => 
        b.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return blocks;
  }, [searchQuery, selectedCategory]);

  const filteredHatches = useMemo(() => {
    let hatches = yqarchHatches;
    
    if (selectedCategory !== 'all') {
      hatches = hatches.filter(h => h.category === selectedCategory);
    }
    
    if (searchQuery) {
      hatches = hatches.filter(h => 
        h.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.pattern.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return hatches;
  }, [searchQuery, selectedCategory]);

  // AI Assistant Functions
  const handleAIChat = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsGenerating(true);

    // Simulate AI response (في الواقع، هنا تتصل بـ Gemini API)
    setTimeout(() => {
      const response = generateAIResponse(message);
      setChatMessages(prev => [...prev, response]);
      setIsGenerating(false);
    }, 2000);
  };

  const generateAIResponse = (userQuery: string): Message => {
    const query = userQuery.toLowerCase();
    
    // تحليل الطلب
    if (query.includes('فيلا') || query.includes('منزل') || query.includes('بيت')) {
      const area = extractArea(query) || 150;
      return {
        role: 'assistant',
        content: `ممتاز! سأصمم لك فيلا بمساحة ${area} م². إليك 3 تصاميم مقترحة:\n\n` +
          `🏠 **التصميم الأول - كلاسيكي**\n` +
          `- 3 غرف نوم (4×4م، 3.5×3.5م، 3×3م)\n` +
          `- صالة 6×5م\n` +
          `- مجلس 5×4م\n` +
          `- مطبخ 4×3م\n` +
          `- 3 حمامات\n\n` +
          `🏡 **التصميم الثاني - عصري**\n` +
          `- غرفة نوم رئيسية 5×4م\n` +
          `- غرفتين 3.5×3م\n` +
          `- صالة مفتوحة 7×6م\n` +
          `- مطبخ أمريكي 5×3م\n\n` +
          `🏘️ **التصميم الثالث - مينيمال**\n` +
          `- 2 غرف نوم كبيرة\n` +
          `- صالة واسعة مفتوحة\n` +
          `- مطبخ عصري متصل\n\n` +
          `اختر التصميم وسأرسمه لك الآن! 🎨`,
        timestamp: new Date(),
        suggestions: [
          'التصميم الأول',
          'التصميم الثاني',
          'التصميم الثالث',
          'عدّل المساحات'
        ],
        floorPlan: {
          area,
          rooms: [
            { type: 'غرفة نوم', dimensions: { width: 4, length: 4 } },
            { type: 'صالة', dimensions: { width: 6, length: 5 } }
          ],
          style: 'modern',
          variants: 3
        }
      };
    }
    
    if (query.includes('شقة')) {
      return {
        role: 'assistant',
        content: `سأصمم لك شقة عملية! ما هي المساحة المتاحة؟\n\n` +
          `🏢 **تصاميم شائعة للشقق:**\n` +
          `- شقة 80 م² (غرفتين + صالة)\n` +
          `- شقة 100 م² (3 غرف + صالة)\n` +
          `- شقة 120 م² (3 غرف + صالتين)\n` +
          `- شقة 150 م² (4 غرف + صالة كبيرة)\n\n` +
          `أخبرني بالمساحة وسأعطيك أفضل توزيع! 📐`,
        timestamp: new Date(),
        suggestions: [
          'شقة 80 م²',
          'شقة 100 م²',
          'شقة 120 م²',
          'مساحة مخصصة'
        ]
      };
    }

    if (query.includes('تصميم') && (query.includes('1') || query.includes('2') || query.includes('3'))) {
      return {
        role: 'assistant',
        content: `رائع! جاري رسم التصميم المختار...\n\n` +
          `✅ **تم إنشاء المخطط الأساسي**\n` +
          `✅ **تم توزيع الغرف حسب المواصفات**\n` +
          `✅ **تم إضافة الأبواب والنوافذ**\n` +
          `✅ **تم حساب المساحات**\n\n` +
          `🎨 **المخطط جاهز للمعاينة!**\n\n` +
          `يمكنك الآن:\n` +
          `- معاينة المخطط 2D 📐\n` +
          `- عرض المبنى 3D 🏢\n` +
          `- تحميل ملف DWG 💾\n` +
          `- طلب تعديلات ✏️`,
        timestamp: new Date(),
        suggestions: [
          'أرني المخطط 2D',
          'اعرضه بشكل 3D',
          'حمّل DWG',
          'عدّل التصميم'
        ]
      };
    }

    // Default response
    return {
      role: 'assistant',
      content: `فهمت طلبك! أنا هنا لمساعدتك في:\n\n` +
        `🏗️ **تصميم مخططات معمارية**\n` +
        `- فلل ومنازل\n` +
        `- شقق سكنية\n` +
        `- مباني تجارية\n` +
        `- استراحات ومزارع\n\n` +
        `📐 **الرسم الذكي**\n` +
        `- توزيع الغرف الأمثل\n` +
        `- حساب المساحات\n` +
        `- إضافة التفاصيل\n\n` +
        `🎨 **العرض والتصدير**\n` +
        `- معاينة 2D/3D\n` +
        `- تصدير DWG\n` +
        `- renders احترافية\n\n` +
        `أخبرني ماذا تريد أن تصمم؟ 🚀`,
      timestamp: new Date(),
      suggestions: [
        'صمم فيلا 200 م²',
        'شقة 3 غرف',
        'مبنى تجاري',
        'استراحة'
      ]
    };
  };

  const extractArea = (text: string): number | null => {
    const match = text.match(/(\d+)\s*م/);
    return match ? parseInt(match[1]) : null;
  };

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Preview Component
  const ItemPreview = ({ item, type }: { item: any; type: 'block' | 'hatch' }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         onClick={() => setShowPreview(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
           onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.nameAr}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{item.nameEn}</p>
            </div>
            <button 
              onClick={() => setShowPreview(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Preview Area */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 mb-6">
            <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg 
                          flex items-center justify-center">
              <div className="text-center">
                <Box className="w-24 h-24 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  معاينة {type === 'block' ? 'البلوك' : 'النمط'}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900 dark:text-white">الفئة</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{item.category}</p>
            </div>
            
            {type === 'hatch' && (
              <>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">المقياس</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{item.scale}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">الزاوية</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{item.angle}°</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">النمط</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-mono">{item.pattern}</p>
                </div>
              </>
            )}
          </div>

          {item.description && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
              <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 
                             rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 
                             transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              تحميل DWG
            </button>
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 
                             rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 
                             transition-all flex items-center justify-center gap-2"
                    onClick={() => setShow3D(true)}>
              <Box className="w-5 h-5" />
              عرض 3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 3D Viewer Component  
  const Viewer3D = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         onClick={() => setShow3D(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full h-[80vh]"
           onClick={e => e.stopPropagation()}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Box className="w-6 h-6 text-blue-600" />
              عارض 3D التفاعلي
            </h3>
            <button onClick={() => setShow3D(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              ✕
            </button>
          </div>
          
          <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 relative">
            {/* 3D Canvas سيتم إضافة Three.js هنا */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Box className="w-32 h-32 mx-auto mb-4 animate-pulse" />
                <p className="text-xl font-semibold mb-2">عارض 3D التفاعلي</p>
                <p className="text-gray-400">استخدم الماوس للتحريك والتدوير</p>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                          bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 
                          flex items-center gap-2">
              <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <Play className="w-5 h-5" />
              </button>
              <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <Maximize2 className="w-5 h-5" />
              </button>
              <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 
                    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 
                    dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                           bg-clip-text text-transparent">
                مكتبة yQArch المتقدمة
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                مكتبة CAD شاملة مع مساعد ذكي وعرض 3D
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'blocks', icon: Package, label: 'البلوكات' },
              { id: 'hatches', icon: Layers, label: 'أنماط التهشير' },
              { id: 'ai', icon: Sparkles, label: 'المساعد الذكي' },
              { id: '3d', icon: Box, label: 'العارض 3D' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                          ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                          }`}>
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Blocks Tab */}
        {activeTab === 'blocks' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 
                                   text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ابحث في البلوكات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl
                             border-2 border-transparent focus:border-blue-500 outline-none"/>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 
                           border-transparent focus:border-blue-500 outline-none">
                  <option value="all">جميع الفئات</option>
                  {blockCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl ${viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl ${viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Blocks Grid */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'}>
              {filteredBlocks.map(block => (
                <div key={block.id}
                     className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl 
                              transition-all cursor-pointer group"
                     onClick={() => { setSelectedItem(block); setShowPreview(true); }}>
                  <div className="aspect-square bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                                rounded-lg mb-4 flex items-center justify-center 
                                group-hover:scale-105 transition-transform">
                    <Package className="w-16 h-16 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {block.nameAr}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {block.nameEn}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 
                                   px-3 py-1 rounded-full">
                      {block.category}
                    </span>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); }}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hatches Tab */}
        {activeTab === 'hatches' && (
          <div>
            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 
                                   text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ابحث في أنماط التهشير..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl
                             border-2 border-transparent focus:border-blue-500 outline-none"/>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 
                           border-transparent focus:border-blue-500 outline-none">
                  <option value="all">جميع الفئات</option>
                  {hatchCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hatches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredHatches.map(hatch => (
                <div key={hatch.id}
                     className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl 
                              transition-all cursor-pointer group"
                     onClick={() => { setSelectedItem(hatch); setShowPreview(true); }}>
                  <div className="aspect-square bg-gradient-to-br from-green-500/10 to-blue-500/10 
                                rounded-lg mb-4 flex items-center justify-center 
                                group-hover:scale-105 transition-transform">
                    <Layers className="w-16 h-16 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {hatch.nameAr}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {hatch.nameEn}
                  </p>
                  <p className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 
                              dark:text-gray-300 px-2 py-1 rounded mb-3">
                    {hatch.pattern}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600 
                                dark:text-gray-400">
                    <span>Scale: {hatch.scale}</span>
                    <span>Angle: {hatch.angle}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">المساعد الذكي للرسم</h2>
                    <p className="text-blue-100">أخبرني ماذا تريد أن ترسم وسأساعدك!</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
                {chatMessages.map((message, index) => (
                  <div key={index}
                       className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    } rounded-2xl p-4 shadow-lg`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleAIChat(suggestion)}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                message.role === 'user'
                                  ? 'bg-white/20 hover:bg-white/30'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200'
                              }`}>
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" 
                             style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" 
                             style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAIChat(userInput)}
                    placeholder="اكتب طلبك هنا... مثال: أريد رسم فيلا 150 م²"
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl 
                             border-2 border-transparent focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => handleAIChat(userInput)}
                    disabled={!userInput.trim() || isGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                             rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 
                             transition-all disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    إرسال
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Tab */}
        {activeTab === '3d' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <Box className="w-24 h-24 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                عارض 3D المتقدم
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                عرض تفاعلي ثلاثي الأبعاد لمخططاتك المعمارية
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'جولة افتراضية', icon: Eye, color: 'blue' },
                { title: 'إضاءة واقعية', icon: Zap, color: 'yellow' },
                { title: 'مواد متقدمة', icon: Layers, color: 'green' },
                { title: 'تصدير Renders', icon: Image, color: 'purple' },
                { title: 'قياسات حية', icon: Ruler, color: 'red' },
                { title: 'تحريك الكاميرا', icon: Box, color: 'indigo' }
              ].map((feature, index) => (
                <div key={index}
                     className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 
                              dark:to-gray-800 rounded-xl p-6 hover:shadow-lg transition-all
                              cursor-pointer group">
                  <feature.icon className={`w-12 h-12 text-${feature.color}-600 mb-4 
                                          group-hover:scale-110 transition-transform`} />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ميزات متقدمة للعرض الثلاثي الأبعاد
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setShow3D(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 
                         rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 
                         transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto">
                <Box className="w-6 h-6" />
                افتح العارض 3D
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedItem && (
        <ItemPreview item={selectedItem} type={activeTab as 'block' | 'hatch'} />
      )}

      {/* 3D Viewer Modal */}
      {show3D && <Viewer3D />}
    </div>
  );
};

export default EnhancedCADLibrary;
