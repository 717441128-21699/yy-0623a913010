import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Download, 
  Database, 
  Trash2,
  Play
} from 'lucide-react';
import { useAppStore } from '@/store';
import { calculatePressureStats } from '@/utils/expiryCalculator';
import { exportToExcel, exportActionListPDF } from '@/utils/exportManager';
import dayjs from 'dayjs';

export const StatusBar: React.FC = () => {
  const { 
    inventory, 
    consumptionRecords, 
    dailyGoal, 
    showPurchasePrice, 
    togglePriceVisibility,
    loadSampleData,
    clearAllData
  } = useAppStore();

  const stats = calculatePressureStats(inventory, consumptionRecords, dailyGoal);

  const handleExportExcel = async () => {
    if (inventory.length === 0) {
      alert('暂无数据可导出');
      return;
    }
    await exportToExcel(inventory, consumptionRecords, stats, showPurchasePrice);
  };

  const handleExportPDF = async () => {
    if (inventory.length === 0) {
      alert('暂无数据可导出');
      return;
    }
    await exportActionListPDF(inventory, stats);
  };

  const handleClearData = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      clearAllData();
    }
  };

  return (
    <div className="bg-white shadow-card px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-500">玻尿酸效期营销看板</h1>
              <p className="text-xs text-neutral-300">
                {dayjs().format('YYYY年MM月DD日')} · 本地数据安全
              </p>
            </div>
          </div>

          <div className="h-10 w-px bg-neutral-100" />

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-neutral-500 font-mono">
                {stats.totalRemaining}
              </div>
              <div className="text-xs text-neutral-300">总库存(支)</div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-semibold font-mono ${
                stats.urgentCount > 0 ? 'text-danger-500' : 'text-neutral-500'
              }`}>
                {stats.urgentCount}
              </div>
              <div className="text-xs text-neutral-300 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                紧急临期
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-semibold text-warning-500 font-mono">
                {stats.dailyAverageNeed}
              </div>
              <div className="text-xs text-neutral-300">日均需消耗</div>
            </div>

            <div className="text-center">
              <div className="w-24">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-neutral-400">今日进度</span>
                  <span className="text-neutral-500 font-mono">
                    {stats.todayConsumed}/{stats.todayGoal}
                  </span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {inventory.length === 0 && (
            <button
              onClick={loadSampleData}
              className="btn-secondary flex items-center gap-1"
            >
              <Play className="w-4 h-4" />
              加载示例
            </button>
          )}
          
          <button
            onClick={togglePriceVisibility}
            className="btn-secondary flex items-center gap-1"
            title={showPurchasePrice ? '点击隐藏进价' : '点击显示进价'}
          >
            {showPurchasePrice ? (
              <><Eye className="w-4 h-4" /> 显示进价</>
            ) : (
              <><EyeOff className="w-4 h-4" /> 隐藏进价</>
            )}
          </button>

          <button
            onClick={handleExportExcel}
            className="btn-secondary flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            导出Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            导出行动清单
          </button>

          {inventory.length > 0 && (
            <button
              onClick={handleClearData}
              className="p-2 text-neutral-300 hover:text-danger-500 transition-colors"
              title="清空数据"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
