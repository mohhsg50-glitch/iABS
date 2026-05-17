import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

interface AIChatProps {
  lang: Language;
}

const API_KEYS = [
  'sk-f606af64b454403684bec8eb477916e5',
  'sk-7ae88917fa654723b43323e950abd9d4',
  'sk-8d59f937022948ba94960876a0511848',
];

const SYSTEM_PROMPT = `أنت مساعد iABS الرسمي، تتحدث باللهجة السعودية دائمًا. اسمك "iABS AI".

معلومات كاملة عن iABS (محمد القحطاني):
- الاسم الكامل: محمد القحطاني
- العمر: 24 سنة (مواليد 2002)
- الجنسية: سعودي من سراة عبيدة، من سكان أبها
- المنصة الأساسية: Kick - iABS
- المتابعين: 124K على Kick، 40K يوتيوب، 43K تيك توك، 57K تويتر
- طوله: 176 سم - وزنه: 80 كجم
- أخوه: iMSA3Dq ستريمر في Kick
- محتواه: GTA V / FiveM، Just Chatting، ألعاب تنويعية
- أسلوبه: عفوي، تفاعلي، فكاهي، يعتمد على الكاريزما والضحك
- كلانه: LevelOne
- المودات: inormal, yousef1098, ireim, shaddoh, sipdai, maryamqa, imiro97, iali5, lena81l, a7medo, wjdan3, fotaami, 2inoura, awash7, rton, janaxx, mohmd505, raghada1
- أشهر كلماته: "ملك القبول والاستمرارية" 👑، هاشتاق #StayOne
- شخصيته: واثق، حماسي، يحب التفاعل مع الشات، بثوثه طويلة وسابثونات

تعليمات الرد:
- تحدث باللهجة السعودية دائمًا
- أجب بحماس واختصار عشان التوكنز
- استخدم كلمات: وش، يابو، الحين، كذا، اقصد`.trim();

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SUGGESTIONS_AR = [
  'وش قصة iABS؟',
  'كم عمر محمد القحطاني؟',
  'وش نوع محتواه؟',
  'من هم المودات؟',
  'وش معنٰى ملك القبول؟',
  'كم متابع عنده؟',
];

const SUGGESTIONS_EN = [
  'Tell me about iABS',
  'How old is Mohammed?',
  'What content does he make?',
  'Who are his mods?',
  'What is his style?',
];

