import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  InventoryItem, 
  ConsumptionRecord, 
  ColumnMapping,
  ParsedExcelRow,
  TreatmentType
} from '@/types';
import { 
  calculateDaysUntilExpiry, 
  getUrgencyLevel, 
  calculateSuggestedConsumeDate,
  generateId 
} from '@/utils/expiryCalculator';
import { generateSampleData } from '@/utils/excelParser';
import dayjs from 'dayjs';

interface AppState {
  inventory: InventoryItem[];
  consumptionRecords: ConsumptionRecord[];
  dailyGoal: number;
  showPurchasePrice: boolean;
  currentMonth: string;
  selectedCalendarDate: string | null;
  
  parsedHeaders: string[];
  parsedRows: ParsedExcelRow[];
  columnMapping: ColumnMapping;
  showImportModal: boolean;
  showFieldMapper: boolean;
  
  addInventory: (items: InventoryItem[]) => void;
  updateInventory: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventory: (id: string) => void;
  addConsumption: (record: Omit<ConsumptionRecord, 'id' | 'createdAt'>) => void;
  updateConsumption: (id: string, updates: Partial<ConsumptionRecord>) => void;
  deleteConsumption: (id: string) => void;
  setDailyGoal: (goal: number) => void;
  togglePriceVisibility: () => void;
  setCurrentMonth: (month: string) => void;
  setSelectedCalendarDate: (date: string | null) => void;
  markTreatment: (id: string, treatmentType: TreatmentType, remark: string) => void;
  
  setParsedData: (headers: string[], rows: ParsedExcelRow[]) => void;
  setColumnMapping: (mapping: ColumnMapping) => void;
  setShowImportModal: (show: boolean) => void;
  setShowFieldMapper: (show: boolean) => void;
  confirmImport: () => void;
  loadSampleData: () => void;
  
  refreshInventoryUrgency: () => void;
  clearAllData: () => void;
}

