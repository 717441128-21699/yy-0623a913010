import React, { useMemo, useState } from 'react';
import { MessageSquareText, Filter } from 'lucide-react';
import { SectionCard } from '@/components/layout/SectionCard';
import { ScriptCard } from './ScriptCard';
import { useAppStore } from '@/store';
import { generateAllScripts } from '@/utils/scriptGenerator';
import type { MolecularType } from '@/types';

const filterOptions: { key: 'all' | 'key' | MolecularType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'key', label: '仅看主推' },
  { key: 'macromolecule', label: '大分子' },
  { key: 'medium', label: '中分子' },
  { key: 'micromolecule', label: '小分子' },
];

export const ScriptArea: React.FC = () => {
  const { inventory } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'key' | MolecularType>('all');
  const [searchText, setSearchText] = useState('');

  const scripts = useMemo(() => generateAllScripts(inventory), [inventory]);

  const filteredScripts = useMemo(() => {
    let result = scripts;
    
    if (filter === 'key') {
      result = result.filter(s => s.isKeyPromotion);
    } else if (filter !== 'all') {
      result = result.filter(s => s.molecularType === filter);
    }
    
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(lower) ||
        s.content.toLowerCase().includes(lower) ||
        s.productBrand.toLowerCase().includes(lower)
      );
    }
    
    return result;
  }, [scripts, filter, searchText]);

  return (
    <SectionCard 
      title="话术卡片" 
      icon={<MessageSquareText className="w-5 h-5" />}
      extra={
        <span className="text-xs text-neutral-300">
          共 {scripts.filter(s => s.isKeyPromotion).length} 个主推话术
        </span>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="搜索话术..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 input-field text-sm py-1.5"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="input-field text-sm py-1.5 w-28"
          >
            {filterOptions.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>

        {filteredScripts.length === 0 ? (
          <div className="text-center py-8 text-neutral-300">
            <p className="text-sm">暂无话术卡片</p>
            <p className="text-xs mt-1">导入库存数据后自动生成</p>
          </div>
        ) : (
          <div className="grid gap-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
            {filteredScripts.map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
};
