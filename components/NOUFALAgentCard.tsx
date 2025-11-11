import React from 'react';
import {
  Brain, Calculator, PenTool, Box, Sparkles, Zap, Shield, TrendingUp, ArrowUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NOUFALAgentCardProps {
  className?: string;
  compact?: boolean;
}

export const NOUFALAgentCard: React.FC<NOUFALAgentCardProps> = ({ className = '', compact = false }) => {
  const { t, language } = useLanguage();

  const quickAccessCards = [
    {
      id: 'calculators',
      icon: Calculator,
      gradient: 'from-blue-500 to-indigo-600',
      route: '#/engineering-calculators',
      items: [
        t('noufal.calculators.columns'),
        t('noufal.calculators.beams'),
        t('noufal.calculators.slabs'),
        t('noufal.calculators.reinforcement'),
        t('noufal.calculators.concrete')
      ],
      count: t('noufal.calculators.count')
    },
    {
      id: 'drawing',
      icon: PenTool,
      gradient: 'from-purple-500 to-pink-600',
      route: '#/architectural-drawing-studio',
      items: [
        t('noufal.drawing.plans'),
        t('noufal.drawing.ai'),
        t('noufal.drawing.convert'),
        t('noufal.drawing.blocks'),
        t('noufal.drawing.hatches')
      ],
      count: t('noufal.drawing.status')
    },
    {
      id: 'viewer',
      icon: Box,
      gradient: 'from-green-500 to-emerald-600',
      route: '#/enhanced-cad-library',
      items: [
        t('noufal.viewer.display'),
        t('noufal.viewer.lighting'),
        t('noufal.viewer.tours'),
        t('noufal.viewer.camera'),
        t('noufal.viewer.daynight')
      ],
      count: t('noufal.viewer.status')
    },
    {
      id: 'analysis',
      icon: Brain,
      gradient: 'from-orange-500 to-red-600',
      route: '#/noufal-integrated',
      items: [
        t('noufal.analysis.boq'),
        t('noufal.analysis.scheduling'),
        t('noufal.analysis.sbc'),
        t('noufal.analysis.financial'),
        t('noufal.analysis.productivity')
      ],
      count: t('noufal.analysis.count')
    }
  ];

  const stats = [
    { value: '6', label: t('noufal.stats.calculators') },
    { value: '157', label: t('noufal.stats.blocks') },
    { value: '67', label: t('noufal.stats.hatches') },
    { value: '10+', label: t('noufal.stats.ai') }
  ];

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-orange-500 to-red-500 rounded-md shadow-sm p-1.5 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="bg-white p-1 rounded shadow-sm">
              <Brain className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <span className="text-xs font-bold text-white">{t('noufal.title')}</span>
          </div>
          <div className="flex gap-0.5">
            {quickAccessCards.map(card => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => (window as any).location.hash = card.route}
                  className="bg-white/20 backdrop-blur-sm p-1 rounded hover:bg-white/30 transition-all"
                  title={t(`noufal.${card.id}.title`)}
                >
                  <Icon className="w-3 h-3 text-white" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl animate-pulse delay-75"></div>
      </div>

      {/* Content */}
      <div className="relative p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Main Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl blur-md opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-white to-yellow-100 p-4 rounded-2xl shadow-lg">
                <Brain className="w-12 h-12 text-orange-600 animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
                {language === 'ar' ? '🧠' : '🤖'} {t('noufal.title')}
                <Sparkles className="w-6 h-6 text-yellow-200 animate-spin" style={{ animationDuration: '3s' }} />
              </h2>
              <p className="text-yellow-100 text-lg font-semibold">
                {t('noufal.subtitle')}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg">
                  <Zap className="w-3 h-3 animate-pulse" />
                  <span>{t('noufal.connected')}</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold shadow-lg">
                  <Shield className="w-3 h-3" />
                  <span>{t('noufal.advanced')}</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold shadow-lg">
                  <TrendingUp className="w-3 h-3" />
                  <span>{t('noufal.accuracy')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessCards.map((card) => {
            const Icon = card.icon;
            const gradientColor = card.gradient.includes('blue') ? 'blue-600' :
                                  card.gradient.includes('purple') ? 'purple-600' :
                                  card.gradient.includes('green') ? 'green-600' : 'orange-600';

            return (
              <button
                key={card.id}
                onClick={() => (window as any).location.hash = card.route}
                className="group bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
              >
                <div className={`flex items-center gap-3 mb-4 ${language === 'ar' ? '' : 'flex-row-reverse justify-end'}`}>
                  <div className={`p-3 bg-gradient-to-br ${card.gradient} rounded-lg group-hover:rotate-12 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t(`noufal.${card.id}.title`)}</h3>
                    <p className="text-sm text-gray-600">{t(`noufal.${card.id}.subtitle`)}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {card.items.map((item, idx) => (
                    <li key={idx} className={`flex items-center gap-2 ${language === 'ar' ? '' : 'flex-row-reverse justify-end'}`}>
                      <div className={`w-1.5 h-1.5 bg-${gradientColor.split('-')[0]}-500 rounded-full`}></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className={`flex items-center justify-between text-sm ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                    <span className="text-gray-600 font-semibold">{card.count}</span>
                    <ArrowUp className={`w-4 h-4 text-${gradientColor} group-hover:translate-x-1 transition-transform ${language === 'ar' ? '' : 'rotate-180'}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <div className="mt-6 pt-6 border-t border-white/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-yellow-100 text-sm font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NOUFALAgentCard;
