import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  Clock,
  FileText,
  Send,
  Mic,
  Image as ImageIcon,
  Settings,
  Star,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// TypeScript Interfaces
interface AIInsight {
  id: string;
  type: 'risk' | 'opportunity' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  impact: string;
  action?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Prediction {
  id: string;
  metric: string;
  current: number;
  predicted: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

const AdvancedAIFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'chat' | 'predictions' | 'automation'>('insights');
  const [chatInput, setChatInput] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);

  // AI Insights Data
  const [insights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'risk',
      title: 'تأخير محتمل في مشروع برج الرياض',
      description: 'بناءً على تحليل البيانات الحالية، هناك احتمال 78% لتأخير المشروع بسبب نقص الموارد',
      priority: 'high',
      confidence: 78,
      impact: 'تأخير 2-3 أسابيع',
      action: 'إعادة تخصيص فريق إضافي من مشروع آخر'
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'فرصة لتوفير 15% من التكاليف',
      description: 'يمكن تحقيق وفورات كبيرة عن طريق التفاوض على عقود مواد البناء مع موردين جدد',
      priority: 'high',
      confidence: 85,
      impact: 'توفير 2.25 مليون ريال',
      action: 'جدولة اجتماع مع قسم المشتريات'
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'توصية بتحسين جدولة المهام',
      description: 'يمكن تحسين الكفاءة بنسبة 25% من خلال إعادة ترتيب أولويات المهام الحالية',
      priority: 'medium',
      confidence: 72,
      impact: 'زيادة الإنتاجية 25%',
      action: 'تطبيق جدولة AI المقترحة'
    },
    {
      id: '4',
      type: 'prediction',
      title: 'توقع تجاوز الميزانية في Q2',
      description: 'النماذج التنبؤية تشير إلى احتمال تجاوز ميزانية الربع الثاني بنسبة 12%',
      priority: 'high',
      confidence: 81,
      impact: 'زيادة 1.8 مليون ريال',
      action: 'مراجعة وتعديل الميزانية التشغيلية'
    },
    {
      id: '5',
      type: 'opportunity',
      title: 'فريق العمل يحقق أداءً متميزاً',
      description: 'فريق المشروع الحالي يتجاوز المعدلات المستهدفة بنسبة 18%',
      priority: 'low',
      confidence: 92,
      impact: 'إمكانية إنجاز مبكر',
      action: 'تقديم مكافآت تحفيزية للفريق'
    }
  ]);

  // Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً! أنا مساعد AI الذكي لنظام NOUFAL. كيف يمكنني مساعدتك اليوم؟ يمكنني تحليل المشاريع، تقديم توصيات، والإجابة على أسئلتك حول إدارة المشاريع.',
      timestamp: '10:30'
    }
  ]);

  // Predictions Data
  const [predictions] = useState<Prediction[]>([
    {
      id: '1',
      metric: 'إجمالي الإيرادات',
      current: 15000000,
      predicted: 18500000,
      change: 23.3,
      trend: 'up',
      confidence: 87
    },
    {
      id: '2',
      metric: 'معدل إكمال المشاريع',
      current: 68,
      predicted: 75,
      change: 10.3,
      trend: 'up',
      confidence: 79
    },
    {
      id: '3',
      metric: 'التكاليف التشغيلية',
      current: 10200000,
      predicted: 11800000,
      change: 15.7,
      trend: 'up',
      confidence: 82
    },
    {
      id: '4',
      metric: 'رضا العملاء',
      current: 4.2,
      predicted: 4.5,
      change: 7.1,
      trend: 'up',
      confidence: 74
    }
  ]);

  // Handle Chat Send
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    setIsAIThinking(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'شكراً على سؤالك! بناءً على تحليل البيانات الحالية، يمكنني أن أقدم لك التوصيات التالية:\n\n1. تحسين توزيع الموارد بين المشاريع\n2. مراجعة الجداول الزمنية للمشاريع المتأخرة\n3. تحديد أولويات المهام الحرجة\n\nهل تريد المزيد من التفاصيل حول أي نقطة؟',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiResponse]);
      setIsAIThinking(false);
    }, 2000);
  };

  // Insight Type Configuration
  const insightTypeConfig = {
    risk: {
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-400'
    },
    opportunity: {
      icon: Lightbulb,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-700 dark:text-green-400'
    },
    recommendation: {
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-700 dark:text-blue-400'
    },
    prediction: {
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-700 dark:text-purple-400'
    }
  };

  // Priority Badge
  const PriorityBadge: React.FC<{ priority: AIInsight['priority'] }> = ({ priority }) => {
    const config = {
      high: { text: 'عالي', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      medium: { text: 'متوسط', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      low: { text: 'منخفض', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[priority].color}`}>
        {config[priority].text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🤖 مميزات AI المتقدمة
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ذكاء اصطناعي متقدم لتحليل المشاريع وتقديم التوصيات
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            رؤى ذكية
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            مساعد AI
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'predictions'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            التنبؤات
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'automation'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            الأتمتة
          </button>
        </div>
      </div>

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {insights.map((insight) => {
            const config = insightTypeConfig[insight.type];
            const Icon = config.icon;

            return (
              <div
                key={insight.id}
                className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl p-6 transition-all hover:shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {insight.title}
                      </h3>
                      <PriorityBadge priority={insight.priority} />
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {insight.description}
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ثقة: <strong className={config.textColor}>{insight.confidence}%</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          التأثير: <strong>{insight.impact}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {insight.type === 'risk' ? 'مخاطرة' : insight.type === 'opportunity' ? 'فرصة' : insight.type === 'recommendation' ? 'توصية' : 'توقع'}
                        </span>
                      </div>
                    </div>

                    {insight.action && (
                      <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-3`}>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          الإجراء المقترح: {insight.action}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Chat Assistant Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">مساعد NOUFAL AI</h3>
                  <p className="text-sm opacity-90">متصل الآن</p>
                </div>
              </div>
              <Settings className="w-5 h-5 cursor-pointer hover:rotate-90 transition-transform" />
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {isAIThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white mb-6">
            <h2 className="text-2xl font-bold mb-2">📊 التنبؤات الذكية</h2>
            <p className="opacity-90">توقعات مدعومة بالذكاء الاصطناعي للشهر القادم</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {prediction.metric}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    prediction.trend === 'up'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : prediction.trend === 'down'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {prediction.trend === 'up' ? '📈 صاعد' : prediction.trend === 'down' ? '📉 هابط' : '➡️ مستقر'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">القيمة الحالية</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {prediction.metric.includes('رضا') ? prediction.current.toFixed(1) : prediction.current.toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(prediction.current / prediction.predicted) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">القيمة المتوقعة</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {prediction.metric.includes('رضا') ? prediction.predicted.toFixed(1) : prediction.predicted.toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">التغيير</span>
                    </div>
                    <span className="font-bold text-green-600">+{prediction.change}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">دقة التوقع</span>
                    </div>
                    <span className="font-bold text-blue-600">{prediction.confidence}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white mb-6">
            <h2 className="text-2xl font-bold mb-2">⚡ الأتمتة الذكية</h2>
            <p className="opacity-90">أتمتة المهام الروتينية باستخدام AI</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Automation Card 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">جدولة تلقائية</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">تنظيم المهام والاجتماعات</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                يقوم AI بتحليل أولويات المهام وجداول الفريق لإنشاء جدول أمثل تلقائياً
              </p>
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                مفعّل
              </button>
            </div>

            {/* Automation Card 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">تقارير تلقائية</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إنشاء التقارير الدورية</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                إنشاء وإرسال التقارير الأسبوعية والشهرية تلقائياً إلى أصحاب المصلحة
              </p>
              <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                مفعّل
              </button>
            </div>

            {/* Automation Card 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">كشف المخاطر</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">تنبيهات استباقية</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                رصد المخاطر المحتملة وإرسال تنبيهات فورية للفريق المعني
              </p>
              <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                مفعّل
              </button>
            </div>

            {/* Automation Card 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">تحسين الميزانية</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">توصيات مالية</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                تحليل الإنفاق وتقديم توصيات لتحسين الكفاءة المالية
              </p>
              <button className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" />
                معطّل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAIFeatures;
