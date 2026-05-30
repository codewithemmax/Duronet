# DuroNet Master Build Plan

This document contains the complete, step-by-step specifications for all implementation units of the DuroNet project, reflecting the Predictive Control Tower architecture.

---

## Phase 1: The Foundation (Data & Layout)

### Unit 01: Backend Initialization & Mock Data (Node.js)
**Goal:** Establish the `duronet-server` base, configuring the Node.js API and setting up mock telemetry data.
**Scope:** - Initialize Node.js project. 
- Create `src/data/drug-shortages.json` and `src/data/hospital-telemetry.json`. 
- Setup `src/server.ts` with CORS. 
- Create basic `GET /api/inventory/status` endpoints.

### Unit 02: Frontend Layout & Theming (Next.js)
**Goal:** Establish the `duronet-client` base and UI Context.
**Scope:** Initialize Next.js App Router, install shadcn/ui. Build static layout with categorized Sidebar, Main Canvas, Action Panel. Implement 'Enterprise Modules' modal for future features.
Sidebar Structure:
- Group 1 (Core): Global Radar, Inventory Forecast, Alert Feed
- Group 2 (Data Pipelines): Transfer Pipelines (Fivetran), Supplier Database, AI Logs
- Group 3 (Enterprise Modules): Live EHR Sync, Automated POs (Triggers the 'Beta Roadmap' Modal)
- Group 4 (Configuration): System Governance Settings

### Unit 03: The Predictive Dashboard (End-to-End)
**Goal:** Connect the UI to the backend inventory data.
**Scope:** Create API fetch utility. Build `InventoryMatrix` and `ShortageFeed` components. Handle loading/errors and zero-state UI.

---

## Phase 2: The AI Engine (Reasoning & Governance)

### Unit 04: Gemini Reasoning Service (Node.js)
**Goal:** Integrate the LLM to act as a Prescriptive Analytics Copilot.
**Scope:** Create `src/services/ai.ts`. Prompt Gemini to evaluate critical shortage alerts, locate regional surplus, calculate logistical feasibility, and recommend emergency transfer routes. Return structured JSON analysis.

### Unit 05: Fivetran Configuration Drafter (Node.js)
**Goal:** Generate the infrastructure-as-code payload to route emergency inventory.
**Scope:** Expand Gemini prompt to draft a Fivetran JSON payload matching their REST API schema (`service`, `group_id`, `config`) to onboard the surplus supplier. Use `zod` to validate the payload structure.

### Unit 06: The AI Action Panel (Next.js)
**Goal:** Visualize the AI's prescriptive strategy, enforce governance, and display realistic inventory breakdowns.
**Scope:** - Render the **Surplus Breakdown**: Total Stock, Committed Orders, Truly Available, and Requested amounts.
- Build the **Multi-Stakeholder Governance Checklist**: UI requiring the simulated "pinging" of a Pharmacy Director and Supply Chain Manager.
- Ensure the main Fivetran deployment button is strictly disabled until the governance checklist is complete.

---

## Phase 3: The Enterprise Constraint & Live Execution

### Unit 07: Live Fivetran API Deployment & Physical Tracking (End-to-End)
**Goal:** Enforce Human-in-the-Loop safety while executing a REAL Fivetran API call, and decouple data movement from physical reality.
**Scope:**
- Create `POST /api/deploy` endpoint on Node.js backend using `FIVETRAN_API_KEY` and `FIVETRAN_API_SECRET` to execute a live Fivetran pipeline creation.
- **Frontend State Machine:** Upon successful deployment (201 status), do NOT immediately resolve the crisis. Instead, transition the Action Panel to a **4-Stage Physical Tracker**: (1) Pipeline Deployed → (2) Transfer Authorized → (3) In Transit → (4) Physically Received.
- Require a manual "Confirm Dock Receipt" UI click to resolve the alert.

---

## Phase 4: Prescriptive Analytics

### Unit 08: Predictive Control Tower (Geospatial Map)
**Goal:** Visually map Anticipatory Logistics and inventory health.
**Scope:** Integrate an interactive geospatial map at the top of the Main Canvas to plot hospitals and regional hubs. 
- Map markers track inventory health (Green = Surplus, Red = Imminent Shortage based on predictive math, Amber = Emergency Transfer In Transit).

### Unit 09: Predictive Demand Engine (Node.js)
**Goal:** Calculate dynamic reorder points based on live telemetry instead of static thresholds.
**Scope:** - Create `GET /api/inventory/predict` endpoint on the Express server.
- Write the deterministic mathematical logic to cross-reference `currentInventory` with `livePatientInflux` (burn rate).
- Output the `DaysOfSupplyRemaining` metric. If the metric drops below 5 days, trigger the UI shortage alert and Gemini Action Panel.

---

## Phase 5: Enterprise Polish

### Unit 10: Smoke & Mirrors UIs (Next.js)
**Objective:** Create high-fidelity static mock pages for the secondary sidebar navigation links to demonstrate the long-term enterprise vision during the hackathon pitch. 
**Strict Constraints:** - These pages are strictly frontend UI. Do NOT build backend API routes for these.
- Maintain the strict Dark Mode Emerald/Teal theme defined in `ui-context.md`.
- Ensure the Next.js `app/` router directory structure is used.

**Target Pages:**
1. `/inventory-forecast`: A data table showing predictive burn rates across all SKUs.
2. `/transfer-pipelines`: A pipeline monitoring dashboard with metric cards showing active Fivetran sync statuses.
3. `/ai-logs`: A timeline view of Gemini's decision-making process for supply chain pivots.