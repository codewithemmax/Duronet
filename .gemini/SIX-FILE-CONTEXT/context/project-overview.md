# DuroNet: The Predictive Control Tower for Patient Care

## Inspiration: The Human Cost of a Broken Chain
Behind every supply chain metric, there is a human heartbeat. In 2023, hospitals faced an average of 301 drug shortages per quarter. But "shortage" is a cold, clinical word. In the real world, a shortage means a cancer patient’s chemotherapy is delayed. It means a pediatric surgery is canceled because there is no anesthetic. It means doctors and pharmacists scrambling at 2:00 AM, fighting a systemic collapse they cannot see coming.

When we looked at the drug shortage crisis, we realized the tech industry has been misdiagnosing the disease. We keep trying to fix the supply chain *reactively*. Current dashboards only tell hospital administrators that they are running out of medicine faster. **But prediction without procurement power is just an early panic.** 

We realized that to protect patients, we had to shift from reactive tracking to **Anticipatory Logistics**. We built **DuroNet** because a patient's survival should never depend on a blind spot in the global supply chain.

## What it does: The Predictive Shield
DuroNet is an AI-driven, Prescriptive Analytics control tower for hospital procurement teams. It acts as an invisible shield, anticipating local inventory collapse before it ever reaches the hospital doors.

Instead of relying on static reorder points, DuroNet features a **Predictive Demand Engine**. It cross-references current hospital inventory levels with real-time patient influx telemetry to calculate a dynamic "burn rate." If a sudden influx of respiratory patients causes the "Days of Supply Remaining" for Albuterol to drop below a critical threshold, DuroNet initiates a prescriptive rescue protocol:

1. **Feasible Surplus Identification:** The system leverages Gemini to instantly locate regional surplus inventory. It goes beyond toy metrics by presenting a strict breakdown of *Total Stock* vs. *Committed Orders* to guarantee the *Truly Available* surplus can fulfill the emergency request.
2. **Automated Pipeline Drafting:** The agent autonomously drafts the precise Fivetran data pipeline configuration needed to secure the new supply line.
3. **Multi-Stakeholder Governance:** To model the reality of hospital administration, the "Deploy" action is gated. DuroNet surfaces a notification checklist requiring coordination from the Pharmacy Director and Supply Chain Manager before the Fivetran pipeline can be authorized. 

## How we built it: Safe, Agentic Action
We built DuroNet using a modern, server-rendered stack and a strict "human-in-the-loop" AI architecture:
* **Frontend & Backend:** Built on Next.js (App Router) and an Express/Node.js backend, featuring a dark-mode, high-contrast React dashboard designed for urgency and clarity.
* **The Brain:** We utilized a lightweight Node-based time-series forecasting engine to calculate dynamic consumption rates, paired with **Gemini 1.5 Pro via Vertex AI** to reason over mitigation strategies and logistics mapping. 
* **The Muscle (Action & Reality Tracking):** We integrated with the **Fivetran API** to instantly provision zero-touch ELT pipelines. Crucially, we decoupled the *data event* from the *physical event*. Fivetran deployment initiates a four-stage physical state machine (Pipeline Deployed → Transfer Authorized → In Transit → Physically Received). The map marker remains amber until physical dock receipt is confirmed, bridging the gap between cloud data and real-world logistics.

## Challenges we ran into: The Burden of Healthcare Tech
The most dangerous thing you can build in healthcare is an AI that acts without supervision. Early on, we faced the temptation to let the agent autonomously build data pipelines and move inventory with a single click. However, we realized that bypassing hospital governance is a structural disaster waiting to happen. 

We had to fundamentally redesign the agent's boundaries. We restricted it to a "Zero-PHI" ingestion layer—analyzing only inventory telemetry and SKU burn rates, never patient records. We learned to model reality rather than circumvent it: transforming the UX from "one person clicks a button" to "one person coordinates a decision" using our mandatory stakeholder checklist.

## Accomplishments that we're proud of
We are incredibly proud to have built a predictive engine that executes real, infrastructure-level actions while completely respecting the regulatory and safety constraints of enterprise healthcare. By having our backend dynamically calculate reorder points, enforce governance, and track physical delivery timelines, we proved that we can securely rebuild the digital logistics of a hospital in real-time. 

## What we learned
We learned that the most complex AI challenges aren't just technical; they are structural. We learned that a dashboard showing a surplus is useless if the stock is already committed, and that deploying an API is only the starting gun for a physical delivery. "Moving data fast" doesn't matter if you aren't moving the *right* data to the *right* place before the crisis hits. 

## What's next for DuroNet
The next step for DuroNet is integrating directly with live EHR data feeds to build more complex machine learning models (like ARIMA) for our predictive burn-rate calculations, and adding automated webhooks from warehouse scanners to instantly clear our "In Transit" statuses. Our ultimate goal is to turn this prototype into an enterprise-grade standard—ensuring that the fragile thread between global manufacturing and local patient care is never broken again.