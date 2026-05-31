"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchAll, UnifiedSearchResult } from "@/lib/api";

interface AISearchBarProps {
  onSelect: (id: string, kind: 'shortage' | 'alert') => void;
}

export function AISearchBar({ onSelect }: AISearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length <= 2) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    timeoutRef.current = window.setTimeout(async () => {
      try {
        const matches = await searchAll(trimmed);
        setResults(matches);
        setIsOpen(true);
      } catch (err) {
        console.error("Semantic search error:", err);
        setError("Unable to search at this time.");
        setResults([]);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleSelect = (id: string, kind: 'shortage' | 'alert') => {
    onSelect(id, kind);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <label htmlFor="ai-search" className="sr-only">
        Search supply chain shortages
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <Search className="h-4 w-4 text-slate-500" />
        </div>
        <Input
          id="ai-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search shortages, symptoms, or drug names..."
          className="pl-10 pr-10 bg-slate-950/90 border-slate-700 focus:border-emerald-400 focus:ring-emerald-400 placeholder:text-slate-500"
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
        />
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
          ) : (
            <Sparkles className="h-4 w-4 text-emerald-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/95 shadow-xl shadow-slate-950/40 backdrop-blur-xl">
          {error ? (
            <div className="p-4 text-sm text-slate-300">{error}</div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result.id.replace(/^alert-/, ''), result.kind)}
                  className="w-full px-4 py-4 text-left hover:bg-slate-900/90 focus:bg-slate-900/90 focus:outline-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {result.kind === 'alert' ? `${result.product} (FDA Alert)` : result.drugName}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {result.kind === 'alert' ? result.shortageReason : result.shortageReason}
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-600 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      {result.severity}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    {result.kind === 'alert' ? `Date: ${result.date ?? ''}` : `Regions: ${result.affectedRegions.join(', ')}`}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-slate-300">No shortages matched your query.</div>
          )}
        </div>
      )}
    </div>
  );
}
