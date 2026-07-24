import React from 'react';
import { motion } from 'framer-motion';
import { User, Package, FileText, CheckCircle, CreditCard, MessageSquare, Plus, Edit } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface ActivityItem {
  id: string;
  type: 'order' | 'invoice' | 'payment' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5 text-blue-500" />;
      case 'invoice': return <FileText className="w-5 h-5 text-yellow-500" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative border-r-2 border-[var(--color-border)] mr-4 pr-6 space-y-8" dir="rtl">
      {activities.map((activity, index) => (
        <motion.div 
          key={activity.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div className="absolute w-10 h-10 rounded-full bg-[var(--color-bg-main)] border-4 border-[var(--color-bg-card)] flex items-center justify-center -right-[45px] top-0 shadow-sm z-10">
            {getIcon(activity.type)}
          </div>
          <div className="bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-primary-500)] transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary-500)] transition-colors">
                {activity.title}
              </h4>
              <Badge variant="outline" className="text-[10px] text-[var(--color-text-muted)] border-[var(--color-border)] whitespace-nowrap mr-4">
                {new Date(activity.timestamp).toLocaleString('ar-DZ')}
              </Badge>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              {activity.description}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[var(--color-primary-500)]/20 flex items-center justify-center text-[10px] text-[var(--color-primary-500)] font-bold">
                {activity.user.charAt(0)}
              </div>
              <span className="text-xs text-[var(--color-text-muted)] font-medium">بواسطة: {activity.user}</span>
            </div>
          </div>
        </motion.div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-8 text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border)] rounded-xl">
          <p>لا توجد أنشطة مسجلة بعد</p>
        </div>
      )}
    </div>
  );
};
