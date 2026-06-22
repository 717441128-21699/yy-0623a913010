import React, { useState, useMemo } from 'react';
import { 
  Calendar, AlertTriangle, XCircle, CheckCircle, 
  Clock, User, Syringe, ArrowRight, TrendingUp 
} from 'lucide-react';
import { SectionCard } from '@/components/layout/SectionCard';
import { useAppStore } from '@/store';
import dayjs from 'dayjs';
import { getUrgencyBadgeClass, getUrgencyLabel, calculatePressureStats } from '@/utils/expiryCalculator';
import type { ConsumptionRecord, InventoryItem } from '@/types';

type WorkbenchFilter = 'all' | 'appointments' | 'urgent' | 'cancelled' | 'completed';

const statusConfig = {
  appointment: { icon: <Clock className="w-4 h-4" />, label: '待跟进', class: 'text-caution-500 bg-caution-50' },
  completed: { icon: <CheckCircle className="w-4 h-4" />, label: '已完成', class: 'text-success-500 bg-success-50' },
  cancelled: { icon: <XCircle className="w-4 h-4" />, label: '未成交', class: 'text-danger-500 bg-danger-50' },
};

export const TodayWorkbench: React.FC = () => {
  const { 
    inventory, 
    consumptionRecords, 
    updateConsumption,
    dailyGoal
  } = useAppStore();

  const pressureStats = useMemo(() => 
    calculatePressureStats(inventory, consumptionRecords, dailyGoal),
    [inventory, consumptionRecords, dailyGoal]
  );
  
  const [filter, setFilter] = useState<WorkbenchFilter>('all');

  const today = dayjs().format('YYYY-MM-DD');

  const todayRecords = useMemo(() => {
    return consumptionRecords.filter(r => r.appointmentDate === today);
  }, [consumptionRecords, today]);

  const urgentItems = useMemo(() => {
    return inventory.filter(i => 
      i.urgency === 'danger' && 
      i.remainingQuantity > 0 && 
      !i.treatmentType
    ).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [inventory]);

  const cancelledItems = useMemo(() => {
    return consumptionRecords
      .filter(r => r.status === 'cancelled')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [consumptionRecords]);

  const getItemInfo = (inventoryId: string) => {
    return inventory.find(i => i.id === inventoryId);
  };

  const handleStatusChange = (record: ConsumptionRecord, newStatus: typeof record.status) => {
    updateConsumption(record.id, { status: newStatus });
  };

  const filteredAppointments = useMemo(() => {
    if (filter === 'all' || filter === 'appointments') {
      return todayRecords.filter(r => r.status === 'appointment');
    }
    return [];
  }, [todayRecords, filter]);

  const filteredCompleted = useMemo(() => {
    if (filter === 'all' || filter === 'completed') {
      return todayRecords.filter(r => r.status === 'completed');
    }
    return [];
  }, [todayRecords, filter]);

  const filteredCancelled = useMemo(() => {
    if (filter === 'all' || filter === 'cancelled') {
      return todayRecords.filter(r => r.status === 'cancelled');
    }
    return [];
  }, [todayRecords, filter]);

  const displayUrgent = filter === 'all' || filter === 'urgent';

  const stats = [
    { key: 'all', label: '全部', count: todayRecords.length + urgentItems.length, icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'appointments', label: '今日预约', count: todayRecords.filter(r => r.status === 'appointment').length, icon: <Calendar className="w-4 h-4" /> },
    { key: 'urgent', label: '紧急临期', count: urgentItems.length, icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'cancelled', label: '未成交', count: todayRecords.filter(r => r.status === 'cancelled').length, icon: <XCircle className="w-4 h-4" /> },
    { key: 'completed', label: '已完成', count: todayRecords.filter(r => r.status === 'completed').length, icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <SectionCard 
      title="今日行动工作台" 
      icon={<Calendar className="w-5 h-5 text-primary-500" />}
      extra={
        <div className="text-xs text-neutral-400">
          今日目标: <span className="font-semibold text-primary-500">{pressureStats.todayGoal}</span> 支
          <span className="mx-2">|</span>
          已完成: <span className="font-semibold text-success-500">{pressureStats.todayConsumed}</span> 支
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {stats.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as WorkbenchFilter)}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap
                ${filter === tab.key 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                }
              `}
            >
              {tab.icon}
              {tab.label}
              <span className={`
                px-1.5 py-0.5 rounded text-xs
                ${filter === tab.key ? 'bg-white/20' : 'bg-neutral-200 text-neutral-500'}
              `}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {displayUrgent && urgentItems.length > 0 && (
            <div className="p-3 bg-danger-50 rounded-lg border border-danger-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-danger-500" />
                <span className="text-sm font-semibold text-danger-700">紧急临期 - 必须优先处理</span>
                <span className="px-2 py-0.5 bg-danger-500 text-white text-xs rounded-full">
                  {urgentItems.length} 支
                </span>
              </div>
              <div className="space-y-2">
                {urgentItems.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <Syringe className="w-4 h-4 text-danger-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-700">
                          {item.brand} {item.specification}
                        </p>
                        <p className="text-xs text-neutral-400">
                          剩余 {item.remainingQuantity} 支 · {item.daysUntilExpiry}天到期
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={getUrgencyBadgeClass(item.urgency)}>
                        {getUrgencyLabel(item.urgency)}
                      </span>
                    </div>
                  </div>
                ))}
                {urgentItems.length > 3 && (
                  <p className="text-xs text-danger-400 text-center pt-1">
                    还有 {urgentItems.length - 3} 支紧急库存需要处理
                  </p>
                )}
              </div>
            </div>
          )}

          {filteredAppointments.length > 0 && (
            <div className="p-3 bg-caution-50 rounded-lg border border-caution-100">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-caution-500" />
                <span className="text-sm font-semibold text-caution-700">今日待跟进</span>
                <span className="px-2 py-0.5 bg-caution-500 text-white text-xs rounded-full">
                  {filteredAppointments.length} 位
                </span>
              </div>
              <div className="space-y-2">
                {filteredAppointments.map(record => {
                  const item = getItemInfo(record.inventoryId);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-caution-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-caution-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-700">{record.customerName}</p>
                          <p className="text-xs text-neutral-400">
                            {item?.brand} · {record.projectType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(record, 'completed')}
                          className="px-2.5 py-1 bg-success-500 text-white text-xs rounded-lg hover:bg-success-600 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          成交
                        </button>
                        <button
                          onClick={() => handleStatusChange(record, 'cancelled')}
                          className="px-2.5 py-1 bg-neutral-200 text-neutral-600 text-xs rounded-lg hover:bg-neutral-300 transition-colors"
                        >
                          未成交
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredCancelled.length > 0 && (
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-semibold text-neutral-700">今日未成交 - 需回访</span>
                <span className="px-2 py-0.5 bg-neutral-500 text-white text-xs rounded-full">
                  {filteredCancelled.length} 位
                </span>
              </div>
              <div className="space-y-2">
                {filteredCancelled.map(record => {
                  const item = getItemInfo(record.inventoryId);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-neutral-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-700">{record.customerName}</p>
                          <p className="text-xs text-neutral-400">
                            {item?.brand} · {record.projectType}
                          </p>
                          {record.rejectionReason && (
                            <p className="text-xs text-danger-400 mt-0.5">
                              原因: {record.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(record, 'appointment')}
                          className="px-2.5 py-1 bg-caution-100 text-caution-600 text-xs rounded-lg hover:bg-caution-200 transition-colors flex items-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          重新预约
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredCompleted.length > 0 && (
            <div className="p-3 bg-success-50 rounded-lg border border-success-100">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span className="text-sm font-semibold text-success-700">今日已完成</span>
                <span className="px-2 py-0.5 bg-success-500 text-white text-xs rounded-full">
                  {filteredCompleted.length} 位
                </span>
              </div>
              <div className="space-y-2">
                {filteredCompleted.slice(0, 3).map(record => {
                  const item = getItemInfo(record.inventoryId);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-success-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-700">{record.customerName}</p>
                          <p className="text-xs text-neutral-400">
                            {item?.brand} · {record.projectType}
                          </p>
                        </div>
                      </div>
                      <span className={`badge ${statusConfig.completed.class} text-xs`}>
                        {statusConfig.completed.icon}
                        已成交
                      </span>
                    </div>
                  );
                })}
                {filteredCompleted.length > 3 && (
                  <p className="text-xs text-success-400 text-center pt-1">
                    今日累计成交 {filteredCompleted.length} 位
                  </p>
                )}
              </div>
            </div>
          )}

          {todayRecords.length === 0 && urgentItems.length === 0 && (
            <div className="text-center py-8 text-neutral-300">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">今日暂无行动项</p>
              <p className="text-xs mt-1">导入库存或登记预约后开始工作</p>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
};
