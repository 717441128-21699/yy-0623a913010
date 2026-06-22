import React, { useState } from 'react';
import { Tag, X, Heart, Users, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';
import type { InventoryItem, TreatmentType } from '@/types';
import { treatmentTypeLabels } from '@/utils/scriptGenerator';

interface ExpiryHandlerProps {
  item: InventoryItem;
  onClose: () => void;
}

const treatmentOptions: { type: TreatmentType; icon: React.ReactNode; label: string; desc: string }[] = [
  { 
    type: 'staff_purchase', 
    icon: <Users className="w-5 h-5" />, 
    label: '员工内购', 
    desc: '优惠价格出售给内部员工' 
  },
  { 
    type: 'customer_return', 
    icon: <Heart className="w-5 h-5" />, 
    label: '老客回访', 
    desc: '针对老客户的特别优惠活动' 
  },
  { 
    type: 'combo_project', 
    icon: <Sparkles className="w-5 h-5" />, 
    label: '联合项目', 
    desc: '搭配其他项目作为促销赠品' 
  },
];

export const ExpiryHandler: React.FC<ExpiryHandlerProps> = ({ item, onClose }) => {
  const { markTreatment } = useAppStore();
  const [selectedType, setSelectedType] = useState<TreatmentType | null>(item.treatmentType || null);
  const [remark, setRemark] = useState(item.treatmentRemark || '');

  const handleSave = () => {
    if (selectedType) {
      markTreatment(item.id, selectedType, remark);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-card-hover w-full max-w-md animate-fade-in">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-medium text-neutral-500">临期处理</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-neutral-300" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
            <p className="font-medium text-neutral-500 mb-1">{item.brand}</p>
            <p className="text-xs text-neutral-400">{item.specification}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-danger">{item.daysUntilExpiry}天后到期</span>
              <span className="text-xs text-neutral-400 font-mono">剩余 {item.remainingQuantity} 支</span>
            </div>
          </div>

          <p className="text-sm text-neutral-400 mb-3">选择处理方式：</p>
          
          <div className="space-y-2 mb-4">
            {treatmentOptions.map((opt) => (
              <div
                key={opt.type}
                onClick={() => setSelectedType(opt.type)}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-all
                  ${selectedType === opt.type 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-neutral-100 hover:border-neutral-200'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedType === opt.type ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      selectedType === opt.type ? 'text-primary-600' : 'text-neutral-500'
                    }`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-neutral-400">{opt.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="text-sm text-neutral-400 mb-1 block">备注（可选）</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="输入处理备注..."
              className="input-field resize-none h-20"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedType}
              className={`btn-primary ${!selectedType ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              确认标记
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
