import React, { useState } from 'react';
import { MessageSquare, AlertTriangle, Star, Copy, Check } from 'lucide-react';
import type { ScriptCard as ScriptCardType } from '@/types';
import { getMolecularTypeColor } from '@/utils/projectMatcher';

interface ScriptCardProps {
  script: ScriptCardType;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({ script }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div 
      className={`
        relative p-4 rounded-lg border transition-all duration-300
        ${script.isKeyPromotion 
          ? 'border-danger-200 bg-danger-50/50' 
          : 'border-neutral-100 bg-white hover:border-primary-200'
        }
      `}
    >
      {script.isKeyPromotion && (
        <div className="absolute -top-2 -right-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-danger-500 text-white text-xs rounded-full">
            <Star className="w-3 h-3 fill-current" />
            主推
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${
            script.isKeyPromotion ? 'text-danger-500' : 'text-primary-500'
          }`} />
          <div>
            <h4 className="text-sm font-medium text-neutral-500">{script.title}</h4>
            <p className="text-xs text-neutral-400">{script.productBrand}</p>
          </div>
        </div>
        
        <button
          onClick={handleCopy}
          className={`p-1.5 rounded transition-colors ${
            copied 
              ? 'bg-success-50 text-success-500' 
              : 'hover:bg-neutral-100 text-neutral-300'
          }`}
          title="复制话术"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p className="text-sm text-neutral-500 leading-relaxed mb-3">
        {script.content}
      </p>

      <div className="pt-3 border-t border-neutral-100">
        <p className="text-xs font-medium text-neutral-400 mb-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-caution-500" />
          合规提醒
        </p>
        <ul className="space-y-1">
          {script.warnings.map((warning, index) => (
            <li key={index} className="text-xs text-caution-600 flex items-start gap-1">
              <span className="text-caution-400 mt-0.5">•</span>
              {warning}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 text-xs text-neutral-300 italic">
        本话术仅供参考，实际沟通请遵循医嘱
      </div>
    </div>
  );
};
