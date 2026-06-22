import React from 'react';
import { useAppStore } from '@/store';
import { getUrgencyBadgeClass, getUrgencyLabel } from '@/utils/expiryCalculator';
import { getMolecularTypeLabel, getMolecularTypeColor } from '@/utils/projectMatcher';
import { treatmentTypeLabels } from '@/utils/scriptGenerator';
import { Pencil, Trash2 } from 'lucide-react';

export const DataPreview: React.FC = () => {
  const { inventory, showPurchasePrice, updateInventory, deleteInventory } = useAppStore();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<number>(0);

  if (inventory.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-300">
        <p className="text-sm">暂无库存数据</p>
        <p className="text-xs mt-1">请先导入Excel文件或加载示例数据</p>
      </div>
    );
  }

  const handleStartEdit = (id: string, currentQuantity: number) => {
    setEditingId(id);
    setEditValue(currentQuantity);
  };

  const handleSaveEdit = (id: string) => {
    updateInventory(id, { remainingQuantity: Math.max(0, editValue) });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该批次吗？')) {
      deleteInventory(id);
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100">
            <th className="table-header text-left py-3 px-2">紧急度</th>
            <th className="table-header text-left py-3 px-2">品牌</th>
            <th className="table-header text-left py-3 px-2">规格</th>
            <th className="table-header text-left py-3 px-2">批号</th>
            <th className="table-header text-left py-3 px-2">类型</th>
            <th className="table-header text-center py-3 px-2">入库量</th>
            <th className="table-header text-center py-3 px-2">剩余量</th>
            <th className="table-header text-left py-3 px-2">到期日</th>
            <th className="table-header text-left py-3 px-2">距到期</th>
            {showPurchasePrice && (
              <th className="table-header text-right py-3 px-2">进价</th>
            )}
            <th className="table-header text-left py-3 px-2">处理方式</th>
            <th className="table-header text-center py-3 px-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr 
              key={item.id} 
              className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"
            >
              <td className="table-cell py-3 px-2">
                <span className={getUrgencyBadgeClass(item.urgency)}>
                  {getUrgencyLabel(item.urgency)}
                </span>
              </td>
              <td className="table-cell py-3 px-2 font-medium">{item.brand}</td>
              <td className="table-cell py-3 px-2">{item.specification}</td>
              <td className="table-cell py-3 px-2 font-mono text-xs">{item.batchNumber}</td>
              <td className="table-cell py-3 px-2">
                <span className={`badge ${getMolecularTypeColor(item.molecularType)}`}>
                  {getMolecularTypeLabel(item.molecularType)}
                </span>
              </td>
              <td className="table-cell py-3 px-2 text-center font-mono">{item.quantity}</td>
              <td className="table-cell py-3 px-2 text-center">
                {editingId === item.id ? (
                  <div className="flex items-center gap-1 justify-center">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-16 input-field text-center py-1 text-xs"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="p-1 text-success-500 hover:bg-success-50 rounded"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-danger-500 hover:bg-danger-50 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span 
                    className={`font-mono font-medium cursor-pointer hover:text-primary-500 ${
                      item.remainingQuantity === 0 ? 'text-neutral-300 line-through' : 
                      item.urgency === 'danger' ? 'text-danger-500' :
                      item.urgency === 'warning' ? 'text-warning-500' : 'text-neutral-500'
                    }`}
                    onClick={() => handleStartEdit(item.id, item.remainingQuantity)}
                  >
                    {item.remainingQuantity}
                  </span>
                )}
              </td>
              <td className="table-cell py-3 px-2 font-mono text-xs">{item.expiryDate}</td>
              <td className={`table-cell py-3 px-2 font-mono ${
                item.daysUntilExpiry <= 30 ? 'text-danger-500 font-medium' :
                item.daysUntilExpiry <= 90 ? 'text-warning-500' :
                'text-neutral-400'
              }`}>
                {item.daysUntilExpiry <= 0 ? '已过期' : `${item.daysUntilExpiry}天`}
              </td>
              {showPurchasePrice && (
                <td className="table-cell py-3 px-2 text-right font-mono">
                  {item.purchasePrice ? `¥${item.purchasePrice}` : '-'}
                </td>
              )}
              <td className="table-cell py-3 px-2">
                {item.treatmentType ? (
                  <span className="badge badge-primary">
                    {treatmentTypeLabels[item.treatmentType]}
                  </span>
                ) : (
                  <span className="text-neutral-300 text-xs">正常销售</span>
                )}
              </td>
              <td className="table-cell py-3 px-2">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleStartEdit(item.id, item.remainingQuantity)}
                    className="p-1.5 text-neutral-300 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors"
                    title="编辑数量"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-neutral-300 hover:text-danger-500 hover:bg-danger-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
