import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { InventoryItem, ConsumptionRecord, PressureStats } from '@/types';
import { getUrgencyLabel, getUrgencyTextColor } from './expiryCalculator';
import { getMolecularTypeLabel } from './projectMatcher';
import { treatmentTypeLabels } from './scriptGenerator';
import dayjs from 'dayjs';

export interface ActionItem {
  product: string;
  specification: string;
  remainingQuantity: number;
  daysUntilExpiry: number;
  urgency: string;
  suggestedProjects: string;
  priority: 'high' | 'medium' | 'low';
}

export function generateActionItems(
  items: InventoryItem[]
): ActionItem[] {
  return items
    .filter(i => i.remainingQuantity > 0 && i.urgency !== 'expired')
    .map(item => {
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (item.urgency === 'danger') {
        priority = 'high';
      } else if (item.urgency === 'warning') {
        priority = 'medium';
      }
      return {
        product: item.brand,
        specification: item.specification,
        remainingQuantity: item.remainingQuantity,
        daysUntilExpiry: item.daysUntilExpiry,
        urgency: getUrgencyLabel(item.urgency),
        suggestedProjects: getSuggestedProjectsText(item),
        priority,
      };
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

function getSuggestedProjectsText(item: InventoryItem): string {
  const projects: Record<string, string[]> = {
    macromolecule: ['隆鼻', '丰下巴', '下颌缘提升', '眉骨塑形'],
    medium: ['鼻唇沟填充', '太阳穴填充', '苹果肌填充', '面颊填充'],
    micromolecule: ['泪沟填充', '丰唇', '颈部除皱', '手部年轻化'],
  };
  return projects[item.molecularType]?.join('、') || '填充项目';
}

export async function exportToExcel(
  items: InventoryItem[],
  consumptionRecords: ConsumptionRecord[],
  stats: PressureStats,
  includeSensitive: boolean = false
): Promise<void> {
  const wb = XLSX.utils.book_new();
  
  const actionItems = generateActionItems(items);
  const actionData = actionItems.map(item => ({
    '优先级': item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低',
    '产品': item.product,
    '规格': item.specification,
    '剩余数量': item.remainingQuantity,
    '距到期天数': item.daysUntilExpiry,
    '紧急程度': item.urgency,
    '建议项目': item.suggestedProjects,
  }));
  
  const ws1 = XLSX.utils.json_to_sheet(actionData);
  XLSX.utils.book_append_sheet(wb, ws1, '行动清单');
  
  const summaryData = [
    { '指标': '总库存剩余', '数值': stats.totalRemaining },
    { '指标': '紧急临期(<30天)', '数值': stats.urgentCount },
    { '指标': '临期(30-90天)', '数值': stats.warningCount },
    { '指标': '关注(90-180天)', '数值': stats.attentionCount },
    { '指标': '日均需消耗', '数值': stats.dailyAverageNeed },
    { '指标': '今日目标', '数值': stats.todayGoal },
    { '指标': '今日已完成', '数值': stats.todayConsumed },
    { '指标': '完成率', '数值': `${stats.completionRate}%` },
  ];
  
  const ws2 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws2, '消耗统计');
  
  const inventoryData = items.map(item => ({
    '品牌': item.brand,
    '规格': item.specification,
    '批号': item.batchNumber,
    '入库数量': item.quantity,
    '剩余数量': item.remainingQuantity,
    '分子类型': getMolecularTypeLabel(item.molecularType),
    '到期日': item.expiryDate,
    '距到期天数': item.daysUntilExpiry,
    '紧急程度': getUrgencyLabel(item.urgency),
    '处理方式': item.treatmentType ? treatmentTypeLabels[item.treatmentType] : '正常销售',
    ...(includeSensitive ? { '进价': item.purchasePrice } : {}),
  }));
  
  const ws3 = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(wb, ws3, '库存明细');
  
  const appointmentData = consumptionRecords
    .filter(r => r.status !== 'cancelled')
    .map(r => {
      const item = items.find(i => i.id === r.inventoryId);
      return {
        '顾客姓名': r.customerName,
        '预约日期': r.appointmentDate,
        '项目类型': r.projectType,
        '产品': item?.brand || '-',
        '状态': r.status === 'appointment' ? '已预约' : '已完成',
      };
    });
  
  const ws4 = XLSX.utils.json_to_sheet(appointmentData);
  XLSX.utils.book_append_sheet(wb, ws4, '顾客预约');
  
  const fileName = `玻尿酸效期营销清单_${dayjs().format('YYYYMMDD')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export async function exportToPDF(elementId: string, title: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('未找到导出元素');
  }
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 20;
  
  pdf.setFontSize(16);
  pdf.text(title, 14, 15);
  
  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  
  const fileName = `${title}_${dayjs().format('YYYYMMDD')}.pdf`;
  pdf.save(fileName);
}

export async function exportActionListPDF(
  items: InventoryItem[],
  stats: PressureStats
): Promise<void> {
  const actionItems = generateActionItems(items);
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('玻尿酸效期营销行动清单', 105, 20, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`生成日期：${dayjs().format('YYYY年MM月DD日')}`, 14, 32);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('消耗压力概览', 14, 45);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const overviewY = 52;
  const overviewItems = [
    `总库存剩余：${stats.totalRemaining} 支`,
    `紧急临期(<30天)：${stats.urgentCount} 支`,
    `临期(30-90天)：${stats.warningCount} 支`,
    `日均需消耗：${stats.dailyAverageNeed} 支`,
    `今日目标：${stats.todayGoal} 支`,
    `今日已完成：${stats.todayConsumed} 支 (${stats.completionRate}%)`,
  ];
  
  overviewItems.forEach((text, i) => {
    pdf.text(text, 14, overviewY + i * 7);
  });
  
  let currentY = overviewY + overviewItems.length * 7 + 10;
  
  if (currentY > 250) {
    pdf.addPage();
    currentY = 20;
  }
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('重点行动项（按紧急度排序）', 14, currentY);
  currentY += 8;
  
  const highPriority = actionItems.filter(a => a.priority === 'high');
  const mediumPriority = actionItems.filter(a => a.priority === 'medium');
  const lowPriority = actionItems.filter(a => a.priority === 'low');
  
  const renderPrioritySection = (title: string, color: string, items: ActionItem[]) => {
    if (items.length === 0) return;
    
    if (currentY > 250) {
      pdf.addPage();
      currentY = 20;
    }
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(
      color === 'danger' ? 245 : color === 'warning' ? 255 : 0,
      color === 'danger' ? 63 : color === 'warning' ? 125 : 180,
      color === 'danger' ? 63 : color === 'warning' ? 0 : 42
    );
    pdf.text(`${title} (${items.length}项)`, 14, currentY);
    pdf.setTextColor(0, 0, 0);
    currentY += 6;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    items.forEach((item, i) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }
      
      const lineY = currentY + i * 10;
      pdf.setDrawColor(230, 230, 230);
      pdf.line(14, lineY - 2, 196, lineY - 2);
      
      pdf.text(`${i + 1}. ${item.product} ${item.specification}`, 16, lineY + 5);
      pdf.text(`剩余${item.remainingQuantity}支，还剩${item.daysUntilExpiry}天`, 90, lineY + 5);
      pdf.text(`建议：${item.suggestedProjects}`, 16, lineY + 10);
    });
    
    currentY += items.length * 10 + 5;
  };
  
  renderPrioritySection('高优先级 - 紧急处理', 'danger', highPriority);
  renderPrioritySection('中优先级 - 重点关注', 'warning', mediumPriority);
  renderPrioritySection('低优先级 - 正常销售', 'success', lowPriority);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(150, 150, 150);
  pdf.text('本文件仅供内部参考，请在专业医师指导下进行治疗推荐。', 105, 285, { align: 'center' });
  
  const fileName = `玻尿酸行动清单_${dayjs().format('YYYYMMDD')}.pdf`;
  pdf.save(fileName);
}
