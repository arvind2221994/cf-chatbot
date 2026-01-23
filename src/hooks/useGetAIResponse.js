/**
 * Hook to get AI response from Gemini API
 * @param {string} prompt - The user's input prompt
 * @returns {Promise<string|null>} - The AI response or null if error
 */
export async function useGetAIResponse(prompt) {
  // Hook implementation
  try{
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
    });
    const data = await response.json();
    console.log(data.response);
    return data.response;
  }
  catch(err){
    console.error("Error fetching AI response", err);
    return "";
  }
    
}