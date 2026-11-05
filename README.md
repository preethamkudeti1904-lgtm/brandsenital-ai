This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Inkloom AI Brand Sentinel — Autonomous Multimodal Brand Governance

> **Team Identifier:** `preethamkudeti1904`  
> **Round:** 2 (The Build)  
> **Live Web Application:** [Insert Deployed Vercel URL]  
> **Repository:** [Insert Public GitHub Repo URL]

---

## 1. Executive Summary & Problem Overview
Marketing and communications teams often publish off-brand copy, unverified technical claims, outdated terminology, and unverified creative assets. Traditional review workflows rely on manual proofreading against static PDF brand books, leading to regulatory violations, tone drift, and leaked internal credentials.

**Inkloom AI Brand Sentinel** is an enterprise-grade brand governance platform that enforces factual accuracy, approved corporate lexicon, voice consistency, PII/secret redaction, and WCAG 2.1 AA visual accessibility in a unified dual-pane workspace.

---

## 2. Central Workflow Architecture
1. **Brand Knowledge Store & Presets:** Pre-configured ground-truth stores for regulated FinTech (*ApexPay Financial*) and sustainable retail (*Verdant Studio*).
2. **Autonomous Multi-Aspect Audit Engine:** Evaluates draft content across:
   - **Factual Claims (NLI Contradiction Detection):** Cross-checks numerical and operational claims against certified fact sheets.
   - **Lexicon & Nomenclature:** Detects deprecated internal jargon and enforces enterprise product names.
   - **Tone & Voice Pillars:** Flags promotional hyperbole to maintain grounded, transparent brand voice.
   - **Enterprise Security & PII Redaction:** Automatic detection of internal engineer emails and live API secrets.
   - **Multimodal Visual & WCAG Compliance:** Inspects uploaded banners for approved hex palette match and W3C AA (4.5:1+) contrast standards.
3. **Surgical 1-Click Patching:** Applies context-preserving replacements to specific character spans without re-writing or disrupting surrounding copy.
4. **Role-Based Review & Immutable Audit Trail:** Separates Content Creators from Brand Reviewers, creating timestamped audit logs for regulatory sign-offs.

---

## 3. The Three Key Engineering Improvements (Round 2 Milestone)
1. **Deterministic Context-Preserving Fix Engine:** Replaced destructive full-text regeneration with surgical clause-level patching, preventing AI hallucination during remediation.
2. **Multimodal Accessibility Layer:** Integrated client-side canvas-based color extraction and WCAG 2.1 AA contrast ratio validation for image creatives.
3. **Enterprise Privacy & Secret Guardrail:** Integrated zero-data-retention secret and PII interceptors to block internal tokens and emails prior to publication sign-off.

---

## 4. Tech Stack & Environment
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment Target:** Vercel Edge Network

---

## 5. Local Setup Instructions
```bash
# 1. Clone the repository
git clone [https://github.com/YOUR_USERNAME/brandsentinel-ai.git](https://github.com/YOUR_USERNAME/brandsentinel-ai.git)
cd brandsentinel-ai

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev
