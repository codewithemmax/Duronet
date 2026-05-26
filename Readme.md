## 🏗️ Architecture & Deployment Flow

DuroNet operates on a strict **Human-in-the-Loop** architecture, ensuring Zero-PHI risk while maintaining autonomous capabilities. The core feature is the "Deploy" action, which translates AI recommendations into physical infrastructure changes using Fivetran.

1. **AI Reasoning (The Brain):** When a global logistics alert is triggered, Gemini 1.5 Pro analyzes the blast radius and identifies a reliable alternate supplier.
2. **Infrastructure-as-Code Generation:** The AI drafts a structured JSON payload formatted specifically for the Fivetran REST API.
3. **Human Review (The Safeguard):** The AI is explicitly forbidden from executing changes autonomously. The drafted configuration is displayed in the Next.js frontend for an administrator to review.
4. **Live API Execution (The Muscle):** Upon clicking "Approve & Deploy," the Node.js backend securely authenticates with the Fivetran API (`POST /v1/connectors`).
5. **Result:** A live data pipeline is instantly provisioned, routing the new supplier's inventory data directly into the hospital's secure Google Cloud Storage bucket.