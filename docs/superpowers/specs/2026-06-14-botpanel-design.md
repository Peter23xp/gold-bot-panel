# Gold Bot Panel — Design Spec

**Date:** 2026-06-14
**Status:** Approved

---

## 1. Overview

A multi-tenant web control panel for the Gold (XAUUSD) algorithmic trading bot running on AWS VPS via Docker. Replaces SSH access with a secure, browser-based interface.

**Two roles:**
- `admin` — full access: all accounts, user management, Docker control, bot settings
- `user` — scoped access: their own MT5 accounts only, read/write on logs/trades/P&L

---

## 2. Architecture

```
VERCEL (Frontend)
  React 18 + Vite + TypeScript
  TailwindCSS + shadcn/ui
  Tanstack Query (data fetching)
  Deployed: Vercel (global CDN)
        │
        │ HTTPS REST + WebSocket
        ▼
AWS VPS — new Docker container: panel-api (:8000)
  FastAPI + Python 3.11
  Docker SDK (controls gold-bot container)
  PostgreSQL client (asyncpg)
  JWT auth (python-jose)
  WebSocket endpoint: streams docker logs
        │
        ├── postgres container (:5432)
        │     users, accounts, trade_history, bot_settings
        │
        └── gold-bot container (existing)
              controlled via Docker SDK
```

**Communication:** Vercel calls `http://<VPS_IP>:8000` for REST. WebSocket at `ws://<VPS_IP>:8000/ws/logs/{account_id}` for live logs. Port 8000 opened in AWS Security Group.

---

## 3. Data Model (PostgreSQL)

### `users`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| hashed_password | VARCHAR | bcrypt |
| role | ENUM('admin','user') | |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |

### `accounts`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| display_name | VARCHAR | e.g. "XM Real #1" |
| mt5_login | INTEGER | |
| mt5_password_enc | TEXT | AES-256 encrypted |
| mt5_server | VARCHAR | e.g. "XMGlobal-MT5 2" |
| container_name | VARCHAR | e.g. "gold-bot-container" |
| is_active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |

### `trade_history`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| account_id | UUID FK → accounts | |
| ticket | BIGINT | MT5 ticket number |
| symbol | VARCHAR | GOLD |
| order_type | ENUM('BUY','SELL') | |
| volume | DECIMAL | lot size |
| price_open | DECIMAL | |
| price_close | DECIMAL | |
| sl | DECIMAL | |
| tp | DECIMAL | |
| profit | DECIMAL | in account currency |
| open_time | TIMESTAMPTZ | |
| close_time | TIMESTAMPTZ | |
| duration_seconds | INTEGER | computed |

### `bot_settings`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| account_id | UUID FK → accounts | |
| key | VARCHAR | e.g. RISK_PER_TRADE_PCT |
| value | TEXT | |
| updated_at | TIMESTAMPTZ | |
| updated_by | UUID FK → users | |

---

## 4. Backend API (FastAPI)

### Auth
| method | path | description |
|---|---|---|
| POST | `/auth/login` | email+password → JWT access token (24h) + refresh token (7d) |
| POST | `/auth/refresh` | refresh token → new access token |
| POST | `/auth/logout` | invalidate refresh token |

### Accounts
| method | path | description |
|---|---|---|
| GET | `/accounts` | list accounts for current user (admin sees all) |
| POST | `/accounts` | create account (admin only) |
| PUT | `/accounts/{id}` | update account |
| DELETE | `/accounts/{id}` | delete account (admin only) |

### Bot Control
| method | path | description |
|---|---|---|
| GET | `/bot/{account_id}/status` | container status: running/stopped/error + uptime |
| POST | `/bot/{account_id}/start` | `docker start <container>` |
| POST | `/bot/{account_id}/stop` | `docker stop <container>` |
| POST | `/bot/{account_id}/restart` | `docker restart <container>` |
| WS | `/ws/logs/{account_id}` | stream `docker logs -f <container>` over WebSocket |

### Dashboard Data
| method | path | description |
|---|---|---|
| GET | `/dashboard/{account_id}` | balance, equity, daily P&L, drawdown, open positions |
| GET | `/dashboard/{account_id}/pnl/chart` | P&L curve last N days |

### Trade History
| method | path | description |
|---|---|---|
| GET | `/trades/{account_id}` | paginated trade list, filters: date range, symbol, win/loss |
| GET | `/trades/{account_id}/summary` | total trades, win rate, total profit, best/worst trade |
| GET | `/trades/{account_id}/export` | CSV download |

### Settings (admin only)
| method | path | description |
|---|---|---|
| GET | `/settings/{account_id}` | current bot_settings |
| PUT | `/settings/{account_id}` | update settings, writes .env on VPS, restarts container |
| GET | `/users` | list all users (admin) |
| POST | `/users` | create user (admin) |
| DELETE | `/users/{id}` | delete user (admin) |

---

## 5. Frontend Pages

### App Shell
- Fixed left sidebar (240px): logo, nav links, account selector dropdown, user avatar + role badge, logout
- Top bar (56px): page title, current account name, bot status badge (always visible)
- Sidebar collapses to 56px icon-only rail at < 1024px
- Mobile (< 640px): bottom nav bar replaces sidebar

