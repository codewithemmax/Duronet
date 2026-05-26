# DuroNet Master Build Plan

This document contains the complete, step-by-step specifications for all 8 implementation units of the DuroNet project. 

---

## Phase 1: The Foundation (Data & Layout)

### Unit 01: Backend Initialization & Mock Data (Node.js)
**Goal:** Establish the `duronet-server` base, configuring the Node.js API and setting up mock static data.
**Scope:** Initialize Node.js project. Create `src/data/fda-alerts.json` and `src/data/gpo-metrics.json`. Setup `src/server.ts` with CORS. Create `GET /api/logistics/status`.

### Unit 02: Frontend Layout & Theming (Next.js)
**Goal:** Establish the `duronet-client` base and UI Context.
**Scope:** Initialize Next.js App Router, install shadcn/ui. Build static layout with categorized Sidebar, Main Canvas, Action Panel. Implement 'Enterprise Modules' modal for future features.
Sidebar Structure:
- Group 1 (Core): Global Radar, Risk Matrix, Alert Feed
- Group 2 (Data Pipelines): Fivetran Connectors, Supplier Database, AI Logs
- Group 3 (Enterprise Modules): Live EHR Sync, Automated POs (These still trigger the 'Beta Roadmap' Modal)
- Group 4 (Configuration): Project Settings

### Unit 03: The Risk Matrix Dashboard (End-to-End)
**Goal:** Connect the UI to the backend data.
**Scope:** Create API fetch utility. Build `RiskMatrix` and `AlertFeed` components. Handle loading/errors.

---

## Phase 2: The AI Engine (Reasoning & Drafting)

### Unit 04: Gemini Reasoning Service (Node.js)
**Goal:** Integrate the LLM to analyze supply chain risk.
**Scope:** Create `src/services/ai.ts`. Analyze FDA alert vs GPO volume. Return structured JSON risk analysis.

### Unit 05: Fivetran Configuration Drafter (Node.js)
**Goal:** Generate the infrastructure-as-code payload.
**Scope:** Expand Gemini prompt to draft a Fivetran JSON payload matching their REST API schema (`service`, `group_id`, `config`). Use `zod` to validate.

### Unit 06: The AI Action Panel (Next.js)
**Goal:** Visualize the AI's "thinking" and the drafted payload.
**Scope:** Wire UI alerts to trigger the AI endpoint. Render AI reasoning and the drafted Fivetran JSON in a styled code block.

---

## Phase 3: The Enterprise Constraint & Live Execution

### Unit 07: Live Fivetran API Deployment (End-to-End)
**Goal:** Enforce Human-in-the-Loop safety while executing a REAL Fivetran API call.
**Scope:**
- Add "Approve & Deploy" button in Next.js Action Panel.
- Create `POST /api/deploy` endpoint on Node.js backend.
- **LIVE INTEGRATION:** Instead of mocking, this endpoint must use the `FIVETRAN_API_KEY` and `FIVETRAN_API_SECRET` to execute a live `POST https://api.fivetran.com/v1/connectors` request using the AI-drafted payload.
- Update Next.js UI to show a "Deployment Successful" toast only if Fivetran returns a 201 Created status.

---

## Phase 4: Advanced Visualization

### Unit 08: Global Threat Radar (Geospatial Map)
**Goal:** Visually prove the "outward-looking" value proposition.
**Scope:** Integrate an interactive geospatial map at the top of the Main Canvas to plot physical locations of FDA alerts.

## Phase 5 - Unit 09: Enterprise Polish (Smoke & Mirrors UIs)
**Objective:** Create high-fidelity static mock pages for the secondary sidebar navigation links to demonstrate the long-term enterprise vision during the hackathon pitch. 
**Strict Constraints:** - These pages are strictly frontend UI. Do NOT build backend API routes for these.
- Maintain the strict Dark Mode Emerald/Teal theme defined in `ui-context.md`.
- Ensure the Next.js `app/` router directory structure is used (e.g., `app/risk-matrix/page.tsx`).

**Target Pages:**
1. `/risk-matrix`: A data table showing supplier risk scores.
2. `/fivetran-connectors`: A pipeline monitoring dashboard with metric cards.
3. `/ai-logs`: A timeline view of Gemini's decision-making process.