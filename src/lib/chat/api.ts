import type { Model } from './types';

interface CallOpenRouterParams {
  model: Model;
  messages: Array<{ role: string; content: string }>;
  apiKey: string;
  signal: AbortSignal;
  onChunk: (text: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
}

export async function callOpenRouter({
  model,
  messages,
  apiKey,
  signal,
  onChunk,
  onDone,
  onError
}: CallOpenRouterParams) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${apiKey}`,
        'HTTP-Referer':   window.location.origin,
        'X-Title':        'VSCompiler AI Chat',
      },
      body: JSON.stringify({
        model:  model.id,
        messages,
        stream: true,
        temperature:       0.7,
        max_tokens:        2048,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any)?.error?.message ?? `OpenRouter error ${res.status}`);
    }

    const reader  = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const json  = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onChunk(fullText);
          }
        } catch { /* skip */ }
      }
    }
    
    onDone(fullText || '(empty response)');
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      onError(err);
    } else {
      // It was aborted, typically we handle this in the UI
      onError(new Error('AbortError'));
    }
  }
}
