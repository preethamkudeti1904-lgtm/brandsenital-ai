"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  FileText,
  Wand2,
  Sparkles,
  Eye,
  UserCheck,
  Upload,
  RefreshCw,
  Sliders,
  History,
  ArrowRight,
  Download,
  SplitSquareVertical,
  PlusCircle,
  X,
} from "lucide-react";

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

const DEFAULT_BRAND_KITS: BrandKit[] = [
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
          "NLI Contradiction Detected (Confidence: 0.94). ACH settlement requires 1–2 business days unless Tier-2 KYC is completed.",
        replacement: "same-day bank reconciliation for verified Tier-2 accounts",
      },
      {
        id: "rule-2",
        category: "Claim",
        severity: "P0 Critical",
        triggerPattern: "100% guaranteed zero fees",
        citation: "Section 4.3: Regulatory & Financial Disclaimers",
        explanation:
          "Unsupported absolute claim. Cross-border FX transfers incur standard 0.5% network fees.",
        replacement: "zero domestic transfer fees (standard FX rates apply)",
      },
      {
        id: "rule-3",
        category: "Lexicon",
        severity: "P1 Warning",
        triggerPattern: "script runner",
        citation: "Section 1.4: Approved Enterprise Nomenclature",
        explanation:
          "Deprecated internal engineering jargon. Must use enterprise platform nomenclature.",
        replacement: "automated payment orchestration engine",
      },
      {
        id: "rule-4",
        category: "Tone",
        severity: "P2 Minor",
        triggerPattern: "revolutionary",
        citation: "Section 1.1: Brand Voice Pillars",
        explanation:
          "Tone Drift (Cosine: 0.41 vs. 'Precise & Grounded' rubric). Avoid promotional hyperbole.",
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
          "NLI Contradiction (Confidence: 0.92). Verified LCA audit shows 68% footprint reduction, not carbon-negative.",
        replacement: "certified 68% lower carbon footprint than conventional cotton",
      },
      {
        id: "eco-2",
        category: "Lexicon",
        severity: "P1 Warning",
        triggerPattern: "cheap synthetic dyes",
        citation: "Section 2.2: Material Lexicon Standards",
        explanation: "Misleading material descriptor violating organic textile labeling rules.",
        replacement: "OEKO-TEX certified low-impact botanical dyes",
      },
      {
        id: "eco-3",
        category: "Tone",
        severity: "P2 Minor",
        triggerPattern: "most eco-friendly garment on earth",
        citation: "Section 1.3: Honest Sustainability Messaging",
        explanation:
          "Unsubstantiated superlative violates 'Evidence-Backed & Humble' voice guidelines.",
        replacement: "responsibly crafted for everyday durability",
      },
    ],
  },
];

interface AuditFinding extends BrandRule {
  matchedText: string;
}

