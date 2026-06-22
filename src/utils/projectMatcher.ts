import type { MatchedProject, MolecularType, InventoryItem, CombinationPlan } from '@/types';

export const combinationPlans: CombinationPlan[] = [
  {
    id: 'cp1',
    name: '中下面部年轻化组合',
    description: '鼻唇沟+苹果肌+下颌缘联合治疗',
    benefit: '改善面部松垂，重现年轻轮廓线',
    suitableCustomerTypes: ['35+岁初老人群', '面部轻度松弛者', '追求自然抗衰者']
  },
  {
    id: 'cp2',
    name: '立体轮廓组合',
    description: '隆鼻+丰下巴+眉骨塑形',
    benefit: '打造立体五官，提升面部立体感',
    suitableCustomerTypes: ['面部扁平者', '追求精致轮廓者', '年轻求美者']
  },
  {
    id: 'cp3',
    name: '倦容改善组合',
    description: '泪沟+苹果肌+太阳穴',
    benefit: '改善疲惫感，打造元气少女脸',
    suitableCustomerTypes: ['熬夜党', '工作压力大者', '25-35岁轻熟龄']
  },
  {
    id: 'cp4',
    name: '抗衰老联合治疗',
    description: '热玛吉/Fotona + 玻尿酸填充',
    benefit: '光电紧致+填充塑形，效果1+1>2',
    suitableCustomerTypes: ['40+岁熟龄肌', '松弛明显者', '追求极致抗衰者']
  },
  {
    id: 'cp5',
    name: '全身年轻化组合',
    description: '面部填充+颈部除皱+手部年轻化',
    benefit: '全面部+颈部+手部联合，年龄成谜',
    suitableCustomerTypes: ['注重细节保养者', '高端求美者', '45+岁人群']
  },
];

