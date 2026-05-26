# DuroNet: Protecting the Fragile Thread of Patient Care

## Inspiration: The Human Cost of a Broken Chain
Behind every supply chain metric, there is a human heartbeat. In 2023, hospitals faced an average of 301 drug shortages per quarter. But "shortage" is a cold, clinical word. In the real world, a shortage means a cancer patient’s chemotherapy is delayed. It means a pediatric surgery is canceled because there is no anesthetic. It means doctors and pharmacists scrambling at 2:00 AM, fighting a systemic collapse they cannot see coming.

When we looked at the drug shortage crisis, we realized the tech industry has been misdiagnosing the disease. We keep trying to fix the hospital's internal database—building dashboards to tell them faster that they are running out of medicine. **But prediction without procurement power is just faster bad news.** The real crisis happens upstream: in fractured global supply chains, single-source generic manufacturers, and disaster-struck facilities. 

We realized that to protect patients, we had to build an early-warning system that looks outward, not inward. We built **DuroNet** because a patient's survival should never depend on a blind spot in the global supply chain.

## What it does: The Invisible Shield
DuroNet is an AI-driven, upstream risk copilot for hospital procurement teams and Group Purchasing Organizations (GPOs). It acts as an invisible shield, anticipating supply chain collapse before it ever reaches the hospital doors.

Instead of monitoring local inventory (which triggers false alarms and risks HIPAA violations), the DuroNet agent uses Gemini to constantly reason over national GPO procurement data, manufacturer reliability scores, and FDA shortage alerts. 

When it detects a critical upstream risk—like a primary injectable manufacturer halting production—it doesn’t just sound an alarm. The agent immediately calculates the hospital's regional exposure, recommends an alternate medical product from a reliable supplier, and **autonomously drafts the precise Fivetran data pipeline configuration** needed to onboard that new supplier. With a single click from a human data engineer, the new supply lines are secured.

## How we built it: Safe, Agentic Action
We built DuroNet using a modern, server-rendered stack and a strict "human-in-the-loop" AI architecture:
* **Frontend & Backend:** Built on Next.js (App Router) and Node.js, featuring a dark-mode, high-contrast React dashboard (Tailwind + shadcn/ui) designed for urgency and clarity.
* **The Brain:** We utilized **Gemini 1.5 Pro via Vertex AI** as our core reasoning engine. Gemini parses complex global logistics data, calculates Manufacturer Reliability Scores, and correlates regional purchase volumes to predict local impact.
* **The Muscle (Action):** To move "beyond chat," we integrated with the **Fivetran API**. Once Gemini decides on a strategic pivot, it outputs deployable infrastructure-as-code (JSON/YAML Fivetran configurations) to route new supplier data directly into the hospital's warehouse. 

## Challenges we ran into: The Burden of Healthcare Tech
The most dangerous thing you can build in healthcare is an AI that acts without supervision. Early on, we faced the temptation to let the agent autonomously build and deploy data pipelines. However, we realized that an agent autonomously moving hospital data is a HIPAA violation and a data governance disaster waiting to happen. 

We had to fundamentally redesign the agent's boundaries. We restricted it to a "Zero-PHI" ingestion layer—analyzing only SKUs and manufacturer logistics, never patient records. We also engineered a strict **human-in-the-loop** constraint, ensuring the AI only *drafts* the pipeline code, requiring a human expert to review the payload and click "Deploy."

## Accomplishments that we're proud of
We are incredibly proud to have built an AI agent that executes real, infrastructure-level actions while completely respecting the regulatory and safety constraints of enterprise healthcare. By having Gemini draft Fivetran configurations natively, we proved that Generative AI can go beyond writing emails and summarizing text—it can dynamically rebuild the digital logistics of a hospital in real-time. 

## What we learned
We learned that the most complex AI challenges aren't just technical; they are structural. We learned how Group Purchasing Organizations actually operate, how easily data integration can cause silent failures in EHR systems, and why "moving data fast" doesn't matter if you aren't moving the *right* data. 

## What's next for DuroNet
The next step for DuroNet is integrating directly with live, real-time FDA Drug Shortage APIs and partnering with a regional GPO to pilot the agent against historical shortage data. Our ultimate goal is to turn this prototype into an enterprise-grade standard—ensuring that the fragile thread between global manufacturing and local patient care is never broken again.