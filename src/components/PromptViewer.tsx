import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  Sliders,
  Download,
  Terminal,
  FileCode,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { PromptVariable } from '../types';

interface PromptViewerProps {
  content: string;
  variables?: PromptVariable[];
  onCopy?: () => void;
  title?: string;
}

export const PromptViewer: React.FC<PromptViewerProps> = ({
  content,
  variables = [],
  onCopy,
  title = 'Prompt'
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Variable values mapping
  const [varValues, setVarValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    variables.forEach(v => {
      initial[v.name] = v.defaultValue || '';
    });
    // Auto-detect bracketed variables like {{name}} in content if not declared
    const matches = content.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g);
    if (matches) {
      matches.forEach(m => {
        const key = m.replace(/[{}]/g, '');
        if (!initial[key]) {
          initial[key] = '';
        }
      });
    }
    return initial;
  });

  const handleVarChange = (name: string, val: string) => {
    setVarValues(prev => ({ ...prev, [name]: val }));
  };

  // Compute final populated prompt text
  const getCompiledPrompt = () => {
    let output = content;
    Object.entries(varValues).forEach(([key, val]) => {
      const strVal = String(val ?? '');
      if (strVal.trim()) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        output = output.replace(regex, strVal);
      }
    });
    return output;
  };

  const handleCopyCompiled = async () => {
    const text = getCompiledPrompt();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = getCompiledPrompt();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-prompt.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const variableKeys = Object.keys(varValues);

  return (
    <div className="flex flex-col rounded-xl border border-stone-200 bg-stone-900 text-stone-100 overflow-hidden shadow-sm">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between border-b border-stone-800 bg-stone-950/80 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
          <Terminal className="w-4 h-4 text-amber-500" />
          <span>Interactive Prompt Engine</span>
          {variableKeys.length > 0 && (
            <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] text-amber-400 font-mono">
              {variableKeys.length} Dynamic Variables
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownloadTxt}
            title="Download TXT"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="p-1 rounded-md text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            id="copy-compiled-prompt-btn"
            onClick={handleCopyCompiled}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Variables Input Panel (if any variables detected) */}
      {variableKeys.length > 0 && (
        <div className="border-b border-stone-800 bg-stone-900/90 p-4">
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Prompt Variables</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {variableKeys.map(key => {
              const meta = variables.find(v => v.name === key);
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono text-stone-400 flex items-center justify-between">
                    <span>{meta?.label || key}</span>
                    <span className="text-[10px] text-stone-400">{`{{${key}}}`}</span>
                  </label>
                  <input
                    type="text"
                    value={varValues[key]}
                    onChange={(e) => handleVarChange(key, e.target.value)}
                    placeholder={meta?.defaultValue || `Enter ${key}...`}
                    className="w-full rounded-md border border-stone-700 bg-stone-950 px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden"
                  />
                  {meta?.description && (
                    <span className="text-[10px] text-stone-400">{meta.description}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Prompt Text Display */}
      <div
        className={`p-4 font-mono text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap selection:bg-amber-500/30 ${
          isExpanded ? 'max-h-[650px]' : 'max-h-[380px]'
        }`}
      >
        {getCompiledPrompt()}
      </div>
    </div>
  );
};
