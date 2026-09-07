import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google Gen AI helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), platform: 'PromptFoundry' });
});

// Search Grounding API: Uses gemini-3.5-flash with googleSearch tool as requested
app.post('/api/ai/grounded-search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const ai = getGenAI();
    // gemini-3.5-flash with googleSearch
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are an AI research assistant on PromptFoundry. Provide a factual, up-to-date, comprehensive summary for the following topic or prompt discovery question. Include context on current tools, modern workflows, and best practices:\n\nQuery: ${query}`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || '';
    const searchMetadata = response.candidates?.[0]?.groundingMetadata || null;

    res.json({
      success: true,
      text,
      groundingMetadata: searchMetadata
    });
  } catch (err: any) {
    console.error('Error in grounded search:', err);
    res.status(500).json({ error: err?.message || 'Failed to execute grounded search' });
  }
});

// High-quality image generation API: Uses gemini-3-pro-image-preview with 1K, 2K, 4K affordance
app.post('/api/ai/generate-image', async (req, res) => {
  try {
    const { prompt, size = '1K', aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();
    // gemini-3-pro-image-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1',
          imageSize: size || '1K'
        }
      }
    });

    // Extract base64 image from candidate parts
    let imageUrl = '';
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return res.status(502).json({ error: 'No image data returned from image generation model' });
    }

    res.json({
      success: true,
      imageUrl,
      size,
      aspectRatio
    });
  } catch (err: any) {
    console.error('Error generating image:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate image' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PromptFoundry server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
