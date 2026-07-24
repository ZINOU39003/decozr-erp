import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Send,
  MessageSquare,
  Package,
  Loader2,
  ShoppingBag,
  ChevronRight,
  LifeBuoy,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getPortalChatMessages,
  getPortalChatThreads,
  getPortalSupportMessages,
  postPortalChatMessage,
  postPortalSupportMessage,
} from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';

const SUPPORT_ID = '__support__';

const statusLabel: Record<string, string> = {
  received: 'مستلم',
  pending_review: 'مراجعة',
  pending_approval: 'موافقة',
  in_design: 'تصميم',
  in_cutting: 'قص',
  in_printing: 'طباعة',
  in_assembly: 'تجميع',
  ready: 'جاهز',
  delivered: 'تم التسليم',
};

function timeAgo(iso?: string | Date | null) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} س`;
  return new Date(iso).toLocaleDateString('ar-DZ');
}

export const PortalMessages = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.currentUser?.id);
  const [activeId, setActiveId] = useState<string | null>(SUPPORT_ID);
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const threadsQ = useQuery({
    queryKey: ['portal', 'chat', 'threads'],
    queryFn: getPortalChatThreads,
  });
  const supportQ = useQuery({
    queryKey: ['portal', 'support', 'messages'],
    queryFn: getPortalSupportMessages,
    refetchInterval: 8000,
  });

  const orderThreads = useMemo(() => {
    const list = Array.isArray(threadsQ.data) ? threadsQ.data : [];
    const term = filter.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (t: any) =>
        t.order_number?.toLowerCase().includes(term) ||
        t.title_ar?.toLowerCase().includes(term)
    );
  }, [threadsQ.data, filter]);

  const supportMessages = Array.isArray(supportQ.data) ? supportQ.data : [];
  const lastSupport = supportMessages[supportMessages.length - 1];

  const threads = useMemo(
    () => [
      {
        order_id: SUPPORT_ID,
        order_number: 'SUPPORT',
        status: 'support',
        title_ar: 'دردشة مباشرة مع الورشة',
        last_message: lastSupport
          ? { body_ar: lastSupport.body_ar, at: lastSupport.created_at, from: 'الورشة' }
          : { body_ar: 'اكتب رسالتك لصاحب الورشة مباشرة', at: null, from: '' },
        unread_hint: false,
      },
      ...orderThreads,
    ],
    [orderThreads, lastSupport]
  );

  const isSupport = activeId === SUPPORT_ID;

  const messagesQ = useQuery({
    queryKey: ['portal', 'chat', 'messages', activeId],
    queryFn: () => getPortalChatMessages(activeId!),
    enabled: !!activeId && !isSupport,
    refetchInterval: 8000,
  });

  const sendMut = useMutation({
    mutationFn: (text: string) =>
      isSupport
        ? postPortalSupportMessage(text)
        : postPortalChatMessage(activeId!, text),
    onSuccess: () => {
      setDraft('');
      if (isSupport) qc.invalidateQueries({ queryKey: ['portal', 'support', 'messages'] });
      else {
        qc.invalidateQueries({ queryKey: ['portal', 'chat', 'messages', activeId] });
        qc.invalidateQueries({ queryKey: ['portal', 'chat', 'threads'] });
      }
    },
    onError: () => toast.error('تعذر إرسال الرسالة'),
  });

  const messages = isSupport
    ? supportMessages
    : Array.isArray(messagesQ.data)
      ? messagesQ.data
      : [];
  const active = threads.find((t: any) => t.order_id === activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeId]);

  const onSend = () => {
    const text = draft.trim();
    if (!text || !activeId || sendMut.isPending) return;
    sendMut.mutate(text);
  };

  const selectThread = (id: string) => {
    setActiveId(id);
    setMobileShowChat(true);
  };

  return (
    <div className="space-y-4 overflow-x-hidden" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#15202b]">الرسائل</h1>
          <p className="text-sm text-[#64748B] mt-1">دردشة مباشرة مع الورشة ومتابعة طلباتك</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/portal/whatsapp')}
          className="gap-2 border-[#D7E5E3] text-[#0F766E]"
        >
          واتساب داخل التطبيق
        </Button>
      </div>

      <div className="h-[min(70vh,640px)] relative rounded-3xl border border-[#E6ECF2] overflow-hidden bg-white shadow-sm md:flex">
        {/* Threads */}
        <aside
          className={`${
            mobileShowChat ? 'hidden' : 'flex'
          } md:flex absolute inset-0 z-10 md:static md:z-auto md:max-w-[300px] w-full border-l border-[#E6ECF2] flex-col bg-[#F8FAFC] shrink-0`}
        >
          <div className="p-4 border-b border-[#E6ECF2] space-y-3">
            <div className="flex items-center gap-2 text-[#0F766E]">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-bold">المحادثات</span>
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="ابحث برقم الطلب..."
                className="w-full h-10 rounded-xl bg-white border border-[#E6ECF2] pr-10 pl-3 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threadsQ.isLoading && (
              <div className="p-6 text-sm text-[#64748B] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> جاري التحميل...
              </div>
            )}
            {threads.map((t: any) => {
              const selected = t.order_id === activeId;
              const isSup = t.order_id === SUPPORT_ID;
              return (
                <button
                  key={t.order_id}
                  type="button"
                  onClick={() => selectThread(t.order_id)}
                  className={`w-full text-right p-4 border-b border-[#EEF2F6] ${
                    selected ? 'bg-[#0F766E]/10' : 'hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="font-bold text-sm truncate text-[#15202b] flex items-center gap-1.5">
                      {isSup && <LifeBuoy className="w-3.5 h-3.5 text-[#0F766E]" />}
                      {t.title_ar}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] shrink-0">
                      {timeAgo(t.last_message?.at)}
                    </span>
                  </div>
                  {!isSup && (
                    <span className="text-[10px] font-mono text-[#94A3B8]">{t.order_number}</span>
                  )}
                  <p className="text-xs text-[#64748B] truncate mt-1">
                    {t.last_message?.body_ar || 'ابدأ المحادثة...'}
                  </p>
                </button>
              );
            })}
            {!threadsQ.isLoading && orderThreads.length === 0 && (
              <div className="p-6 text-center text-xs text-[#94A3B8]">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                محادثات الطلبات تظهر بعد إنشاء طلب
              </div>
            )}
          </div>
        </aside>

        {/* Chat */}
        <section
          className={`${
            mobileShowChat ? 'flex' : 'hidden'
          } md:flex absolute inset-0 z-20 md:static md:z-auto flex-1 flex-col min-w-0 bg-white`}
        >
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-[#94A3B8] text-sm">
              اختر محادثة
            </div>
          ) : (
            <>
              <header className="h-14 px-3 border-b border-[#E6ECF2] flex items-center gap-2 shrink-0 bg-[#F8FAFC]">
                <button
                  type="button"
                  className="md:hidden p-2 rounded-lg hover:bg-white"
                  onClick={() => setMobileShowChat(false)}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shrink-0">
                  {isSupport ? <LifeBuoy className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-sm truncate text-[#15202b]">{active.title_ar}</h2>
                  <p className="text-[11px] text-[#64748B] truncate">
                    {isSupport
                      ? 'رد مباشر من فريق الورشة'
                      : `${active.order_number} · ${statusLabel[active.status] || active.status}`}
                  </p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-[#F6F8FB]">
                {(isSupport ? supportQ.isLoading : messagesQ.isLoading) && (
                  <div className="flex justify-center py-8 text-[#64748B]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
                {!messages.length && !(isSupport ? supportQ.isLoading : messagesQ.isLoading) && (
                  <div className="text-center py-12 text-sm text-[#94A3B8]">
                    لا رسائل بعد — اكتب أول رسالة
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {messages.map((m: any) => {
                    const mine = m.user_id === userId || m.sender_user_id === userId;
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                            mine
                              ? 'bg-[#0F766E] text-white rounded-br-md'
                              : 'bg-white border border-[#E6ECF2] text-[#15202b] rounded-bl-md'
                          }`}
                        >
                          {!mine && (
                            <p className="text-[10px] font-bold mb-1 opacity-70">
                              {m.user?.full_name_ar || m.sender?.full_name_ar || 'الورشة'}
                            </p>
                          )}
                          <p className="leading-relaxed whitespace-pre-wrap">{m.body_ar}</p>
                          <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-[#94A3B8]'}`}>
                            {new Date(m.created_at).toLocaleTimeString('ar-DZ', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              <footer className="p-3 border-t border-[#E6ECF2] bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSend();
                      }
                    }}
                    rows={1}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 min-h-[44px] max-h-28 resize-none rounded-2xl border border-[#E6ECF2] bg-[#F8FAFC] px-4 py-3 text-sm"
                  />
                  <Button
                    onClick={onSend}
                    disabled={!draft.trim() || sendMut.isPending}
                    className="h-11 w-11 rounded-2xl p-0 bg-[#0F766E] text-white shrink-0"
                  >
                    {sendMut.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
