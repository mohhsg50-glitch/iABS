import React, { useEffect, useState, useMemo } from 'react';

interface BotrixEntry {
  level: number;
  watchtime: number;
  xp: number;
  points: number;
  name: string;
}

type SortKey = 'watchtime' | 'level' | 'xp' | 'points';

interface BotrixLeaderboardProps {
  lang: 'en' | 'ar';
}

const API_URL = 'https://botrix.live/api/public/leaderboard?platform=kick&user=iabs';

const formatWatchtime = (seconds: number) => {
  const hrs = seconds / 3600;
  return `${hrs.toFixed(1)}h`;
};

const formatNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const TABS: { key: SortKey; labelEn: string; labelAr: string }[] = [
  { key: 'watchtime', labelEn: 'Watch Time', labelAr: 'وقت المشاهدة' },
  { key: 'level', labelEn: 'Level', labelAr: 'المستوى' },
  { key: 'xp', labelEn: 'XP', labelAr: 'نقاط الخبرة' },
  { key: 'points', labelEn: 'Points', labelAr: 'النقاط' },
];

const BotrixLeaderboard: React.FC<BotrixLeaderboardProps> = ({ lang }) => {
  const [data, setData] = useState<BotrixEntry[] | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('watchtime');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(r => r.json())
      .then((json: BotrixEntry[]) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setLoading(false);
      });
  }, []);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b[sortBy] - a[sortBy]).slice(0, 50);
  }, [data, sortBy]);

  const renderRankBadge = (rank: number) => {
    if (rank === 1) return (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#FFD700] to-[#FDB931] shadow-[0_0_20px_rgba(255,215,0,0.5)] border border-[#FFFACD]/50 text-black font-black text-sm md:text-base shrink-0">
        1
      </div>
    );
    if (rank === 2) return (
      <div className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E0E0E0] to-[#BDBDBD] shadow-[0_0_12px_rgba(192,192,192,0.3)] border border-white/40 text-black font-black text-xs md:text-sm shrink-0">
        2
      </div>
    );
    if (rank === 3) return (
      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E6A373] to-[#8B4513] shadow-[0_0_12px_rgba(205,127,50,0.3)] border border-[#FFDAB9]/30 text-white font-black text-[10px] md:text-xs shrink-0">
        3
      </div>
    );
    return (
      <span className="w-5 md:w-6 text-center text-[11px] md:text-xs font-bold text-white/20 font-mono shrink-0">
        {rank < 10 ? `0${rank}` : rank}
      </span>
    );
  };

  const getSortValue = (entry: BotrixEntry) => {
    switch (sortBy) {
      case 'watchtime': return formatWatchtime(entry.watchtime);
      case 'level': return `${entry.level}`;
      case 'xp': return formatNum(entry.xp);
      case 'points': return formatNum(entry.points);
    }
  };

  const getSortLabel = () => {
    const tab = TABS.find(t => t.key === sortBy);
    return lang === 'ar' ? tab?.labelAr : tab?.labelEn;
  };

  const t = {
    title: lang === 'ar' ? 'متداولين البثوث' : 'Stream Regulars',
    subtitle: lang === 'ar' ? 'الأكثر تفاعلاً عبر البثوث' : 'Most active across all streams',
    loading: lang === 'ar' ? 'جاري التحميل…' : 'Loading…',
    empty: lang === 'ar' ? 'لا توجد بيانات حالياً' : 'No data available',
    powered: lang === 'ar' ? 'مدعوم من Botrix' : 'Powered by Botrix',
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="group relative flex flex-col rounded-[24px] md:rounded-[32px] overflow-hidden transition-all duration-700 bg-[#050505]/80 backdrop-blur-lg border border-white/5 shadow-[0_0_60px_-15px_rgba(83,252,24,0.08)] hover:border-white/20">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#53FC18]/5 to-transparent pointer-events-none opacity-40 blur-2xl"></div>

        <div className="relative p-4 md:p-8 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#53FC18]/20 to-transparent border border-[#53FC18]/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#53FC18] drop-shadow-[0_0_8px_rgba(83,252,24,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-none">{t.title}</h2>
                  <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] bg-gradient-to-r from-[#53FC18] to-emerald-600 bg-clip-text text-transparent opacity-80">{t.subtitle}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5 self-start md:self-auto flex-wrap">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSortBy(tab.key)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-bold tracking-wide transition-all duration-300 ${
                    sortBy === tab.key
                      ? 'bg-[#53FC18] text-black shadow-[0_0_15px_rgba(83,252,24,0.3)]'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  {lang === 'ar' ? tab.labelAr : tab.labelEn}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] animate-pulse">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5"></div>
                  <div className="flex-1 h-4 bg-white/5 rounded-lg"></div>
                  <div className="w-16 h-4 bg-white/5 rounded-lg"></div>
                </div>
              ))}
            </div>
          )}

          {!loading && sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-5 rounded-full bg-white/5 mb-4">
                <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <p className="text-sm text-white/40 font-medium">{t.empty}</p>
            </div>
          )}

          {!loading && sorted.length > 0 && (
            <div className="space-y-1 relative">
              <div className="flex items-center justify-between px-3 py-2 mb-2">
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/20">{lang === 'ar' ? 'الترتيب' : 'Rank'}</span>
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/20">{getSortLabel()}</span>
              </div>
              {sorted.map((entry, idx) => {
                const isTop3 = idx < 3;
                return (
                  <div
                    key={entry.name}
                    className={`relative flex items-center justify-between p-2 md:p-3.5 rounded-xl md:rounded-2xl transition-all duration-300 hover:bg-white/[0.03] ${
                      isTop3 ? 'bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                      <div className="shrink-0 flex justify-center w-6 md:w-8">
                        {renderRankBadge(idx + 1)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm md:text-base font-bold truncate transition-colors ${
                          idx === 0 ? 'text-white drop-shadow-lg' : 'text-white/90'
                        } leading-tight`}>
                          {entry.name}
                        </span>
                        {isTop3 && (
                          <div className="h-[2px] w-10 rounded-full bg-gradient-to-r from-white/20 to-transparent mt-0.5"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-3 bg-black/30 rounded-lg px-2.5 md:px-3 py-1.5 border border-white/5">
                      <span className={`text-xs md:text-sm font-black tracking-wide leading-none ${
                        idx === 0 ? 'text-white drop-shadow-lg' : 'text-[#53FC18]/80'
                      }`}>
                        {getSortValue(entry)}
                      </span>
                      {idx === 0 && (
                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#53FC18] animate-pulse shadow-[0_0_10px_#53FC18]"></div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="h-4"></div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20"></div>

        <div className="relative px-4 md:px-8 pb-4 md:pb-6 flex items-center justify-center">
          <a
            href="https://botrix.live"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-white/20 hover:text-[#53FC18]/60 transition-colors duration-300"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            {t.powered}
          </a>
        </div>
      </div>
    </div>
  );
};

export default BotrixLeaderboard;
