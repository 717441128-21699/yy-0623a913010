import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { InventoryItem, ConsumptionRecord, PressureStats } from '@/types';
import { getUrgencyLabel, getUrgencyTextColor } from './expiryCalculator';
import { getMolecularTypeLabel, matchProjectsForItem } from './projectMatcher';
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
  treatmentType?: string;
  treatmentRemark?: string;
  todayAppointments: number;
}

export function generateActionItems(
  items: InventoryItem[],
  records: ConsumptionRecord[] = []
): ActionItem[] {
  const today = dayjs().format('YYYY-MM-DD');
  
  return items
    .filter(i => i.remainingQuantity > 0 && i.urgency !== 'expired')
    .map(item => {
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (item.urgency === 'danger') {
        priority = 'high';
      } else if (item.urgency === 'warning') {
        priority = 'medium';
      }
      
      const matchedProjects = matchProjectsForItem(item);
      const suggestedProjectsText = matchedProjects
        .slice(0, 3)
        .map(p => p.name)
        .join('、');
      
      const todayAppointments = records.filter(
        r => r.inventoryId === item.id && 
             dayjs(r.appointmentDate).isSame(today, 'day') &&
             r.status !== 'cancelled'
      ).length;
      
      return {
        product: item.brand,
        specification: item.specification,
        remainingQuantity: item.remainingQuantity,
        daysUntilExpiry: item.daysUntilExpiry,
        urgency: getUrgencyLabel(item.urgency),
        suggestedProjects: suggestedProjectsText || '填充项目',
        priority,
        treatmentType: item.treatmentType ? treatmentTypeLabels[item.treatmentType] : undefined,
        treatmentRemark: item.treatmentRemark,
        todayAppointments,
      };
    })
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (b.todayAppointments !== a.todayAppointments) {
        return b.todayAppointments - a.todayAppointments;
      }
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });
}

export async function exportToExcel(
  items: InventoryItem[],
  consumptionRecords: ConsumptionRecord[],
  stats: PressureStats,
  includeSensitive: boolean = false
): Promise<void> {
  const wb = XLSX.utils.book_new();
  
  const actionItems = generateActionItems(items, consumptionRecords);
  const actionData = actionItems.map(item => ({
    '优先级': item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低',
    '产品': item.product,
    '规格': item.specification,
    '剩余数量': item.remainingQuantity,
    '距到期天数': item.daysUntilExpiry,
    '紧急程度': item.urgency,
    '今日预约': item.todayAppointments,
    '建议项目': item.suggestedProjects,
    '处理方式': item.treatmentType || '正常销售',
    '备注': item.treatmentRemark || '',
  }));
  
  const ws1 = XLSX.utils.json_to_sheet(actionData);
  ws1['!cols'] = [
    { wch: 8 }, { wch: 15 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 25 },
    { wch: 12 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '行动清单');
  
  const today = dayjs().format('YYYY-MM-DD');
  const todayActions = actionItems
    .filter(a => a.priority === 'high' || a.todayAppointments > 0)
    .map(item => ({
      '产品': item.product,
      '规格': item.specification,
      '剩余数量': item.remainingQuantity,
      '到期天数': item.daysUntilExpiry,
      '今日预约': item.todayAppointments,
      '建议项目': item.suggestedProjects,
      '处理方式': item.treatmentType || '正常销售',
      '行动建议': item.priority === 'high' ? '今日必须消耗' : '跟进已预约客户',
    }));
  
  const ws0 = XLSX.utils.json_to_sheet(todayActions);
  ws0['!cols'] = [
    { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 20 }
  ];
  wb.SheetNames.unshift('今日重点');
  wb.Sheets['今日重点'] = ws0;
  
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
  ws2['!cols'] = [{ wch: 20 }, { wch: 10 }];
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
    '备注': item.treatmentRemark || '',
    ...(includeSensitive ? { '进价': item.purchasePrice } : {}),
  }));
  
  const ws3 = XLSX.utils.json_to_sheet(inventoryData);
  ws3['!cols'] = [
    { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
    { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 20 }, ...(includeSensitive ? [{ wch: 10 }] : [])
  ];
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
        '未成交原因': r.rejectionReason || '',
      };
    });
  
  const ws4 = XLSX.utils.json_to_sheet(appointmentData);
  ws4['!cols'] = [
    { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
    { wch: 10 }, { wch: 25 }
  ];
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
    logging: false,
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 30) / imgHeight);
  
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 25;
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 14, 18);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`生成日期：${dayjs().format('YYYY年MM月DD日')}`, 14, 24);
  
  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(150, 150, 150);
  pdf.text('本文件仅供内部参考', 105, 287, { align: 'center' });
  
  const fileName = `${title}_${dayjs().format('YYYYMMDD')}.pdf`;
  pdf.save(fileName);
}

