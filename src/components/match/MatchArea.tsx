import React, { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { SectionCard } from '@/components/layout/SectionCard';
import { ProductCard } from './ProductCard';
import { useAppStore } from '@/store';
import type { MolecularType } from '@/types';
import { getMolecularTypeLabel } from '@/utils/projectMatcher';

const tabs: { key: MolecularType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'macromolecule', label: '大分子（塑形）' },
  { key: 'medium', label: '中分子（填充）' },
  { key: 'micromolecule', label: '小分子（补水）' },
];

export const MatchArea: React.FC = () => {
  const { inventory } = useAppStore();
  const [activeTab, setActiveTab] = useState<MolecularType | 'all'>('all');

  const filteredItems = useMemo(() => {
    let items = inventory.filter(item => item.remainingQuantity > 0);
    
    if (activeTab !== 'all') {
      items = items.filter(item => item.molecularType === activeTab);
    }
    
    return items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [inventory, activeTab]);

  const urgentCount = inventory.filter(i => i.urgency === 'danger' && i.remainingQuantity > 0).length;

  return (
    <SectionCard 
      title="项目匹配" 
      icon={<Layers className="w-5 h-5" />}
      extra={
        urgentCount > 0 && (
          <span className="badge badge-danger">
            {urgentCount}支需紧急消耗
          </span>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-1 bg-neutral-50 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${activeTab === tab.key 
                  ? 'bg-white text-primary-500 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-500'
                }
              `}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1 text-neutral-300">
                  {inventory.filter(i => i.molecularType === tab.key && i.remainingQuantity > 0).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-neutral-300">
            <p className="text-sm">暂无库存数据</p>
            <p className="text-xs mt-1">请先导入Excel文件</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
};
