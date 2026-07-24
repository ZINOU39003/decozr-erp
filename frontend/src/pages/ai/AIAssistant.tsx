import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Bot, Send, Sparkles, BarChart2, TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { motion } from 'framer-motion';

export const AIAssistant = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'أهلاً بك! أنا مساعد DecoZR الذكي. يمكنني تحليل البيانات، وتوقع تأخيرات الإنتاج، وتقديم مقترحات لتقليل الهدر في المخزون. كيف يمكنني مساعدتك اليوم؟' }
  ]);

  const handleSend = () => {
    if (!query.trim()) return;
    
    setMessages([...messages, { role: 'user', text: query }]);
    setQuery('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'بناءً على تحليلي للبيانات الحالية: لاحظت أن آلة الليزر CO2 تعمل بعبء 92%، بينما طابعة الـ UV متوقفة. أنصح بتحويل بعض أعمال القص (إن أمكن) أو جدولة المهام بشكل متوازي لتقليل وقت التسليم بنسبة 15%.' 
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            مساعد الذكاء الاصطناعي (AI Assistant)
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">احصل على تحليلات ذكية وتوصيات لزيادة كفاءة المصنع</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Chat Area */}
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] flex-1 flex flex-col min-h-0 shadow-lg shadow-purple-500/5">
          <CardHeader className="border-b border-[var(--color-border)] shrink-0 bg-gradient-to-l from-purple-500/10 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-500" />
              المحادثة الذكية
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'mr-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[var(--color-primary-600)] text-white' : 'bg-purple-500/20 text-purple-500'}`}>
                  {msg.role === 'user' ? 'U' : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[var(--color-primary-600)] text-white rounded-tl-none' : 'bg-[var(--color-bg-main)] border border-[var(--color-border)] text-[var(--color-text-main)] rounded-tr-none'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>

          <div className="p-4 border-t border-[var(--color-border)] shrink-0 bg-[var(--color-bg-main)]/50">
            <div className="relative">
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل عن المبيعات، المخزون، أو الإنتاج..." 
                className="pr-4 pl-12 bg-[var(--color-bg-card)] border-[var(--color-border)] focus:border-purple-500 focus:ring-purple-500 h-12 rounded-xl"
              />
              <Button 
                onClick={handleSend}
                size="icon" 
                className="absolute left-1 top-1 bottom-1 h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Suggested Prompts & Insights */}
        <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar">
          
          <Card className="border-[var(--color-border)] bg-gradient-to-b from-purple-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> مقترحات للأسئلة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-xs border-[var(--color-border)] hover:border-purple-500/50 hover:bg-purple-500/10 text-[var(--color-text-main)] whitespace-normal h-auto py-2 text-right" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
                هل هناك أي مواد خام توشك على النفاذ وتؤثر على الإنتاج؟
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs border-[var(--color-border)] hover:border-purple-500/50 hover:bg-purple-500/10 text-[var(--color-text-main)] whitespace-normal h-auto py-2 text-right" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
                لخص لي أداء المبيعات في هذا الأسبوع مقارنة بالأسبوع الماضي.
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs border-[var(--color-border)] hover:border-purple-500/50 hover:bg-purple-500/10 text-[var(--color-text-main)] whitespace-normal h-auto py-2 text-right" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
                كيف يمكنني تحسين استهلاك الآلات اليوم؟
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[var(--color-primary-500)]" /> تحليلات سريعة (Insights)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded mt-0.5"><TrendingUp className="w-3 h-3" /></div>
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-main)]">ارتفاع الطلب على الخشب</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">لوحظت زيادة بنسبة 20% في طلبات الـ MDF هذا الشهر.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded mt-0.5"><AlertCircle className="w-3 h-3" /></div>
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-main)]">تأخير متوقع</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">الطلب ORD-2399 معرض للتأخير بسبب الصيانة المجدولة غداً.</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};
