# 🌌 Social Sync v2.4 — Product Requirements Document (PRD)

## 1. Vision Statement
To provide a high-performance, agency-grade terminal for managing massive social media portfolios. Social Sync focuses on **Extreme Scalability**, **Strict Data Privacy**, and **Operational Speed**.

## 2. Updated Technical Stack
- **Modern Web Architecture**: Next.js 16 (Turbopack) & React 19.
- **Styling Engine**: Tailwind CSS v4 (Zero-config Utility Engine).
- **Typography**: Outfit (Display) & Inter (UI) for a high-end agency aesthetic.
- **Backend**: FastAPI (Python 3.12+), PostgreSQL, SQLAlchemy.
- **Environment**: Strict ngrok tunneling for Meta/Instagram compliance.

## 3. Structural Features

### ✅ Phase 3: High-Volume Portfolio (COMPLETED)
- [x] **Scalable Matrix UI**: Designed to handle 100+ clients with sub-second performance.
- [x] **Global Search Engine**: Real-time filtering across the entire client ecosystem.
- [x] **Status Pulse**: Color-coded health indicators (Offline/Expiring/Ready) for instant monitoring.
- [x] **Add/Delete Workflows**: Secure brand onboarding and pruning with confirmation safeguards.

### ✅ Phase 4: Extreme Isolation (COMPLETED)
- [x] **Island Mode Architecture**:
    - Complete UI separation between "Agency Master" and "Client Operator" modes.
    - Context-aware sidebars that hide admin tools when a client workspace is active.
- [x] **Identity Terminal**:
    - Centralized "Master Admin" profile management.
    - Secure Logout & Session clearing logic.
    - Editable Admin display name with persistent local storage.

### 📅 Phase 5: Advanced Intelligence (UPCOMING)
- [ ] **AI Caption Engine**: Integration with LLMs for tone-specific content generation.
- [ ] **Bulk Ingestion Hub**: CSV/JSON based mass-uploading for 30-day content pipelines.
- [ ] **Cross-Client Analytics**: Aggregated growth reports across the entire 100+ brand portfolio.

## 4. Operational Protocols
| Mode | Purpose | Visibility |
| :--- | :--- | :--- |
| **Agency Master** | Portfolio Management | Full Access to Add/Delete/Search all clients. |
| **Client Operator** | Execution & Posting | Isolated access to one brand's Stats/Posts/Accounts. |

## 5. Security Architecture
- **Token Protection**: Fernet Encryption (AES-256) at rest.
- **Context Injection**: The `ActiveClient` context acts as the single source of truth for all API requests. Client tokens are never leaked between workspaces.
- **Auth Gate**: LocalStorage session gating with ngrok domain verification.

---
*Last Updated: 2026-04-20 — Agency Command Center v2.4 Build*
