import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { rejectionReasons } from '@/utils/scriptGenerator';
import { matchedProjects } from '@/utils/projectMatcher';
import type { ConsumptionStatus } from '@/types';
import dayjs from 'dayjs';

interface AddConsumptionModalProps {
  onClose: () => void;
}

export const AddConsumptionModal: React.FC<AddConsumptionModalProps> = ({ onClose }) => {
  const { inventory, addConsumption } = useAppStore();
  
  const [formData, setFormData] = useState({
    inventoryId: '',
    customerName: '',
    appointmentDate: dayjs().format('YYYY-MM-DD'),
    status: 'appointment' as ConsumptionStatus,
    projectType: '',
    rejectionReason: '',
  });

  const availableItems = inventory.filter(i => i.remainingQuantity > 0 && i.urgency !== 'expired');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inventoryId || !formData.customerName || !formData.projectType) {
      alert('请填写完整信息');
      return;
    }

    addConsumption({
      inventoryId: formData.inventoryId,
      customerName: formData.customerName,
      appointmentDate: formData.appointmentDate,
      status: formData.status,
      projectType: formData.projectType,
      rejectionReason: formData.status === 'cancelled' ? formData.rejectionReason : undefined,
    });

    onClose();
  };

  const selectedItem = inventory.find(i => i.id === formData.inventoryId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-card-hover w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-medium text-neutral-500">登记消耗/预约</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-neutral-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm text-neutral-500 mb-1 block">
              选择产品 <span className="text-danger-500">*</span>
            </label>
            <select
              value={formData.inventoryId}
              onChange={(e) => setFormData({ ...formData, inventoryId: e.target.value })}
              className="input-field"
            >
              <option value="">-- 请选择产品 --</option>
              {availableItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.brand} {item.specification} (剩{item.remainingQuantity}支, {item.daysUntilExpiry}天)
                </option>
              ))}
            </select>
            {selectedItem && (
              <p className="text-xs text-neutral-400 mt-1">
                类型：{selectedItem.molecularType === 'macromolecule' ? '大分子（塑形）' : 
                  selectedItem.molecularType === 'medium' ? '中分子（填充）' : '小分子（补水）'}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-neutral-500 mb-1 block">
              顾客姓名 <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="请输入顾客姓名"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-500 mb-1 block">
              预约日期 <span className="text-danger-500">*</span>
            </label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-500 mb-1 block">
              项目类型 <span className="text-danger-500">*</span>
            </label>
            <select
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className="input-field"
            >
              <option value="">-- 请选择项目 --</option>
              {matchedProjects.map(project => (
                <option key={project.id} value={project.name}>
                  {project.name}（{project.area}）
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-neutral-500 mb-1 block">
              状态 <span className="text-danger-500">*</span>
            </label>
            <div className="flex gap-3">
              {[
                { value: 'appointment', label: '已预约' },
                { value: 'completed', label: '已完成' },
                { value: 'cancelled', label: '未成交' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`
                    flex-1 p-3 border rounded-lg cursor-pointer text-center transition-all
                    ${formData.status === opt.value 
                      ? 'border-primary-500 bg-primary-50 text-primary-600' 
                      : 'border-neutral-100 text-neutral-500'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={formData.status === opt.value}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ConsumptionStatus })}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.status === 'cancelled' && (
            <div>
              <label className="text-sm text-neutral-500 mb-1 block">未成交原因</label>
              <select
                value={formData.rejectionReason}
                onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                className="input-field"
              >
                <option value="">-- 请选择原因 --</option>
                {rejectionReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button type="submit" className="btn-primary">
              确认登记
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