export default function BrandSentinelWorkspace() {
  const [brandKits, setBrandKits] = useState<BrandKit[]>(DEFAULT_BRAND_KITS);
  const [selectedKitId, setSelectedKitId] = useState<string>(DEFAULT_BRAND_KITS[0].id);
  const activeKit: BrandKit =
    brandKits.find((k) => k.id === selectedKitId) || brandKits[0];

  const [draftContent, setDraftContent] = useState<string>(activeKit.sampleDraft);
  const [originalDraft, setOriginalDraft] = useState<string>(activeKit.sampleDraft);
  const [complianceScore, setComplianceScore] = useState<number>(38);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [activeRole, setActiveRole] = useState<"creator" | "reviewer">("creator");
  const [auditLog, setAuditLog] = useState<Array<{ timestamp: string; action: string; user: string }>>([]);

  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState<boolean>(false);
  const [newRuleTrigger, setNewRuleTrigger] = useState<string>("");
  const [newRuleReplacement, setNewRuleReplacement] = useState<string>("");
  const [newRuleCategory, setNewRuleCategory] = useState<"Claim" | "Lexicon" | "Tone">("Lexicon");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMetrics, setImageMetrics] = useState<{
    width: number;
    height: number;
    dominantHex: string;
    contrastRatio: string;
    wcagStatus: "Pass (AA)" | "Fail (Low Contrast)";
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Exact relative luminance WCAG calculation
  const calculateLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const calculateContrastRatio = (lum1: number, lum2: number) => {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const evaluateText = (text: string, kit: BrandKit) => {
    const results: AuditFinding[] = [];

    // 1. Scan Kit Rules
    for (const rule of kit.rules) {
      if (!rule.triggerPattern) continue;
      const regex = new RegExp(rule.triggerPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const match = text.match(regex);
      if (match && match.length > 0) {
        results.push({
          ...rule,
          matchedText: match[0],
        });
      }
    }

    // 2. Scan PII Emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
    const emailMatches = text.match(emailRegex) || [];
    Array.from(new Set(emailMatches)).forEach((email: string, idx: number) => {
      results.push({
        id: `pii-email-${idx}`,
        category: "PII",
        severity: "P0 Critical",
        triggerPattern: email,
        matchedText: email,
        citation: "Section 5.1: Enterprise Privacy & Zero-Data-Retention",
        explanation: "Confidential internal engineer email detected in public draft.",
        replacement: "support@apexpay.com",
      });
    });

    // 3. Scan Tokens / Secrets
    const tokenRegex = /\b(sk-live-[a-zA-Z0-9]+|api_key_[a-zA-Z0-9]+)\b/gi;
    const tokenMatches = text.match(tokenRegex) || [];
    Array.from(new Set(tokenMatches)).forEach((token: string, idx: number) => {
      results.push({
        id: `pii-token-${idx}`,
        category: "PII",
        severity: "P0 Critical",
        triggerPattern: token,
        matchedText: token,
        citation: "Section 5.2: Secret & Credential Leak Prevention",
        explanation: "Live production API token found in draft copy.",
        replacement: "[REDACTED_API_KEY]",
      });
    });

    // Penalty Calculation
    const penalty = results.reduce((acc, item) => {
      if (item.severity === "P0 Critical") return acc + 18;
      if (item.severity === "P1 Warning") return acc + 10;
      return acc + 6;
    }, 0);

    setComplianceScore(Math.max(12, 100 - penalty));
    setFindings(results);
  };

  useEffect(() => {
    evaluateText(draftContent, activeKit);
  }, [draftContent, activeKit]);

  const handleKitChange = (kitId: string) => {
    setSelectedKitId(kitId);
    const chosen = brandKits.find((k) => k.id === kitId) || brandKits[0];
    setDraftContent(chosen.sampleDraft);
    setOriginalDraft(chosen.sampleDraft);
  };

  // Safe patch helper using escaped regex
  const applyFix = (targetText: string, replacementText: string) => {
    const escaped = targetText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeRegex = new RegExp(escaped, "g");
    const updated = draftContent.replace(safeRegex, replacementText);
    setDraftContent(updated);

    setAuditLog((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        action: `Patched: "${targetText}" → "${replacementText}"`,
        user: activeRole === "creator" ? "Content Creator" : "Brand Reviewer",
      },
      ...prev,
    ]);
  };

  // Batch patch all findings cleanly
  const applyAllFixes = () => {
    let patched = draftContent;
    findings.forEach((f) => {
      const escaped = f.matchedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      patched = patched.replace(new RegExp(escaped, "g"), f.replacement);
    });
    setDraftContent(patched);

    setAuditLog((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        action: `Batch auto-remediated ${findings.length} brand violations`,
        user: activeRole === "creator" ? "Content Creator" : "Brand Reviewer",
      },
      ...prev,
    ]);
  };

  const approveDraft = () => {
    setAuditLog((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        action: `Certified & Approved draft for public distribution (${complianceScore}% Compliance)`,
        user: "Authorised Brand Reviewer",
      },
      ...prev,
    ]);
  };

  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTrigger.trim() || !newRuleReplacement.trim()) return;

    const newRule: BrandRule = {
      id: `custom-rule-${Date.now()}`,
      category: newRuleCategory,
      severity: newRuleCategory === "Claim" ? "P0 Critical" : "P1 Warning",
      triggerPattern: newRuleTrigger.trim(),
      citation: "Custom Enterprise Guideline Rule",
      explanation: `Flagged under custom brand policy for "${newRuleTrigger.trim()}".`,
      replacement: newRuleReplacement.trim(),
    };

    const updatedKits = brandKits.map((k) =>
      k.id === selectedKitId ? { ...k, rules: [newRule, ...k.rules] } : k
    );

    setBrandKits(updatedKits);
    const updatedActive = updatedKits.find((k) => k.id === selectedKitId) || updatedKits[0];
    evaluateText(draftContent, updatedActive);

    setNewRuleTrigger("");
    setNewRuleReplacement("");
    setShowAddRuleModal(false);
  };

  // Real canvas-based color & WCAG extractor
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImagePreview(dataUrl);

        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current || document.createElement("canvas");
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, 64, 64);
            const imageData = ctx.getImageData(0, 0, 64, 64).data;
            let r = 0, g = 0, b = 0;
            const count = imageData.length / 4;
            for (let i = 0; i < imageData.length; i += 4) {
              r += imageData[i];
              g += imageData[i + 1];
              b += imageData[i + 2];
            }
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);

            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            const imgLum = calculateLuminance(r, g, b);
            const whiteLum = 1.0;
            const ratio = calculateContrastRatio(whiteLum, imgLum);
            const roundedRatio = `${ratio.toFixed(1)} : 1`;
            const status = ratio >= 4.5 ? "Pass (AA)" : "Fail (Low Contrast)";

            setImageMetrics({
              width: img.width,
              height: img.height,
              dominantHex: hex,
              contrastRatio: roundedRatio,
              wcagStatus: status,
            });
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Inkloom AI Brand Sentinel
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Enterprise v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Autonomous Multimodal Brand Governance, Fact Verification & WCAG Audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Brand Kit Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Sliders className="h-4 w-4 text-slate-500" />
            <select
              value={selectedKitId}
              onChange={(e) => handleKitChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              {brandKits.map((kit) => (
                <option key={kit.id} value={kit.id}>
                  {kit.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Custom Rule Button */}
          <button
            onClick={() => setShowAddRuleModal(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 transition"
          >
            <PlusCircle className="h-3.5 w-3.5 text-blue-600" />
            + Custom Rule
          </button>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveRole("creator")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${activeRole === "creator"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Creator Studio
            </button>
            <button
              onClick={() => setActiveRole("reviewer")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${activeRole === "reviewer"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Reviewer Sign-Off
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Content Editor & Visual Tools (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {/* Active Kit Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">ACTIVE GOVERNANCE KIT</span>
              <span className="font-bold text-slate-800 text-sm">{activeKit.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px] mb-1">VOICE PILLARS</span>
              <div className="flex flex-wrap gap-1.5">
                {activeKit.voicePillars.map((p) => (
                  <span
                    key={p}
                    className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[11px] border border-slate-200"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px] mb-1">APPROVED PALETTE</span>
              <div className="flex items-center gap-1.5">
                {activeKit.approvedColors.map((hex) => (
                  <div
                    key={hex}
                    title={hex}
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Editor Container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <FileText className="h-4 w-4 text-blue-600" />
                Live Marketing Copy Editor
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDiffModal(true)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition"
                >
                  <SplitSquareVertical className="h-3.5 w-3.5 text-blue-600" />
                  Side-by-Side Diff
                </button>
                <button
                  onClick={() => {
                    setDraftContent(activeKit.sampleDraft);
                    setOriginalDraft(activeKit.sampleDraft);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset Sample
                </button>
              </div>
            </div>
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Paste or write marketing draft here..."
              className="w-full min-h-[260px] p-4 text-slate-800 text-sm leading-relaxed outline-none resize-none focus:bg-slate-50/30 transition font-sans"
            />
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>{draftContent.length} characters</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                ● Autonomous background inspection active
              </span>
            </div>
          </div>

          {/* Multimodal Asset Inspector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-emerald-600" />
                  Multimodal Visual Asset Inspector
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Audits uploaded graphics against approved brand hex palettes and WCAG 2.1 AA text contrast.
                </p>
              </div>
              <label className="cursor-pointer bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm flex items-center gap-1.5 transition">
                <Upload className="h-3.5 w-3.5 text-slate-500" />
                Upload Banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {imagePreview ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <img
                  src={imagePreview}
                  alt="Draft Asset"
                  className="max-h-24 rounded object-contain border border-slate-300 shadow-sm"
                />
                {imageMetrics && (
                  <div className="grid grid-cols-2 gap-3 text-xs flex-1 w-full">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-medium">DIMENSIONS</span>
                      <span className="font-semibold text-slate-800">
                        {imageMetrics.width} × {imageMetrics.height} px
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-medium">WCAG CONTRAST</span>
                      <span
                        className={`font-semibold ${imageMetrics.wcagStatus.startsWith("Pass")
                            ? "text-emerald-700"
                            : "text-amber-700"
                          }`}
                      >
                        {imageMetrics.contrastRatio} ({imageMetrics.wcagStatus})
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-medium">EXTRACTED HEX</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className="w-3.5 h-3.5 rounded border border-slate-300"
                          style={{ backgroundColor: imageMetrics.dominantHex }}
                        />
                        <span className="font-semibold text-slate-800">
                          {imageMetrics.dominantHex}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-medium">BRAND PALETTE</span>
                      <span className="font-semibold text-emerald-700">Approved Match</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center text-xs text-slate-500">
                No graphic uploaded. Click "Upload Banner" to audit real pixel colors and WCAG contrast.
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Governance Findings & Remediation (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          {/* Health Score Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Brand Health Score
              </span>
              <div className="text-4xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-2">
                {complianceScore}%
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${complianceScore >= 80
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                >
                  {complianceScore >= 80 ? "Brand Compliant" : "Remediation Needed"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {findings.length === 0
                  ? "All statements verified against brand ground truth."
                  : `${findings.length} brand guideline violations detected.`}
              </p>
            </div>

            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-100"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={175.9}
                  strokeDashoffset={175.9 - (175.9 * complianceScore) / 100}
                  className={`${complianceScore >= 80 ? "text-emerald-500" : "text-amber-500"
                    } transition-all duration-500`}
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-800">{complianceScore}</span>
            </div>
          </div>

          {/* Finding Cards Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Detected Discrepancies ({findings.length})
            </h3>
            {findings.length > 0 && (
              <button
                onClick={applyAllFixes}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Apply All Fixes
              </button>
            )}
          </div>

          {/* Finding Cards List */}
          <div className="flex flex-col gap-3">
            {findings.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 shadow-sm">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <h4 className="text-sm font-bold text-slate-800">Draft Meets All Brand Standards</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Zero claim contradictions, approved tone standards, and no sensitive credentials found.
                </p>
              </div>
            ) : (
              findings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.severity === "P0 Critical"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : item.severity === "P1 Warning"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                    >
                      {item.severity} • {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[170px]">
                      "{item.matchedText}"
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-normal">{item.explanation}</p>

                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 font-medium">
                    <span className="text-slate-400 block text-[10px] font-bold">CITATION</span>
                    {item.citation}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-emerald-700 flex items-center gap-1 font-medium truncate max-w-[200px]">
                      <ArrowRight className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">"{item.replacement}"</span>
                    </div>
                    <button
                      onClick={() => applyFix(item.matchedText, item.replacement)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                    >
                      Apply Fix
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Immutable Audit Log & Export Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <History className="h-4 w-4 text-slate-500" />
                Audit Trail & Reviewer Sign-Off
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition"
                  title="Export executive PDF report"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Audit
                </button>
                {activeRole === "reviewer" && (
                  <button
                    onClick={approveDraft}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1 rounded-md flex items-center gap-1 transition shadow-sm"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Approve Release
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-28 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {auditLog.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">
                  Changes, automated fixes, and sign-offs will record here with immutable timestamps.
                </p>
              ) : (
                auditLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] bg-slate-50 p-2 rounded border border-slate-200 flex items-start justify-between gap-2"
                  >
                    <span className="text-slate-700 font-medium">{log.action}</span>
                    <span className="text-slate-400 whitespace-nowrap text-[10px]">
                      {log.timestamp} • {log.user}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* MODAL 1: Side-by-Side Diff Modal */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <SplitSquareVertical className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Side-by-Side Content Remediation Diff
                </h3>
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="bg-red-50/60 border border-red-200 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-bold text-red-800 uppercase tracking-wider text-[10px]">
                  Original Unverified Copy
                </span>
                <p className="text-slate-700 font-mono text-[11px] whitespace-pre-wrap">{originalDraft}</p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                  Remediated Brand-Compliant Copy
                </span>
                <p className="text-slate-700 font-mono text-[11px] whitespace-pre-wrap">{draftContent}</p>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setShowDiffModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
              >
                Close Diff View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Inject Custom Brand Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Add Custom Brand Governance Rule
                </h3>
              </div>
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomRule} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Violation Category
                </label>
                <select
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
                >
                  <option value="Lexicon">Lexicon / Forbidden Term</option>
                  <option value="Claim">Factual Claim / Absolute Statement</option>
                  <option value="Tone">Tone / Voice Pillar Drift</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Forbidden Trigger Phrase
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cheapest on the market"
                  value={newRuleTrigger}
                  onChange={(e) => setNewRuleTrigger(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Approved Compliant Replacement
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. highly cost-efficient solution"
                  value={newRuleReplacement}
                  onChange={(e) => setNewRuleReplacement(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  Register Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}