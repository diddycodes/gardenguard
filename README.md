# GardenGuard

**Community-driven scammer watchlist for Grow a Garden 2.** Report scammers, upload evidence, and protect fellow players. Every report verified by our admin team.

🔗 **Live:** [gardenguard.app](https://gardenguard.app)  
📖 **Open Source:** Full source code transparency on the [Open Source page](https://gardenguard.app/open-source)

---

## Features

- **Report Scammers**: Submit reports with screenshots, platform info, and scam type
- **Verified Watchlist**: Only admin-approved reports appear publicly
- **Community Chat**: Real-time global chat for players
- **Admin Dashboard**: Review reports, manage messages, audit logs
- **User Profiles**: Track your submissions and activity
- **Row-Level Security**: Data access controlled at database level, not just UI

---

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Base44 BaaS (Auth, Database, File Upload)
- **UI**: shadcn/ui + Radix UI
- **State**: TanStack Query (React Query)
- **Icons**: Lucide React

---

## Project Structure

```
src/
├── pages/          # Route pages (Home, Reports, Chat, Admin, etc.)
├── components/     # Reusable UI components
├── lib/            # Auth context, utilities, config
├── hooks/          # Custom React hooks
├── api/            # Base44 client setup
├── index.css       # Design tokens & global styles
└── App.jsx         # Router setup & middleware
```

---

## Getting Started

### Prerequisites
- Node.js 16+ & npm/yarn
- Base44 account (for backend)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/gardenguard.git
cd gardenguard

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your Base44 app credentials

# Start dev server
npm run dev
```

The app runs on `http://localhost:5173` by default.

---

## Build & Deploy

```bash
# Production build
npm run build

# Preview production build locally
npm run preview

# Linting & type checking
npm run lint
npm run typecheck
```

---

## Security & Data Privacy

### Row-Level Security (RLS)

All data access is controlled at the database level through RLS policies:

- **ScammerReport**: Approved reports public; pending reports private to reporter + admins
- **ChatMessage**: Public read; owner/admin delete only
- **AdminActivityLog**: Admin-only (complete access restriction)

See [src/base44/entities/](./base44/entities/) for full RLS definitions.

### No Data Selling

We collect only:
- Display name
- Email address
- Profile picture (optional)

Reports and chat messages are never sold or shared with third parties.

### Admin Audit Trail

Every admin action (approve, reject, delete) is logged in an immutable audit log viewable by admins only.

---

## How It Works

### 1. Report a Scammer
- Submit username, platform, scam type, description, and evidence (screenshots)
- Reports default to **pending** (private to reporter + admins)

### 2. Admin Review
- Admin reviews the report and evidence
- Approves (makes public) or rejects (deleted)
- Action logged in audit trail

### 3. Public Watchlist
- Approved reports appear on the watchlist for all users
- Can be searched, filtered, and commented on

---

## Key Pages

| Page | Auth Required | Role | Purpose |
|------|---|---|---|
| `/` | No | Public | Home page with stats & how-it-works |
| `/reports` | No | Public | Browse verified scammer watchlist |
| `/submit` | Yes | User | Submit a new report |
| `/chat` | Yes | User | Real-time community chat |
| `/profile` | Yes | User | User settings & password management |
| `/admin` | Yes | Admin | Review reports, manage messages, logs |
| `/open-source` | No | Public | Transparency: source code & policies |

---

## Environment Variables

```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_FUNCTIONS_VERSION=v1
VITE_BASE44_APP_BASE_URL=https://your-app-url
```

---

## Contributing

This project is open-source under [LICENSE]. Contributions are welcome!

- Found a security issue? Report it on the [Open Source](open-source) page
- Have a feature idea? Open an issue or PR

---

## Deployment

### Deploy on Netlify / Vercel

1. Push code to GitHub
2. Connect repo to Netlify / Vercel
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in the platform dashboard
6. Deploy!

### Or manually:

```bash
npm run build
# Upload the 'dist/' folder to any static host
```

---

## Support & Feedback

- 🐛 Found a bug? Open an issue
- 💬 Have questions? Check the [Open Source](open-source) page for architecture details
- 📧 Security concern? Report via the app's submit page

---

## License

[Add your license here — e.g., MIT, Apache 2.0, etc.]

---

**Stay safe out there.** 🛡️
