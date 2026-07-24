import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function AIAssistantDrawer() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'أهلاً بك! أنا مساعد DecoZR الذكي. كيف يمكنني مساعدتك اليوم؟' }
  ]);

  const quickPrompts = [
    'عرض الفواتير المتأخرة',
    'تلخيص طلبات اليوم',
    'توقع تأخير الإنتاج'
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setQuery('');
    
    setTimeout(() => {
      let reply = 'قمت بتحليل طلبك وإليك النتائج...';
      if (text.includes('فواتير')) reply = 'يوجد 5 فواتير متأخرة بقيمة إجمالية 120,000 د.ج.';
      if (text.includes('تلخيص')) reply = 'تم استلام 12 طلب جديد اليوم معظمها طلبات طباعة.';
      if (text.includes('تأخير')) reply = 'هناك احتمال تأخير 15% في الطلب ORD-2026-104 بسبب نقص الأكريليك.';
      
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--color-bg-main)]/50 rounded-lg mb-4 border border-[var(--color-border)]">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'mr-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'assistant' ? 'bg-purple-500/20 text-purple-500' : 'bg-[var(--color-primary-500)]/20 text-[var(--color-primary-500)]'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <span className="font-bold">أنت</span>}
            </div>
            
            <div className={`p-3 rounded-xl text-sm ${
              msg.role === 'user' ? 'bg-[var(--color-primary-600)] text-white' : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-main)]'
            }`}>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {quickPrompts.map(prompt => (
          <button 
            key={prompt} 
            onClick={() => handleSend(prompt)}
            className="text-xs px-3 py-1.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-full hover:border-purple-500 hover:text-purple-400 transition-colors text-[var(--color-text-muted)]"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="relative shrink-0">
        <Input 
          placeholder="اسأل المساعد الذكي..." 
          className="pr-4 pl-12 py-3 bg-[var(--color-bg-card)] border-purple-500/30 focus:border-purple-500 rounded-xl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(query)}
        />
        <Button 
          size="icon" 
          className="absolute left-1 top-1 bottom-1 h-auto w-10 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          onClick={() => handleSend(query)}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
