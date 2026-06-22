import React, { useState, useMemo } from 'react';
import { ClipboardList, Plus, Tag, CheckCircle, Clock, XCircle, Edit3, Trash2 } from 'lucide-react';
import { SectionCard } from '@/components/layout/SectionCard';
import { DailyGoal } from './DailyGoal';
import { AddConsumptionModal } from './AddConsumptionModal';
import { ExpiryHandler } from './ExpiryHandler';
import { useAppStore } from '@/store';
import type { ConsumptionRecord, InventoryItem } from '@/types';
import { treatmentTypeLabels } from '@/utils/scriptGenerator';

const statusConfig = {
  appointment: { icon: <Clock className="w-3.5 h-3.5" />, label: '已预约', class: 'text-caution-500 bg-caution-50' },
  completed: { icon: <CheckCircle className="w-3.5 h-3.5" />, label: '已完成', class: 'text-success-500 bg-success-50' },
  cancelled: { icon: <XCircle className="w-3.5 h-3.5" />, label: '未成交', class: 'text-danger-500 bg-danger-50' },
};

export const TrackingArea: React.FC = () => {
  const { 
    inventory, 
    consumptionRecords, 
    updateConsumption, 
    deleteConsumption,
    showPurchasePrice 
  } = useAppStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHandlerModal, setShowHandlerModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'appointment' | 'completed' | 'cancelled'>('all');

  const urgentItems = useMemo(() => 
    inventory.filter(i => 
      (i.urgency === 'danger' || i.urgency === 'warning') && 
      i.remainingQuantity > 0 && 
      !i.treatmentType
    ),
    [inventory]
  );

  const filteredRecords = useMemo(() => {
    let records = [...consumptionRecords].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    if (filter !== 'all') {
      records = records.filter(r => r.status === filter);
    }
    
    return records;
  }, [consumptionRecords, filter]);

  const getItemInfo = (inventoryId: string) => {
    return inventory.find(i => i.id === inventoryId);
  };

  const handleMarkTreatment = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowHandlerModal(true);
  };

  const handleStatusChange = (record: ConsumptionRecord, newStatus: typeof record.status) => {
    updateConsumption(record.id, { status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      deleteConsumption(id);
    }
  };

  return (
    <>
      <SectionCard 
        title="消耗跟踪" 
        icon={<ClipboardList className="w-5 h-5" />}
        extra={
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs flex items-center gap-1 py-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            登记
          </button>
        }
      >
        <div className="space-y-4">
          <DailyGoal />

          {urgentItems.length > 0 && (
            <div className="p-3 bg-danger-50 rounded-lg">
              <p className="text-xs font-medium text-danger-600 mb-2 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                临期待处理（{urgentItems.length}支）
              </p>
              <div className="flex flex-wrap gap-2">
                {urgentItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleMarkTreatment(item)}
                    className="px-2 py-1 bg-white rounded text-xs text-neutral-500 hover:bg-danger-100 transition-colors flex items-center gap-1"
                  >
                    <span className="font-medium">{item.brand}</span>
                    <span className="text-neutral-300">剩{item.remainingQuantity}支</span>
                    <span className="text-danger-500">{item.daysUntilExpiry}天</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 bg-neutral-50 p-1 rounded-lg">
            {[
              { key: 'all', label: '全部' },
              { key: 'appointment', label: '已预约' },
              { key: 'completed', label: '已完成' },
              { key: 'cancelled', label: '未成交' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`
                  flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all
                  ${filter === tab.key 
                    ? 'bg-white text-primary-500 shadow-sm' 
                    : 'text-neutral-400 hover:text-neutral-500'
                  }
                `}
              >
                {tab.label}
                <span className="ml-1 text-neutral-300">
                  {filter === tab.key || tab.key === 'all' 
                    ? consumptionRecords.filter(r => tab.key === 'all' || r.status === tab.key).length
                    : ''}
                </span>
              </button>
            ))}
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-neutral-300">
              <p className="text-sm">暂无消耗记录</p>
              <p className="text-xs mt-1">点击右上角"登记"添加记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="table-header text-left py-2 px-2">顾客</th>
                    <th className="table-header text-left py-2 px-2">产品</th>
                    <th className="table-header text-left py-2 px-2">项目</th>
                    <th className="table-header text-left py-2 px-2">预约日</th>
                    <th className="table-header text-center py-2 px-2">状态</th>
                    <th className="table-header text-left py-2 px-2">原因</th>
                    <th className="table-header text-center py-2 px-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.slice(0, 10).map(record => {
                    const item = getItemInfo(record.inventoryId);
                    const config = statusConfig[record.status];
                    
                    return (
                      <tr key={record.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                        <td className="table-cell py-2 px-2">
                          <span className="font-medium">{record.customerName}</span>
                        </td>
                        <td className="table-cell py-2 px-2">
                          <div>
                            <span className="text-sm">{item?.brand}</span>
                            {showPurchasePrice && item?.purchasePrice && (
                              <span className="text-xs text-neutral-300 ml-2">¥{item.purchasePrice}</span>
                            )}
                          </div>
                          <span className="text-xs text-neutral-300">{item?.specification}</span>
                        </td>
                        <td className="table-cell py-2 px-2">{record.projectType}</td>
                        <td className="table-cell py-2 px-2 font-mono text-xs">{record.appointmentDate}</td>
                        <td className="table-cell py-2 px-2 text-center">
                          <select
                            value={record.status}
                            onChange={(e) => handleStatusChange(record, e.target.value as typeof record.status)}
                            className={`badge border-0 ${config.class} cursor-pointer`}
                          >
                            <option value="appointment">已预约</option>
                            <option value="completed">已完成</option>
                            <option value="cancelled">未成交</option>
                          </select>
                        </td>
                        <td className="table-cell py-2 px-2 text-xs text-neutral-400 max-w-[120px] truncate">
                          {record.rejectionReason || '-'}
                        </td>
                        <td className="table-cell py-2 px-2 text-center">
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1 text-neutral-300 hover:text-danger-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredRecords.length > 10 && (
                <p className="text-center text-xs text-neutral-300 mt-2">
                  显示最近10条，共 {filteredRecords.length} 条记录
                </p>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {showAddModal && (
        <AddConsumptionModal onClose={() => setShowAddModal(false)} />
      )}

      {showHandlerModal && selectedItem && (
        <ExpiryHandler 
          item={selectedItem} 
          onClose={() => {
            setShowHandlerModal(false);
            setSelectedItem(null);
          }} 
        />
      )}
    </>
  );
};
