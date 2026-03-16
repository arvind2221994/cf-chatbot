import { GoogleGenerativeAI } from '@google/generative-ai';
import { INTERVIEWER_SYSTEM_PROMPT } from './_prompts.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), { status: 500 });
  }
  try {
    const { prompt, history, models } = await request.json();
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    let result = null;

    // Map conversation array [{role: 'user'|'assistant', content: '...'}] to Gemini's structure
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    for (let i = 0; i < models.length; i++) {
      try {
        const currentModelName = models[i];
        const model = genAI.getGenerativeModel({
          model: currentModelName,
          systemInstruction: INTERVIEWER_SYSTEM_PROMPT,
        });

        const chat = model.startChat({
          history: formattedHistory
        });

        result = await chat.sendMessageStream(prompt);
        console.log(`Successfully connected using model: ${currentModelName}`);
        // If request succeeds, break out of the fallback loop
        break;

      } catch (e) {
        console.error(`Error with model ${models[i]}:`, e.message);
        // If it's a rate limit / quota error, apply linear backoff before falling back
        if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
          if (i < models.length - 1) {
            // Linear Backoff algorithm: 2s -> 4s -> 6s delays between fallback attempts
            const backoffMs = (i + 1) * 2000;
            console.warn(`Model ${models[i]} hit 429 (Quota limit). Delaying ${backoffMs}ms before falling back to ${models[i + 1]}...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue;
          } else {
            throw new Error("All backend models exceeded rate limits due to heavy traffic. Please wait 10 seconds and try again.");
          }
        } else {
          throw e; // Throw if it's not a rate limit error
        }
      }
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        await writer.write(encoder.encode(text));
      }
      await writer.close();
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
