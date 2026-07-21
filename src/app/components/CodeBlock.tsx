/**
 * Syntax-highlighted code viewer for the design-system "Component details" Code tab.
 *
 * Uses shiki (lazy-loaded single highlighter instance shared across all CodeBlocks).
 * Supports the three languages surfaced in the detail page: tsx, swift, kotlin.
 *
 * The highlighter is created once and cached in a module-level promise; subsequent
 * mounts reuse it, so a page with many CodeBlocks pays the WASM/grammar cost only once.
 */
import { useEffect, useState } from "react";
import type { Highlighter } from "shiki";

export type CodeLanguage = "tsx" | "swift" | "kotlin";

interface CodeBlockProps {
  code: string;
  language: CodeLanguage;
  /** Optional file/origin label shown above the code (e.g. "PageHeader.tsx"). */
  fileName?: string;
}

const SHIKI_THEME = "github-dark";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        themes: [SHIKI_THEME],
        langs: ["tsx", "swift", "kotlin"],
      }),
    );
  }
  return highlighterPromise;
}

export default function CodeBlock({ code, language, fileName }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((highlighter) => {
      if (cancelled) return;
      const out = highlighter.codeToHtml(code, {
        lang: language,
        theme: SHIKI_THEME,
      });
      setHtml(out);
    });
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      // Clipboard may be unavailable (permissions / non-secure context). Silent no-op.
    }
  };

  return (
    <div className="overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-static-black)]">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-[12px] py-[8px]">
        <span className="font-mono text-[12px] text-[rgba(255,255,255,0.6)]">
          {fileName ?? language.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-[4px] px-[8px] py-[3px] text-[11px] font-bold uppercase tracking-wide text-[rgba(255,255,255,0.7)] transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
        >
          {copyState === "copied" ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="max-h-[560px] overflow-auto">
        {html ? (
          <div
            className="shiki-host p-[16px] text-[13px] leading-[20px]"
            // shiki returns sanitized, tokenized HTML with inline color styles.
            // The highlighter is trusted (shiki) and input is dev-authored sample code.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="p-[16px] font-mono text-[13px] leading-[20px] text-[rgba(255,255,255,0.85)]">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
