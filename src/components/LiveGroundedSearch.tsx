import React, { useState } from 'react';
import { Search, Globe, Sparkles, Loader2, ExternalLink, BookOpen } from 'lucide-react';

export const LiveGroundedSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [grounding, setGrounding] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/grounded-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to perform grounded research');
      }

      setResultText(data.text);
      setGrounding(data.groundingMetadata);
    } catch (err: any) {
      setError(err?.message || 'Error communicating with Gemini Search Grounding API');
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'Latest open-source AI agent frameworks in 2026',
    'Best practices for structured prompt evaluation and red-teaming',
    'How to integrate MCP (Model Context Protocol) with LangChain and n8n',
    'High-converting prompt patterns for B2B outbound copywriting'
  ];

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
          <Globe className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-stone-900">Live Search Grounded AI Intelligence</h3>
          <p className="text-xs text-stone-500">
            Powered by <span className="font-mono font-medium text-stone-700">gemini-3.5-flash</span> with real-time Google Search grounding.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about modern AI agents, prompts, or workflows..."
            className="w-full rounded-xl border border-stone-200 pl-10 pr-24 py-3 text-xs text-stone-900 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 rounded-lg bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-stone-600 font-medium mr-1">Trending Topics:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuery(sq)}
              className="text-[11px] text-stone-600 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Result Display with Search Citations */}
      {resultText && (
        <div className="mt-6 border-t border-stone-100 pt-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Grounded Synthesis & Sourced Findings</span>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 text-xs leading-relaxed text-stone-700 whitespace-pre-wrap font-sans">
            {resultText}
          </div>

          {/* Grounding web sources metadata */}
          {grounding?.groundingChunks && grounding.groundingChunks.length > 0 && (
            <div className="border-t border-stone-100 pt-3">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                Live Google Search Citations
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grounding.groundingChunks.map((chunk: any, idx: number) => {
                  if (!chunk.web) return null;
                  return (
                    <a
                      key={idx}
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white p-2.5 text-xs text-stone-700 hover:border-amber-400 transition-colors"
                    >
                      <span className="truncate font-medium">{chunk.web.title || chunk.web.uri}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
