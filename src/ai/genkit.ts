import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit initialization for CleanMadurai.AI.
 * We use a placeholder key to prevent the server from crashing during initialization 
 * if the environment variables are not yet set.
 */
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AI_PROTOTYPE_MODE';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
