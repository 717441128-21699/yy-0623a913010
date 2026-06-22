import * as XLSX from 'xlsx';
import type { ParsedExcelRow, ColumnMapping, InventoryItem, MolecularType } from '@/types';
import { 
  generateId, 
  parseDate, 
  calculateDaysUntilExpiry, 
  getUrgencyLevel, 
  calculateSuggestedConsumeDate 
} from './expiryCalculator';
import dayjs from 'dayjs';

const columnMatchRules: Record<keyof ColumnMapping, string[]> = {
  brand: ['品牌', '品名', '产品名称', 'product', 'name', '名称'],
  specification: ['规格', '型号', 'spec', '包装', '容量'],
  batchNumber: ['批号', '批次', 'batch', 'lot', '生产批号'],
  quantity: ['数量', '库存', '支数', 'qty', '数量(支)', '库存数量'],
  expiryDate: ['到期日', '有效期', '效期', 'expiry', '有效期至', '到期时间'],
  purchasePrice: ['进价', '成本', '单价', 'price', '进货价', '采购价'],
};

const molecularTypeMapping: Record<string, MolecularType> = {
  '大分子': 'macromolecule',
  '大': 'macromolecule',
  '塑形': 'macromolecule',
  '中分子': 'medium',
  '中': 'medium',
  '填充': 'medium',
  '小分子': 'micromolecule',
  '小': 'micromolecule',
  '补水': 'micromolecule',
  '水光': 'micromolecule',
};

const brandMolecularHints: Record<string, MolecularType> = {
  '乔雅登': 'medium',
  '雅致': 'medium',
  '极致': 'macromolecule',
  '丰颜': 'macromolecule',
  '缇颜': 'medium',
  '质颜': 'medium',
  '瑞蓝': 'medium',
  '瑞蓝2号': 'medium',
  '丽瑅': 'macromolecule',
  '维瑅': 'micromolecule',
  '艾莉薇': 'macromolecule',
  '传奇': 'macromolecule',
  '风尚': 'medium',
  '典雅': 'medium',
  '濡白天使': 'macromolecule',
  '宝尼达': 'macromolecule',
  '爱贝芙': 'macromolecule',
  '海薇': 'medium',
  '润百颜': 'medium',
  '润致': 'medium',
  '伊婉': 'medium',
  '伊婉C': 'medium',
  '伊婉V': 'macromolecule',
  '法思丽': 'macromolecule',
  '欣菲聆': 'medium',
  '舒颜': 'medium',
  '嗨体': 'micromolecule',
};

export function detectMolecularType(brand: string, specification: string): MolecularType {
  const combined = (brand + ' ' + specification).toLowerCase();
  
  for (const [keyword, type] of Object.entries(molecularTypeMapping)) {
    if (combined.includes(keyword.toLowerCase())) {
      return type;
    }
  }
  
  for (const [brandHint, type] of Object.entries(brandMolecularHints)) {
    if (combined.includes(brandHint.toLowerCase())) {
      return type;
    }
  }
  
  return 'medium';
}

export function autoDetectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    brand: null,
    specification: null,
    batchNumber: null,
    quantity: null,
    expiryDate: null,
    purchasePrice: null,
  };

  for (const [field, keywords] of Object.entries(columnMatchRules)) {
    for (const header of headers) {
      const headerLower = header.toLowerCase().trim();
      if (keywords.some(kw => headerLower.includes(kw.toLowerCase()))) {
        (mapping as unknown as Record<string, string | null>)[field] = header;
        break;
      }
    }
  }

  return mapping;
}

export async function parseExcelFile(file: File): Promise<{ headers: string[]; rows: ParsedExcelRow[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false }) as (string | number)[][];
        
        if (jsonData.length === 0) {
          reject(new Error('Excel文件为空'));
          return;
        }

        const headers = jsonData[0].map(h => String(h || '').trim());
        const rows: ParsedExcelRow[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const parsedRow: ParsedExcelRow = {};
          
          let hasData = false;
          headers.forEach((header, index) => {
            const value = row[index];
            if (value !== undefined && value !== null && value !== '') {
              parsedRow[header] = value;
              hasData = true;
            }
          });

          if (hasData) {
            rows.push(parsedRow);
          }
        }

        resolve({ headers, rows });
      } catch (error) {
        reject(new Error('Excel解析失败: ' + (error as Error).message));
      }
    };

    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsBinaryString(file);
  });
}

