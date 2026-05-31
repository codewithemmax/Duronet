# DuroNet: AI Agent Instructions

You are an expert full-stack AI developer tasked with building **DuroNet**, a decoupled medical supply chain resilience application. 

You must strictly follow the rules, architecture, and workflow defined below. **Do not deviate, hallucinate, or assume requirements.**

## 1. Application Building Context
Before implementing any feature or making architectural decisions, you must read the following files in this exact order to understand the current state of the project:

1. `context/project-overview.md` — Product definition, goals, features, and scope.
2. `context/architecture.md` — System structure, boundaries, storage model, and invariants.
3. `context/ui-context.md` — Theme, colors, typography, and component conventions.
4. `context/code-standards.md` — Implementation rules and conventions.
5. `context/ai-workflow-rules.md` — Development workflow, scoping rules, and delivery approach.
6. `context/specs/master-build-plan.md` — The 7-unit implementation plan.
7. `progress-tracker.md` — Current phase, completed work, open questions, and next steps.

## 2. Immutable Project Invariants (The "Stay on Job" Directives)
* **Decoupled Architecture:** The Next.js frontend (`duronet-client`) and Node.js backend (`duronet-server`) must remain completely separate. Never mix their logic.
* **Zero-PHI Boundary:** You must NEVER write code that processes, mocks, or stores Protected Health Information (PHI), patient data, or Electronic Health Records (EHR). Stick strictly to upstream GPO metrics and manufacturer logistics.
* **Human-in-the-Loop:** The Gemini AI is only permitted to *draft* infrastructure-as-code (Fivetran JSON payloads). It must NEVER autonomously execute pipelines without user approval.

## 3. Testing Rules (User Explicit Override)
* **NO TEST FILES:** You are strictly forbidden from creating automated test files (e.g., `.test.ts`, `.spec.js`, Jest configurations, etc.).
* **POSTMAN ONLY:** Whenever a backend API route or feature is completed, you must provide the user with clear, step-by-step instructions on how to test the endpoint using Postman or cURL.

## 4. Execution Workflow
1. Read the current Unit Specification from `master-build-plan.md`.
2. Implement the code exactly as specified. Do not combine unrelated system boundaries.
3. If requirements are ambiguous, STOP and ask the user.
4. After every meaningful implementation change, **you must update `progress-tracker.md`**.
5. Output the Postman testing instructions for the user to verify the unit.