### Page 1: Login (`/login`)
- Email + password form, centered card on dark bg
- Gold "Sign in" primary button
- JWT stored in httpOnly cookie via `/auth/login`
- Redirect to `/dashboard` on success
- Error state: inline message under form, never a modal

### Page 2: Dashboard (`/dashboard`)
Four zones:

**Zone A — Account Stats Row** (4 metric tiles):
- Balance (account currency)
- Equity (live)
- Daily P&L (green if positive, red if negative, +/- format)
- Drawdown % (red if > 3%)

No hero-metric template. Tiles are compact (not oversized): value in `--text-2xl` weight 700, label in `--text-xs --ink-2`. No gradients.

**Zone B — Bot Status Card** (right side):
- Status badge: RUNNING (gold pulse dot) / STOPPED (grey) / ERROR (red flash)
- Uptime: e.g. "Running for 6d 12h"
- Three buttons side by side: Start / Stop / Restart (ghost buttons, destructive color on Stop)
- One click, no confirmation modal — speed to action is a design principle

**Zone C — Open Positions Table**:
- Columns: Symbol | Type | Lots | Open Price | Current Price | SL | TP | Profit
- Profit column: green text if positive, red if negative
- Empty state: "No open positions" — not blank

**Zone D — P&L Chart** (last 7 days):
- Simple line chart (Recharts or lightweight-charts)
- Gold line on dark background
- Axis labels in `--ink-3`, tooltip in `--surface-2`
- No area fills, no gradients

### Page 3: Logs (`/logs`)
- Full-height terminal panel
- WebSocket connection to `/ws/logs/{account_id}` — auto-reconnect on drop
- Color by level: INFO (`--ink-2`), WARN (`--warning`), ERROR (`--loss`), timestamp (`--ink-3`)
- Filter bar: INFO / WARN / ERROR toggle chips
- Toolbar: Auto-scroll toggle, Clear button, Connection status dot
- Font: `--font-mono --text-sm`
- Background: `oklch(0.05 0 0)` — deepest black
- New lines animate in: opacity 0→1 + translateY 4px→0, 100ms

### Page 4: Trade History (`/trades`)

**Summary Bar** (top, 5 stats):
Total Trades | Win Rate % | Total Profit | Best Trade | Worst Trade

**Filter Bar**:
- Date range picker (from/to)
- Symbol filter (GOLD only for now, expandable)
- Result filter: All / Win / Loss
- Export CSV button (ghost, right-aligned)

**Trades Table** (paginated, 25 rows/page):
| Date | Type | Lots | Open | Close | SL | TP | Profit | Duration |
- Profit: green (positive) / red (negative), always show + or - sign
- Date/time in UTC with explicit "UTC" suffix
- Ticket number in monospace
- Pagination: prev/next + page number

### Page 5: Settings (`/settings`) — admin only

**Tab 1: Bot Parameters**
Editable fields for key bot variables:
- Risk per trade (%)
- Trading hours start/end (UTC)
- Max open trades
- Max daily drawdown (%)
- ATR SL multiplier / TP multiplier
- Trailing stop enabled (toggle)
- Check interval (seconds)

Save button writes to `bot_settings` table AND patches `.env` on VPS via FastAPI, then restarts the container. Confirmation toast: "Settings saved — bot restarting…"

**Tab 2: MT5 Accounts**
- Table of accounts: display name, MT5 login, server, status, assigned user
- Add / Edit / Delete actions (row-level)
- Password field masked, never returned by API after save

**Tab 3: Users**
- Table: email, role badge, created date, active status toggle
- Invite new user: email + role selector
- Delete user (with confirmation: "This will remove access for <email>")

---

## 6. Security

- JWT in httpOnly cookies — never in localStorage
- MT5 passwords AES-256 encrypted at rest, encryption key in VPS env var (not in DB)
- All `/bot/*` and `/settings/*` endpoints: admin-only guard OR user scoped to their own accounts
- CORS: FastAPI allows only Vercel domain (`https://*.vercel.app` + production domain)
- Rate limiting on `/auth/login`: 5 attempts / minute per IP
- Port 8000 AWS Security Group: open to `0.0.0.0/0` (required for Vercel) — consider IP allowlist later

---

## 7. Deployment

### Backend (VPS)
New `docker-compose.yml` at `/home/ec2-user/`:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: botpanel
      POSTGRES_USER: botpanel
      POSTGRES_PASSWORD: <from env>
    volumes:
      - pg_data:/var/lib/postgresql/data

  panel-api:
    build: ./panel-api
    ports:
      - "8000:8000"
    depends_on: [postgres]
    environment:
      DATABASE_URL: postgresql+asyncpg://botpanel:<pw>@postgres/botpanel
      JWT_SECRET: <from env>
      ENCRYPTION_KEY: <from env>
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock  # Docker SDK access

  gold-bot:
    image: gold-bot:latest
    # existing config unchanged
```

### Frontend (Vercel)
- `panel/` directory → Vercel project
- Env var: `VITE_API_URL=http://13.220.233.0:8000`
- Deploy on push to `main` branch

---

## 8. Out of Scope (v1)

- HTTPS / SSL on the API (add Nginx + Certbot later)
- Multi-symbol bots (GOLD only for now)
- Push notifications / alerts
- Deploying new bot instances from the panel
- Two-factor authentication