export function convertToInventoryItems(
  rows: ParsedExcelRow[],
  mapping: ColumnMapping
): InventoryItem[] {
  const items: InventoryItem[] = [];

  for (const row of rows) {
    const brand = mapping.brand ? String(row[mapping.brand] || '') : '';
    const specification = mapping.specification ? String(row[mapping.specification] || '') : '';
    const batchNumber = mapping.batchNumber ? String(row[mapping.batchNumber] || '') : '';
    const quantityRaw = mapping.quantity ? row[mapping.quantity] : undefined;
    const expiryDateRaw = mapping.expiryDate ? row[mapping.expiryDate] : undefined;
    const purchasePriceRaw = mapping.purchasePrice ? row[mapping.purchasePrice] : undefined;

    if (!brand || !expiryDateRaw) continue;

    const quantity = typeof quantityRaw === 'number' ? quantityRaw : parseInt(String(quantityRaw || '1'), 10);
    if (isNaN(quantity) || quantity <= 0) continue;

    const expiryDate = parseDate(String(expiryDateRaw));
    const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);

    const item: InventoryItem = {
      id: generateId(),
      brand: brand.trim(),
      specification: specification.trim(),
      batchNumber: batchNumber.trim(),
      quantity,
      remainingQuantity: quantity,
      expiryDate,
      purchasePrice: purchasePriceRaw !== undefined ? Number(purchasePriceRaw) : undefined,
      molecularType: detectMolecularType(brand, specification),
      importDate: dayjs().format('YYYY-MM-DD'),
      urgency: getUrgencyLevel(daysUntilExpiry),
      daysUntilExpiry,
      suggestedConsumeDate: calculateSuggestedConsumeDate(expiryDate),
    };

    items.push(item);
  }

  return items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

export function generateSampleData(): InventoryItem[] {
  const today = dayjs();
  
  const sampleBrands = [
    { brand: '乔雅登 丰颜', spec: '1ml/支', type: 'macromolecule' as MolecularType },
    { brand: '乔雅登 缇颜', spec: '1ml/支', type: 'medium' as MolecularType },
    { brand: '瑞蓝 丽瑅', spec: '1ml/支', type: 'macromolecule' as MolecularType },
    { brand: '艾莉薇 传奇', spec: '1ml/支', type: 'macromolecule' as MolecularType },
    { brand: '濡白天使', spec: '0.75g/支', type: 'macromolecule' as MolecularType },
    { brand: '嗨体', spec: '2.5ml/支', type: 'micromolecule' as MolecularType },
    { brand: '伊婉V', spec: '1ml/支', type: 'macromolecule' as MolecularType },
    { brand: '润百颜', spec: '1ml/支', type: 'medium' as MolecularType },
  ];

  const items: InventoryItem[] = [];
  
  sampleBrands.forEach((sample, index) => {
    const daysToAdd = [15, 45, 75, 120, 200, 60, 30, 100][index];
    const quantity = [10, 8, 15, 6, 12, 20, 5, 18][index];
    const remaining = [3, 5, 8, 4, 10, 12, 2, 15][index];
    const price = [3800, 3200, 2800, 2500, 4200, 680, 1800, 1200][index];
    
    const expiryDate = today.add(daysToAdd, 'day').format('YYYY-MM-DD');
    const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
    
    items.push({
      id: generateId(),
      brand: sample.brand,
      specification: sample.spec,
      batchNumber: `B${2024000 + index}`,
      quantity,
      remainingQuantity: remaining,
      expiryDate,
      purchasePrice: price,
      molecularType: sample.type,
      importDate: today.subtract(30 + index, 'day').format('YYYY-MM-DD'),
      urgency: getUrgencyLevel(daysUntilExpiry),
      daysUntilExpiry,
      suggestedConsumeDate: calculateSuggestedConsumeDate(expiryDate),
    });
  });

  return items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}
