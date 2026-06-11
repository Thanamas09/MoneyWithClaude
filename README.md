# FinTrack — Personal Finance Tracker

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://your-vercel-url.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

A modern, full-stack personal finance tracker built with Next.js 14 and Supabase. Track your income, expenses, wallets, and monthly budgets — all in one place.

![Dashboard](./screenshots/dashboard.png)

## Live Demo

[![Open Demo](https://img.shields.io/badge/Open%20Live%20Demo-%E2%86%92-brightgreen?style=for-the-badge)](https://your-vercel-url.vercel.app)

## Features

- **Transaction Management** — Add, categorise, and delete income/expense transactions with custom categories
- **Multi-Wallet Support** — Track balances across multiple wallets (cash, bank, credit card, etc.)
- **Monthly Overview** — Visualise monthly income vs. expense trends with interactive Recharts graphs
- **Transaction History** — Filter and search past transactions by date, category, or wallet
- **Budget Calculator** — Built-in calculator for quick budget planning
- **User Settings** — Manage custom wallets and categories per account
- **Authentication** — Secure sign-up / login powered by Supabase Auth with per-user data isolation
- **Responsive Design** — Clean neo-brutalist UI built with Tailwind CSS, works on mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Charts | [Recharts 2](https://recharts.org/) |
| Backend / DB | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime) |
| Icons | [Lucide React](https://lucide.dev/) |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) |
| Deployment | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A free [Supabase](https://supabase.com/) project

### Installation

```bash
git clone https://github.com/your-username/money-with-claude.git
cd money-with-claude
npm install
```

### Environment Setup

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find both values in your Supabase project under **Settings → API**.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Account

You can try the live demo without signing up:

| Field | Value |
|---|---|
| Email | `demo@fintrack.app` |
| Password | `demo1234` |

> Note: The demo account is shared and reset periodically. Please do not change the password.

## Project Structure

```
src/
├── app/
│   ├── dashboard/     # Overview with charts and summary cards
│   ├── add/           # Add new transaction
│   ├── history/       # Transaction history with filters
│   ├── monthly/       # Monthly income vs expense view
│   ├── wallets/       # Wallet balance management
│   ├── calculator/    # Budget calculator
│   ├── settings/      # User settings (wallets & categories)
│   ├── login/         # Auth — login page
│   └── register/      # Auth — register page
├── components/        # Shared UI components
└── lib/
    ├── FinanceContext.tsx   # Global state (React Context)
    └── supabase/            # Supabase client helpers
```

## License

[MIT](./LICENSE) © 2024 Thanamas
