import React, { useState, useMemo } from 'react';
import { 
  XCircle, Calendar, User, Syringe, 
  Lightbulb, Clock, CheckCircle, ArrowRight,
  RefreshCw, MessageSquare
} from 'lucide-react';
import { SectionCard } from '@/components/layout/SectionCard';
import { useAppStore } from '@/store';
import { matchedProjects } from '@/utils/projectMatcher';
import { getUrgencyBadgeClass, getUrgencyLabel } from '@/utils/expiryCalculator';
import type { ConsumptionRecord, InventoryItem, MatchedProject } from '@/types';

export const CancelledPool: React.FC = () => {
  const { 
    inventory, 
    consumptionRecords, 
    updateConsumption 
  } = useAppStore();
  
  const [selectedRecord, setSelectedRecord] = useState<ConsumptionRecord | null>(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [alternativeProject, setAlternativeProject] = useState('');
  const [followUpRemark, setFollowUpRemark] = useState('');

  const cancelledRecords = useMemo(() => {
    return consumptionRecords
      .filter(r => r.status === 'cancelled')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [consumptionRecords]);

  const getItemInfo = (inventoryId: string) => {
    return inventory.find(i => i.id === inventoryId);
  };

  const getAlternativeSuggestions = (record: ConsumptionRecord): MatchedProject[] => {
    const item = getItemInfo(record.inventoryId);
    if (!item) return [];
    
    const currentProject = record.projectType;
    
    const suggestions = matchedProjects.filter(p => {
      if (p.name === currentProject) return false;
      return p.suitableMolecularTypes.includes(item.molecularType);
    });
    
    return suggestions.slice(0, 3);
  };

  const handleOpenFollowUp = (record: ConsumptionRecord) => {
    setSelectedRecord(record);
    setFollowUpDate(record.followUpDate || '');
    setAlternativeProject(record.alternativeProject || '');
    setFollowUpRemark(record.followUpRemark || '');
    setShowFollowUpModal(true);
  };

  const handleSaveFollowUp = () => {
    if (!selectedRecord) return;
    
    updateConsumption(selectedRecord.id, {
      followUpDate: followUpDate || undefined,
      alternativeProject: alternativeProject || undefined,
      followUpRemark: followUpRemark || undefined,
    });
    
    setShowFollowUpModal(false);
    setSelectedRecord(null);
  };

  const handleReactivate = (record: ConsumptionRecord) => {
    updateConsumption(record.id, { status: 'appointment' });
  };

  const handleSelectAlternative = (projectName: string) => {
    setAlternativeProject(projectName);
  };

  const rejectionReasons = [
    '价格敏感',
    '担心效果',
    '时间不合适',
    '需要考虑',
    '怕疼',
    '朋友反对',
    '其他原因'
  ];

  return (
    <>
      <SectionCard 
        title="未成交回访池" 
        icon={<XCircle className="w-5 h-5 text-danger-500" />}
        extra={
          <span className="text-xs text-neutral-400">
            共 <span className="font-semibold text-danger-500">{cancelledRecords.length}</span> 位待回访
          </span>
        }
      >
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
          {cancelledRecords.length === 0 ? (
            <div className="text-center py-8 text-neutral-300">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">暂无未成交记录</p>
              <p className="text-xs mt-1">继续保持，争取全部成交！</p>
            </div>
          ) : (
            cancelledRecords.map(record => {
              const item = getItemInfo(record.inventoryId);
              const alternatives = getAlternativeSuggestions(record);
              
              return (
                <div 
                  key={record.id} 
                  className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-danger-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-danger-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-danger-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-700">{record.customerName}</p>
                        <p className="text-xs text-neutral-400">
                          {item?.brand} · {record.projectType}
                        </p>
                      </div>
                    </div>
                    {item && (
                      <span className={getUrgencyBadgeClass(item.urgency)}>
                        {getUrgencyLabel(item.urgency)}
                      </span>
                    )}
                  </div>
                  
                  {record.rejectionReason && (
                    <div className="mb-2 p-2 bg-danger-50 rounded-lg">
                      <p className="text-xs text-danger-600 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        未成交原因: {record.rejectionReason}
                      </p>
                    </div>
                  )}

                  {record.followUpDate && (
                    <div className="mb-2 p-2 bg-caution-50 rounded-lg">
                      <p className="text-xs text-caution-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        下次回访: {record.followUpDate}
                        {record.alternativeProject && (
                          <span className="ml-2">· 替代方案: {record.alternativeProject}</span>
                        )}
                      </p>
                    </div>
                  )}

                  {alternatives.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-neutral-500 mb-1.5 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-caution-500" />
                        建议替代项目:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {alternatives.map(alt => (
                          <span 
                            key={alt.id}
                            className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full"
                          >
                            {alt.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenFollowUp(record)}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-200 text-neutral-600 text-xs rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      回访跟进
                    </button>
                    <button
                      onClick={() => handleReactivate(record)}
                      className="flex-1 px-2.5 py-1.5 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      重新预约
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>

      {showFollowUpModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl animate-fade-in">
            <div className="p-4 border-b border-neutral-100">
              <h3 className="text-base font-semibold text-neutral-800">回访跟进设置</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{selectedRecord.customerName}</p>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                  下次回访时间
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                  推荐替代项目
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {getAlternativeSuggestions(selectedRecord).map(alt => (
                    <button
                      key={alt.id}
                      onClick={() => handleSelectAlternative(alt.name)}
                      className={`
                        px-2.5 py-1 text-xs rounded-full transition-colors
                        ${alternativeProject === alt.name
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }
                      `}
                    >
                      {alt.name}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={alternativeProject}
                  onChange={(e) => setAlternativeProject(e.target.value)}
                  placeholder="或手动输入其他项目"
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                  回访备注
                </label>
                <textarea
                  value={followUpRemark}
                  onChange={(e) => setFollowUpRemark(e.target.value)}
                  placeholder="记录客户偏好、关注点、异议点等..."
                  className="input text-sm min-h-[80px] resize-none"
                />
              </div>

              <div className="p-3 bg-caution-50 rounded-lg">
                <p className="text-xs font-medium text-caution-700 mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  回访话术建议
                </p>
                <p className="text-xs text-caution-600">
                  "XX姐/哥，上次您咨询的玻尿酸项目考虑得怎么样啦？
                  我们最近有个{alternativeProject || '联合治疗'}的方案特别适合您，
                  想跟您简单分享一下，看您什么时候方便？"
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 flex gap-2">
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-600 text-sm rounded-lg hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveFollowUp}
                className="flex-1 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
