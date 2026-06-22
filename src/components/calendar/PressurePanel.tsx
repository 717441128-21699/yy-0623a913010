import React from 'react';
import { TrendingUp, AlertCircle, Clock, Target, Zap } from 'lucide-react';
import type { PressureStats } from '@/types';

interface PressurePanelProps {
  stats: PressureStats;
}

export const PressurePanel: React.FC<PressurePanelProps> = ({ stats }) => {
  const getProgressColor = (rate: number) => {
    if (rate >= 100) return 'bg-success-500';
    if (rate >= 60) return 'bg-primary-500';
    if (rate >= 30) return 'bg-caution-500';
    return 'bg-warning-500';
  };

  const statItems = [
    {
      icon: <AlertCircle className="w-4 h-4" />,
      label: '紧急临期',
      value: stats.urgentCount,
      unit: '支',
      color: 'text-danger-500',
      bgColor: 'bg-danger-50',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: '临期提醒',
      value: stats.warningCount,
      unit: '支',
      color: 'text-warning-500',
      bgColor: 'bg-warning-50',
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: '需关注',
      value: stats.attentionCount,
      unit: '支',
      color: 'text-caution-500',
      bgColor: 'bg-caution-50',
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: '日均消耗',
      value: stats.dailyAverageNeed,
      unit: '支',
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {statItems.map((item, index) => (
          <div 
            key={index}
            className={`${item.bgColor} rounded-lg p-3 transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={item.color}>{item.icon}</span>
              <span className="text-xs text-neutral-400">{item.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-semibold font-mono ${item.color}`}>
                {item.value}
              </span>
              <span className="text-xs text-neutral-300">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-neutral-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-neutral-500">今日消耗目标</span>
          </div>
          <span className="text-lg font-semibold font-mono text-neutral-500">
            {stats.todayConsumed} / {stats.todayGoal} 支
          </span>
        </div>
        
        <div className="relative h-3 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${getProgressColor(stats.completionRate)}`}
            style={{ width: `${Math.min(100, stats.completionRate)}%` }}
          />
          {stats.completionRate > 100 && (
            <div 
              className="absolute left-0 top-0 h-full bg-success-500/30 rounded-full transition-all duration-700"
              style={{ width: `${stats.completionRate}%` }}
            />
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-neutral-400">
            完成率
          </span>
          <span className={`text-sm font-medium font-mono ${
            stats.completionRate >= 100 ? 'text-success-500' : 
            stats.completionRate >= 60 ? 'text-primary-500' : 'text-warning-500'
          }`}>
            {stats.completionRate}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <AlertCircle className="w-3.5 h-3.5 text-caution-500" />
        <span>
          建议优先消耗{stats.urgentCount > 0 ? `紧急临期的${stats.urgentCount}支` : 
            stats.warningCount > 0 ? `临期的${stats.warningCount}支` : '库存充足，按常规销售'}
        </span>
      </div>
    </div>
  );
};
