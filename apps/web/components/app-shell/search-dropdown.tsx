"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, Search, Sparkles, TrendingUp } from "lucide-react";
import {
  type AiTrendResult,
  type CalendarResult,
  type SearchApiResponse,
  type SearchResult,
  type TrendResult,
} from "@/lib/search";
import { routes } from "@/lib/routes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urgencyClass(urgency: string): string {
  if (urgency === "design now") return "urgency-badge--now";
  if (urgency === "coming soon") return "urgency-badge--soon";
  return "urgency-badge--ahead";
}

const PLATFORMS = ["Amazon", "Etsy", "Redbubble"] as const;

// ─── AI expansion panel ───────────────────────────────────────────────────────

function AiExpandPanel({
  result,
  onCopy,
  copiedId,
}: {
  result: AiTrendResult;
  onCopy: (text: string, key: string) => void;
  copiedId: string | null;
}) {
  return (
    <div className="ai-expand-panel">
      <div className="ai-expand-section">
        <span className="ai-expand-label">Why Now</span>
        <p className="ai-expand-text">{result.whyNow}</p>
      </div>

      <div className="ai-expand-section">
        <span className="ai-expand-label">Target Buyer</span>
        <p className="ai-expand-text">{result.targetBuyer}</p>
      </div>

      <div className="ai-expand-section">
        <span className="ai-expand-label">Competition</span>
        <div className="ai-competition-row">
          {PLATFORMS.map((p) => (
            <div key={p} className="ai-competition-chip">
              <strong>{p}</strong>
              {result[p.toLowerCase() as "amazon" | "etsy" | "redbubble"]}
            </div>
          ))}
        </div>
      </div>

      <div className="ai-expand-section">
        <span className="ai-expand-label">Design Prompt</span>
        <p className="ai-expand-text">{result.designPrompt}</p>
        <div className="ai-expand-actions" style={{ marginTop: 8 }}>
          <button
            className={`ai-copy-btn${copiedId === `${result.id}-prompt` ? " copied" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onCopy(result.designPrompt, `${result.id}-prompt`);
            }}
          >
            {copiedId === `${result.id}-prompt` ? "Copied!" : "Copy Prompt"}
          </button>
          <button
            className={`ai-copy-btn${copiedId === `${result.id}-phrase` ? " copied" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onCopy(result.phrase, `${result.id}-phrase`);
            }}
          >
            {copiedId === `${result.id}-phrase` ? "Copied!" : "Copy Phrase"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SearchDropdown() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localTrends, setLocalTrends] = useState<TrendResult[]>([]);
  const [localCalendar, setLocalCalendar] = useState<CalendarResult[]>([]);
  const [aiResults, setAiResults] = useState<AiTrendResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [expandedAiId, setExpandedAiId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flat list used for keyboard navigation
  const allItems: Array<SearchResult | AiTrendResult> = [
    ...localTrends,
    ...localCalendar,
    ...aiResults,
  ];

  const hasResults = allItems.length > 0;
  const showEmpty =
    open && query.trim().length >= 2 && !isLoading && !hasResults;
  const showPanel = open && (isLoading || hasResults || showEmpty);

  const clearResults = useCallback(() => {
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLocalTrends([]);
    setLocalCalendar([]);
    setAiResults([]);
    setExpandedAiId(null);
    setIsLoading(false);
  }, []);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchResults = useCallback(
    async (q: string, force = false) => {
      if (q.trim().length < 2) {
        clearResults();
        return;
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setIsLoading(true);

      try {
        const url = `/api/search?q=${encodeURIComponent(q)}${force ? "&force=true" : ""}`;
        const res = await fetch(url, { signal: abortRef.current.signal });
        if (!res.ok) throw new Error("search failed");
        const data: SearchApiResponse = await res.json();

        setLocalTrends(
          data.localResults.filter((r): r is TrendResult => r.type === "trend")
        );
        setLocalCalendar(
          data.localResults.filter(
            (r): r is CalendarResult => r.type === "calendar"
          )
        );
        setAiResults(data.aiResults);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        // On error keep whatever we have
      } finally {
        setIsLoading(false);
      }
    },
    [clearResults]
  );

  // ─── Debounced input handler ─────────────────────────────────────────────────

  useEffect(() => {
    if (query.trim().length < 2) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  // ─── Close on outside click ──────────────────────────────────────────────────

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Clipboard helper ────────────────────────────────────────────────────────

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1800);
  }, []);

  // ─── Selection ───────────────────────────────────────────────────────────────

  const toggleAiExpand = useCallback((id: string) => {
    setExpandedAiId((prev) => (prev === id ? null : id));
  }, []);

  const select = useCallback(
    (item: SearchResult | AiTrendResult) => {
      if (item.type === "ai") {
        toggleAiExpand(item.id);
        return;
      }
      setOpen(false);
      setQuery("");
      setActiveIndex(-1);
      clearResults();
      if (item.type === "trend") {
        router.push(routes.trend(item.id));
      } else {
        router.push(routes.calendar);
      }
    },
    [clearResults, router, toggleAiExpand]
  );

  // ─── Keyboard ────────────────────────────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    // Enter with no selection → force AI search
    if (e.key === "Enter" && activeIndex < 0 && query.trim().length >= 2) {
      e.preventDefault();
      fetchResults(query, true);
      return;
    }

    if (!open || allItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(allItems[activeIndex]);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="search-container">
      <label className="search-box">
        <Search size={17} aria-hidden />
        <input
          ref={inputRef}
          aria-label="Search trends and calendar events"
          aria-expanded={showPanel}
          aria-autocomplete="list"
          role="combobox"
          aria-controls="search-results-panel"
          placeholder="Search niches, phrases, events…"
          value={query}
          autoComplete="off"
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setOpen(true);
            setActiveIndex(-1);
            if (value.trim().length < 2) clearResults();
          }}
          onFocus={() => {
            if (query) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
      </label>

      {showPanel && (
        <div
          id="search-results-panel"
          className="search-results-panel"
          role="listbox"
          aria-label="Search results"
        >
          {/* Loading */}
          {isLoading && (
            <div className="search-loading">
              <div className="search-spinner" />
              Searching…
            </div>
          )}

          {/* Empty */}
          {showEmpty && (
            <div className="search-empty">
              No results for &ldquo;{query}&rdquo; — press Enter for AI search
            </div>
          )}

          {/* Local trends */}
          {localTrends.length > 0 && (
            <div className="search-group">
              <div className="search-group-label">
                <TrendingUp size={11} aria-hidden />
                From your trends
              </div>
              {localTrends.map((r) => {
                const idx = allItems.indexOf(r);
                return (
                  <button
                    key={r.id}
                    role="option"
                    aria-selected={activeIndex === idx}
                    className={`search-result-item${activeIndex === idx ? " active" : ""}`}
                    onClick={() => select(r)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span className="search-type-badge search-type-badge--trend">
                      Trend
                    </span>
                    <div className="search-result-body">
                      <strong>{r.title}</strong>
                      <span>
                        {r.niche}
                        {r.subcategory ? ` · ${r.subcategory}` : ""}
                      </span>
                    </div>
                    <span className={`temp-badge ${r.temperature}`}>
                      {r.temperature}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {localTrends.length > 0 && localCalendar.length > 0 && (
            <div className="search-separator" aria-hidden />
          )}

          {/* Local calendar */}
          {localCalendar.length > 0 && (
            <div className="search-group">
              <div className="search-group-label">
                <CalendarDays size={11} aria-hidden />
                Calendar events
              </div>
              {localCalendar.map((r) => {
                const idx = allItems.indexOf(r);
                return (
                  <button
                    key={r.id}
                    role="option"
                    aria-selected={activeIndex === idx}
                    className={`search-result-item${activeIndex === idx ? " active" : ""}`}
                    onClick={() => select(r)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span className="search-type-badge search-type-badge--calendar">
                      Event
                    </span>
                    <div className="search-result-body">
                      <strong>{r.title}</strong>
                      <span>
                        {r.date} · {r.daysAway}d away · {r.platform}
                      </span>
                    </div>
                    <span className={`urgency-badge ${urgencyClass(r.urgency)}`}>
                      {r.urgency}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* AI results */}
          {aiResults.length > 0 && (
            <>
              {(localTrends.length > 0 || localCalendar.length > 0) && (
                <div className="search-separator" aria-hidden />
              )}
              <div className="search-group">
                <div className="search-group-label">
                  <Sparkles size={11} aria-hidden />
                  AI Discovered
                </div>
                {aiResults.map((r) => {
                  const idx = allItems.indexOf(r);
                  const isExpanded = expandedAiId === r.id;
                  return (
                    <div
                      key={r.id}
                      role="option"
                      aria-selected={activeIndex === idx}
                      className={`search-result-item search-result-item--ai${activeIndex === idx ? " active" : ""}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <button
                        className="ai-result-header"
                        onClick={() => toggleAiExpand(r.id)}
                        aria-expanded={isExpanded}
                      >
                        <span className="search-type-badge search-type-badge--ai">
                          AI
                        </span>
                        <div className="search-result-body">
                          <strong>{r.phrase}</strong>
                          <span>{r.niche}</span>
                        </div>
                        <span className={`temp-badge ${r.temperature}`}>
                          {r.temperature}
                        </span>
                        <div className="search-platform-tags">
                          {PLATFORMS.map((p) => (
                            <span key={p} className="search-platform-tag">
                              {p}
                            </span>
                          ))}
                        </div>
                        <ChevronDown
                          size={13}
                          className={`ai-chevron${isExpanded ? " expanded" : ""}`}
                          aria-hidden
                        />
                      </button>

                      {isExpanded && (
                        <AiExpandPanel
                          result={r}
                          onCopy={handleCopy}
                          copiedId={copiedId}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
