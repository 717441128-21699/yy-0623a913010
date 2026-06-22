import type { ScriptCard, MolecularType, InventoryItem } from '@/types';
import { generateId } from './expiryCalculator';

const forbiddenWords = ['永久', '无痕', '100%', '彻底', '永不', '神效', '无敌', '根治'];

const warningTemplate = [
  '效果因人而异，需根据个人情况评估',
  '请在正规医疗机构由专业医师操作',
  '术后可能出现轻微红肿，属正常反应',
  '孕期、哺乳期及过敏体质者不建议使用',
];

const scriptTemplates: Record<MolecularType, { title: string; content: string }[]> = {
  macromolecule: [
    {
      title: '轮廓塑形方案',
      content: '这款产品是大分子玻尿酸，塑形效果好，支撑力强，非常适合做鼻子、下巴、下颌缘等部位的轮廓塑形。它的黏性和弹性都很好，术后形态自然，维持时间也比较理想。现在有临期优惠，性价比很高。',
    },
    {
      title: '轮廓固定抗衰',
      content: '我们现在主推的这款大分子玻尿酸，非常适合做轮廓固定。通过深层注射，可以对松弛的组织进行复位和支撑，改善面部下垂问题。和其他部位联合治疗，能达到整体年轻化的效果。',
    },
  ],
  medium: [
    {
      title: '凹陷填充方案',
      content: '这款中分子玻尿酸软硬适中，非常适合填充鼻唇沟、太阳穴、苹果肌等部位的凹陷。填充后效果自然，不会有僵硬感。现在库存充足但效期临近，有特别优惠活动。',
    },
    {
      title: '柔和年轻化',
      content: '中分子玻尿酸是填充的首选，它能很好地改善面部凹陷问题，让您看起来更饱满年轻。和光电项目联合治疗，效果会更持久。这段时间我们在做效期管理，价格非常合适。',
    },
  ],
  micromolecule: [
    {
      title: '精细部位填充',
      content: '这款小分子玻尿酸质地柔软，非常适合泪沟、嘴唇、颈部等精细部位的填充。它的颗粒很细，注射后表面平整，不会有颗粒感。现在有活动，是尝试的好时机。',
    },
    {
      title: '肤质改善方案',
      content: '小分子玻尿酸不仅可以填充，还能改善肤质。它可以给真皮层补充水分，让皮肤看起来更水润有光泽。眼周、口周的细纹都可以用它来改善。',
    },
  ],
};

export function validateCompliance(text: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  for (const word of forbiddenWords) {
    if (text.includes(word)) {
      issues.push(`包含违禁词："${word}"`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

export function generateScriptsForItem(item: InventoryItem): ScriptCard[] {
  const templates = scriptTemplates[item.molecularType] || scriptTemplates.medium;
  const isKeyPromotion = item.urgency === 'danger' || item.urgency === 'warning';
  
  return templates.map((template, index) => ({
    id: generateId(),
    productBrand: item.brand,
    title: template.title,
    content: template.content,
    isKeyPromotion: isKeyPromotion && index === 0,
    warnings: warningTemplate,
    molecularType: item.molecularType,
  }));
}

export function generateAllScripts(items: InventoryItem[]): ScriptCard[] {
  const scripts: ScriptCard[] = [];
  
  const sortedItems = [...items].sort((a, b) => {
    const urgencyOrder = { danger: 0, warning: 1, attention: 2, safe: 3, expired: 4 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
  
  for (const item of sortedItems) {
    if (item.remainingQuantity > 0 && item.urgency !== 'expired') {
      scripts.push(...generateScriptsForItem(item));
    }
  }
  
  return scripts;
}

export const rejectionReasons = [
  '价格太高',
  '担心效果',
  '担心安全',
  '需要回家考虑',
  '想再对比其他机构',
  '没时间做',
  '朋友不建议',
  '有其他安排',
  '害怕疼痛',
  '其他原因',
];

export const treatmentTypeLabels: Record<string, string> = {
  staff_purchase: '员工内购',
  customer_return: '老客回访',
  combo_project: '联合项目',
};
