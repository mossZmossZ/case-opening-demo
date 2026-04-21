# Phase 1: Monolith — Local npm

## Goal
Working application with full user + admin flow, running locally via `npm install && npm start`.

## Structure
```
case-opening-demo/
├── client/                  # React (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI (ReelCard, PrizeIcon, TierBadge, etc.)
│   │   ├── screens/         # WelcomeScreen, GameScreen, ResultScreen, SummaryScreen
│   │   ├── admin/           # AdminLogin, Dashboard, Prizes, Probability, History
│   │   ├── hooks/           # useApi, useSession
│   │   ├── lib/             # api client, constants, tier metadata
│   │   ├── styles/          # Tailwind config + global CSS
│   │   └── App.jsx
│   ├── tailwind.config.js   # Kinetic Foundry design tokens
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── models/          # Mongoose: User, Session, Prize, AdminUser, Settings
│   │   ├── routes/          # game.js, admin.js
│   │   ├── middleware/       # auth.js (JWT verify)
│   │   ├── services/        # gameService.js (weighted random), prizeService.js
│   │   ├── seed.js          # Database seeder
│   │   └── index.js         # Express entry point
│   └── package.json
├── .env.example
└── package.json             # Root: scripts to run both client + server
```

## API Contracts

### Game API
```
POST /api/game/register
  Body: { name: string, attempts: number }
  Response: { sessionId: string, playerName: string, totalAttempts: number }

POST /api/game/spin/:sessionId
  Response: { prize: { id, name, description, tier, icon_key }, attemptsLeft: number }

GET /api/game/session/:sessionId
  Response: { playerName, totalAttempts, results: [...], status }
```

### Admin API (JWT required)
```
POST /api/admin/login
  Body: { username, password }
  Response: { token: string }

GET    /api/admin/dashboard     → { participants, totalOpens, activeSessions, stockSummary }
GET    /api/admin/prizes        → [{ id, name, tier, weight, totalStock, remainingStock, active }]
POST   /api/admin/prizes        → create prize
PUT    /api/admin/prizes/:id    → update prize
DELETE /api/admin/prizes/:id    → delete prize
GET    /api/admin/rates         → { common: N, rare: N, epic: N, legendary: N }
PUT    /api/admin/rates         → update rates (must sum to 100)
GET    /api/admin/history?page=1&limit=20 → { results: [...], total, page }
```

## Weighted Random Algorithm (Server-Side)
```
1. Fetch all active prizes with remaining_stock > 0
2. Sum all weights
3. Generate random number 0..totalWeight
4. Iterate prizes, subtract weight — first prize where remainder <= 0 wins
5. Decrement remaining_stock atomically (findOneAndUpdate with $inc: -1)
6. If stock hits 0 mid-spin (race condition), retry once with updated pool
```

## How to Run
```bash
# Terminal 1: Start MongoDB (local install or Docker)
mongod --dbpath ./data

# Terminal 2: Seed + start server
cd server && npm install && npm run seed && npm start

# Terminal 3: Start client
cd client && npm install && npm run dev
```

## Done When
- [ ] User can: enter name → select attempts → spin reel → see result → see summary
- [ ] Admin can: login → view dashboard → manage prizes → adjust rates → view history
- [ ] Weighted random runs server-side (not client)
- [ ] Prize stock decrements on each spin
- [ ] UI matches Kinetic Foundry design (dark industrial theme, orange accent, Space Grotesk headlines)
