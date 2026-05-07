import React, { useState, useEffect } from 'react';

export const AdminDashboard = ({ supabase, visitorCount, activePoll, setActivePoll, setIsAdmin, fetchLive }: any) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Overview / Polls
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);

    // Announcements
    const [announcement, setAnnouncement] = useState('');
    const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);

    // Sponsors
    const [sponsors, setSponsors] = useState<any[]>([]);
    const [sponsorForm, setSponsorForm] = useState({ brand_name: '', promo_code: '', discount_desc: '', url: '' });

    // Clips
    const [clips, setClips] = useState<any[]>([]);
    const [clipForm, setClipForm] = useState({ title: '', video_url: '', platform: 'youtube' });

    // Schedule
    const [schedule, setSchedule] = useState<any[]>([]);
    const [isScheduleActive, setIsScheduleActive] = useState(true);

    // FAQs
    const [faqs, setFaqs] = useState<any[]>([]);
    const [faqForm, setFaqForm] = useState({ question: '', answer: '' });
    const [isFaqActive, setIsFaqActive] = useState(true);

    // SEO Settings
    const [seoSettings, setSeoSettings] = useState({ title: 'iABS STREAM HUB', description: 'تابع بثوث iABS المباشرة', keywords: 'بث, كيك, العاب' });

    // Chart Data
    const [chartData, setChartData] = useState<any[]>([]);

    const loadData = async () => {
        try {
            const { data: ann, error: err1 } = await supabase.from('announcements').select('*').eq('id', 1).single();
            if (err1) console.error("Announcements Error:", err1);
            else if (ann) { setAnnouncement(ann.message || ''); setIsAnnouncementActive(ann.is_active); }

            const { data: spon, error: err2 } = await supabase.from('sponsors').select('*').order('id', { ascending: false });
            if (err2) console.error("Sponsors Error:", err2);
            else if (spon) setSponsors(spon);

            const { data: clp, error: err3 } = await supabase.from('highlight_clips').select('*').order('id', { ascending: false });
            if (err3) console.error("Clips Error:", err3);
            else if (clp) setClips(clp);

            const { data: sch, error: err4 } = await supabase.from('schedule').select('*').order('id', { ascending: true });
            if (err4) console.error("Schedule Error:", err4);
            else if (sch) setSchedule(sch);

            // Fetch Schedule Visibility Toggle
            const { data: schToggle } = await supabase.from('announcements').select('*').eq('id', 2).single();
            if (schToggle) setIsScheduleActive(schToggle.is_active);

            const { data: fq, error: err5 } = await supabase.from('faqs').select('*').order('id', { ascending: false });
            if (err5) console.error("FAQs Error:", err5);
            else if (fq) setFaqs(fq);

            // Fetch FAQ Visibility Toggle
            const { data: faqToggle } = await supabase.from('announcements').select('*').eq('id', 3).single();
            if (faqToggle) setIsFaqActive(faqToggle.is_active === true || faqToggle.is_active === 'true');

            // Fetch SEO
            const { data: seo } = await supabase.from('seo_settings').select('*').eq('id', 1).single();
            if (seo) setSeoSettings(seo);

            // Fetch Chart Data
            const { data: dViews } = await supabase.from('daily_views').select('*').order('view_date', { ascending: false }).limit(10);
            if (dViews && dViews.length > 0) {
                setChartData(dViews.reverse());
            }

        } catch (err) {
            console.error("Admin Load Error", err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const saveAnnouncement = async () => {
        const { error } = await supabase.from('announcements').upsert({ id: 1, message: announcement, is_active: isAnnouncementActive });
        if (error) return alert('خطأ في قاعدة البيانات: ' + error.message);
        alert('تم حفظ الإعلان بنجاح');
        fetchLive();
    };

    const addSponsor = async () => {
        if (!sponsorForm.brand_name) return alert('اسم الراعي مطلوب');
        const { error } = await supabase.from('sponsors').insert([sponsorForm]);
        if (error) return alert('خطأ في قاعدة البيانات: ' + error.message);
        setSponsorForm({ brand_name: '', promo_code: '', discount_desc: '', url: '' });
        loadData();
        fetchLive();
    };

    const deleteSponsor = async (id: number) => {
        const { error } = await supabase.from('sponsors').delete().eq('id', id);
        if (error) return alert('خطأ: ' + error.message);
        loadData();
        fetchLive();
    };

    const addClip = async () => {
        if (!clipForm.title || !clipForm.video_url) return alert('العنوان والرابط مطلوبان');
        const { error } = await supabase.from('highlight_clips').insert([clipForm]);
        if (error) return alert('خطأ في قاعدة البيانات: ' + error.message);
        setClipForm({ title: '', video_url: '', platform: 'youtube' });
        loadData();
        fetchLive();
    };

    const deleteClip = async (id: number) => {
        const { error } = await supabase.from('highlight_clips').delete().eq('id', id);
        if (error) return alert('خطأ: ' + error.message);
        loadData();
        fetchLive();
    };

    const updateSchedule = async (id: number, plan: string, time: string) => {
        const { error } = await supabase.from('schedule').update({ stream_plan: plan, time }).eq('id', id);
        if (error) return alert('خطأ: ' + error.message);
        loadData();
        fetchLive();
    };

    const addFaq = async () => {
        if (!faqForm.question || !faqForm.answer) return alert('السؤال والإجابة مطلوبان');
        const { error } = await supabase.from('faqs').insert([faqForm]);
        if (error) return alert('خطأ في قاعدة البيانات: ' + error.message);
        setFaqForm({ question: '', answer: '' });
        loadData();
        fetchLive();
    };

    const deleteFaq = async (id: number) => {
        const { error } = await supabase.from('faqs').delete().eq('id', id);
        if (error) return alert('خطأ: ' + error.message);
        loadData();
        fetchLive();
    };

    const saveSeo = async () => {
        const { error } = await supabase.from('seo_settings').upsert({ id: 1, ...seoSettings });
        if (error) return alert('تأكد من إنشاء جدول seo_settings في سوبابيس');
        alert('تم حفظ إعدادات محركات البحث بنجاح (SEO)');
        // Update document dynamically
        document.title = seoSettings.title;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', seoSettings.description);
    };

    const tabs = [
        { id: 'overview', name: 'الرئيسية 👑', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { id: 'announcements', name: 'الإعلانات 📢', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        { id: 'sponsors', name: 'الرعاة والخصومات 💸', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'clips', name: 'مكتبة اللقطات 🎬', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
        { id: 'schedule', name: 'جدول البثوث 📅', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'faqs', name: 'الأسئلة الشائعة ❓', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'seo', name: 'إعدادات SEO 🔍', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' }
    ];

    return (
        <div className="fixed inset-0 z-[200] bg-[#050505]/95 backdrop-blur-2xl flex justify-center p-0 md:p-8 animate-fade-in" dir="rtl">
            <div className="bg-[#0a0a0a] border border-white/10 md:rounded-[40px] w-full max-w-6xl h-full md:h-[88vh] shadow-[0_0_120px_rgba(255,45,45,0.15)] flex flex-col md:flex-row overflow-hidden relative">
                
                {/* Elegant Gradient Background */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#FF2D2D]/10 to-transparent blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/5 to-transparent blur-[100px] rounded-full pointer-events-none"></div>

                {/* Sidebar */}
                <div className="w-full md:w-[320px] bg-black/40 backdrop-blur-xl border-l border-white/5 flex flex-col shrink-0 relative z-10">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">لوحة الإدارة <span className="text-[#FF2D2D] ml-1">👑</span></h2>
                            <p className="text-white/40 text-xs mt-1 font-bold tracking-widest uppercase">Premium Dashboard</p>
                        </div>
                        <button onClick={() => setIsAdmin(false)} className="md:hidden w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-[#FF2D2D] transition-colors">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 flex md:block overflow-x-auto md:overflow-x-visible hide-scrollbar">
                        {tabs.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-right px-6 py-4 rounded-2xl font-bold transition-all duration-500 whitespace-nowrap flex items-center gap-4 group relative overflow-hidden ${activeTab === tab.id ? 'text-white bg-white/5 shadow-lg border border-white/10' : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'}`}
                            >
                                {activeTab === tab.id && <div className="absolute inset-0 bg-gradient-to-r from-[#FF2D2D]/20 to-transparent opacity-100 z-0"></div>}
                                <svg className={`w-6 h-6 relative z-10 transition-colors ${activeTab === tab.id ? 'text-[#FF2D2D]' : 'text-white/30 group-hover:text-white/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
                                <span className="relative z-10 flex-1">{tab.name}</span>
                                <div className={`w-2 h-2 rounded-full relative z-10 transition-all duration-300 ${activeTab === tab.id ? 'bg-[#FF2D2D] shadow-[0_0_10px_#FF2D2D]' : 'bg-transparent'}`}></div>
                            </button>
                        ))}
                    </div>
                    <div className="p-6 border-t border-white/5 hidden md:block bg-gradient-to-t from-black to-transparent">
                        <button onClick={() => setIsAdmin(false)} className="w-full bg-[#FF2D2D]/10 hover:bg-[#FF2D2D] text-[#FF2D2D] hover:text-white border border-[#FF2D2D]/20 font-black py-4 rounded-2xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,45,45,0.4)] flex justify-center items-center gap-2">
                            <span>إغلاق لوحة التحكم</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-12 relative custom-scrollbar z-10">
                    
                    {/* Tab: Overview (Polls & Quick Stats) */}
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in-up space-y-8">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-4xl font-black text-white tracking-tight">نظرة عامة</h2>
                                    <p className="text-white/50 mt-2 font-medium">مرحباً بك في لوحة تحكم موقع iABS، تحكم بكل شيء من هنا.</p>
                                </div>
                                <div className="hidden md:flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/10">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                                    <span className="text-white font-bold text-sm tracking-widest uppercase">System Online</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 p-8 rounded-[32px] flex flex-col justify-center relative overflow-hidden group hover:border-[#FF2D2D]/50 transition-colors">
                                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 text-[#FF2D2D]">
                                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-white/50 mb-2 tracking-widest uppercase relative z-10">إجمالي زوار الموقع</h3>
                                    <p className="text-5xl font-black text-white relative z-10">{visitorCount.toLocaleString()}</p>
                                </div>
                                
                                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 p-8 rounded-[32px] flex flex-col justify-center relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                                    <h3 className="text-sm font-bold text-white/50 mb-2 tracking-widest uppercase relative z-10">التفاعل مع التصويت</h3>
                                    <p className="text-5xl font-black text-white relative z-10">{activePoll ? activePoll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0) : 0}</p>
                                    <p className="text-blue-400 font-bold mt-2 relative z-10 text-sm">إجمالي الأصوات</p>
                                </div>

                                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 p-8 rounded-[32px] flex flex-col justify-center relative overflow-hidden group hover:border-green-500/50 transition-colors">
                                    <h3 className="text-sm font-bold text-white/50 mb-2 tracking-widest uppercase relative z-10">حالة التصويت الحالي</h3>
                                    <div className="flex items-center gap-4 relative z-10 mt-2">
                                        <div className={`w-5 h-5 rounded-full ${activePoll ? 'bg-green-500 shadow-[0_0_15px_#22c55e] animate-pulse' : 'bg-red-500/50'}`}></div>
                                        <span className="text-3xl font-black text-white">{activePoll ? 'نشط الآن' : 'مغلق'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#111] p-8 md:p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF2D2D]/5 blur-[80px] rounded-full pointer-events-none"></div>
                                {activePoll ? (
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                نتائج التصويت المباشر <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                                            </h3>
                                        </div>
                                        <h4 className="text-3xl text-white font-black mb-8 leading-tight">{activePoll.question}</h4>
                                        <div className="space-y-4 mb-10">
                                            {activePoll.options.map((opt: any) => {
                                                const totalVotes = activePoll.options.reduce((sum: number, o: any) => sum + o.votes, 0);
                                                const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                                return (
                                                    <div key={opt.id} className="relative bg-black/50 p-6 rounded-3xl border border-white/10 overflow-hidden group">
                                                        <div className="absolute top-0 right-0 bottom-0 bg-gradient-to-l from-[#FF2D2D]/20 to-transparent transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                                        <div className="relative z-10 flex justify-between items-center">
                                                            <span className="text-white font-bold text-xl">{opt.text}</span>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-white/50 font-bold">{percentage}%</span>
                                                                <span className="text-[#FF2D2D] font-black bg-[#FF2D2D]/10 px-5 py-2.5 rounded-xl border border-[#FF2D2D]/20">{opt.votes} أصوات</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                await supabase.from('polls').update({ is_active: false }).eq('id', activePoll.id);
                                                setActivePoll(null);
                                                alert('تم الإيقاف بنجاح');
                                            }}
                                            className="w-full md:w-auto bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold px-10 py-4 rounded-2xl transition-all border border-red-500/30 flex items-center justify-center gap-3"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                                            إيقاف وإنهاء التصويت
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black text-white mb-8 border-b border-white/5 pb-6">إنشاء تصويت جديد 📊</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-white/50 font-bold mb-3 ml-2">السؤال الرئيسي</label>
                                                <input className="w-full bg-black/50 border border-white/10 focus:border-[#FF2D2D] outline-none rounded-2xl p-5 text-xl text-white font-bold transition-colors" placeholder="ما رأيك في البث اليوم؟" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-white/50 font-bold mb-3 ml-2">الخيارات</label>
                                                <div className="space-y-3">
                                                    {pollOptions.map((opt, i) => (
                                                        <div key={i} className="flex gap-3 animate-fade-in-up">
                                                            <div className="flex-1 relative">
                                                                <input className="w-full bg-black/50 border border-white/10 focus:border-white/30 outline-none rounded-xl p-4 text-white pr-12 transition-colors" placeholder={`الخيار ${i + 1}`} value={opt} onChange={e => { const o = [...pollOptions]; o[i] = e.target.value; setPollOptions(o); }} />
                                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-black">{i+1}</span>
                                                            </div>
                                                            {pollOptions.length > 2 && <button onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))} className="w-14 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center transition-colors border border-red-500/20"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5 mt-8">
                                                <button onClick={() => setPollOptions([...pollOptions, ''])} className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-2xl transition-colors border border-white/10 flex items-center justify-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                    إضافة خيار
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        const validOpts = pollOptions.filter(o => o.trim() !== '');
                                                        if (!pollQuestion || validOpts.length < 2) return alert('أكمل البيانات وأضف خيارين على الأقل');
                                                        await supabase.from('polls').update({ is_active: false }).eq('is_active', true);
                                                        const { data } = await supabase.from('polls').insert([{ question: pollQuestion, options: validOpts.map((t, i) => ({ id: i, text: t, votes: 0 })), is_active: true }]).select().single();
                                                        setPollQuestion(''); setPollOptions(['', '']); setActivePoll(data); alert('تم النشر والتفعيل!');
                                                    }}
                                                    className="flex-1 bg-gradient-to-r from-[#FF2D2D] to-[#ff4747] text-white shadow-[0_0_20px_rgba(255,45,45,0.4)] hover:shadow-[0_0_30px_rgba(255,45,45,0.6)] font-black text-lg py-4 rounded-2xl transition-all"
                                                >
                                                    إطلاق التصويت للمشاهدين 🚀
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}



                    {/* Tab: SEO Settings */}
                    {activeTab === 'seo' && (
                        <div className="animate-fade-in-up space-y-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">إعدادات محركات البحث (SEO)</h2>
                                    <p className="text-white/50 text-sm mt-1">تخصيص كيفية ظهور موقعك في جوجل ووسائل التواصل</p>
                                </div>
                            </div>

                            <div className="bg-[#111] p-8 md:p-10 rounded-[32px] border border-white/10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-white/70 font-bold mb-2">عنوان الموقع (Title)</label>
                                        <input 
                                            className="w-full bg-black border border-white/10 focus:border-[#FF2D2D] rounded-xl p-4 text-white font-bold transition-all outline-none" 
                                            value={seoSettings.title} 
                                            onChange={e => setSeoSettings({...seoSettings, title: e.target.value})} 
                                        />
                                        <p className="text-white/30 text-xs mt-2">يظهر في تبويبة المتصفح ونتائج البحث.</p>
                                    </div>
                                    <div>
                                        <label className="block text-white/70 font-bold mb-2">وصف الموقع (Meta Description)</label>
                                        <textarea 
                                            className="w-full bg-black border border-white/10 focus:border-[#FF2D2D] rounded-xl p-4 text-white font-bold transition-all outline-none h-32 resize-none" 
                                            value={seoSettings.description} 
                                            onChange={e => setSeoSettings({...seoSettings, description: e.target.value})} 
                                        />
                                        <p className="text-white/30 text-xs mt-2">وصف قصير يجذب الزوار من محركات البحث.</p>
                                    </div>
                                    <div>
                                        <label className="block text-white/70 font-bold mb-2">الكلمات المفتاحية (Keywords)</label>
                                        <input 
                                            className="w-full bg-black border border-white/10 focus:border-[#FF2D2D] rounded-xl p-4 text-white font-bold transition-all outline-none" 
                                            value={seoSettings.keywords} 
                                            onChange={e => setSeoSettings({...seoSettings, keywords: e.target.value})} 
                                            placeholder="بث, كيك, العاب, تحديات, تفاعل"
                                        />
                                        <p className="text-white/30 text-xs mt-2">افصل بين الكلمات بفاصلة (,)</p>
                                    </div>
                                    <button onClick={saveSeo} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] mt-6">
                                        تحديث إعدادات SEO
                                    </button>
                                </div>
                            </div>
                            
                            {/* Preview Card */}
                            <div className="bg-white p-6 rounded-2xl max-w-2xl border border-gray-200">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">معاينة محرك البحث Google</h4>
                                <div className="text-[#1a0dab] text-xl font-medium mb-1 cursor-pointer hover:underline">{seoSettings.title}</div>
                                <div className="text-[#006621] text-sm mb-1">https://iabs.stream/</div>
                                <div className="text-[#545454] text-sm leading-relaxed">{seoSettings.description}</div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Announcements */}
                    {activeTab === 'announcements' && (
                        <div className="animate-fade-in-up space-y-8">
                            <h2 className="text-4xl font-black text-white mb-8 tracking-tight">شريط الأخبار والإعلانات 📢</h2>
                            <div className="bg-[#111] p-8 md:p-10 rounded-[40px] border border-white/10">
                                <label className="block text-white/70 text-lg font-bold mb-4">نص الإعلان (يظهر أعلى الموقع بشكل متحرك)</label>
                                <textarea 
                                    className="w-full bg-black/50 border border-white/10 focus:border-[#FF2D2D] rounded-2xl p-6 text-white font-bold h-40 mb-8 outline-none text-xl leading-relaxed resize-none transition-colors" 
                                    placeholder="🔥 بث بطولة فالورانت الليلة الساعة 9!"
                                    value={announcement}
                                    onChange={e => setAnnouncement(e.target.value)}
                                />
                                <div className="flex items-center justify-between bg-white/5 p-6 rounded-2xl mb-8 border border-white/5">
                                    <div>
                                        <h4 className="text-white font-bold text-lg mb-1">تفعيل شريط الإعلانات</h4>
                                        <p className="text-white/40 text-sm">عند التفعيل سيظهر الشريط لجميع زوار الموقع.</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsAnnouncementActive(!isAnnouncementActive)}
                                        className={`w-20 h-10 rounded-full transition-colors relative shadow-inner ${isAnnouncementActive ? 'bg-[#FF2D2D]' : 'bg-black border border-white/20'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full bg-white absolute top-1 transition-transform shadow-md ${isAnnouncementActive ? 'left-1 translate-x-10' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <button onClick={saveAnnouncement} className="w-full bg-white text-black hover:bg-gray-200 font-black py-5 rounded-2xl text-lg transition-colors">حفظ التغييرات</button>
                            </div>
                        </div>
                    )}

                    {/* Tab: Sponsors */}
                    {activeTab === 'sponsors' && (
                        <div className="animate-fade-in-up space-y-8">
                            <h2 className="text-4xl font-black text-white mb-8 tracking-tight">أكواد الخصم والرعاة 💸</h2>
                            <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] p-8 md:p-10 rounded-[40px] border border-white/10">
                                <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-6">إضافة راعي جديد</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block text-white/50 text-sm font-bold mb-2 ml-1">اسم العلامة التجارية</label>
                                        <input className="w-full bg-black/50 border border-white/10 focus:border-white/30 outline-none rounded-xl p-4 text-white" placeholder="مثال: G-Fuel" value={sponsorForm.brand_name} onChange={e => setSponsorForm({...sponsorForm, brand_name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-white/50 text-sm font-bold mb-2 ml-1">كود الخصم</label>
                                        <input className="w-full bg-black/50 border border-[#FF2D2D]/30 focus:border-[#FF2D2D] outline-none rounded-xl p-4 text-[#FF2D2D] font-black uppercase tracking-wider" placeholder="مثال: iABS10" value={sponsorForm.promo_code} onChange={e => setSponsorForm({...sponsorForm, promo_code: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-white/50 text-sm font-bold mb-2 ml-1">تفاصيل الخصم</label>
                                        <input className="w-full bg-black/50 border border-white/10 focus:border-white/30 outline-none rounded-xl p-4 text-white" placeholder="مثال: خصم 20% على كل المنتجات والتوصيل مجاني" value={sponsorForm.discount_desc} onChange={e => setSponsorForm({...sponsorForm, discount_desc: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-white/50 text-sm font-bold mb-2 ml-1">رابط المتجر</label>
                                        <input className="w-full bg-black/50 border border-white/10 focus:border-white/30 outline-none rounded-xl p-4 text-blue-400" placeholder="https://" value={sponsorForm.url} onChange={e => setSponsorForm({...sponsorForm, url: e.target.value})} dir="ltr" />
                                    </div>
                                </div>
                                <button onClick={addSponsor} className="w-full bg-[#FF2D2D] hover:bg-[#ff4747] text-white shadow-[0_0_20px_rgba(255,45,45,0.3)] font-black py-4 rounded-xl text-lg transition-all">إضافة الراعي للقائمة</button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {sponsors.map(sp => (
                                    <div key={sp.id} className="bg-[#111] p-8 rounded-[32px] border border-white/5 hover:border-white/20 transition-all flex justify-between items-center group shadow-xl">
                                        <div className="flex-1 pr-6">
                                            <h4 className="text-2xl font-black text-white mb-3">{sp.brand_name}</h4>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="text-lg bg-[#FF2D2D]/10 text-[#FF2D2D] border border-[#FF2D2D]/20 px-4 py-1.5 rounded-xl font-black tracking-widest">{sp.promo_code}</span>
                                                <span className="text-white/60 font-medium">{sp.discount_desc}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteSponsor(sp.id)} className="w-14 h-14 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all flex items-center justify-center shrink-0 border border-red-500/10">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                                {sponsors.length === 0 && <div className="col-span-full text-center py-10 text-white/30 font-bold">لا يوجد رعاة مضافين حالياً.</div>}
                            </div>
                        </div>
                    )}

                    {/* Tab: Clips */}
                    {activeTab === 'clips' && (
                        <div className="animate-fade-in-up space-y-8">
                            <h2 className="text-4xl font-black text-white mb-8 tracking-tight">مكتبة اللقطات 🎬</h2>
                            <div className="bg-[#111] p-8 md:p-10 rounded-[40px] border border-white/10">
                                <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-6">إضافة مقطع مميز للموقع</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-white/50 text-sm font-bold mb-2 ml-1">عنوان المقطع</label>
                                        <input className="w-full bg-black/50 border border-white/10 focus:border-white/30 outline-none rounded-xl p-4 text-white" placeholder="مثال: أقوى لقطة في فالورانت!" value={clipForm.title} onChange={e => setClipForm({...clipForm, title: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-white/50 text-sm font-bold mb-2 ml-1">المنصة</label>
                                        <select className="w-full bg-black/50 border border-white/10 focus:border-white/30 outline-none rounded-xl p-4 text-white cursor-pointer" value={clipForm.platform} onChange={e => setClipForm({...clipForm, platform: e.target.value})}>
                                            <option value="youtube">YouTube (مقطع أو شورت)</option>
                                            <option value="tiktok">TikTok</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-white/50 text-sm font-bold mb-2 ml-1">رابط المقطع</label>
                                        <input className="w-full bg-black/50 border border-white/10 focus:border-white/30 outline-none rounded-xl p-4 text-white" placeholder="https://" value={clipForm.video_url} onChange={e => setClipForm({...clipForm, video_url: e.target.value})} dir="ltr" />
                                    </div>
                                </div>
                                <button onClick={addClip} className="w-full bg-white text-black hover:bg-gray-200 font-black py-4 rounded-xl text-lg transition-colors">إضافة المقطع</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {clips.map(clip => (
                                    <div key={clip.id} className="bg-[#111] p-6 rounded-[24px] border border-white/5 hover:border-white/20 transition-all flex justify-between items-center gap-4 group">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${clip.platform === 'tiktok' ? 'bg-black border border-pink-500/30 text-white' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {clip.platform === 'tiktok' ? '📱' : '▶️'}
                                        </div>
                                        <div className="flex-1 truncate">
                                            <h4 className="text-white font-black truncate text-xl mb-1">{clip.title}</h4>
                                            <a href={clip.video_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors inline-flex items-center gap-1">
                                                مشاهدة الرابط
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </div>
                                        <button onClick={() => deleteClip(clip.id)} className="w-12 h-12 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab: Schedule */}
                    {activeTab === 'schedule' && (
                        <div className="animate-fade-in-up space-y-8">
                            <h2 className="text-4xl font-black text-white mb-8 tracking-tight">جدول البثوث الأسبوعي 📅</h2>
                            <div className="bg-[#111] p-8 md:p-10 rounded-[40px] border border-white/10">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-8 border-b border-white/5 gap-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">ظهور الجدول للزوار</h3>
                                        <p className="text-white/50 text-sm">تفعيل هذا الخيار يعرض الجدول في الصفحة الرئيسية، يمكنك إيقافه في أوقات الإجازات.</p>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            const newState = !isScheduleActive;
                                            setIsScheduleActive(newState);
                                            const { error } = await supabase.from('announcements').upsert({ id: 2, message: 'schedule_toggle', is_active: newState });
                                            if (error) alert("حدث خطأ أثناء الحفظ: " + error.message);
                                            fetchLive();
                                        }}
                                        className={`w-20 h-10 rounded-full transition-colors relative shrink-0 shadow-inner ${isScheduleActive ? 'bg-green-500' : 'bg-black border border-white/20'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full bg-white absolute top-1 transition-transform shadow-md ${isScheduleActive ? 'left-1 translate-x-10' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {schedule.map(day => (
                                        <div key={day.id} className="flex flex-col md:flex-row gap-4 items-center bg-black/40 p-5 rounded-2xl border border-white/5 focus-within:border-white/20 transition-colors">
                                            <div className="w-32 text-center md:text-right font-black text-[#FF2D2D] text-xl">{day.day_name}</div>
                                            <div className="flex-1 w-full relative">
                                                <input 
                                                    className="w-full bg-transparent border-none outline-none text-white text-lg placeholder-white/20" 
                                                    placeholder="خطة البث (مثال: رول بلاي، إجازة...)" 
                                                    defaultValue={day.stream_plan} 
                                                    onBlur={e => updateSchedule(day.id, e.target.value, day.time)}
                                                />
                                            </div>
                                            <div className="w-full md:w-40 relative">
                                                <input 
                                                    className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl p-3 text-white text-center outline-none transition-colors" 
                                                    placeholder="الوقت 9:00 PM" 
                                                    defaultValue={day.time} 
                                                    onBlur={e => updateSchedule(day.id, day.stream_plan, e.target.value)}
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 flex items-center justify-center gap-2 text-white/40 text-sm">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>يتم حفظ التغييرات تلقائياً بمجرد تغيير الخانة.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: FAQs */}
                    {activeTab === 'faqs' && (
                        <div className="animate-fade-in-up space-y-8">
                            <h2 className="text-4xl font-black text-white mb-8 tracking-tight">الأسئلة الشائعة ❓</h2>
                            <div className="bg-[#111] p-8 md:p-10 rounded-[40px] border border-white/10">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-8 border-b border-white/5 gap-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">عرض قسم الأسئلة</h3>
                                        <p className="text-white/50 text-sm">التحكم في إظهار أو إخفاء كامل قسم الأسئلة الشائعة من الموقع.</p>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            const newState = !isFaqActive;
                                            setIsFaqActive(newState);
                                            const { error } = await supabase.from('announcements').upsert({ id: 3, message: 'faq_toggle', is_active: newState });
                                            if (error) alert("حدث خطأ أثناء الحفظ: " + error.message);
                                            fetchLive();
                                        }}
                                        className={`w-20 h-10 rounded-full transition-colors relative shrink-0 shadow-inner ${isFaqActive ? 'bg-blue-500' : 'bg-black border border-white/20'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full bg-white absolute top-1 transition-transform shadow-md ${isFaqActive ? 'left-1 translate-x-10' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-6">إضافة سؤال جديد</h3>
                                <div className="space-y-6 mb-8">
                                    <div>
                                        <label className="block text-white/50 text-sm font-bold mb-2 ml-1">السؤال</label>
                                        <input className="w-full bg-black/50 border border-white/10 focus:border-white/30 outline-none rounded-xl p-4 text-white font-bold" placeholder="مثال: متى مواعيد البث؟" value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-white/50 text-sm font-bold mb-2 ml-1">الإجابة</label>
                                        <textarea className="w-full bg-black/50 border border-white/10 focus:border-white/30 outline-none rounded-xl p-4 text-white h-32 resize-none" placeholder="الإجابة التفصيلية للسؤال..." value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} />
                                    </div>
                                </div>
                                <button onClick={addFaq} className="w-full bg-white text-black hover:bg-gray-200 font-black py-4 rounded-xl text-lg transition-colors">نشر السؤال</button>
                            </div>

                            <div className="space-y-4">
                                {faqs.map(faq => (
                                    <div key={faq.id} className="bg-[#111] p-8 rounded-[32px] border border-white/5 hover:border-white/20 transition-colors group shadow-xl">
                                        <div className="flex justify-between items-start gap-6">
                                            <div className="flex-1">
                                                <h4 className="text-xl font-black text-white mb-3 flex items-start gap-3">
                                                    <span className="text-[#FF2D2D] mt-1">Q.</span>
                                                    {faq.question}
                                                </h4>
                                                <p className="text-white/60 text-base font-medium leading-relaxed flex items-start gap-3">
                                                    <span className="text-white/20 mt-1">A.</span>
                                                    {faq.answer}
                                                </p>
                                            </div>
                                            <button onClick={() => deleteFaq(faq.id)} className="w-12 h-12 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center shrink-0">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

