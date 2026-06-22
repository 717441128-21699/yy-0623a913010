import React, { useState } from 'react';
import type { CalendarDayData, InventoryItem } from '@/types';
import { getUrgencyColor, getUrgencyBadgeClass } from '@/utils/expiryCalculator';
import { getMolecularTypeLabel } from '@/utils/projectMatcher';

interface CalendarDayProps {
  data: CalendarDayData;
  onClick?: (items: InventoryItem[]) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({ data, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const { date, day, isCurrentMonth, isToday, items, maxUrgency } = data;
  const hasItems = items.length > 0;
  const totalQuantity = items.reduce((sum, item) => sum + item.remainingQuantity, 0);

  const urgencyColor = maxUrgency ? getUrgencyColor(maxUrgency) : '';

  if (!isCurrentMonth) {
    return (
      <div className="aspect-square p-1 text-neutral-200 text-sm flex items-start justify-center">
        {day}
      </div>
    );
  }

  return (
    <div 
      className={`
        aspect-square p-1 relative cursor-pointer group
        ${isToday ? 'bg-primary-50 rounded-lg' : ''}
        ${hasItems ? 'hover:bg-neutral-50 rounded-lg' : ''}
      `}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => hasItems && onClick?.(items)}
    >
      <div className="flex items-start justify-between">
        <span className={`
          text-sm w-6 h-6 flex items-center justify-center rounded-full
          ${isToday ? 'bg-primary-500 text-white font-medium' : 'text-neutral-500'}
        `}>
          {day}
        </span>
        
        {hasItems && (
          <div className="flex flex-col items-end gap-0.5">
            <div className={`w-2 h-2 rounded-full ${urgencyColor}`} />
            <span className="text-xs font-mono text-neutral-400">{totalQuantity}</span>
          </div>
        )}
      </div>

      {showTooltip && hasItems && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-white shadow-card-hover rounded-lg p-3 z-10 animate-fade-in border border-neutral-100">
          <p className="text-xs font-medium text-neutral-500 mb-2">
            {date} · 共{totalQuantity}支
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="p-2 bg-neutral-50 rounded text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-neutral-500">{item.brand}</span>
                  <span className={getUrgencyBadgeClass(item.urgency)}>
                    {item.daysUntilExpiry <= 0 ? '已过期' : `${item.daysUntilExpiry}天`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>{item.specification}</span>
                  <span className="font-mono">剩{item.remainingQuantity}支</span>
                </div>
                <div className="mt-1">
                  <span className="text-xs text-neutral-300">
                    {getMolecularTypeLabel(item.molecularType)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
