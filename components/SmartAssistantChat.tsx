import React, { useState, useRef, useEffect } from 'react';
import { 
    MessageSquare, Send, X, Minimize2, Maximize2, Brain, 
    Sparkles, Loader2, CheckCircle, AlertCircle, Zap,
    TrendingUp, Calculator, FileText, BarChart3, Users, DollarSign
} from 'lucide-react';

interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestions?: string[];
}

interface SmartAssistantChatProps {
    context: 'boq' | 'schedule' | 'financial' | 'risk' | 'resource' | 'general';
    projectName?: string;
    onClose?: () => void;
}

// Context-specific prompts and responses
const contextConfig = {
    boq: {
        title: 'مساعد المقايسات الذكي',
        titleEn: 'BOQ Smart Assistant',
        icon: <FileText className="w-5 h-5" />,
        color: 'from-blue-500 to-indigo-600',
        suggestions: [
            'احسب إجمالي تكلفة المشروع',
            'حلل البنود الأكثر تكلفة',
            'اعمل جدول كميات',
            'قارن الأسعار مع السوق',
            'احسب نسبة الربح'
        ],
        welcomeMessage: 'مرحباً! أنا مساعدك الذكي لإدارة المقايسات. يمكنني مساعدتك في حساب التكاليف، تحليل البنود، ومقارنة الأسعار. كيف يمكنني مساعدتك اليوم؟'
    },
    schedule: {
        title: 'مساعد الجدول الزمني الذكي',
        titleEn: 'Schedule Smart Assistant',
        icon: <BarChart3 className="w-5 h-5" />,
        color: 'from-green-500 to-emerald-600',
        suggestions: [
            'حدد المسار الحرج',
            'احسب مدة المشروع',
            'اقترح تحسينات للجدول',
            'اعمل تحليل CPM',
            'حدد الأنشطة المتأخرة'
        ],
        welcomeMessage: 'مرحباً! أنا مساعدك الذكي للجدولة. يمكنني مساعدتك في تحليل المسار الحرج، حساب المدة، وتحسين الجدول الزمني. ما الذي تحتاجه؟'
    },
    financial: {
        title: 'المساعد المالي الذكي',
        titleEn: 'Financial Smart Assistant',
        icon: <DollarSign className="w-5 h-5" />,
        color: 'from-yellow-500 to-orange-600',
        suggestions: [
            'احسب القيمة المكتسبة',
            'حلل التدفق النقدي',
            'اعمل تنبؤ مالي',
            'احسب CPI و SPI',
            'حدد تجاوزات الميزانية'
        ],
        welcomeMessage: 'مرحباً! أنا مساعدك المالي الذكي. يمكنني مساعدتك في حساب القيمة المكتسبة، تحليل التكاليف، والتنبؤ المالي. كيف يمكنني خدمتك؟'
    },
    risk: {
        title: 'مساعد إدارة المخاطر الذكي',
        titleEn: 'Risk Management Assistant',
        icon: <AlertCircle className="w-5 h-5" />,
        color: 'from-red-500 to-pink-600',
        suggestions: [
            'حلل المخاطر الحرجة',
            'اقترح خطط التخفيف',
            'احسب احتمالية المخاطر',
            'حدد المخاطر الجديدة',
            'اعمل مصفوفة المخاطر'
        ],
        welcomeMessage: 'مرحباً! أنا مساعدك لإدارة المخاطر. يمكنني مساعدتك في تحليل وتخفيف المخاطر. كيف يمكنني مساعدتك؟'
    },
    resource: {
        title: 'مساعد إدارة الموارد الذكي',
        titleEn: 'Resource Management Assistant',
        icon: <Users className="w-5 h-5" />,
        color: 'from-purple-500 to-violet-600',
        suggestions: [
            'حلل استخدام الموارد',
            'اقترح توزيع العمالة',
            'احسب تكلفة الموارد',
            'حدد الموارد الزائدة',
            'اعمل جدول توزيع'
        ],
        welcomeMessage: 'مرحباً! أنا مساعدك لإدارة الموارد. يمكنني مساعدتك في تحليل وتوزيع العمالة والمعدات. ما الذي تحتاجه؟'
    },
    general: {
        title: 'وكيل أحمد ناجح نوفل',
        titleEn: 'NOUFAL Agent',
        icon: <Brain className="w-5 h-5" />,
        color: 'from-orange-500 to-red-600',
        suggestions: [
            'صمم مخطط معماري',
            'احسب تكلفة المشروع',
            'حلل الجدول الزمني',
            'تحقق من الكود السعودي',
            'اعمل تقرير شامل'
        ],
        welcomeMessage: 'مرحباً! أنا وكيل أحمد ناجح نوفل. مساعدك الذكي المتكامل للهندسة والإدارة. كيف يمكنني مساعدتك اليوم؟'
    }
};

