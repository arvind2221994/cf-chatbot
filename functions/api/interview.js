import { GoogleGenerativeAI } from '@google/generative-ai';
import { INTERVIEWER_SYSTEM_PROMPT } from './_prompts.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  if(!env.GEMINI_API_KEY){
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), { status: 500 });
  }
  try {
    const { prompt } = await request.json();
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    
    // Using the same reliable 2.5 flash model with your custom technical prompt
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: INTERVIEWER_SYSTEM_PROMPT,
    });

    const result = await model.generateContentStream(prompt);

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
