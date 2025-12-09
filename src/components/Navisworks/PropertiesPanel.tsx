import React, { useState } from 'react';
import { ChevronDown, ChevronRight, X, Copy, Check } from 'lucide-react';
import type { ElementData, PropertyValue } from '../../types/navisworks.types';

interface PropertiesPanelProps {
  element: ElementData | null;
  onClose: () => void;
}

export function PropertiesPanel({ element, onClose }: PropertiesPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Element', 'Identity Data', 'Dimensions'])
  );
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  if (!element) {
    return (
      <div className="absolute top-4 right-4 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6">
        <p className="text-gray-400 text-center">
          اختر عنصراً لعرض خصائصه
        </p>
      </div>
    );
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedValue(key);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatValue = (prop: PropertyValue): string => {
    if (prop.value == null) return '-';
    if (prop.units) return `${prop.value} ${prop.units}`;
    return String(prop.value);
  };

  return (
    <div className="absolute top-4 right-4 w-96 max-h-[calc(100vh-2rem)] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-lg">خصائص العنصر</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-blue-100 text-sm font-medium truncate" title={element.name}>
          {element.name}
        </p>
        <p className="text-blue-200 text-xs truncate" title={element.path}>
          {element.path}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Basic Info */}
        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
          <InfoRow 
            label="ID" 
            value={element.id}
            onCopy={() => copyToClipboard(element.id, 'id')}
            isCopied={copiedValue === 'id'}
          />
          <InfoRow label="الفئة" value={element.category} />
          {element.metadata?.guid && (
            <InfoRow 
              label="GUID" 
              value={element.metadata.guid}
              onCopy={() => copyToClipboard(element.metadata!.guid!, 'guid')}
              isCopied={copiedValue === 'guid'}
            />
          )}
          {element.metadata?.ifcType && (
            <InfoRow label="IFC Type" value={element.metadata.ifcType} />
          )}
        </div>

        {/* Bounding Box */}
        {element.boundingBox && (
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">Bounding Box</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <InfoRow label="Min X" value={element.boundingBox.minX.toFixed(3)} />
              <InfoRow label="Max X" value={element.boundingBox.maxX.toFixed(3)} />
              <InfoRow label="Min Y" value={element.boundingBox.minY.toFixed(3)} />
              <InfoRow label="Max Y" value={element.boundingBox.maxY.toFixed(3)} />
              <InfoRow label="Min Z" value={element.boundingBox.minZ.toFixed(3)} />
              <InfoRow label="Max Z" value={element.boundingBox.maxZ.toFixed(3)} />
            </div>
          </div>
        )}

        {/* Geometry Info */}
        {element.geometry && (
          <div className="bg-gray-800 rounded-lg p-3 space-y-2">
            <h4 className="text-white font-semibold text-sm mb-2">Geometry</h4>
            <InfoRow label="Vertices" value={element.geometry.vertexCount.toLocaleString()} />
            <InfoRow label="Triangles" value={element.geometry.triangleCount.toLocaleString()} />
          </div>
        )}

        {/* Properties by Category */}
        {Object.entries(element.properties).map(([category, props]) => (
          <PropertyCategory
            key={category}
            category={category}
            properties={props}
            isExpanded={expandedCategories.has(category)}
            onToggle={() => toggleCategory(category)}
            onCopy={copyToClipboard}
            copiedValue={copiedValue}
          />
        ))}

        {/* Material */}
        {element.material && (
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-white font-semibold text-sm mb-2">Material</h4>
            {element.material.name && (
              <InfoRow label="Name" value={element.material.name} />
            )}
            {element.material.diffuseColor && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Color</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-4 rounded border border-gray-600"
                    style={{
                      backgroundColor: `rgba(${element.material.diffuseColor.r * 255}, ${element.material.diffuseColor.g * 255}, ${element.material.diffuseColor.b * 255}, ${element.material.diffuseColor.a})`
                    }}
                  />
                  <span className="text-gray-300 font-mono">
                    RGB({Math.round(element.material.diffuseColor.r * 255)}, 
                    {Math.round(element.material.diffuseColor.g * 255)}, 
                    {Math.round(element.material.diffuseColor.b * 255)})
                  </span>
                </div>
              </div>
            )}
            {element.material.transparency != null && (
              <InfoRow 
                label="Transparency" 
                value={`${(element.material.transparency * 100).toFixed(0)}%`} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyCategory({
  category,
  properties,
  isExpanded,
  onToggle,
  onCopy,
  copiedValue,
}: {
  category: string;
  properties: Record<string, PropertyValue>;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: (text: string, key: string) => void;
  copiedValue: string | null;
}) {
  const propertyCount = Object.keys(properties).length;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-750 transition"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <h4 className="text-white font-semibold text-sm">{category}</h4>
          <span className="text-xs text-gray-500">({propertyCount})</span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {Object.entries(properties).map(([key, prop]) => (
            <div key={key} className="flex items-center justify-between text-xs group">
              <span className="text-gray-400 truncate flex-1 mr-2">
                {prop.displayName || key}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-gray-300 font-mono">
                  {formatValue(prop)}
                </span>
                <button
                  onClick={() => onCopy(formatValue(prop), `${category}-${key}`)}
                  className="opacity-0 group-hover:opacity-100 transition text-gray-500 hover:text-blue-400 p-1"
                >
                  {copiedValue === `${category}-${key}` ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  onCopy,
  isCopied,
}: {
  label: string;
  value: string | number;
  onCopy?: () => void;
  isCopied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs group">
      <span className="text-gray-400">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-gray-300 font-mono">{value}</span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition text-gray-500 hover:text-blue-400 p-1"
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function formatValue(prop: PropertyValue): string {
  if (prop.value == null) return '-';
  if (prop.units) return `${prop.value} ${prop.units}`;
  return String(prop.value);
}
