import React, { useState } from 'react';
import { Target, Edit3, Check, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { calculatePressureStats } from '@/utils/expiryCalculator';

export const DailyGoal: React.FC = () => {
  const { inventory, consumptionRecords, dailyGoal, setDailyGoal } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(dailyGoal);

  const stats = calculatePressureStats(inventory, consumptionRecords, dailyGoal);

  const handleSave = () => {
    if (editValue >= 1 && editValue <= 100) {
      setDailyGoal(editValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(dailyGoal);
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-neutral-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-500">单日消耗目标</span>
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
              min="1"
              max="100"
              className="w-16 input-field text-center py-1 text-sm"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1.5 text-success-500 hover:bg-success-50 rounded"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 text-danger-500 hover:bg-danger-50 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
          >
            <Edit3 className="w-3 h-3" />
            编辑
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-neutral-400">今日进度</span>
            <span className="font-mono font-medium text-neutral-500">
              {stats.todayConsumed} / {dailyGoal} 支
            </span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                stats.completionRate >= 100 ? 'bg-success-500' : 
                stats.completionRate >= 60 ? 'bg-primary-500' : 'bg-warning-500'
              }`}
              style={{ width: `${Math.min(100, stats.completionRate)}%` }}
            />
          </div>
        </div>
        
        <div className={`text-2xl font-semibold font-mono ${
          stats.completionRate >= 100 ? 'text-success-500' : 
          stats.completionRate >= 60 ? 'text-primary-500' : 'text-warning-500'
        }`}>
          {stats.completionRate}%
        </div>
      </div>

      {stats.dailyAverageNeed > dailyGoal && (
        <div className="mt-3 p-2 bg-warning-50 rounded text-xs text-warning-600">
          ⚠️ 根据当前库存压力，建议将目标调整至 {stats.dailyAverageNeed} 支/天
        </div>
      )}
    </div>
  );
};
