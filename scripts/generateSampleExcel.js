import XLSX from 'xlsx';
import dayjs from 'dayjs';

const sampleData = [
  {
    '品牌': '乔雅登',
    '规格': '丰颜 1ml',
    '批号': 'FY202501001',
    '数量': 10,
    '到期日': dayjs().add(25, 'day').format('YYYY-MM-DD'),
    '进价': 2800
  },
  {
    '品牌': '乔雅登',
    '规格': '雅致 0.8ml',
    '批号': 'YZ202502003',
    '数量': 8,
    '到期日': dayjs().add(45, 'day').format('YYYY-MM-DD'),
    '进价': 2200
  },
  {
    '品牌': '艾莉薇',
    '规格': '传奇 1ml',
    '批号': 'CQ202503005',
    '数量': 12,
    '到期日': dayjs().add(75, 'day').format('YYYY-MM-DD'),
    '进价': 1800
  },
  {
    '品牌': '瑞蓝',
    '规格': '瑞蓝2号 1ml',
    '批号': 'RL202506008',
    '数量': 15,
    '到期日': dayjs().add(120, 'day').format('YYYY-MM-DD'),
    '进价': 1500
  },
  {
    '品牌': '濡白天使',
    '规格': '0.75ml',
    '批号': 'RT202508012',
    '数量': 6,
    '到期日': dayjs().add(200, 'day').format('YYYY-MM-DD'),
    '进价': 3200
  },
  {
    '品牌': '嗨体',
    '规格': '1.5ml',
    '批号': 'HT202510015',
    '数量': 20,
    '到期日': dayjs().add(300, 'day').format('YYYY-MM-DD'),
    '进价': 800
  },
  {
    '品牌': '伊婉',
    '规格': 'V 1ml',
    '批号': 'YW202504020',
    '数量': 8,
    '到期日': dayjs().add(15, 'day').format('YYYY-MM-DD'),
    '进价': 1200
  },
  {
    '品牌': '法思丽',
    '规格': '1ml',
    '批号': 'FSL202509003',
    '数量': 10,
    '到期日': dayjs().add(90, 'day').format('YYYY-MM-DD'),
    '进价': 1600
  }
];

const worksheet = XLSX.utils.json_to_sheet(sampleData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, '库存数据');

worksheet['!cols'] = [
  { wch: 12 },
  { wch: 15 },
  { wch: 18 },
  { wch: 8 },
  { wch: 12 },
  { wch: 10 }
];

XLSX.writeFile(workbook, '玻尿酸库存模板.xlsx');
console.log('✅ 示例Excel模板已生成: 玻尿酸库存模板.xlsx');
