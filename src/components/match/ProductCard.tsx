import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, Users } from 'lucide-react';
import type { InventoryItem } from '@/types';
import { getUrgencyBadgeClass, getUrgencyLabel } from '@/utils/expiryCalculator';
import { matchProjectsForItem, getMolecularTypeLabel, getMolecularTypeColor, comboProjects } from '@/utils/projectMatcher';

interface ProductCardProps {
  item: InventoryItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const matchedProjects = matchProjectsForItem(item);
  const isUrgent = item.urgency === 'danger' || item.urgency === 'warning';

  return (
    <div 
      className={`
        border rounded-lg overflow-hidden transition-all duration-300
        ${isUrgent ? 'border-danger-200 bg-danger-50/30' : 'border-neutral-100 bg-white'}
        ${isExpanded ? 'shadow-card-hover' : 'shadow-card hover:shadow-card-hover'}
      `}
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isUrgent && (
                <span className="inline-flex items-center gap-1 text-xs text-danger-500 font-medium">
                  <Zap className="w-3 h-3" />
                  主推
                </span>
              )}
              <h4 className="font-medium text-neutral-500">{item.brand}</h4>
            </div>
            <p className="text-xs text-neutral-400">{item.specification}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`badge ${getMolecularTypeColor(item.molecularType)}`}>
              {getMolecularTypeLabel(item.molecularType)}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-neutral-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-300" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={getUrgencyBadgeClass(item.urgency)}>
              {getUrgencyLabel(item.urgency)}
            </span>
            <span className="text-xs text-neutral-400">
              到期日：{item.expiryDate}
            </span>
          </div>
          <div className="text-right">
            <span className={`text-lg font-semibold font-mono ${
              item.remainingQuantity === 0 ? 'text-neutral-300' :
              isUrgent ? 'text-danger-500' : 'text-neutral-500'
            }`}>
              {item.remainingQuantity}
            </span>
            <span className="text-xs text-neutral-300 ml-1">/ {item.quantity}支</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-neutral-100 animate-fade-in">
          <div className="pt-4">
            <p className="text-xs font-medium text-neutral-500 mb-3 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              适用项目推荐
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {matchedProjects.map((project) => (
                <div 
                  key={project.id}
                  className="p-3 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-500">
                      {project.name}
                    </span>
                    <span className="text-xs text-primary-500">
                      {project.area}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-1">
                    {project.description}
                  </p>
                  <p className="text-xs text-primary-500 font-medium">
                    建议用量：{project.suggestedDosage}
                  </p>
                </div>
              ))}
            </div>

            {isUrgent && (
              <div className="p-3 bg-warning-50 rounded-lg">
                <p className="text-xs font-medium text-warning-600 mb-2">
                  临期联合项目推荐（提升客单价）
                </p>
                <div className="flex flex-wrap gap-2">
                  {comboProjects.map((combo) => (
                    <div 
                      key={combo.id}
                      className="px-2 py-1 bg-white rounded text-xs text-neutral-500"
                    >
                      <span className="font-medium text-warning-600">{combo.name}</span>
                      <span className="text-neutral-300 mx-1">·</span>
                      <span className="text-neutral-400">{combo.benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
