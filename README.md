# 🌌 Social Sync v2.4 — Agency Command Center

Social Sync is a **Next.js 16 + FastAPI** powered multi-tenant orchestration platform. It is engineered for high-growth agencies to manage, automate, and scale social media presence across 100+ independent brand portfolios.

---

## 🚀 Enterprise Features

### 🏢 Agency Portfolio Matrix (100+ Clients)
*   **Scalable Search & Filter**: Instant lookup across massive brand portfolios using a high-density Matrix UI.
*   **Status Monitoring**: At-a-glance health checks for every client account (Connected, Expiring, Offline).
*   **Portfolio Pruning**: Safe onboarding and deletion workflows with full data isolation.

### 🏝️ Island Mode (Deep Isolation)
*   **Strict Multi-Tenancy**: Every client workspace acts as an independent "Operational Island." 
*   **Context-Aware Navigation**: Automatic sidebar switching hides administrative tools when inside a client panel to prevent cross-tenant leakage.
*   **Dynamic Scoping**: All operations (Posts, Accounts, Stats) are dynamically scoped to the active `client_id` context.

### 🖋️ Celestial Composer
*   **Poly-Channel Sync**: Draft one post and broadcast it across Facebook, Instagram, LinkedIn, and YouTube.
*   **Platform Overrides**: Customize captions and media for individual platforms within a single drafting session.
*   **Live Preview**: Real-time simulated mockups for each platform to ensure visual perfection before dispatch.

---

## 🛠️ Tech Stack & Requirements

*   **Frontend**: Next.js 16 (Turbopack), React 19, Tailwind v4.
*   **Backend**: FastAPI (Python 3.10+), PostgreSQL (SQLAlchemy).
*   **Security**: AES-256 Fernet Encryption for Social Tokens, localStorage session gating.
*   **Tunneling**: ngrok (Mandatory for Meta Graph API compliance).

---

## 📂 Project Structure

```bash
├── frontend/             # Next.js 16 Enterprise UI
│   ├── src/app/          # Page Router & Global Contexts
│   ├── src/components/   # Isolated UI Components (Sidebar, Modals)
│   └── src/context/      # Brand & Auth Context Engines
└── backend/              # FastAPI High-Performance Logic
    ├── app/models/       # Scalable SQL Schemas
    ├── app/services/     # Platform APIs (Meta, Media, AI)
    └── app/routers/      # REST API Controllers
```

---

## 📈 Current Roadmap Status

- [x] **Phase 1**: FOUNDATION (DB & Tunneling)
- [x] **Phase 2**: HANDSHAKE (Meta/OAuth & Page Scoping)
- [x] **Phase 3**: SCALE (100+ Client Search & Identity Management)
- [x] **Phase 4**: ISOLATION (Island Mode & Contextual Navigation)
- [ ] **Phase 5**: INTELLIGENCE (Bulk Upload & AI Suggestion Engine)

---

## 🆘 Troubleshooting & Setup
1.  **ngrok Configuration**: Ensure your Meta Callback matches your static ngrok domain exactly.
2.  **Auth Gate**: The default Master Admin credentials are set in `AuthContext.tsx` (`akash` / `1234`).
3.  **Client Seeding**: Use the Admin Tooling to initialize your first brand portfolio.

For detailed architecture, see [PRD.md](./PRD.md).
