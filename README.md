# Embedding Analytics Dashboard

Interactive visualization layer for the **Embedding Analytics Platform**.

This React application enables exploration of **semantic similarity, drift, and model variance** derived from ensembles of word embeddings.

🌐 Live demo: https://www.embedding-analytics.com/  
🧠 Backend pipeline: https://github.com/areebms/embedding-analytics

---

## Purpose

The backend trains multiple embedding models per corpus and aligns them into a shared space.

The dashboard turns those outputs into something humans can reason about.

It helps answer:

- How does a term’s meaning change across corpora?
- Which associations are consistent vs unstable?
- Where do datasets agree or diverge semantically?
- Which similarities should we trust?

---

## What you can do in the UI

### Compare corpora
Select multiple datasets and inspect how relationships differ.

### Inspect similarity
See nearest neighbors and similarity strengths.

### Understand drift
Identify terms whose relationships shift the most between corpora.

### Interpret confidence
Variance across ensemble runs acts as a proxy for reliability.

---

## How it works

1. UI calls the FastAPI backend.
2. Backend returns similarity + variance metrics.
3. Dashboard renders:
   - relative rankings
   - divergence measures
   - comparative views

The frontend is intentionally thin — computation lives in the pipeline/API.

---

## Tech stack

- React
- Vite
- Chart.js
- Modern ES modules

---

## Local development

### Requirements
- Node 18+
- npm / yarn / pnpm

### Install
```bash
npm install