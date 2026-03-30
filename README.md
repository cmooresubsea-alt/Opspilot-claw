# OpsPilot
### Multi-location Operations, Maintenance & Compliance Platform

---

## Project Structure
```
opspilot/
├── backend/                ← Node.js + Express API
│   ├── src/
│   │   ├── index.js       ← Server entry point
│   │   ├── db/
│   │   │   ├── index.js   ← Database connection
│   │   │   ├── migrate.js ← Creates all tables
│   │   │   └── seed.js    ← Demo data for testing
│   │   ├── middleware/
│   │   │   └── auth.js    ← JWT auth + role guards
│   │   └── routes/
│   │       ├── auth.js    ← Login, register, profile
│   │       ├── tasks.js   ← Task CRUD
│   │       ├── api.js     ← Incidents, assets, locations, checklists, messaging
│   │       └── billing.js ← Stripe subscriptions
│   ├── package.json
│   └── .env.example       ← Copy to .env and fill in
│
├── frontend/              ← React + Vite
│   ├── src/
│   │   ├── App.jsx        ← Router + auth protection
│   │   ├── main.jsx       ← Entry point
│   │   ├── api/
│   │   │   └── client.js  ← All API calls in one place
│   │   ├── context/
│   │   │   └── AuthContext.jsx ← Global auth state
│   │   ├── pages/
│   │   │   └── Auth.jsx   ← Login + Register pages
│   │   └── components/
│   │       └── AppShell.jsx ← Main app with all pages
│   ├── index.html
│   └── vite.config.js
│
├── DEPLOYMENT_GUIDE.md    ← Step-by-step to go live
└── README.md
```

## Running Locally

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Fill in your values
node src/db/migrate.js  # Create tables
node src/db/seed.js     # Add demo data
npm run dev             # Start on port 3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Start on port 5173
```

Open http://localhost:5173 and log in with owner@suddaddeez.com / OpsPilot2024!

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Real-time | Socket.io |
| Payments | Stripe |
| Hosting | Railway |

## Commercial Architecture

- Multi-tenant: Every record has tenant_id — complete data isolation between customers
- Subscription tiers: Starter / Professional / Enterprise with user/location limits
- 14-day free trial: Auto-created on registration, no card required
- Stripe integration: Full checkout, webhooks, customer portal
- Role-based access: owner → manager → location_manager → employee