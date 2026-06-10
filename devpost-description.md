# PrioritAI — AI-Powered Internal Process Prioritization Assistant

PrioritAI helps organizations evaluate and prioritize internal process improvement, automation and AI project requests in a transparent and data-driven way.

In many companies, different business units submit multiple digitalization, dashboard, RPA, optimization and AI requests at the same time. However, deciding which request should be implemented first is often manual, subjective and difficult to standardize. PrioritAI solves this by collecting requests through a structured interface, scoring each request with a weighted prioritization model, and generating an explainable recommendation.

The product evaluates each request across six dimensions: business value, strategic alignment, feasibility, data readiness, urgency/risk and user impact. It then produces a 0–100 priority score, assigns a priority level, recommends the best project track and highlights risks such as unclear data sources, heavy system dependency or low AI readiness.

This MVP is designed for product, operations and digital transformation teams that need to turn scattered internal requests into a ranked and actionable backlog.

## Who it is for

- Product managers
- Digital transformation teams
- Operations excellence teams
- Automation and AI program owners
- Internal platform teams managing limited delivery capacity

## What I built

- A request intake form
- A weighted prioritization engine
- Eligibility and risk flags
- AI-style recommendation summary
- Ranked dashboard
- Sample internal requests
- JSON export
- Novus-ready product analytics tracking

## Tools used

- HTML
- CSS
- JavaScript
- LocalStorage
- Novus.ai for product analytics / usage visibility

## What I learned

Shipping an internal product is not only about the algorithm. The product must also explain its decision clearly so business teams trust the prioritization. The most important design decision was making the score transparent: users can see not only the final ranking, but also why a request is high priority, risky or better suited for a later phase.