export async function exportSummaryPDF(
  items: InventoryItem[],
  records: ConsumptionRecord[],
  stats: PressureStats
): Promise<void> {
  const actionItems = generateActionItems(items, records);
  const today = dayjs();
  
  const summaryContainer = document.createElement('div');
  summaryContainer.style.cssText = `
    width: 210mm;
    padding: 20mm;
    background: white;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    color: #1D2129;
    position: absolute;
    left: -9999px;
    top: -9999px;
  `;
  
  const highPriority = actionItems.filter(a => a.priority === 'high');
  const mediumPriority = actionItems.filter(a => a.priority === 'medium');
  const todayAppointments = records.filter(
    r => dayjs(r.appointmentDate).isSame(today, 'day') && r.status === 'appointment'
  );
  const todayCompleted = records.filter(
    r => dayjs(r.appointmentDate).isSame(today, 'day') && r.status === 'completed'
  );
  
  summaryContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0; color: #165DFF;">
        玻尿酸效期营销行动摘要
      </h1>
      <p style="font-size: 12px; color: #86909C; margin: 0;">
        生成日期：${today.format('YYYY年MM月DD日')}
      </p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
      <div style="background: #E8F3FF; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #165DFF;">${stats.totalRemaining}</div>
        <div style="font-size: 12px; color: #4E5969;">总库存（支）</div>
      </div>
      <div style="background: #FFECE8; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #F53F3F;">${stats.urgentCount}</div>
        <div style="font-size: 12px; color: #4E5969;">紧急临期（<30天）</div>
      </div>
      <div style="background: #FFF7E8; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #FF7D00;">${todayAppointments.length}</div>
        <div style="font-size: 12px; color: #4E5969;">今日待处理</div>
      </div>
      <div style="background: #E8FFEA; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #00B42A;">${todayCompleted.length}</div>
        <div style="font-size: 12px; color: #4E5969;">今日已完成</div>
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 12px 0; color: #F53F3F; display: flex; align-items: center; gap: 6px;">
        <span style="width: 4px; height: 16px; background: #F53F3F; border-radius: 2px;"></span>
        🔥 高优先级 - 今日必须处理（${highPriority.length}项）
      </h2>
      ${highPriority.length > 0 ? `
        <div style="background: #FFF; border: 1px solid #FFECE8; border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #FFECE8;">
                <th style="padding: 8px 12px; font-size: 12px; text-align: left; color: #F53F3F;">产品</th>
                <th style="padding: 8px 12px; font-size: 12px; text-align: center; color: #F53F3F;">剩余</th>
                <th style="padding: 8px 12px; font-size: 12px; text-align: center; color: #F53F3F;">到期天数</th>
                <th style="padding: 8px 12px; font-size: 12px; text-align: left; color: #F53F3F;">建议项目</th>
                <th style="padding: 8px 12px; font-size: 12px; text-align: left; color: #F53F3F;">处理方式</th>
              </tr>
            </thead>
            <tbody>
              ${highPriority.slice(0, 5).map((item, i) => `
                <tr style="border-top: 1px solid #FFECE8;">
                  <td style="padding: 8px 12px; font-size: 12px;">${item.product} ${item.specification}</td>
                  <td style="padding: 8px 12px; font-size: 12px; text-align: center; font-weight: bold; color: #F53F3F;">${item.remainingQuantity}支</td>
                  <td style="padding: 8px 12px; font-size: 12px; text-align: center; font-weight: bold; color: #F53F3F;">${item.daysUntilExpiry}天</td>
                  <td style="padding: 8px 12px; font-size: 12px;">${item.suggestedProjects}</td>
                  <td style="padding: 8px 12px; font-size: 12px; color: #165DFF;">${item.treatmentType || '正常销售'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${highPriority.length > 5 ? `
            <div style="padding: 8px 12px; background: #FFECE8; font-size: 11px; color: #F53F3F; text-align: center;">
              还有 ${highPriority.length - 5} 项紧急批次，请查看完整Excel清单
            </div>
          ` : ''}
        </div>
      ` : `
        <div style="padding: 16px; background: #F7F8FA; border-radius: 8px; text-align: center; color: #86909C; font-size: 12px;">
          暂无紧急临期批次，继续保持！
        </div>
      `}
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 12px 0; color: #FF7D00; display: flex; align-items: center; gap: 6px;">
        <span style="width: 4px; height: 16px; background: #FF7D00; border-radius: 2px;"></span>
        📅 今日待跟进预约（${todayAppointments.length}位）
      </h2>
      ${todayAppointments.length > 0 ? `
        <div style="display: grid; gap: 8px;">
          ${todayAppointments.slice(0, 6).map(r => {
            const item = items.find(i => i.id === r.inventoryId);
            return `
              <div style="display: flex; align-items: center; padding: 10px 12px; background: #FFF7E8; border-radius: 8px; border-left: 3px solid #FF7D00;">
                <div style="flex: 1;">
                  <div style="font-size: 13px; font-weight: 500; color: #1D2129;">${r.customerName}</div>
                  <div style="font-size: 11px; color: #86909C;">${r.projectType} · ${item?.brand || ''}</div>
                </div>
                <div style="padding: 4px 8px; background: #FFAA00; color: white; font-size: 11px; border-radius: 4px;">
                  待确认
                </div>
              </div>
            `;
          }).join('')}
          ${todayAppointments.length > 6 ? `
            <div style="padding: 8px; text-align: center; font-size: 11px; color: #86909C;">
              还有 ${todayAppointments.length - 6} 位顾客待跟进
            </div>
          ` : ''}
        </div>
      ` : `
        <div style="padding: 16px; background: #F7F8FA; border-radius: 8px; text-align: center; color: #86909C; font-size: 12px;">
          今日暂无预约，建议主动联系老客户
        </div>
      `}
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 12px 0; color: #165DFF; display: flex; align-items: center; gap: 6px;">
        <span style="width: 4px; height: 16px; background: #165DFF; border-radius: 2px;"></span>
        ⚡ 今日执行建议
      </h2>
      <div style="background: #E8F3FF; padding: 12px 16px; border-radius: 8px;">
        <ul style="margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.8; color: #1D2129;">
          <li>优先处理${stats.urgentCount}支紧急临期产品，重点推荐给今日到院顾客</li>
          <li>跟进${todayAppointments.length}位已预约顾客，确认到院时间</li>
          <li>今日目标消耗${stats.todayGoal}支，目前已完成${stats.todayConsumed}支（${stats.completionRate}%）</li>
          <li>日均需消耗${stats.dailyAverageNeed}支才能在效期内消化完毕</li>
          ${mediumPriority.length > 0 ? `<li>重点关注${mediumPriority.length}项临期产品，可推出优惠活动</li>` : ''}
        </ul>
      </div>
    </div>
    
    ${mediumPriority.length > 0 ? `
      <div>
        <h2 style="font-size: 14px; font-weight: bold; margin: 0 0 12px 0; color: #FFAA00; display: flex; align-items: center; gap: 6px;">
          <span style="width: 4px; height: 16px; background: #FFAA00; border-radius: 2px;"></span>
          ⏰ 近期关注（${mediumPriority.length}项，30-90天内到期）
        </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${mediumPriority.slice(0, 8).map(item => `
            <span style="padding: 4px 8px; background: #FFFBE8; border: 1px solid #FFE58F; border-radius: 4px; font-size: 11px; color: #AD6800;">
              ${item.product}（剩${item.remainingQuantity}支，${item.daysUntilExpiry}天）
            </span>
          `).join('')}
          ${mediumPriority.length > 8 ? `
            <span style="padding: 4px 8px; color: #86909C; font-size: 11px;">
              +${mediumPriority.length - 8}项
            </span>
          ` : ''}
        </div>
      </div>
    ` : ''}
    
    <div style="margin-top: 20px; padding-top: 12px; border-top: 1px dashed #E5E6EB; text-align: center; font-size: 10px; color: #C9CDD4;">
      本文件仅供内部运营使用 · 不含敏感成本信息 · 请在专业医师指导下推荐
    </div>
  `;
  
  document.body.appendChild(summaryContainer);
  
  try {
    const canvas = await html2canvas(summaryContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
      windowHeight: 1123,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    const fileName = `玻尿酸行动摘要_${today.format('YYYYMMDD')}.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(summaryContainer);
  }
}

export async function exportActionListPDF(
  items: InventoryItem[],
  records: ConsumptionRecord[],
  stats: PressureStats
): Promise<void> {
  await exportSummaryPDF(items, records, stats);
}
