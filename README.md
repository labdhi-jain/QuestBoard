# 🎯 QuestBoard — Gamified Campus Onboarding Platform

> **Agile Development Process Coursework**  
> Complete, runnable web application for freshman campus onboarding via real-world quest discovery, physical QR code check-ins, live competitive leaderboards, and campus reward redemptions.

---

## ⚡ Quick Start (One Command Setup)

### Prerequisites
- **Node.js**: v18+ or v20+
- **npm**: v9+ or v10+

### 1. Install & Seed
From the project root:
```bash
npm run setup
```
*(This installs root, client, and server dependencies, synchronizes the SQLite schema with Prisma, and seeds the database with demo accounts, quests, pre-generated QR codes, and rewards).*

Alternatively, run each step manually:
```bash
npm install
npm run db:push
npm run db:seed
```

### 2. Run the Full Stack App
```bash
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173) (Proxies `/api` to port 4000)
- **Backend API Server**: [http://localhost:4000](http://localhost:4000)

### 3. Run Automated Tests
```bash
npm test
```
Runs the full Vitest suite covering:
- Authentication & college domain security (`@college.edu`)
- QR verification, expirations, and invalidation rules
- Duplicate check-in race conditions and concurrency guards
- Atomic dual-points ledger transactions
- Reward redemption and out-of-stock guards
- Leaderboard ranking with earliest-completion tie-breaking

---

## 👥 Demo Accounts (Credentials)

| Role | Email | Password | Starting Points | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `Admin@123` | — | Orientation staff. Has access to Quest CRUD, QR Manager, Verification Queue, Rewards, and Analytics. |
| **Student** | `aisha@college.edu` | `Student@123` | 50 XP / 50 pts | Top #1 student. Completed "Silent Floor" and "Coffee Canteen". |
| **Student** | `ben@college.edu` | `Student@123` | 50 XP / 50 pts | #2 student. Tied with Aisha at 50 points, but completed his latest quest later (demonstrating the tie-breaker rule!). |
| **Student** | `carlos@college.edu`| `Student@123` | 30 XP / 30 pts | Has 1 pending manual check-in in the queue ("Meet a Senior Mentor"). |
| **Student** | `dana@college.edu` | `Student@123` | 20 XP / 20 pts | Completed 1 quest ("Silent Floor"). |
| **Student** | `evan@college.edu` | `Student@123` | 0 XP / 0 pts | Brand new "Freshie" student with 0 points. |

*(Quick-fill demo buttons are also provided directly on the Login screen for 1-click access during presentations!)*

---

## 🏗️ Architecture & Module Structure

Directly matching the **UML Component Diagram (Part I, Section 8)** and **Sequence Diagrams (Section 4)**:

### 1. Presentation Layer (`/client`)
Built with **React 18 + Vite + TypeScript**, styled with a custom **Neo-Brutalist Pop Design System** using **Tailwind CSS** and animated with **Framer Motion**.
- **Mobile-First Experience**: Optimized at 390px viewport with a floating bottom navigation bar and large raised center scan button; seamlessly scales up to responsive desktop grid layouts.
- **Color Tokens**: Ink (`#1B1340`), Warm Cream (`#FFF8EC`), Primary Violet (`#6C3BFF`), Sunny Yellow (`#FFD23F`), Mint (`#2EE6A6`), Sky Blue (`#3DC8FF`), Hot Pink (`#FF4FA3`), and Tangerine (`#FF7A3D`).
- **Tactile Neo-Brutalism**: Chunky 2.5px borders, 4px hard offset drop-shadows (no blur), and physical arcade button press animations.
- **Accessibility & Contrast**: Ink text strictly enforced on yellow, mint, sky, and pink; white text permitted only on violet and ink.

### 2. Service Layer (`/server/src/services`)
- **`AuthService`**: Handles student registration and login with bcrypt hashing (10 salt rounds) and signed JWT tokens stored in `httpOnly` secure cookies. Enforces college domain restrictions (`ALLOWED_EMAIL_DOMAIN`).
- **`QuestService`**: Serves the student quest board with dynamically computed per-user states (`LOCKED`, `AVAILABLE`, `PENDING`, `COMPLETED`). Handles admin CRUD operations.
- **`QRService`**: Generates unguessable 32-character hex tokens, renders high-resolution PNG QR images with embedded URLs (`{APP_URL}/scan?t=<token>`), and automatically invalidates superseded codes.
- **`CheckInService`**: Core verification engine. Executes atomic transactions (`db.$transaction`) to verify tokens, check prerequisites, prevent duplicate entries via database constraints (`@@unique([userId, questId])`), and credit points.
- **`LeaderboardService`**: Generates the Top 20 rankings sorted by `lifetimePoints` DESC with a deterministic tie-breaker (earliest timestamp of latest verified check-in). Always pins the current student's personal standing.
- **`RewardService`**: Manages the rewards catalog and executes atomic redemptions: decrements spendable `pointsBalance` and stock without reducing `lifetimePoints`.
- **`NotificationService`**: Delivers in-app alerts whenever prerequisite quests unlock or manual submissions receive approval.
- **`StatsService`**: Aggregates cohort metrics and per-quest completion percentages for orientation organizers.

