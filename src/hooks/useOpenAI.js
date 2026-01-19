import { useState, useCallback } from 'react';

const DIFFICULTY_PROMPTS = {
  easy: 'Create a simple, short tongue twister (about 5-8 words) that is relatively easy to say.',
  medium: 'Create a moderately difficult tongue twister (about 8-15 words) with some challenging sound combinations.',
  hard: 'Create a very challenging tongue twister (about 15-25 words) with complex alliteration, similar sounds, and tricky transitions.',
};

export function useOpenAI(apiKey) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateTwister = useCallback(async (theme, difficulty) => {
    if (!apiKey || !apiKey.trim()) {
      setError('Please enter your OpenAI API key.');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    const prompt = `You are a creative tongue twister generator. 
${DIFFICULTY_PROMPTS[difficulty]}

Theme: ${theme}

Rules:
- Make it fun and challenging to say quickly
- Use alliteration and similar sounds related to the theme
- Do NOT include any explanation, just the tongue twister itself
- Do NOT use quotation marks around the tongue twister
- Make it a single sentence or phrase`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You generate creative tongue twisters. Respond only with the tongue twister, nothing else.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 100,
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const twister = data.choices[0]?.message?.content?.trim();
      
      if (!twister) {
        throw new Error('No tongue twister generated');
      }

      setIsGenerating(false);
      return twister;
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
      return null;
    }
  }, [apiKey]);

  return { generateTwister, isGenerating, error, clearError: () => setError(null) };
}
