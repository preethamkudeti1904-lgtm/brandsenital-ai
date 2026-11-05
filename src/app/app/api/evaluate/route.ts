import { NextResponse } from "next/server";
import { BRAND_KITS, BrandRule } from "@/data/brandKits";

export async function POST(req: Request) {
    try {
        const { text = "", brandKitId, customRules = [] } = await req.json();

        const kit = BRAND_KITS.find((k) => k.id === brandKitId) || BRAND_KITS[0];
        const allRules: BrandRule[] = [...kit.rules, ...customRules];

        const findings: Array<BrandRule & { matchedText: string }> = [];

        // 1. Evaluate against Brand Guidelines (Claims, Lexicon, Tone)
        for (const rule of allRules) {
            if (!rule.triggerPattern) continue;
            const regex = new RegExp(rule.triggerPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            const match = text.match(regex);
            if (match) {
                findings.push({
                    ...rule,
                    matchedText: match[0],
                });
            }
        }

        // 2. Sensitive Data & PII Redaction Guard (Emails, API Keys)
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const emailMatches = text.match(emailRegex) || [];
        emailMatches.forEach((email: string, idx: number) => {
            findings.push({
                id: `pii-email-${idx}`,
                category: "PII",
                severity: "P0 Critical",
                triggerPattern: email,
                matchedText: email,
                citation: "Section 5.1: Enterprise Data Privacy & Zero-Data-Retention Policy",
                explanation:
                    "Confidential internal email address detected in public draft. Must be redacted or replaced with an official alias before publication.",
                replacement: "support@company.com",
            });
        });

        const tokenRegex = /\b(sk-live-[a-zA-Z0-9]+|api_key_[a-zA-Z0-9]+)\b/g;
        const tokenMatches = text.match(tokenRegex) || [];
        tokenMatches.forEach((token: string, idx: number) => {
            findings.push({
                id: `pii-token-${idx}`,
                category: "PII",
                severity: "P0 Critical",
                triggerPattern: token,
                matchedText: token,
                citation: "Section 5.2: Secret & Credential Leak Prevention",
                explanation:
                    "Live API credential detected in draft copy. Publishing creates an immediate security risk.",
                replacement: "[REDACTED_API_KEY]",
            });
        });

        // 3. Compute Brand Health Compliance Score (0 - 100)
        const penalty = findings.reduce((acc, item) => {
            if (item.severity === "P0 Critical") return acc + 20;
            if (item.severity === "P1 Warning") return acc + 10;
            return acc + 5;
        }, 0);

        const score = Math.max(10, 100 - penalty);

        return NextResponse.json({
            score,
            findings,
            evaluatedAt: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
    }
}