/**
 * Hook to get AI response from Gemini API with streaming support
 * @param {string} prompt - The user's input prompt
 * @param {Function} onChunk - Callback function to receive text chunks as they stream in
 * @returns {Promise<string|null>} - The complete AI response or null if error
 */
export async function useGetAIResponse(prompt, language, onChunk) {
  if (!prompt || prompt.trim() === '') {
    return null;
  }
  try{
    const userPrompt = prompt;
    const models = await getExistingModels();
    console.log('Available models:', models);
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ 
        prompt: userPrompt,
        language: language
      }),
    });
    console.log(response);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      console.log(fullText);
      // Update your React state here to show the text as it arrives
      onChunk(fullText);
    }
  }catch(error){
    console.error('Error fetching AI response:', error);
    throw error;
  }
  
}

/**
 * Fetch available Gemini models from the API
 * @returns {Promise<Array|null>} - Array of available models or null if error
 */
export async function getExistingModels() {
  try {
    const response = await fetch('/api/models', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.models;
  } catch (error) {
    console.error('Error fetching models:', error);
    return null;
  }
}