# 🎮 iABS Stream Hub

> البث المباشر، التفاعل، والمجتمع — منصة iABS الشاملة

![iABS Banner](https://i.postimg.cc/jjsCB3zT/iABSs.png)

## ✨ Features

- **📺 Live Stream** — Kick embed with low-latency player and auto-reconnect
- **📊 Social Stats** — Live follower counts from Kick, YouTube, TikTok, X, Snapchat, Instagram, Discord & WhatsApp
- **🤖 AI Chat** — DeepSeek-powered assistant speaking Saudi slang, with custom Kick emotes & social link rendering
- **🏆 Botrix Leaderboard** — Top gifters & supporters with levels, watchtime & XP
- **🎬 Highlight Clips** — YouTube & TikTok highlight reel
- **📅 Stream Schedule** — Weekly plan visible to all visitors
- **❓ FAQ Section** — Community Q&A with toggle
- **📢 Announcement Bar** — Scrolling news ticker
- **💰 Sponsors & Discount Codes** — Promo displays with one-click copy
- **🎨 Studio Section** — Community submissions with approve/reject moderation
- **🔐 Admin Dashboard** — Full RBAC control panel (polls, media, SEO, audit logs, AI chat logs)
- **⚡ Edge Proxy** — Vercel Edge Function for CORS-free API fetching

## 🛠 Tech Stack

| Frontend | Backend / Infra |
|----------|----------------|
| React 19 + TypeScript | Supabase (Postgres + Auth + REST) |
| Vite 6 | Vercel Edge Functions |
| Tailwind CSS (inline) | DeepSeek API (AI) |
| HLS.js (stream player) | Botrix.live API |
| GitHub Pages (hosting) | Kick.com API |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/HSG116/iABS_AR.git
cd iABS_AR

# Install
npm install

# Dev server (port 3000)
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🔑 Environment

The project uses inline configuration for Supabase, DeepSeek API keys, and social links. No `.env` file required for basic operation.

| Variable | Location |
|----------|----------|
| Supabase URL & Key | `supabaseClient.ts` |
| DeepSeek API keys | `components/AIChat.tsx` (3-key fallback) |
| Social links | `App.tsx` — `createSocialLink()` |

## 📁 Project Structure

```
├── api/                  # Vercel Edge Functions
│   └── kick.ts           # API proxy (Kick & Botrix)
├── components/
│   ├── AdminDashboard.tsx # Full admin panel
│   ├── AIChat.tsx         # AI assistant with emotes
│   ├── BotrixLeaderboard.tsx
│   ├── StatsSection.tsx   # Live stats + leaderboard
│   ├── KICKsSection.tsx   # Stream player
│   ├── StudioSection.tsx  # Community submissions
│   ├── PublicWidgets.tsx   # Schedule, FAQ, sponsors
│   └── ...
├── App.tsx                # Main app with routing
├── supabaseClient.ts      # Supabase singleton
└── vite.config.ts         # Vite + dev proxy
```

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

## 📬 Contact

- **Business Inquiries:** ABSX84@gmail.com | +966 550 348 751

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/HSG116">HSG</a> for the iABS Community<br>
  <a href="https://discord.com/users/1416151331965767810">💬 Join Discord</a> ·
  <a href="https://x.com/Moh_HSG">🐦 Follow on X</a>
</p>
