export type MolecularType = 'macromolecule' | 'medium' | 'micromolecule';

export type UrgencyLevel = 'safe' | 'attention' | 'warning' | 'danger' | 'expired';

export type ConsumptionStatus = 'appointment' | 'completed' | 'cancelled';

export type TreatmentType = 'staff_purchase' | 'customer_return' | 'combo_project';

export interface InventoryItem {
  id: string;
  brand: string;
  specification: string;
  batchNumber: string;
  quantity: number;
  remainingQuantity: number;
  expiryDate: string;
  purchasePrice?: number;
  molecularType: MolecularType;
  importDate: string;
  urgency: UrgencyLevel;
  daysUntilExpiry: number;
  suggestedConsumeDate: string;
  treatmentType?: TreatmentType;
  treatmentRemark?: string;
}

export interface ConsumptionRecord {
  id: string;
  inventoryId: string;
  customerName: string;
  appointmentDate: string;
  status: ConsumptionStatus;
  projectType: string;
  rejectionReason?: string;
  followUpDate?: string;
  alternativeProject?: string;
  followUpRemark?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MatchedProject {
  id: string;
  name: string;
  area: string;
  suggestedDosage: string;
  suitableMolecularTypes: MolecularType[];
  description: string;
  notRecommendedScenarios: string[];
  keyPromotionPoints: string[];
  combinationPlans: CombinationPlan[];
}

export interface CombinationPlan {
  id: string;
  name: string;
  description: string;
  benefit: string;
  suitableCustomerTypes: string[];
}

export interface CalendarSidebarData {
  date: string;
  items: InventoryItem[];
  records: ConsumptionRecord[];
}

export interface ScriptCard {
  id: string;
  productBrand: string;
  title: string;
  content: string;
  isKeyPromotion: boolean;
  warnings: string[];
  molecularType: MolecularType;
}

export interface DailyGoal {
  date: string;
  targetQuantity: number;
}

export interface ParsedExcelRow {
  brand?: string;
  specification?: string;
  batchNumber?: string;
  quantity?: number;
  expiryDate?: string;
  purchasePrice?: number;
  [key: string]: string | number | undefined;
}

export interface ColumnMapping {
  brand: string | null;
  specification: string | null;
  batchNumber: string | null;
  quantity: string | null;
  expiryDate: string | null;
  purchasePrice: string | null;
}

export interface PressureStats {
  totalRemaining: number;
  urgentCount: number;
  warningCount: number;
  attentionCount: number;
  dailyAverageNeed: number;
  todayConsumed: number;
  todayAppointments: number;
  todayGoal: number;
  completionRate: number;
}

export interface CalendarDayData {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  items: InventoryItem[];
  maxUrgency: UrgencyLevel | null;
}
