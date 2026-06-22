import type { MatchedProject, MolecularType, InventoryItem } from '@/types';

export const matchedProjects: MatchedProject[] = [
  {
    id: 'p1',
    name: '隆鼻',
    area: '鼻子',
    suggestedDosage: '1-2ml',
    suitableMolecularTypes: ['macromolecule'],
    description: '通过大分子玻尿酸塑形鼻梁和鼻尖，改善鼻型',
  },
  {
    id: 'p2',
    name: '丰下巴',
    area: '下巴',
    suggestedDosage: '1-2ml',
    suitableMolecularTypes: ['macromolecule'],
    description: '延长和翘挺下巴，改善面部轮廓比例',
  },
  {
    id: 'p3',
    name: '下颌缘提升',
    area: '下颌线',
    suggestedDosage: '2-4ml',
    suitableMolecularTypes: ['macromolecule'],
    description: '轮廓固定，提升下颌缘线条，改善松弛',
  },
  {
    id: 'p4',
    name: '眉骨塑形',
    area: '眉骨',
    suggestedDosage: '0.5-1ml',
    suitableMolecularTypes: ['macromolecule'],
    description: '垫高眉骨，加深眼窝，提升眼部立体感',
  },
  {
    id: 'p5',
    name: '鼻唇沟填充',
    area: '鼻唇沟',
    suggestedDosage: '1-2ml',
    suitableMolecularTypes: ['medium'],
    description: '改善法令纹，减轻岁月痕迹',
  },
  {
    id: 'p6',
    name: '太阳穴填充',
    area: '太阳穴',
    suggestedDosage: '1-2ml/侧',
    suitableMolecularTypes: ['medium'],
    description: '填充凹陷太阳穴，改善面部轮廓流畅度',
  },
  {
    id: 'p7',
    name: '苹果肌填充',
    area: '苹果肌',
    suggestedDosage: '1-2ml',
    suitableMolecularTypes: ['medium'],
    description: '打造饱满苹果肌，减龄显幼态',
  },
  {
    id: 'p8',
    name: '面颊填充',
    area: '面颊',
    suggestedDosage: '2-4ml',
    suitableMolecularTypes: ['medium'],
    description: '填充凹陷面颊，改善面部消瘦感',
  },
  {
    id: 'p9',
    name: '泪沟填充',
    area: '泪沟',
    suggestedDosage: '0.5-1ml/侧',
    suitableMolecularTypes: ['micromolecule', 'medium'],
    description: '填平泪沟，改善黑眼圈和疲惫感',
  },
  {
    id: 'p10',
    name: '丰唇',
    area: '嘴唇',
    suggestedDosage: '0.5-1ml',
    suitableMolecularTypes: ['micromolecule', 'medium'],
    description: '打造饱满唇形，改善唇纹',
  },
  {
    id: 'p11',
    name: '颈部除皱',
    area: '颈部',
    suggestedDosage: '1-2ml',
    suitableMolecularTypes: ['micromolecule'],
    description: '改善颈纹，紧致颈部肌肤',
  },
  {
    id: 'p12',
    name: '手部年轻化',
    area: '手部',
    suggestedDosage: '1-2ml/手',
    suitableMolecularTypes: ['micromolecule'],
    description: '填充手部凹陷，改善青筋暴露',
  },
  {
    id: 'p13',
    name: '全脸轮廓固定',
    area: '全面部',
    suggestedDosage: '4-8ml',
    suitableMolecularTypes: ['macromolecule', 'medium'],
    description: '多部位联合注射，打造紧致年轻轮廓',
  },
];

export const comboProjects = [
  { id: 'c1', name: '热玛吉联合', benefit: '提升紧致叠加填充，效果更持久' },
  { id: 'c2', name: 'Fotona 4D联合', benefit: '光电刺激胶原+玻尿酸填充，1+1>2' },
  { id: 'c3', name: '水光针联合', benefit: '深层补水+轮廓塑形，肤质轮廓双提升' },
  { id: 'c4', name: '肉毒素联合', benefit: '动态纹+静态纹联合改善，效果更全面' },
];

export function matchProjectsForItem(item: InventoryItem): MatchedProject[] {
  return matchedProjects.filter(p => 
    p.suitableMolecularTypes.includes(item.molecularType)
  );
}

export function getMolecularTypeLabel(type: MolecularType): string {
  switch (type) {
    case 'macromolecule': return '大分子（塑形）';
    case 'medium': return '中分子（填充）';
    case 'micromolecule': return '小分子（补水）';
    default: return '未知';
  }
}

export function getMolecularTypeColor(type: MolecularType): string {
  switch (type) {
    case 'macromolecule': return 'text-primary-500 bg-primary-50';
    case 'medium': return 'text-caution-500 bg-caution-50';
    case 'micromolecule': return 'text-success-500 bg-success-50';
    default: return 'text-neutral-500 bg-neutral-50';
  }
}
