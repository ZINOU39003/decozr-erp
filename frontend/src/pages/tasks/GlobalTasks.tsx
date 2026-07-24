import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  CheckCircle2, Circle, Clock, Plus, Search, Filter, 
  MoreHorizontal, AlignLeft, Users, Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';

const MOCK_TASKS = [
  { id: 1, title: 'صيانة وقائية لآلة الليزر CO2', status: 'todo', priority: 'high', assignee: 'أحمد محمود', due: '2026-07-11', type: 'maintenance' },
  { id: 2, title: 'مراجعة مخزون الأكريليك وتأكيد الطلبية الجديدة', status: 'in_progress', priority: 'medium', assignee: 'خالد يوسف', due: '2026-07-10', type: 'inventory' },
  { id: 3, title: 'التواصل مع العميل بخصوص تصميم ORD-2401', status: 'todo', priority: 'high', assignee: 'سارة عمر', due: '2026-07-10', type: 'design' },
  { id: 4, title: 'تحديث تقرير الإيرادات الأسبوعي', status: 'done', priority: 'low', assignee: 'محمد علي', due: '2026-07-09', type: 'finance' },
  { id: 5, title: 'تجهيز ملفات الطباعة للطلب ORD-2410', status: 'in_progress', priority: 'high', assignee: 'سارة عمر', due: '2026-07-10', type: 'design' },
];

export const GlobalTasks = () => {
  const { modal } = useUIStore();
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [filter, setFilter] = useState('all');

  const toggleTaskStatus = (id: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (t.status === 'todo') return { ...t, status: 'in_progress' };
        if (t.status === 'in_progress') return { ...t, status: 'done' };
        return { ...t, status: 'todo' };
      }
      return t;
    }));
  };

  const getPriorityBadge = (p: string) => {
    switch(p) {
      case 'high': return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">عاجل</Badge>;
      case 'medium': return <Badge variant="warning" className="text-[10px] px-1.5 py-0">متوسط</Badge>;
      case 'low': return <Badge variant="info" className="text-[10px] px-1.5 py-0">منخفض</Badge>;
      default: return null;
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'all' ? true : t.status === filter);

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[var(--color-primary-500)]" />
            إدارة المهام (Global Tasks)
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">تتبع المهام الشاملة عبر المصنع (تصميم، صيانة، مبيعات)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => modal.openModal('CREATE_TASK')} className="gap-2 bg-[var(--color-primary-600)] text-white shadow-[0_0_15px_var(--color-primary-500)]/20">
            <Plus className="w-4 h-4" /> مهمة جديدة
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-4 shrink-0">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4 space-y-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${filter === 'all' ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]' : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]'}`}
                onClick={() => setFilter('all')}
              >
                <AlignLeft className="w-4 h-4 mr-2 ml-2" /> جميع المهام
                <span className="ml-auto text-xs opacity-70 bg-black/10 px-2 py-0.5 rounded-full">{tasks.length}</span>
              </Button>
              <Button 
                variant={filter === 'todo' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${filter === 'todo' ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]' : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]'}`}
                onClick={() => setFilter('todo')}
              >
                <Circle className="w-4 h-4 mr-2 ml-2" /> قيد الانتظار
                <span className="ml-auto text-xs opacity-70 bg-black/10 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'todo').length}</span>
              </Button>
              <Button 
                variant={filter === 'in_progress' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${filter === 'in_progress' ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]' : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]'}`}
                onClick={() => setFilter('in_progress')}
              >
                <Clock className="w-4 h-4 mr-2 ml-2" /> جاري العمل
                <span className="ml-auto text-xs opacity-70 bg-black/10 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'in_progress').length}</span>
              </Button>
              <Button 
                variant={filter === 'done' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${filter === 'done' ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]' : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]'}`}
                onClick={() => setFilter('done')}
              >
                <CheckCircle2 className="w-4 h-4 mr-2 ml-2" /> مكتملة
                <span className="ml-auto text-xs opacity-70 bg-black/10 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'done').length}</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <div className="flex-1 space-y-4">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
              <Input placeholder="ابحث في المهام..." className="pl-4 pr-10 bg-[var(--color-bg-card)] border-[var(--color-border)]" />
            </div>
            <Button variant="outline" className="border-[var(--color-border)] gap-2" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
              <Filter className="w-4 h-4" /> فلاتر متقدمة
            </Button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/30 transition-all ${task.status === 'done' ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center group">
                      
                      <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-1 sm:mt-0 w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                          task.status === 'done' ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white' :
                          task.status === 'in_progress' ? 'border-[var(--color-warning)] text-[var(--color-warning)]' :
                          'border-[var(--color-border)] text-transparent hover:border-[var(--color-primary-500)]'
                        }`}
                      >
                        {task.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : task.status === 'in_progress' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-50 text-[var(--color-primary-500)]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-bold text-[var(--color-text-main)] truncate ${task.status === 'done' && 'line-through text-[var(--color-text-muted)]'}`}>
                            {task.title}
                          </h3>
                          {getPriorityBadge(task.priority)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> استحقاق: {task.due}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> إسناد إلى: {task.assignee}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <Badge variant="outline" className="border-[var(--color-border)] text-[var(--color-text-muted)] uppercase text-[10px]">
                          {task.type}
                        </Badge>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                لا توجد مهام مطابقة للفلتر الحالي.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