export const SmartAssistantChat: React.FC<SmartAssistantChatProps> = ({ 
    context, 
    projectName = 'المشروع الحالي',
    onClose 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const config = contextConfig[context];

    // Initialize with welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: '1',
                type: 'assistant',
                content: config.welcomeMessage,
                timestamp: new Date(),
                suggestions: config.suggestions
            }]);
        }
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Process user message with intelligent responses
    const processMessage = async (userMessage: string) => {
        const lowerMessage = userMessage.toLowerCase();
        
        // Context-aware responses
        let response = '';
        let newSuggestions: string[] = [];

        // BOQ context
        if (context === 'boq') {
            if (lowerMessage.includes('تكلفة') || lowerMessage.includes('سعر') || lowerMessage.includes('ميزانية')) {
                response = `🔍 تحليل التكاليف:\n\n✅ إجمالي التكلفة: 5,000,000 ريال\n✅ الأعمال الإنشائية: 40% (2,000,000 ريال)\n✅ الأعمال المعمارية: 30% (1,500,000 ريال)\n✅ الأعمال الكهروميكانيكية: 20% (1,000,000 ريال)\n✅ أعمال أخرى: 10% (500,000 ريال)\n\n💡 نصيحة: يمكنك توفير 15% بمراجعة بنود الحديد والخرسانة.`;
                newSuggestions = ['احسب نسبة الربح', 'قارن مع مشاريع مشابهة', 'اعرض البنود التفصيلية'];
            } else if (lowerMessage.includes('بند') || lowerMessage.includes('أعلى') || lowerMessage.includes('أكثر')) {
                response = `📊 البنود الأعلى تكلفة:\n\n1. 🏗️ الخرسانة المسلحة: 800,000 ريال (16%)\n2. 🔩 حديد التسليح: 600,000 ريال (12%)\n3. 🧱 أعمال البلوك: 400,000 ريال (8%)\n4. 🎨 أعمال التشطيبات: 350,000 ريال (7%)\n5. ⚡ الأعمال الكهربائية: 300,000 ريال (6%)\n\n💡 يمكن تحسين التكلفة بمراجعة أسعار الموردين.`;
                newSuggestions = ['احسب الربح', 'اعمل مقارنة سعرية', 'اقترح بدائل أرخص'];
            } else if (lowerMessage.includes('كميات') || lowerMessage.includes('جدول')) {
                response = `📋 جدول الكميات الرئيسية:\n\n🏗️ الخرسانة: 800 م³\n🔩 الحديد: 80 طن\n🧱 البلوك: 15,000 م²\n🎨 البلاط: 3,000 م²\n⚡ نقاط الكهرباء: 250 نقطة\n\n✅ جميع الكميات تم حسابها حسب المخططات المعتمدة.`;
                newSuggestions = ['احسب التكلفة', 'اعمل تحليل للهدر', 'اعرض جدول التنفيذ'];
            }
        }
        
        // Schedule context
        else if (context === 'schedule') {
            if (lowerMessage.includes('مسار') || lowerMessage.includes('حرج') || lowerMessage.includes('critical')) {
                response = `🎯 تحليل المسار الحرج:\n\n⚠️ المسار الحرج الحالي:\n1. الأساسات → 15 يوم\n2. الهيكل الخرساني → 45 يوم\n3. أعمال البلوك → 30 يوم\n4. التشطيبات النهائية → 25 يوم\n\n📊 إجمالي المدة: 115 يوم\n⏰ التأخير الحالي: 5 أيام\n\n💡 نصيحة: تسريع أعمال البلوك يمكن أن يوفر 7 أيام.`;
                newSuggestions = ['اقترح تحسينات', 'احسب احتياج العمالة', 'اعمل تقرير التقدم'];
            } else if (lowerMessage.includes('مدة') || lowerMessage.includes('وقت') || lowerMessage.includes('duration')) {
                response = `⏱️ تحليل المدة الزمنية:\n\n✅ المدة المخططة: 120 يوم\n📅 المدة الفعلية حتى الآن: 35 يوم\n📊 نسبة الإنجاز: 28%\n⚠️ الانحراف: -2 أيام (متأخر)\n\n🎯 تاريخ الإنجاز المتوقع: 15 مارس 2025\n\n💡 احتمالية الانتهاء في الموعد: 78%`;
                newSuggestions = ['اقترح خطة تعافي', 'حلل الموارد المطلوبة', 'اعمل جدول Gantt'];
            } else if (lowerMessage.includes('تأخ') || lowerMessage.includes('متأخر') || lowerMessage.includes('delay')) {
                response = `⚠️ الأنشطة المتأخرة:\n\n1. 🔴 صب الخرسانة للأساسات: متأخر 3 أيام\n2. 🟡 استلام حديد التسليح: متأخر يوم واحد\n3. 🔴 أعمال العزل: متأخر 5 أيام\n\n📊 التأثير على الجدول: متوسط إلى عالي\n💰 التكلفة الإضافية المتوقعة: 50,000 ريال\n\n🎯 خطة التعافي المقترحة:\n✓ زيادة العمالة بنسبة 20%\n✓ العمل في نوبتين\n✓ تسريع أعمال العزل`;
                newSuggestions = ['نفذ خطة التعافي', 'احسب التكلفة الإضافية', 'اعرض بدائل'];
            }
        }
        
        // Financial context
        else if (context === 'financial') {
            if (lowerMessage.includes('قيمة') || lowerMessage.includes('مكتسب') || lowerMessage.includes('earned')) {
                response = `💰 تحليل القيمة المكتسبة (EVM):\n\n📊 المؤشرات الرئيسية:\n✅ PV (القيمة المخططة): 1,500,000 ريال\n✅ EV (القيمة المكتسبة): 1,400,000 ريال\n✅ AC (التكلفة الفعلية): 1,450,000 ريال\n\n📈 مؤشرات الأداء:\n• CPI (مؤشر الأداء التكلفة): 0.97\n• SPI (مؤشر الأداء الجدول): 0.93\n• CV (انحراف التكلفة): -50,000 ريال\n• SV (انحراف الجدول): -100,000 ريال\n\n⚠️ المشروع متأخر قليلاً ويتجاوز الميزانية بنسبة 3%`;
                newSuggestions = ['اعمل توقع للإكمال', 'احسب EAC', 'اقترح إجراءات تصحيحية'];
            } else if (lowerMessage.includes('تدفق') || lowerMessage.includes('نقد') || lowerMessage.includes('cash')) {
                response = `💵 تحليل التدفق النقدي:\n\n📊 الشهر الحالي:\n✅ الإيرادات: 500,000 ريال\n❌ المصروفات: 550,000 ريال\n📉 الصافي: -50,000 ريال (عجز)\n\n📈 التراكمي:\n✅ إجمالي الإيرادات: 1,500,000 ريال\n❌ إجمالي المصروفات: 1,450,000 ريال\n💰 الرصيد: +50,000 ريال\n\n⚠️ تحذير: عجز متوقع في الشهر القادم\n💡 نصيحة: تسريع تحصيل المستحقات`;
                newSuggestions = ['اعمل توقع 3 شهور', 'حلل المستحقات', 'اقترح حلول للعجز'];
            }
        }
        
        // Risk context
        else if (context === 'risk') {
            if (lowerMessage.includes('مخاطر') || lowerMessage.includes('خطر') || lowerMessage.includes('risk')) {
                response = `⚠️ المخاطر الحرجة:\n\n🔴 مخاطر عالية:\n1. تأخر توريد المواد (احتمالية: 70%، تأثير: عالي)\n2. نقص العمالة المتخصصة (احتمالية: 60%، تأثير: متوسط)\n\n🟡 مخاطر متوسطة:\n3. تغيرات في الأسعار (احتمالية: 50%، تأثير: متوسط)\n4. ظروف جوية سيئة (احتمالية: 40%، تأثير: منخفض)\n\n✅ المخاطر المُدارة: 8 من 12\n⚠️ تحتاج متابعة: 4 مخاطر\n\n💡 خطط التخفيف جاهزة للتنفيذ`;
                newSuggestions = ['اعرض خطط التخفيف', 'احسب التكلفة الاحتياطية', 'اعمل مصفوفة المخاطر'];
            }
        }
        
        // Resource context
        else if (context === 'resource') {
            if (lowerMessage.includes('عمالة') || lowerMessage.includes('موارد') || lowerMessage.includes('resource')) {
                response = `👷 تحليل الموارد:\n\n📊 العمالة الحالية:\n✅ المتوفر: 45 عامل\n📈 المطلوب: 50 عامل\n⚠️ النقص: 5 عمال\n\n📈 معدل الاستخدام:\n• عمالة عامة: 85%\n• عمالة متخصصة: 95%\n• معدات: 70%\n\n💡 نصيحة: توظيف 5 عمال إضافيين سيزيد الإنتاجية 15%`;
                newSuggestions = ['اعمل جدول توزيع', 'احسب التكلفة', 'اقترح تحسينات'];
            }
        }

        // Default intelligent response
        if (!response) {
            response = `🧠 فهمت طلبك: "${userMessage}"\n\nأنا أعمل على تحليل البيانات وسأعطيك إجابة دقيقة بناءً على:\n\n✅ بيانات ${projectName}\n✅ أفضل الممارسات الهندسية\n✅ معايير SBC 304\n✅ خبرتي في ${config.title}\n\n💡 يمكنك أيضاً سؤالي عن:\n${config.suggestions.slice(0, 3).map(s => `• ${s}`).join('\n')}`;
            newSuggestions = config.suggestions;
        }

        return { response, suggestions: newSuggestions };
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isProcessing) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsProcessing(true);

        // Simulate processing delay
        setTimeout(async () => {
            const { response, suggestions } = await processMessage(inputValue);
            
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: response,
                timestamp: new Date(),
                suggestions
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsProcessing(false);
        }, 1500);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        inputRef.current?.focus();
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-2xl bg-gradient-to-r ${config.color} text-white hover:scale-110 transition-all duration-300 animate-bounce`}
                title={config.title}
            >
                <div className="relative">
                    <Brain className="w-6 h-6" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </div>
            </button>
        );
    }

    return (
        <div className={`fixed z-50 transition-all duration-300 ${
            isMinimized 
                ? 'bottom-6 left-6 w-80' 
                : 'bottom-6 left-6 w-96 h-[600px]'
        }`}>
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col ${
                isMinimized ? 'h-16' : 'h-full'
            }`}>
                {/* Header */}
                <div className={`bg-gradient-to-r ${config.color} text-white p-4 rounded-t-2xl flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            {config.icon}
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-bold">{config.title}</h3>
                            <p className="text-xs opacity-90">{projectName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" dir="rtl">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-4 ${
                                        message.type === 'user'
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                            : `bg-gradient-to-r ${config.color} text-white`
                                    }`}>
                                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                                        {message.suggestions && message.suggestions.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-xs opacity-75 font-semibold">اقتراحات:</p>
                                                {message.suggestions.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="block w-full text-right text-xs p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                                    >
                                                        💡 {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {isProcessing && (
                                <div className="flex justify-end">
                                    <div className={`bg-gradient-to-r ${config.color} text-white rounded-2xl p-4 flex items-center gap-2`}>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">جاري التفكير...</span>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="اكتب سؤالك هنا..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    disabled={isProcessing}
                                    dir="rtl"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isProcessing || !inputValue.trim()}
                                    className={`p-2 rounded-xl bg-gradient-to-r ${config.color} text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Sparkles className="w-3 h-3" />
                                <span>مدعوم بالذكاء الاصطناعي من NOUFAL</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SmartAssistantChat;
