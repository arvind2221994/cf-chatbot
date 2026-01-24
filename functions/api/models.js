export async function onRequestGet(context) {
  try {
    const { env } = context;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter for models that support generateContent
    const contentModels = data.models.filter(m => 
      m.supportedGenerationMethods?.includes('generateContent')
    );
    
    return new Response(JSON.stringify({ 
      models: contentModels.map(m => ({
        name: m.name,
        displayName: m.displayName,
        description: m.description,
        supportedMethods: m.supportedGenerationMethods
      }))
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}