export const matchedProjects: MatchedProject[] = [
  {
    id: 'p1',
    name: '隆鼻',
    area: '鼻子',
    suggestedDosage: '1-2ml',
    suitableMolecularTypes: ['macromolecule'],
    description: '通过大分子玻尿酸塑形鼻梁和鼻尖，改善鼻型',
    notRecommendedScenarios: [
      '鼻部皮肤较薄者（易出现透光）',
      '鼻基础极差者（建议假体）',
      '正在感冒/鼻炎发作期'
    ],
    keyPromotionPoints: [
      '无需手术，午休式美容',
      '效果立竿见影，即刻可见',
      '大分子塑形好，维持时间久'
    ],
    combinationPlans: [combinationPlans[1]]
  },
  {
    id: 'p2',
    name: '丰下巴',
    area: '下巴',
    suggestedDosage: '1-2ml',
    suitableMolecularTypes: ['macromolecule'],
    description: '延长和翘挺下巴，改善面部轮廓比例',
    notRecommendedScenarios: [
      '下巴后缩严重者',
      '咬合关系异常者',
      '口腔有炎症者'
    ],
    keyPromotionPoints: [
      '微调比例，提升侧颜杀',
      '大分子支撑力强，效果自然',
      '随做随走，不影响生活'
    ],
    combinationPlans: [combinationPlans[1]]
  },
  {
    id: 'p3',
    name: '下颌缘提升',
    area: '下颌线',
    suggestedDosage: '2-4ml',
    suitableMolecularTypes: ['macromolecule'],
    description: '轮廓固定，提升下颌缘线条，改善松弛',
    notRecommendedScenarios: [
      '面部脂肪过多者',
      '重度松弛下垂（建议手术）',
      '皮肤有感染病灶者'
    ],
    keyPromotionPoints: [
      '少女线/赫本线打造',
      '改善羊腮，显小V脸',
      '联合热玛吉效果更佳'
    ],
    combinationPlans: [combinationPlans[0], combinationPlans[3]]
  },
  {
    id: 'p4',
    name: '眉骨塑形',
    area: '眉骨',
    suggestedDosage: '0.5-1ml',
    suitableMolecularTypes: ['macromolecule'],
    description: '垫高眉骨，加深眼窝，提升眼部立体感',
    notRecommendedScenarios: [
      '眼球突出者',
      '眉部有外伤史者',
      '上睑皮肤极度松弛者'
    ],
    keyPromotionPoints: [
      '打造深邃混血感眼窝',
      '改善眼皮松弛下垂',
      '眼神更有神，提升气质'
    ],
    combinationPlans: [combinationPlans[1]]
  },
  {
    id: 'p5',
    name: '鼻唇沟填充',
    area: '鼻唇沟',
    suggestedDosage: '1-2ml',
    suitableMolecularTypes: ['medium'],
    description: '改善法令纹，减轻岁月痕迹',
    notRecommendedScenarios: [
      '面中部严重凹陷者',
      '牙龈突出导致的法令纹',
      '面部有感染病灶者'
    ],
    keyPromotionPoints: [
      '减龄神器，年轻5-10岁',
      '中分子触感自然，无异物感',
      '笑起来更自然'
    ],
    combinationPlans: [combinationPlans[0]]
  },
  {
    id: 'p6',
    name: '太阳穴填充',
    area: '太阳穴',
    suggestedDosage: '1-2ml/侧',
    suitableMolecularTypes: ['medium'],
    description: '填充凹陷太阳穴，改善面部轮廓流畅度',
    notRecommendedScenarios: [
      '颞部血管畸形者',
      '凝血功能障碍者',
      '极度消瘦者'
    ],
    keyPromotionPoints: [
      '改善刻薄相，打造饱满福相',
      '脸型更流畅，扎发更好看',
      '中分子柔软自然'
    ],
    combinationPlans: [combinationPlans[2]]
  },
  {
    id: 'p7',
    name: '苹果肌填充',
    area: '苹果肌',
    suggestedDosage: '1-2ml',
    suitableMolecularTypes: ['medium'],
    description: '打造饱满苹果肌，减龄显幼态',
    notRecommendedScenarios: [
      '苹果肌过于肥大者',
      '面中部下垂明显者',
      '有玻尿酸移位史者'
    ],
    keyPromotionPoints: [
      '元气少女感秘诀',
      '笑起来更甜美可人',
      '改善苦相，提升亲和力'
    ],
    combinationPlans: [combinationPlans[0], combinationPlans[2]]
  },
  {
    id: 'p8',
    name: '面颊填充',
    area: '面颊',
    suggestedDosage: '2-4ml',
    suitableMolecularTypes: ['medium'],
    description: '填充凹陷面颊，改善面部消瘦感',
    notRecommendedScenarios: [
      '婴儿肥明显者',
      '咬肌肥大者',
      '面部有炎症者'
    ],
    keyPromotionPoints: [
      '告别干瘪，恢复饱满',
      '改善面部凹陷崎岖感',
      '拍照更上镜'
    ],
    combinationPlans: [combinationPlans[0]]
  },
  {
    id: 'p9',
    name: '泪沟填充',
    area: '泪沟',
    suggestedDosage: '0.5-1ml/侧',
    suitableMolecularTypes: ['micromolecule', 'medium'],
    description: '填平泪沟，改善黑眼圈和疲惫感',
    notRecommendedScenarios: [
      '眼袋严重者（建议先去眼袋）',
      '眼部有炎症者',
      '近期做过眼部手术者'
    ],
    keyPromotionPoints: [
      '告别憔悴倦容',
      '改善黑眼圈视觉效果',
      '小分子更柔软，不硬结'
    ],
    combinationPlans: [combinationPlans[2]]
  },
  {
    id: 'p10',
    name: '丰唇',
    area: '嘴唇',
    suggestedDosage: '0.5-1ml',
    suitableMolecularTypes: ['micromolecule', 'medium'],
    description: '打造饱满唇形，改善唇纹',
    notRecommendedScenarios: [
      '唇部有疱疹/炎症者',
      '唇部过薄且皮肤极度松弛者',
      '对效果有不切实际期望者'
    ],
    keyPromotionPoints: [
      '打造性感M唇/嘟嘟唇',
      '改善唇纹，水润饱满',
      '微笑唇形，提升魅力'
    ],
    combinationPlans: []
  },
  {
    id: 'p11',
    name: '颈部除皱',
    area: '颈部',
    suggestedDosage: '1-2ml',
    suitableMolecularTypes: ['micromolecule'],
    description: '改善颈纹，紧致颈部肌肤',
    notRecommendedScenarios: [
      '颈部皮肤有感染灶者',
      '甲状腺疾病患者（需咨询医生）',
      '重度皮肤松弛者'
    ],
    keyPromotionPoints: [
      '告别火鸡脖，显露天鹅颈',
      '颈纹是年龄的泄密者',
      '小分子补水保湿双功效'
    ],
    combinationPlans: [combinationPlans[4]]
  },
  {
    id: 'p12',
    name: '手部年轻化',
    area: '手部',
    suggestedDosage: '1-2ml/手',
    suitableMolecularTypes: ['micromolecule'],
    description: '填充手部凹陷，改善青筋暴露',
    notRecommendedScenarios: [
      '手部有皮肤病者',
      '近期做过手部手术者',
      '凝血功能障碍者'
    ],
    keyPromotionPoints: [
      '手是第二张脸',
      '改善青筋暴露和干瘪',
      '双手更显年轻水润'
    ],
    combinationPlans: [combinationPlans[4]]
  },
  {
    id: 'p13',
    name: '全脸轮廓固定',
    area: '全面部',
    suggestedDosage: '4-8ml',
    suitableMolecularTypes: ['macromolecule', 'medium'],
    description: '多部位联合注射，打造紧致年轻轮廓',
    notRecommendedScenarios: [
      '面部有严重感染病灶者',
      '怀孕/哺乳期',
      '免疫系统疾病患者'
    ],
    keyPromotionPoints: [
      '韧带锚定技术，提升效果更持久',
      '多点位注射，面部自然不僵硬',
      '一次治疗，全面部年轻化'
    ],
    combinationPlans: [combinationPlans[0], combinationPlans[3]]
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
