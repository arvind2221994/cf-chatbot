import { GoogleGenerativeAI } from '@google/generative-ai';
import { KANNADA_SYSTEM_PROMPT, ENGLISH_SYSTEM_PROMPT, TELUGU_SYSTEM_PROMPT } from './_prompts.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  if(!env.GEMINI_API_KEY){
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), { status: 500 });
  }
  try {
    const { prompt, language } = await request.json();
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    
    let DEFAULT_SYSTEM_PROMPT = ENGLISH_SYSTEM_PROMPT;
    if (language === 'kn') {
      DEFAULT_SYSTEM_PROMPT = KANNADA_SYSTEM_PROMPT;
    } else if (language === 'te') {
      DEFAULT_SYSTEM_PROMPT = TELUGU_SYSTEM_PROMPT;
    }

    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: DEFAULT_SYSTEM_PROMPT,
     });

    // 1. Call the streaming method
    const result = await model.generateContentStream(prompt);

    // 2. Create a TransformStream to format the data for the browser
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // 3. Start a background loop to push chunks into the stream
    // We DON'T await this so the response can start immediately
    (async () => {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        // Send as a simple text stream or Server-Sent Events (SSE)
        await writer.write(encoder.encode(text));
      }
      await writer.close();
    })();

    // 4. Return the readable side of the stream to the browser
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