import React from 'react';
import { Settings, Check, X } from 'lucide-react';
import { useAppStore } from '@/store';
import type { ColumnMapping } from '@/types';

const fieldLabels: Record<keyof ColumnMapping, string> = {
  brand: '品牌',
  specification: '规格',
  batchNumber: '批号',
  quantity: '数量',
  expiryDate: '到期日',
  purchasePrice: '进价（可选）',
};

const requiredFields: (keyof ColumnMapping)[] = ['brand', 'quantity', 'expiryDate'];

export const FieldMapper: React.FC = () => {
  const { 
    parsedHeaders, 
    columnMapping, 
    setColumnMapping,
    confirmImport,
    setShowFieldMapper
  } = useAppStore();

  const handleMappingChange = (field: keyof ColumnMapping, header: string | null) => {
    setColumnMapping({
      ...columnMapping,
      [field]: header,
    });
  };

  const canConfirm = requiredFields.every(field => columnMapping[field] !== null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-card-hover w-full max-w-2xl max-h-[80vh] overflow-hidden animate-fade-in">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-medium text-neutral-500">字段映射配置</h3>
          </div>
          <button
            onClick={() => setShowFieldMapper(false)}
            className="p-1 hover:bg-neutral-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-neutral-300" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          <p className="text-sm text-neutral-400 mb-4">
            请将Excel列名与系统字段进行对应。系统已尝试自动识别，您可以手动调整。
          </p>

          <div className="space-y-4">
            {(Object.keys(fieldLabels) as (keyof ColumnMapping)[]).map((field) => (
              <div key={field} className="flex items-center gap-4">
                <div className="w-28 flex-shrink-0">
                  <span className="text-sm text-neutral-500">
                    {fieldLabels[field]}
                    {requiredFields.includes(field) && (
                      <span className="text-danger-500 ml-1">*</span>
                    )}
                  </span>
                </div>
                
                <select
                  value={columnMapping[field] || ''}
                  onChange={(e) => handleMappingChange(field, e.target.value || null)}
                  className="flex-1 input-field"
                >
                  <option value="">-- 请选择对应列 --</option>
                  {parsedHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>

                {columnMapping[field] && (
                  <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-600 font-medium mb-2">已识别的映射关系：</p>
            <div className="text-xs text-primary-500 space-y-1">
              {(Object.keys(columnMapping) as (keyof ColumnMapping)[]).map(field => (
                columnMapping[field] && (
                  <p key={field}>
                    {fieldLabels[field]} ← <span className="font-mono">{columnMapping[field]}</span>
                  </p>
                )
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
          <button
            onClick={() => setShowFieldMapper(false)}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={confirmImport}
            disabled={!canConfirm}
            className={`btn-primary ${!canConfirm ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  );
};
