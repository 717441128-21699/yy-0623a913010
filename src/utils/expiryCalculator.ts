import dayjs from 'dayjs';
import type { UrgencyLevel, InventoryItem, PressureStats, ConsumptionRecord } from '@/types';

export function getUrgencyLevel(daysUntilExpiry: number): UrgencyLevel {
  if (daysUntilExpiry <= 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'danger';
  if (daysUntilExpiry <= 90) return 'warning';
  if (daysUntilExpiry <= 180) return 'attention';
  return 'safe';
}

export function getUrgencyColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'expired': return 'bg-neutral-400';
    case 'danger': return 'bg-danger-500';
    case 'warning': return 'bg-warning-500';
    case 'attention': return 'bg-caution-500';
    case 'safe': return 'bg-success-500';
    default: return 'bg-neutral-300';
  }
}

export function getUrgencyTextColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'expired': return 'text-neutral-400';
    case 'danger': return 'text-danger-500';
    case 'warning': return 'text-warning-500';
    case 'attention': return 'text-caution-500';
    case 'safe': return 'text-success-500';
    default: return 'text-neutral-400';
  }
}

export function getUrgencyBadgeClass(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'expired': return 'badge bg-neutral-100 text-neutral-500';
    case 'danger': return 'badge badge-danger';
    case 'warning': return 'badge badge-warning';
    case 'attention': return 'badge badge-caution';
    case 'safe': return 'badge badge-success';
    default: return 'badge bg-neutral-100 text-neutral-500';
  }
}

export function getUrgencyLabel(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'expired': return '已过期';
    case 'danger': return '紧急(<30天)';
    case 'warning': return '临期(30-90天)';
    case 'attention': return '关注(90-180天)';
    case 'safe': return '安全(>180天)';
    default: return '未知';
  }
}

export function calculateDaysUntilExpiry(expiryDate: string): number {
  const today = dayjs().startOf('day');
  const expiry = dayjs(expiryDate).startOf('day');
  return expiry.diff(today, 'day');
}

export function calculateSuggestedConsumeDate(expiryDate: string): string {
  return dayjs(expiryDate).subtract(30, 'day').format('YYYY-MM-DD');
}

export function calculatePressureStats(
  items: InventoryItem[],
  consumptionRecords: ConsumptionRecord[],
  todayGoal: number
): PressureStats {
  const today = dayjs().format('YYYY-MM-DD');
  
  const totalRemaining = items.reduce((sum, item) => sum + item.remainingQuantity, 0);
  
  const urgentCount = items.filter(i => i.urgency === 'danger').reduce((sum, i) => sum + i.remainingQuantity, 0);
  const warningCount = items.filter(i => i.urgency === 'warning').reduce((sum, i) => sum + i.remainingQuantity, 0);
  const attentionCount = items.filter(i => i.urgency === 'attention').reduce((sum, i) => sum + i.remainingQuantity, 0);

  const activeItems = items.filter(i => i.urgency !== 'expired' && i.remainingQuantity > 0);
  let dailyAverageNeed = 0;
  
  if (activeItems.length > 0) {
    const minDays = Math.min(...activeItems.map(i => Math.max(1, i.daysUntilExpiry)));
    const urgentRemaining = activeItems
      .filter(i => i.daysUntilExpiry <= 90)
      .reduce((sum, i) => sum + i.remainingQuantity, 0);
    dailyAverageNeed = minDays > 0 ? Math.ceil(urgentRemaining / minDays) : 0;
  }

  const todayConsumed = consumptionRecords.filter(
    r => r.status === 'completed' && dayjs(r.createdAt).format('YYYY-MM-DD') === today
  ).length;

  const completionRate = todayGoal > 0 ? Math.min(100, Math.round((todayConsumed / todayGoal) * 100)) : 0;

  return {
    totalRemaining,
    urgentCount,
    warningCount,
    attentionCount,
    dailyAverageNeed,
    todayConsumed,
    todayGoal,
    completionRate,
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function parseDate(value: string | number): string {
  if (typeof value === 'number') {
    return dayjs('1899-12-30').add(value, 'day').format('YYYY-MM-DD');
  }
  
  const parsed = dayjs(value);
  if (parsed.isValid()) {
    return parsed.format('YYYY-MM-DD');
  }
  
  return value;
}
