import React from 'react';
import { X, Calendar, Package, Users, Tag, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import type { InventoryItem, ConsumptionRecord } from '@/types';
import { getUrgencyBadgeClass, getUrgencyLabel, getUrgencyTextColor } from '@/utils/expiryCalculator';
import { getMolecularTypeLabel, getMolecularTypeColor, matchProjectsForItem } from '@/utils/projectMatcher';
import { treatmentTypeLabels } from '@/utils/scriptGenerator';
import dayjs from 'dayjs';

const statusConfig = {
  appointment: { label: '已预约', icon: <Clock className="w-3 h-3" />, class: 'bg-primary-50 text-primary-600' },
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
  const { showPurchasePrice } = useAppStore();

  const urgentItems = items.filter(i => i.urgency === 'danger' || i.urgency === 'warning');
  const normalItems = items.filter(i => i.urgency !== 'danger' && i.urgency !== 'warning');

  const appointmentRecords = records.filter(r => r.status === 'appointment');
  const completedRecords = records.filter(r => r.status === 'completed');
  const cancelledRecords = records.filter(r => r.status === 'cancelled');

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
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <p className="text-2xl font-semibold text-primary-600">{urgentItems.length}</p>
            <p className="text-xs text-neutral-400">临期批次</p>
          </div>
          <div className="text-center p-3 bg-success-50 rounded-lg">
            <p className="text-2xl font-semibold text-success-600">{completedRecords.length}</p>
            <p className="text-xs text-neutral-400">已完成</p>
          </div>
          <div className="text-center p-3 bg-caution-50 rounded-lg">
            <p className="text-2xl font-semibold text-caution-600">{appointmentRecords.length}</p>
            <p className="text-xs text-neutral-400">待处理</p>
          </div>
        </div>

        {urgentItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-danger-500" />
              <h4 className="text-sm font-medium text-neutral-500">紧急临期批次</h4>
            </div>
            <div className="space-y-3">
              {urgentItems.map(item => (
                <InventoryItemCard key={item.id} item={item} showPrice={showPurchasePrice} date={date} />
              ))}
            </div>
          </div>
        )}

        {normalItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-neutral-400" />
              <h4 className="text-sm font-medium text-neutral-500">其他相关批次</h4>
            </div>
            <div className="space-y-2">
              {normalItems.map(item => (
                <InventoryItemCard key={item.id} item={item} showPrice={showPurchasePrice} date={date} />
              ))}
            </div>
          </div>
        )}

        {records.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-neutral-400" />
              <h4 className="text-sm font-medium text-neutral-500">顾客预约记录</h4>
            </div>
            <div className="space-y-2">
              {records.map(record => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && records.length === 0 && (
          <div className="text-center py-8 text-neutral-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">当日无相关批次和预约</p>
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
}

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item, showPrice, date }) => {
  const matchedProjects = matchProjectsForItem(item);
  const isSuggestedDate = dayjs(item.suggestedConsumeDate).isSame(date, 'day');

  return (
    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-neutral-500">{item.brand}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded ${getMolecularTypeColor(item.molecularType)}`}>
            {getMolecularTypeLabel(item.molecularType)}
          </span>
        </div>
        <p className="text-xs text-neutral-400">{item.specification}</p>
      </div>
      <span className={`badge ${getUrgencyBadgeClass(item.urgency)}`}>
        {getUrgencyLabel(item.urgency)}
      </span>
    </div>

    <div className="flex flex-wrap gap-4 text-xs mb-2">
      <span className="text-neutral-400">
        剩余 <span className={`font-medium ${getUrgencyTextColor(item.urgency)}`}>{item.remainingQuantity}</span> 支
      </span>
      {showPrice && item.purchasePrice !== undefined && (
        <span className="text-neutral-400">进价 ¥{item.purchasePrice}</span>
      )}
    </div>

    {isSuggestedDate && (
      <div className="flex items-center gap-1 text-xs text-warning-600 mb-2">
        <AlertTriangle className="w-3 h-3" />
        <span>最后建议消耗日</span>
      </div>
    )}

    {item.treatmentType && (
      <div className="flex items-center gap-1.5 text-xs text-primary-600 mb-2">
        <Tag className="w-3 h-3" />
        <span>{treatmentTypeLabels[item.treatmentType]}</span>
        {item.treatmentRemark && (
          <span className="text-neutral-400">· {item.treatmentRemark}</span>
        )}
      </div>
    )}

    <div className="flex flex-wrap gap-1">
      {matchedProjects.slice(0, 3).map(project => (
        <span key={project.id} className="text-xs px-1.5 py-0.5 bg-white rounded text-neutral-500">
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
