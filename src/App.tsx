import React, { useEffect } from 'react';
import { StatusBar } from '@/components/layout/StatusBar';
import { ImportArea } from '@/components/import/ImportArea';
import { ExpiryCalendar } from '@/components/calendar/ExpiryCalendar';
import { MatchArea } from '@/components/match/MatchArea';
import { ScriptArea } from '@/components/script/ScriptArea';
import { TrackingArea } from '@/components/tracking/TrackingArea';
import { TodayWorkbench } from '@/components/dashboard/TodayWorkbench';
import { CancelledPool } from '@/components/tracking/CancelledPool';
import { SectionCard } from '@/components/layout/SectionCard';
import { Calendar } from 'lucide-react';
import { useAppStore } from '@/store';

const App: React.FC = () => {
  const { refreshInventoryUrgency } = useAppStore();

  useEffect(() => {
    const interval = setInterval(() => {
      refreshInventoryUrgency();
    }, 60000);

    return () => clearInterval(interval);
  }, [refreshInventoryUrgency]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <StatusBar />
      
      <main className="container mx-auto px-4 py-6 max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 space-y-4">
            <ImportArea />
            
            <SectionCard title="效期日历" icon={<Calendar className="w-5 h-5" />}>
              <ExpiryCalendar />
            </SectionCard>

            <CancelledPool />
          </div>
          
          <div className="lg:col-span-7 space-y-4">
            <TodayWorkbench />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <MatchArea />
              <ScriptArea />
            </div>
            
            <TrackingArea />
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-neutral-300 pb-6">
          <p>
            本系统为本地纯前端应用，所有数据仅存储在您的浏览器中，不上传任何服务器。
          </p>
          <p className="mt-1">
            数据安全 · 无需注册 · 保护客户隐私
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