const defaultColumnMapping: ColumnMapping = {
  brand: null,
  specification: null,
  batchNumber: null,
  quantity: null,
  expiryDate: null,
  purchasePrice: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      inventory: [],
      consumptionRecords: [],
      dailyGoal: 5,
      showPurchasePrice: true,
      currentMonth: dayjs().format('YYYY-MM'),
      selectedCalendarDate: null,
      
      parsedHeaders: [],
      parsedRows: [],
      columnMapping: defaultColumnMapping,
      showImportModal: false,
      showFieldMapper: false,

      addInventory: (items) => {
        set((state) => ({
          inventory: [...state.inventory, ...items].sort(
            (a, b) => a.daysUntilExpiry - b.daysUntilExpiry
          ),
        }));
      },

      updateInventory: (id, updates) => {
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
        get().refreshInventoryUrgency();
      },

      deleteInventory: (id) => {
        set((state) => ({
          inventory: state.inventory.filter((item) => item.id !== id),
        }));
      },

      addConsumption: (record) => {
        const newRecord: ConsumptionRecord = {
          ...record,
          id: generateId(),
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
        
        set((state) => ({
          consumptionRecords: [...state.consumptionRecords, newRecord],
        }));
        
        if (record.status === 'completed') {
          const item = get().inventory.find(i => i.id === record.inventoryId);
          if (item && item.remainingQuantity > 0) {
            get().updateInventory(record.inventoryId, {
              remainingQuantity: Math.max(0, item.remainingQuantity - 1),
            });
          }
        }
      },

      updateConsumption: (id, updates) => {
        const oldRecord = get().consumptionRecords.find(r => r.id === id);
        if (!oldRecord) return;
        
        const newStatus = updates.status;
        const oldStatus = oldRecord.status;
        
        set((state) => ({
          consumptionRecords: state.consumptionRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
        
        if (newStatus !== undefined && newStatus !== oldStatus) {
          const item = get().inventory.find(i => i.id === oldRecord.inventoryId);
          if (!item) return;
          
          if (newStatus === 'completed' && oldStatus !== 'completed') {
            if (item.remainingQuantity > 0) {
              get().updateInventory(oldRecord.inventoryId, {
                remainingQuantity: Math.max(0, item.remainingQuantity - 1),
              });
            }
          }
          
          if (oldStatus === 'completed' && newStatus !== 'completed') {
            get().updateInventory(oldRecord.inventoryId, {
              remainingQuantity: item.remainingQuantity + 1,
            });
          }
        }
      },

      deleteConsumption: (id) => {
        const record = get().consumptionRecords.find(r => r.id === id);
        
        set((state) => ({
          consumptionRecords: state.consumptionRecords.filter((r) => r.id !== id),
        }));
        
        if (record && record.status === 'completed') {
          const item = get().inventory.find(i => i.id === record.inventoryId);
          if (item) {
            get().updateInventory(record.inventoryId, {
              remainingQuantity: item.remainingQuantity + 1,
            });
          }
        }
      },

      setDailyGoal: (goal) => {
        set({ dailyGoal: goal });
      },

      togglePriceVisibility: () => {
        set((state) => ({ showPurchasePrice: !state.showPurchasePrice }));
      },

      setCurrentMonth: (month) => {
        set({ currentMonth: month });
      },

      setSelectedCalendarDate: (date) => {
        set({ selectedCalendarDate: date });
      },

      markTreatment: (id, treatmentType, remark) => {
        get().updateInventory(id, {
          treatmentType,
          treatmentRemark: remark,
        });
      },

      setParsedData: (headers, rows) => {
        set({ parsedHeaders: headers, parsedRows: rows });
      },

      setColumnMapping: (mapping) => {
        set({ columnMapping: mapping });
      },

      setShowImportModal: (show) => {
        set({ showImportModal: show });
      },

      setShowFieldMapper: (show) => {
        set({ showFieldMapper: show });
      },

      confirmImport: () => {
        const { parsedRows, columnMapping, addInventory } = get();
        
        const items: InventoryItem[] = [];
        
        for (const row of parsedRows) {
          const brand = columnMapping.brand ? String(row[columnMapping.brand] || '') : '';
          const specification = columnMapping.specification ? String(row[columnMapping.specification] || '') : '';
          const batchNumber = columnMapping.batchNumber ? String(row[columnMapping.batchNumber] || '') : '';
          const quantityRaw = columnMapping.quantity ? row[columnMapping.quantity] : undefined;
          const expiryDateRaw = columnMapping.expiryDate ? row[columnMapping.expiryDate] : undefined;
          const purchasePriceRaw = columnMapping.purchasePrice ? row[columnMapping.purchasePrice] : undefined;

          if (!brand || !expiryDateRaw) continue;

          const quantity = typeof quantityRaw === 'number' ? quantityRaw : parseInt(String(quantityRaw || '1'), 10);
          if (isNaN(quantity) || quantity <= 0) continue;

          let expiryDate = String(expiryDateRaw);
          if (typeof expiryDateRaw === 'number') {
            expiryDate = dayjs('1899-12-30').add(expiryDateRaw, 'day').format('YYYY-MM-DD');
          } else {
            const parsed = dayjs(expiryDateRaw);
            if (parsed.isValid()) {
              expiryDate = parsed.format('YYYY-MM-DD');
            }
          }

          const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);

          const molecularType = detectMolecularType(brand, specification);

          items.push({
            id: generateId(),
            brand: brand.trim(),
            specification: specification.trim(),
            batchNumber: batchNumber.trim(),
            quantity,
            remainingQuantity: quantity,
            expiryDate,
            purchasePrice: purchasePriceRaw !== undefined ? Number(purchasePriceRaw) : undefined,
            molecularType,
            importDate: dayjs().format('YYYY-MM-DD'),
            urgency: getUrgencyLevel(daysUntilExpiry),
            daysUntilExpiry,
            suggestedConsumeDate: calculateSuggestedConsumeDate(expiryDate),
          });
        }

        addInventory(items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry));
        
        set({
          parsedHeaders: [],
          parsedRows: [],
          columnMapping: defaultColumnMapping,
          showImportModal: false,
          showFieldMapper: false,
        });
      },

      loadSampleData: () => {
        const sample = generateSampleData();
        set({ inventory: sample });
        
        const sampleRecords: ConsumptionRecord[] = [
          {
            id: generateId(),
            inventoryId: sample[0].id,
            customerName: '张女士',
            appointmentDate: dayjs().format('YYYY-MM-DD'),
            status: 'appointment',
            projectType: '隆鼻',
            createdAt: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
          },
          {
            id: generateId(),
            inventoryId: sample[1].id,
            customerName: '李女士',
            appointmentDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
            status: 'appointment',
            projectType: '鼻唇沟填充',
            createdAt: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
          },
          {
            id: generateId(),
            inventoryId: sample[0].id,
            customerName: '王女士',
            appointmentDate: dayjs().format('YYYY-MM-DD'),
            status: 'completed',
            projectType: '丰下巴',
            createdAt: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
          },
        ];
        
        set({ consumptionRecords: sampleRecords });
      },

      refreshInventoryUrgency: () => {
        set((state) => ({
          inventory: state.inventory.map((item) => {
            const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
            return {
              ...item,
              daysUntilExpiry,
              urgency: getUrgencyLevel(daysUntilExpiry),
            };
          }).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
        }));
      },

      clearAllData: () => {
        set({
          inventory: [],
          consumptionRecords: [],
          dailyGoal: 5,
        });
      },
    }),
    {
      name: 'hyaluronic-acid-dashboard-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inventory: state.inventory,
        consumptionRecords: state.consumptionRecords,
        dailyGoal: state.dailyGoal,
        showPurchasePrice: state.showPurchasePrice,
      }),
      onRehydrateStorage: () => (state) => {
        state?.refreshInventoryUrgency();
      },
    }
  )
);

const molecularTypeMapping: Record<string, 'macromolecule' | 'medium' | 'micromolecule'> = {
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

const brandMolecularHints: Record<string, 'macromolecule' | 'medium' | 'micromolecule'> = {
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

function detectMolecularType(brand: string, specification: string): 'macromolecule' | 'medium' | 'micromolecule' {
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
