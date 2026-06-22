import React from 'react';
import { Upload, Database, FileSpreadsheet } from 'lucide-react';
import { SectionCard } from '@/components/layout/SectionCard';
import { DropZone } from './DropZone';
import { DataPreview } from './DataPreview';
import { FieldMapper } from './FieldMapper';
import { useAppStore } from '@/store';

export const ImportArea: React.FC = () => {
  const { inventory, showFieldMapper } = useAppStore();

  return (
    <>
      <SectionCard 
        title="数据导入" 
        icon={<Upload className="w-5 h-5" />}
        extra={
          inventory.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-neutral-300">
              <Database className="w-3 h-3" />
              {inventory.length} 条记录
            </span>
          )
        }
      >
        {inventory.length === 0 ? (
          <div className="space-y-4">
            <DropZone />
            
            <div className="p-4 bg-primary-50 rounded-lg">
              <h4 className="text-sm font-medium text-primary-600 mb-2 flex items-center gap-1">
                <FileSpreadsheet className="w-4 h-4" />
                Excel模板说明
              </h4>
              <div className="text-xs text-primary-500 space-y-1">
                <p>Excel第一行为表头，包含以下列：</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li><strong>品牌</strong>：产品名称，如"乔雅登 丰颜"</li>
                  <li><strong>规格</strong>：包装规格，如"1ml/支"</li>
                  <li><strong>批号</strong>：生产批次号</li>
                  <li><strong>数量</strong>：入库数量（支）</li>
                  <li><strong>到期日</strong>：有效期截止日期</li>
                  <li><strong>进价</strong>：采购单价（可选）</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">库存列表</span>
              <span className="text-xs text-neutral-300">
                （点击剩余数量可编辑，支持手动调整）
              </span>
            </div>
            <DataPreview />
          </div>
        )}
      </SectionCard>

      {showFieldMapper && <FieldMapper />}
    </>
  );
};