export const AIChat: React.FC<AIChatProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: lang === 'ar'
        ? 'هلا والله يابو 🌟 أنا iABS AI، أسألني عن محمد القحطاني وش تبي تعرف 👑'
        : 'Hey! I\'m iABS AI 🎮 Ask me anything about Mohammed Al-Qahtani!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyIndex, setKeyIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const tryRequest = async (body: object, keyIdx: number): Promise<Response> => {
    if (keyIdx >= API_KEYS.length) throw new Error('All API keys failed');
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEYS[keyIdx]}` },
      body: JSON.stringify(body),
    });
    if (res.status === 429 || res.status === 401 || res.status === 500) return tryRequest(body, keyIdx + 1);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput('');
    setShowSuggestions(false);

    const userMsg: Message = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const body = {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...newMessages.map(m => ({ role: m.role, content: m.content })),
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      };
      const response = await tryRequest(body, keyIndex);
      setKeyIndex(0);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      const decoder = new TextDecoder();
      let assistantContent = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: lang === 'ar' ? 'عذراً، صار خطأ. جرب الحين مرة ثانية.' : 'Sorry, something went wrong. Try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = lang === 'ar';

  return (
    <>
      <style>{`
        @keyframes ai-float {
          0%, 100% { transform: translateY(0px); box-shadow: 0 8px 32px rgba(255,45,45,0.3); }
          50% { transform: translateY(-10px); box-shadow: 0 16px 48px rgba(255,45,45,0.5); }
        }
        @keyframes ai-pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ai-slide {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ai-message {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ai-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ai-dots {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes ai-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes ai-border-run {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .ai-scroll::-webkit-scrollbar { width: 3px; }
        .ai-scroll::-webkit-scrollbar-track { background: transparent; }
        .ai-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #FF2D2D, #FF6B6B); border-radius: 10px; }
      `}</style>

      {/* === FLOATING BUTTON === */}
      <div className="fixed bottom-6 right-6 z-[100]" style={{ direction: 'ltr' }}>
        <div className="relative">
          {!isOpen && (
            <span className="absolute -top-1 -right-1 z-10 flex h-6 w-6 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D2D] opacity-60"></span>
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#FF2D2D] to-[#991111] text-[8px] font-black text-white shadow-lg tracking-tighter">
                AI
              </span>
            </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#FF2D2D] via-[#DD1515] to-[#991111] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20 backdrop-blur-sm"
            style={{ animation: 'ai-float 4s ease-in-out infinite' }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF2D2D]/40 to-transparent blur-sm" style={{ animation: 'ai-pulse-ring 2.5s ease-out infinite' }}></div>
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
            {isOpen ? (
              <svg className="w-7 h-7 relative z-10 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7 relative z-10 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* === CHAT PANEL === */}
      <div
        ref={panelRef}
        className="fixed z-[100] overflow-hidden"
        style={{
          direction: 'ltr',
          bottom: '100px',
          right: '24px',
          width: '400px',
          maxWidth: 'calc(100vw - 48px)',
          height: '640px',
          maxHeight: 'calc(100vh - 140px)',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, rgba(10,10,18,0.96), rgba(5,5,12,0.98))',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,45,45,0.05)',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Animated border gradient */}
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none opacity-20"
          style={{
            padding: '1px',
            background: 'linear-gradient(135deg, #FF2D2D, transparent, #FF2D2D, transparent)',
            backgroundSize: '300% 300%',
            animation: 'ai-border-run 6s ease infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Decorative Glows */}
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#FF2D2D]/10 blur-[100px] pointer-events-none" style={{ animation: 'ai-glow 4s ease-in-out infinite' }}></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-[#FF6B6B]/8 blur-[100px] pointer-events-none" style={{ animation: 'ai-glow 4s ease-in-out infinite 2s' }}></div>

        {/* === HEADER === */}
        <div className="relative h-20 flex items-center justify-between px-5 border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent shrink-0">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF2D2D] via-[#DD1515] to-[#991111] flex items-center justify-center shadow-lg shadow-[#FF2D2D]/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                <svg className="w-6 h-6 text-white drop-shadow-lg relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a12] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            </div>
            {/* Info */}
            <div>
              <h3 className="text-white font-extrabold text-base tracking-tight flex items-center gap-2">
                iABS AI
                <span className="text-[9px] font-bold bg-gradient-to-r from-[#FF2D2D]/20 to-transparent text-[#FF2D2D]/80 px-2 py-0.5 rounded-full border border-[#FF2D2D]/20">
                  {lang === 'ar' ? 'نشط' : 'LIVE'}
                </span>
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-[10px] text-green-400/70 font-medium tracking-wide">
                  {isLoading ? (lang === 'ar' ? 'يفكر...' : 'Thinking...') : (lang === 'ar' ? 'متصل' : 'Online')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => { setMessages([{ role: 'assistant', content: lang === 'ar' ? 'هلا والله يابو 🌟 أنا iABS AI، أسألني عن محمد القحطاني وش تبي تعرف 👑' : 'Hey! I\'m iABS AI 🎮 Ask me anything about Mohammed Al-Qahtani!' }]); setShowSuggestions(true); }}
              className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 flex items-center justify-center transition-all border border-white/[0.04]"
              title={lang === 'ar' ? 'مسح المحادثة' : 'Clear chat'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 flex items-center justify-center transition-all border border-white/[0.04]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* === MESSAGES === */}
        <div
          className="overflow-y-auto px-4 py-5 ai-scroll"
          style={{
            height: 'calc(100% - 80px - 64px)',
            background: 'linear-gradient(180deg, rgba(10,10,18,0) 0%, rgba(10,10,18,1) 100%)',
          }}
        >
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animation: 'ai-message 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <div
                  className={`relative ${msg.role === 'user' ? 'max-w-[80%]' : 'max-w-[88%]'}`}
                  style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF2D2D] to-[#991111] flex items-center justify-center shadow-sm">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#FF2D2D]/70 tracking-widest uppercase">iABS AI</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 text-sm leading-relaxed shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-[#FF2D2D] to-[#CC1111] text-white rounded-2xl rounded-tr-md shadow-[0_8px_24px_rgba(255,45,45,0.25)]'
                        : 'bg-[#16161f]/70 backdrop-blur-xl text-white/90 rounded-2xl rounded-tl-md border border-white/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                    }`}
                  >
                    <span className={`${lang === 'ar' ? 'font-arabic leading-[1.7]' : ''} whitespace-pre-wrap`}>
                      {msg.content}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start" style={{ animation: 'ai-message 0.3s ease-out' }}>
                <div className="max-w-[88%]">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF2D2D] to-[#991111] flex items-center justify-center shadow-sm">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-[#FF2D2D]/50 tracking-widest uppercase">iABS AI</span>
                  </div>
                  <div className="bg-[#16161f]/70 backdrop-blur-xl rounded-2xl rounded-tl-md border border-white/[0.06] px-6 py-5 shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF2D2D]" style={{ animation: 'ai-dots 1.2s ease-in-out infinite' }}></span>
                      <span className="w-2 h-2 rounded-full bg-[#FF2D2D]" style={{ animation: 'ai-dots 1.2s ease-in-out infinite 0.15s' }}></span>
                      <span className="w-2 h-2 rounded-full bg-[#FF2D2D]" style={{ animation: 'ai-dots 1.2s ease-in-out infinite 0.3s' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && messages.length <= 1 && (
              <div className="mt-6" style={{ animation: 'ai-message 0.5s ease-out 0.3s both' }}>
                <p className="text-[10px] text-white/30 font-medium tracking-wider uppercase mb-3 text-center">
                  {lang === 'ar' ? 'اسأل عن iABS' : 'Ask about iABS'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(lang === 'ar' ? SUGGESTIONS_AR : SUGGESTIONS_EN).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setShowSuggestions(false); sendMessage(s); }}
                      className="px-3.5 py-2 text-xs rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white/90 border border-white/[0.06] hover:border-[#FF2D2D]/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,45,45,0.1)]"
                      style={{ animation: `ai-message 0.3s ease-out ${0.4 + i * 0.08}s both` }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* === INPUT === */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12] to-transparent border-t border-white/[0.04] px-3 flex items-center gap-2 backdrop-blur-xl">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={lang === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question...'}
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white placeholder-white/20 text-sm outline-none transition-all duration-300 focus:border-[#FF2D2D]/40 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(255,45,45,0.06)] disabled:opacity-40"
              style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF2D2D] to-[#CC1111] text-white flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(255,45,45,0.35)] active:scale-95 disabled:opacity-25 disabled:hover:scale-100 disabled:hover:shadow-none shadow-lg shadow-[#FF2D2D]/20 flex-shrink-0 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin relative z-10" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
