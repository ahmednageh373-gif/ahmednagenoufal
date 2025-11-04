import React, { useState } from 'react';
import { 
  Calculator, 
  Ruler, 
  Weight, 
  Scissors, 
  FileText, 
  BarChart3,
  Building2,
  Mountain,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import ToolsService, { ToolInput, ToolResult } from '../../tools/ToolsService';

interface ToolsPanelProps {
  className?: string;
}

const TOOL_ICONS: Record<string, React.ElementType> = {
  converter: Ruler,
  load_calculator: Calculator,
  volume_area: Building2,
  building_estimator: Building2,
  steel_weight: Weight,
  cutting_length: Scissors,
  rate_analysis: BarChart3,
  boq_maker: FileText,
  structural_analysis: Mountain,
  soil_mechanics: Mountain
};

const ToolsPanel: React.FC<ToolsPanelProps> = ({ className = '' }) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<ToolResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const tools = ToolsService.getTools();

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setInputs({});
    setResult(null);
  };

  const handleInputChange = (name: string, value: any) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleExecute = () => {
    if (!selectedTool) return;

    setIsCalculating(true);

    // Simulate async execution
    setTimeout(() => {
      const toolResult = ToolsService.executeTool(selectedTool, inputs);
      setResult(toolResult);
      setIsCalculating(false);
    }, 300);
  };

  const renderToolList = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {tools.map(tool => {
        const Icon = TOOL_ICONS[tool.id] || Calculator;
        const isSelected = selectedTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              flex flex-col items-center gap-2 text-center
              hover:shadow-md hover:scale-105
              ${isSelected 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-blue-300'
              }
            `}
          >
            <Icon className={`w-8 h-8 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
            <span className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
              {tool.name}
            </span>
            {tool.description && (
              <span className="text-xs text-gray-500 line-clamp-2">
                {tool.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderInputForm = () => {
    if (!selectedTool) return null;

    const toolInputs = ToolsService.getToolInputs(selectedTool);

    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ChevronRight className="w-5 h-5 text-blue-600" />
          {tools.find(t => t.id === selectedTool)?.name}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {toolInputs.map(input => (
            <div key={input.name} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {input.label}
                {input.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {input.type === 'select' ? (
                <select
                  value={inputs[input.name] || ''}
                  onChange={(e) => handleInputChange(input.name, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={input.required}
                >
                  <option value="">اختر...</option>
                  {input.options?.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={input.type}
                  value={inputs[input.name] || ''}
                  onChange={(e) => handleInputChange(input.name, input.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                  placeholder={input.placeholder}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={input.required}
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleExecute}
          disabled={isCalculating}
          className={`
            w-full py-3 rounded-lg font-semibold text-white
            transition-all duration-200
            ${isCalculating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
            }
          `}
        >
          {isCalculating ? (
            <span className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 animate-spin" />
              جاري الحساب...
            </span>
          ) : (
            'احسب الآن'
          )}
        </button>
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className={`
        bg-white rounded-lg border-2 p-6
        ${result.success ? 'border-green-500' : 'border-red-500'}
      `}>
        <div className="flex items-center gap-2 mb-4">
          {result.success ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
          <h3 className={`text-xl font-bold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.success ? 'النتيجة' : 'خطأ'}
          </h3>
          <span className="text-xs text-gray-500 mr-auto">
            {result.executionTime}ms
          </span>
        </div>

        {result.success ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-red-700">{result.error}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">🛠️ الأدوات الهندسية</h2>
        <p className="text-blue-100">10 أدوات أساسية للحسابات الهندسية</p>
      </div>

      {/* Tool List */}
      {renderToolList()}

      {/* Input Form */}
      {selectedTool && renderInputForm()}

      {/* Result */}
      {renderResult()}
    </div>
  );
};

export default ToolsPanel;
