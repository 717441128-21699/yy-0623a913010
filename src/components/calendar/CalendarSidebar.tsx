import React, { useMemo } from 'react';
import { X, Calendar, Package, Users, Tag, Clock, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/store';
import type { InventoryItem, ConsumptionRecord } from '@/types';
import { getUrgencyBadgeClass, getUrgencyLabel, getUrgencyTextColor } from '@/utils/expiryCalculator';
import { getMolecularTypeLabel, getMolecularTypeColor, matchProjectsForItem } from '@/utils/projectMatcher';
import { treatmentTypeLabels } from '@/utils/scriptGenerator';
import dayjs from 'dayjs';

const statusConfig = {
  appointment: { label: '已预约', icon: <Clock className="w-3 h-3" />, class: 'bg-caution-50 text-caution-600' },
  completed: { label: '已完成', icon: <CheckCircle className="w-3 h-3" />, class: 'bg-success-50 text-success-600' },
  cancelled: { label: '未成交', icon: <XCircle className="w-3 h-3" />, class: 'bg-neutral-100 text-neutral-500' },
};

interface CalendarSidebarProps {
  date: string;
  items: InventoryItem[];
  records: ConsumptionRecord[];
  onClose: () => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ date, items, records, onClose }) => {
  const { showPurchasePrice, inventory, consumptionRecords } = useAppStore();

  const urgentItems = items.filter(i => i.urgency === 'danger' || i.urgency === 'warning');
  const normalItems = items.filter(i => i.urgency !== 'danger' && i.urgency !== 'warning');

  const appointmentRecords = records.filter(r => r.status === 'appointment');
  const completedRecords = records.filter(r => r.status === 'completed');
  const cancelledRecords = records.filter(r => r.status === 'cancelled');

  const dayRecords = useMemo(() => {
    return consumptionRecords.filter(r => r.appointmentDate === date);
  }, [consumptionRecords, date]);

  const allRelatedItems = useMemo(() => {
    const itemIds = new Set(items.map(i => i.id));
    dayRecords.forEach(r => itemIds.add(r.inventoryId));
    return inventory.filter(i => itemIds.has(i.id));
  }, [inventory, items, dayRecords]);

  const getRecordsForItem = (itemId: string) => {
    return dayRecords.filter(r => r.inventoryId === itemId);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-neutral-100 z-40 animate-slide-in-right overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          <div>
            <h3 className="text-lg font-medium text-neutral-500">
              {dayjs(date).format('YYYY年MM月DD日')}
            </h3>
            <p className="text-xs text-neutral-400">
              {dayjs(date).format('dddd')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
        >
          <X className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2.5 bg-primary-50 rounded-lg">
            <p className="text-xl font-semibold text-primary-600">{allRelatedItems.length}</p>
            <p className="text-xs text-neutral-400">相关批次</p>
          </div>
          <div className="text-center p-2.5 bg-caution-50 rounded-lg">
            <p className="text-xl font-semibold text-caution-600">{appointmentRecords.length}</p>
            <p className="text-xs text-neutral-400">待跟进</p>
          </div>
          <div className="text-center p-2.5 bg-success-50 rounded-lg">
            <p className="text-xl font-semibold text-success-600">{completedRecords.length}</p>
            <p className="text-xs text-neutral-400">已成交</p>
          </div>
          <div className="text-center p-2.5 bg-neutral-100 rounded-lg">
            <p className="text-xl font-semibold text-neutral-500">{cancelledRecords.length}</p>
            <p className="text-xs text-neutral-400">未成交</p>
          </div>
        </div>

        {allRelatedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary-500" />
              <h4 className="text-sm font-medium text-neutral-700">批次详情</h4>
              <span className="text-xs text-neutral-400">({allRelatedItems.length}个)</span>
            </div>
            <div className="space-y-3">
              {allRelatedItems.map(item => (
                <InventoryItemCard 
                  key={item.id} 
                  item={item} 
                  showPrice={showPurchasePrice} 
                  date={date}
                  relatedRecords={getRecordsForItem(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {dayRecords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary-500" />
              <h4 className="text-sm font-medium text-neutral-700">当日全部预约</h4>
              <span className="text-xs text-neutral-400">({dayRecords.length}位)</span>
            </div>
            <div className="space-y-2">
              {dayRecords.map(record => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          </div>
        )}

        {allRelatedItems.length === 0 && dayRecords.length === 0 && (
          <div className="text-center py-8 text-neutral-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">当日无批次和预约记录</p>
            <p className="text-xs mt-1">点击其他日期查看详情</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface InventoryItemCardProps {
  item: InventoryItem;
  showPrice: boolean;
  date: string;
  relatedRecords?: ConsumptionRecord[];
}

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item, showPrice, date, relatedRecords = [] }) => {
  const matchedProjects = matchProjectsForItem(item);
  const isSuggestedDate = dayjs(item.suggestedConsumeDate).isSame(date, 'day');
  const isExpiryDate = dayjs(item.expiryDate).isSame(date, 'day');
  const isMilestone7 = dayjs(item.suggestedConsumeDate).subtract(7, 'day').isSame(date, 'day');
  const isMilestone3 = dayjs(item.suggestedConsumeDate).subtract(3, 'day').isSame(date, 'day');

  const appointmentRecords = relatedRecords.filter(r => r.status === 'appointment');
  const completedRecords = relatedRecords.filter(r => r.status === 'completed');
  const cancelledRecords = relatedRecords.filter(r => r.status === 'cancelled');

  return (
    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-neutral-700">{item.brand}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded ${getMolecularTypeColor(item.molecularType)}`}>
              {getMolecularTypeLabel(item.molecularType)}
            </span>
          </div>
          <p className="text-xs text-neutral-400">{item.specification} · 批号 {item.batchNumber || '-'}</p>
        </div>
        <span className={`badge ${getUrgencyBadgeClass(item.urgency)}`}>
          {getUrgencyLabel(item.urgency)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 bg-white rounded-lg">
          <p className="text-xs text-neutral-400 mb-0.5">建议消耗日</p>
          <p className="text-xs font-medium text-caution-600">{item.suggestedConsumeDate}</p>
        </div>
        <div className="p-2 bg-white rounded-lg">
          <p className="text-xs text-neutral-400 mb-0.5">到期日</p>
          <p className="text-xs font-medium text-danger-600">{item.expiryDate}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs mb-3">
        <span className="text-neutral-500">
          剩余 <span className={`font-medium ${getUrgencyTextColor(item.urgency)}`}>{item.remainingQuantity}</span> 支
        </span>
        {showPrice && item.purchasePrice !== undefined && (
          <span className="text-neutral-500">进价 ¥{item.purchasePrice}</span>
        )}
        <span className="text-neutral-500">
          {item.daysUntilExpiry > 0 ? `${item.daysUntilExpiry}天后到期` : '已过期'}
        </span>
      </div>

      {(isSuggestedDate || isExpiryDate || isMilestone7 || isMilestone3) && (
        <div className="mb-3">
          {isSuggestedDate && (
            <div className="flex items-center gap-1 text-xs text-warning-600 mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>最后建议消耗日</span>
            </div>
          )}
          {isExpiryDate && (
            <div className="flex items-center gap-1 text-xs text-danger-600 mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>到期日</span>
            </div>
          )}
          {isMilestone7 && !isSuggestedDate && (
            <div className="flex items-center gap-1 text-xs text-caution-600 mb-1">
              <Clock className="w-3 h-3" />
              <span>还有7天到建议消耗日</span>
            </div>
          )}
          {isMilestone3 && !isSuggestedDate && (
            <div className="flex items-center gap-1 text-xs text-danger-600 mb-1">
              <Clock className="w-3 h-3" />
              <span>还有3天到建议消耗日</span>
            </div>
          )}
        </div>
      )}

      {item.treatmentType && (
        <div className="flex items-center gap-1.5 text-xs text-primary-600 mb-3">
          <Tag className="w-3 h-3" />
          <span>处理方式: {treatmentTypeLabels[item.treatmentType]}</span>
          {item.treatmentRemark && (
            <span className="text-neutral-400">· {item.treatmentRemark}</span>
          )}
        </div>
      )}

      {relatedRecords.length > 0 && (
        <div className="border-t border-neutral-200 pt-3 mb-3">
          <p className="text-xs font-medium text-neutral-600 mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" />
            当天关联预约 ({relatedRecords.length}位)
          </p>
          <div className="space-y-1.5">
            {appointmentRecords.map(record => (
              <div key={record.id} className="flex items-center justify-between text-xs p-1.5 bg-caution-50 rounded">
                <span className="text-neutral-600">{record.customerName}</span>
                <span className="text-caution-600">{record.projectType}</span>
              </div>
            ))}
            {completedRecords.map(record => (
              <div key={record.id} className="flex items-center justify-between text-xs p-1.5 bg-success-50 rounded">
                <span className="text-neutral-600">{record.customerName}</span>
                <span className="text-success-600">已完成 · {record.projectType}</span>
              </div>
            ))}
            {cancelledRecords.map(record => (
              <div key={record.id} className="flex items-center justify-between text-xs p-1.5 bg-neutral-100 rounded">
                <span className="text-neutral-500">{record.customerName}</span>
                <span className="text-neutral-400">未成交</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {matchedProjects.slice(0, 4).map(project => (
          <span key={project.id} className="text-xs px-1.5 py-0.5 bg-white rounded text-neutral-500 border border-neutral-200">
            {project.name}
          </span>
        ))}
      </div>
    </div>
  );
};

interface RecordCardProps {
  record: ConsumptionRecord;
}

const RecordCard: React.FC<RecordCardProps> = ({ record }) => {
  const config = statusConfig[record.status];

  return (
    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-neutral-500">{record.customerName}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${config.class}`}>
          {config.icon}
          {config.label}
        </span>
      </div>
      <p className="text-xs text-neutral-400 mb-1">{record.projectType}</p>
      {record.rejectionReason && (
        <p className="text-xs text-danger-500">未成交原因：{record.rejectionReason}</p>
      )}
    </div>
  );
};
