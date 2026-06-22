import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useAppStore } from '@/store';
import { CalendarDay } from './CalendarDay';
import { PressurePanel } from './PressurePanel';
import { CalendarSidebar } from './CalendarSidebar';
import { calculatePressureStats } from '@/utils/expiryCalculator';
import type { CalendarDayData, InventoryItem, UrgencyLevel } from '@/types';
import dayjs from 'dayjs';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const urgencyPriority: Record<UrgencyLevel, number> = {
  expired: 0,
  danger: 1,
  warning: 2,
  attention: 3,
  safe: 4,
};

export const ExpiryCalendar: React.FC = () => {
  const { 
    inventory, 
    consumptionRecords, 
    dailyGoal, 
    currentMonth, 
    setCurrentMonth,
    selectedCalendarDate,
    setSelectedCalendarDate
  } = useAppStore();

  const stats = useMemo(() => 
    calculatePressureStats(inventory, consumptionRecords, dailyGoal),
    [inventory, consumptionRecords, dailyGoal]
  );

  const calendarData = useMemo(() => {
    const yearMonth = dayjs(currentMonth);
    const startDate = yearMonth.startOf('month');
    const endDate = yearMonth.endOf('month');
    const calendarStart = startDate.startOf('week');
    const calendarEnd = endDate.endOf('week');
    
    const today = dayjs().format('YYYY-MM-DD');
    const days: CalendarDayData[] = [];
    
    let current = calendarStart;
    while (current.isBefore(calendarEnd) || current.isSame(calendarEnd, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      const isCurrentMonth = current.isSame(yearMonth, 'month');
      const isToday = dateStr === today;
      
      const dayItems = inventory.filter(item => {
        if (item.remainingQuantity <= 0) return false;
        
        const suggestedDate = dayjs(item.suggestedConsumeDate);
        const expiryDate = dayjs(item.expiryDate);
        
        const isSuggestedDate = current.isSame(suggestedDate, 'day');
        const isExpiryDate = current.isSame(expiryDate, 'day');
        const isMilestoneDate = current.isSame(suggestedDate.subtract(7, 'day'), 'day') ||
                                current.isSame(suggestedDate.subtract(3, 'day'), 'day');
        
        return isSuggestedDate || isExpiryDate || isMilestoneDate;
      });
      
      let maxUrgency: UrgencyLevel | null = null;
      if (dayItems.length > 0) {
        maxUrgency = dayItems.reduce((max, item) => 
          urgencyPriority[item.urgency] < urgencyPriority[max] ? item.urgency : max
        , dayItems[0].urgency);
      }
      
      days.push({
        date: dateStr,
        day: current.date(),
        isCurrentMonth,
        isToday,
        items: dayItems,
        maxUrgency,
      });
      
      current = current.add(1, 'day');
    }
    
    return days;
  }, [currentMonth, inventory]);

  const goToPrevMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').format('YYYY-MM'));
  };

  const goToNextMonth = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, 'month').format('YYYY-MM'));
  };

  const goToToday = () => {
    setCurrentMonth(dayjs().format('YYYY-MM'));
  };

  const handleDayClick = (date: string) => {
    if (selectedCalendarDate === date) {
      setSelectedCalendarDate(null);
    } else {
      setSelectedCalendarDate(date);
    }
  };

  const sidebarData = useMemo(() => {
    if (!selectedCalendarDate) return null;
    
    const dayItems = inventory.filter(item => {
      if (item.remainingQuantity <= 0) return false;
      const suggestedDate = dayjs(item.suggestedConsumeDate);
      const expiryDate = dayjs(item.expiryDate);
      const selectedDate = dayjs(selectedCalendarDate);
      
      return selectedDate.isSame(suggestedDate, 'day') || 
             selectedDate.isSame(expiryDate, 'day') ||
             selectedDate.isSame(suggestedDate.subtract(7, 'day'), 'day') ||
             selectedDate.isSame(suggestedDate.subtract(3, 'day'), 'day') ||
             (selectedDate.isAfter(suggestedDate.subtract(7, 'day')) && 
              selectedDate.isBefore(expiryDate.add(1, 'day')));
    });
    
    const dayRecords = consumptionRecords.filter(r => 
      dayjs(r.appointmentDate).isSame(selectedCalendarDate, 'day')
    );
    
    return {
      date: selectedCalendarDate,
      items: dayItems,
      records: dayRecords
    };
  }, [selectedCalendarDate, inventory, consumptionRecords]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary-500" />
            <span className="text-base font-medium text-neutral-500">
              {dayjs(currentMonth).format('YYYY年MM月')}
            </span>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
          
          <button
            onClick={goToToday}
            className="ml-2 text-xs text-primary-500 hover:text-primary-600"
          >
            今天
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-danger-500" />
            <span className="text-neutral-400">紧急</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-warning-500" />
            <span className="text-neutral-400">临期</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-caution-500" />
            <span className="text-neutral-400">关注</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success-500" />
            <span className="text-neutral-400">安全</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div 
            key={day} 
            className="text-center text-xs text-neutral-400 py-2 font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((dayData, index) => (
          <CalendarDay 
            key={index} 
            data={dayData}
            isSelected={selectedCalendarDate === dayData.date}
            onClick={() => handleDayClick(dayData.date)}
          />
        ))}
      </div>

      <div className="pt-2 border-t border-neutral-100">
        <PressurePanel stats={stats} />
      </div>

      {sidebarData && (
        <CalendarSidebar
          date={sidebarData.date}
          items={sidebarData.items}
          records={sidebarData.records}
          onClose={() => setSelectedCalendarDate(null)}
        />
      )}

      {sidebarData && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setSelectedCalendarDate(null)}
        />
      )}
    </div>
  );
};
