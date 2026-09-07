import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, Download, Sliders, ExternalLink } from 'lucide-react';

interface AIImageGeneratorProps {
  onImageGenerated?: (url: string) => void;
}

export const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size,
          aspectRatio
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image generation failed');
      }

      setGeneratedImage(data.imageUrl);
      onImageGenerated?.(data.imageUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate image. Please check API credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">AI Image Generator</h3>
            <p className="text-xs text-stone-500">
              Powered by <span className="font-mono font-medium text-stone-700">gemini-3-pro-image-preview</span> with 1K, 2K & 4K fidelity.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Prompt Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="E.g., Minimalist matte ceramic smart home console on a light limestone tabletop, warm studio lighting, 8k..."
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        {/* Configuration: Size affordance (1K, 2K, 4K) & Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Resolution Fidelity
            </label>
            <div className="flex gap-2">
              {(['1K', '2K', '4K'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                    size === s
                      ? 'border-rose-500 bg-rose-50 text-rose-700 font-semibold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Aspect Ratio
            </label>
            <div className="flex gap-2">
              {(['1:1', '16:9', '9:16', '4:3'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspectRatio(r)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                    aspectRatio === r
                      ? 'border-amber-500 bg-amber-50 text-amber-800 font-semibold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-50 transition-all shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Synthesizing {size} High-Fidelity Asset...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Generate Image Asset</span>
            </>
          )}
        </button>
      </form>

      {/* Render generated asset */}
      {generatedImage && (
        <div className="mt-6 border-t border-stone-100 pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-700">
              Generated Asset Output ({size})
            </span>
            <a
              href={generatedImage}
              download="promptfoundry-asset.png"
              className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download High-Res</span>
            </a>
          </div>
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            <img
              src={generatedImage}
              alt="Generated visual"
              className="w-full max-h-[450px] object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
