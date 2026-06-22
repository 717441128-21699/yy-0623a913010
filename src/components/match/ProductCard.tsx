import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, Users, AlertTriangle, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
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
          <div className="pt-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-3 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                适用项目推荐
              </p>
              
              <div className="space-y-2">
                {matchedProjects.slice(0, 4).map((project) => (
                  <div 
                    key={project.id}
                    className="p-3 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-500">
                          {project.name}
                        </span>
                        <span className="text-xs text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded">
                          {project.area}
                        </span>
                      </div>
                      <span className="text-xs text-primary-500 font-medium">
                        {project.suggestedDosage}
                      </span>
                    </div>
                    
                    <p className="text-xs text-neutral-400 mb-2">
                      {project.description}
                    </p>

                    {project.keyPromotionPoints.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-success-600 mb-1 flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          主推要点
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.keyPromotionPoints.slice(0, 3).map((point, idx) => (
                            <span key={idx} className="text-xs px-1.5 py-0.5 bg-success-50 text-success-600 rounded">
                              {point}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.notRecommendedScenarios.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-danger-600 mb-1 flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3" />
                          不建议场景
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.notRecommendedScenarios.slice(0, 3).map((scenario, idx) => (
                            <span key={idx} className="text-xs px-1.5 py-0.5 bg-danger-50 text-danger-600 rounded">
                              {scenario}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {matchedProjects.some(p => p.combinationPlans.length > 0) && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-3 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-warning-500" />
                  高客单价组合方案
                </p>
                <div className="space-y-2">
                  {Array.from(new Set(matchedProjects.flatMap(p => p.combinationPlans).map(c => c.id)))
                    .slice(0, 3)
                    .map(id => {
                      const combo = matchedProjects.flatMap(p => p.combinationPlans).find(c => c.id === id);
                      if (!combo) return null;
                      return (
                        <div key={combo.id} className="p-3 bg-warning-50 rounded-lg border border-warning-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-warning-700">{combo.name}</span>
                            <span className="text-xs text-warning-600 bg-white px-1.5 py-0.5 rounded">
                              {combo.benefit}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mb-1">{combo.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {combo.suitableCustomerTypes.map((type, idx) => (
                              <span key={idx} className="text-xs px-1.5 py-0.5 bg-white text-warning-600 rounded">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {isUrgent && (
              <div className="p-3 bg-warning-50 rounded-lg">
                <p className="text-xs font-medium text-warning-600 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  临期特别建议
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