### 3. Persistence Layer (`/server/prisma`)
**SQLite via Prisma ORM**. Offers zero-configuration local setup with schema typing and foreign key referential integrity. Easily migrates to PostgreSQL by changing the provider string in `schema.prisma`.

---

## 📊 Data Model & Dual-Points Ledger

```
User (id, name, email, passwordHash, role, lifetimePoints, pointsBalance)
 │
 ├── 1:N ── Quest (id, title, description, locationHint, pointValue, category, status, prerequisiteQuestId)
 │            │
 │            ├── 1:N ── QRCode (id, questId, token, expiresAt, active)
 │            └── 1:N ── CheckIn (id, userId, questId, status, method, note, verifiedAt)
 │
 ├── 1:N ── RewardRedemption (id, userId, rewardId, pointsSpent)
 │            └── N:1 ── Reward (id, title, description, pointCost, stock, active)
 └── 1:N ── Notification (id, userId, message, read)
```

### The Dual-Points Pattern
- **`lifetimePoints`**: Monotonically increasing counter. Feeds the competitive leaderboard and cosmetic rank titles (Freshie → Explorer → Trailblazer → Campus Legend). **Never decreases.**
- **`pointsBalance`**: Spendable digital currency. Decrements whenever rewards are claimed.
- *Why:* Prevents students from dropping down leaderboard rankings when redeeming rewards, keeping competition fun and fair.

---

## 🎬 2-Minute Demo Presentation Script

Follow this script to deliver an end-to-end live demo:

### Step 1: Admin Creates & Publishes a Quest (30s)
1. Open [http://localhost:5173/auth](http://localhost:5173/auth) and click the **"🛡️ Admin Desk"** fast login button (logs in as `admin@college.edu`).
2. Navigate to **Quests** → Click **"New Quest"**.
3. Enter:
   - **Title**: `Find the Rooftop Telescope`
   - **Location**: `Astronomy Tower, 5th Floor Observation Deck`
   - **Points**: `35`
   - **Category**: `Explore`
   - **Status**: `Published`
4. Click **Create Quest**.
5. Click the **QR Code** icon next to the new quest to open the **Printable Poster View**.
6. Note the QR code and the shortcode displayed on the projector!

### Step 2: Student Discovers & Scans Checkpoint (45s)
1. In another browser tab (or mobile incognito), go to [http://localhost:5173/auth](http://localhost:5173/auth) and click **"👩‍🎓 Student (Aisha)"**.
2. Aisha sees her header with **50 XP** and current rank title **"Explorer"**.
3. Go to **Quests**: Aisha sees `Find the Rooftop Telescope` marked as **AVAILABLE**.
4. Tap **Scan** in the bottom navigation bar:
   - **Camera Scan**: Point a camera at the projector screen.
   - **Manual Fallback**: If presenting on a laptop without HTTPS/camera, type the code shown on the admin poster (or paste `{APP_URL}/scan?t=<token>`).
5. **The Wow Moment**: The signature **Celebration Modal** pops open with a full-screen confetti blast, vibrant `+35 PTS` pop, and Aisha's points count up from **50 XP → 85 XP**!

### Step 3: Leaderboard Updates Live (25s)
1. Switch to the **Ranks** tab (or check the admin dashboard on the projector).
2. Aisha Patel has vaulted from **50 XP to 85 XP**, cementing her undisputed #1 position over Ben Zhang!

### Step 4: Redeem Campus Reward (20s)
1. Go to the **Rewards** store.
2. Aisha has 85 spendable points. Select **"Campus Canteen Free Coffee Voucher" (30 pts)**.
3. Tap **Claim Reward** → Confirm.
4. Confetti triggers! Notice that Aisha's **spendable balance dropped from 85 to 55 pts**, but her **lifetime score remains 85 XP** on the leaderboard!
