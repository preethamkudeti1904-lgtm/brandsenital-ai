export interface BrandRule {
    id: string;
    category: "Claim" | "Lexicon" | "Tone" | "PII";
    severity: "P0 Critical" | "P1 Warning" | "P2 Minor";
    triggerPattern: string;
    citation: string;
    explanation: string;
    replacement: string;
}

export interface BrandKit {
    id: string;
    name: string;
    industry: string;
    voicePillars: string[];
    approvedColors: string[];
    sampleDraft: string;
    rules: BrandRule[];
}

export const BRAND_KITS: BrandKit[] = [
    {
        id: "fintech-corp",
        name: "ApexPay Financial (FinTech)",
        industry: "Regulated Payments & Banking",
        voicePillars: ["Trustworthy", "Precise", "Transparent", "No Hyperbole"],
        approvedColors: ["#0F172A", "#2563EB", "#10B981", "#F8FAFC"],
        sampleDraft:
            "Launch Update: ApexPay now offers instant real-time bank reconciliation with 100% guaranteed zero fees for all global users! Our revolutionary script runner processes 50,000 TPS effortlessly. For beta access, email our lead engineer at rahul.dev@apexpay.internal or use token sk-live-99881122.",
        rules: [
            {
                id: "rule-1",
                category: "Claim",
                severity: "P0 Critical",
                triggerPattern: "instant real-time bank reconciliation",
                citation: "Section 2.1: Approved Product Claims (Fact Sheet v4.2)",
                explanation:
                    "NLI Contradiction Detected (Confidence: 0.94). Settlement takes 1–2 business days for standard ACH transfers unless KYC Tier-2 is completed.",
                replacement: "same-day bank reconciliation for verified Tier-2 accounts",
            },
            {
                id: "rule-2",
                category: "Claim",
                severity: "P0 Critical",
                triggerPattern: "100% guaranteed zero fees",
                citation: "Section 4.3: Regulatory & Financial Disclaimers",
                explanation:
                    "Unsupported absolute promotional claim. Cross-border FX transactions incur a 0.5% network conversion fee.",
                replacement: "zero domestic transfer fees (standard FX rates apply)",
            },
            {
                id: "rule-3",
                category: "Lexicon",
                severity: "P1 Warning",
                triggerPattern: "script runner",
                citation: "Section 1.4: Approved Brand Terminology & Nomenclature",
                explanation:
                    "Deprecated internal engineering term. Always refer to the core engine using approved enterprise nomenclature.",
                replacement: "automated payment orchestration engine",
            },
            {
                id: "rule-4",
                category: "Tone",
                severity: "P2 Minor",
                triggerPattern: "revolutionary",
                citation: "Section 1.1: Brand Voice & Tone Pillars",
                explanation:
                    "Tone Drift Detected (Cosine Similarity: 0.41 vs. 'Precise & Grounded' rubric). Avoid exaggerated marketing hyperbole.",
                replacement: "enterprise-grade",
            },
        ],
    },
    {
        id: "ecowear-retail",
        name: "Verdant Studio (Sustainable Apparel)",
        industry: "D2C Sustainable Fashion",
        voicePillars: ["Warm", "Evidence-Backed", "Honest", "Inclusive"],
        approvedColors: ["#064E3B", "#059669", "#FEF3C7", "#1F2937"],
        sampleDraft:
            "Our new bamboo hoodie is 100% carbon-negative and completely eliminates environmental impact! Made with cheap synthetic dyes, it is the most eco-friendly garment on earth. Contact supplier ops at vendor_admin@verdant.org for wholesale pricing.",
        rules: [
            {
                id: "eco-1",
                category: "Claim",
                severity: "P0 Critical",
                triggerPattern: "100% carbon-negative and completely eliminates environmental impact",
                citation: "Section 3.2: FTC Green Guides & Sustainability Claims",
                explanation:
                    "NLI Contradiction (Confidence: 0.92). Approved LCA audit confirms a 68% lower carbon footprint compared to conventional cotton, not carbon-negative.",
                replacement: "certified 68% lower carbon footprint than conventional cotton",
            },
            {
                id: "eco-2",
                category: "Lexicon",
                severity: "P1 Warning",
                triggerPattern: "cheap synthetic dyes",
                citation: "Section 2.2: Material Lexicon Standards",
                explanation:
                    "Off-brand terminology and factually inaccurate material description.",
                replacement: "OEKO-TEX certified low-impact botanical dyes",
            },
            {
                id: "eco-3",
                category: "Tone",
                severity: "P2 Minor",
                triggerPattern: "most eco-friendly garment on earth",
                citation: "Section 1.3: Honest Sustainability Messaging",
                explanation:
                    "Unsubstantiated superlative claim violates the 'Evidence-Backed & Humble' brand voice pillar.",
                replacement: "responsibly crafted for long-lasting everyday wear",
            },
        ],
    },
];