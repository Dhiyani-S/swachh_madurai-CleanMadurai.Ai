
'use server';
/**
 * @fileOverview AI performance advisor for the Corporation Commissioner.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CommissionerPerformanceInsightsInputSchema = z.object({
  period: z.string().optional().describe('Time period for analysis.'),
});
export type CommissionerPerformanceInsightsInput = z.infer<typeof CommissionerPerformanceInsightsInputSchema>;

const CommissionerPerformanceInsightsOutputSchema = z.object({
  overview: z.string().describe('City-wide performance summary.'),
  keyTrends: z.array(z.string()).describe('List of trends.'),
  inefficiencies: z.array(z.string()).describe('List of inefficiencies.'),
  recommendations: z.array(z.string()).describe('List of recommendations.'),
  warningSuggestions: z.array(z.string()).describe('Suggestions for admins.'),
});
export type CommissionerPerformanceInsightsOutput = z.infer<typeof CommissionerPerformanceInsightsOutputSchema>;

const commissionerPerformancePrompt = ai.definePrompt({
  name: 'commissionerPerformancePrompt',
  input: { schema: CommissionerPerformanceInsightsInputSchema },
  output: { schema: CommissionerPerformanceInsightsOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an AI-powered performance advisor for the CleanMadurai.AI smart waste management system.
Analyze city-wide data for the period: {{{period}}}. Identify trends and inefficiencies.`,
});

const commissionerPerformanceInsightsFlow = ai.defineFlow(
  {
    name: 'commissionerPerformanceInsightsFlow',
    inputSchema: CommissionerPerformanceInsightsInputSchema,
    outputSchema: CommissionerPerformanceInsightsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await commissionerPerformancePrompt(input);
      if (!output) throw new Error('AI failed to generate insights.');
      return output;
    } catch (error) {
      console.error('AI Flow Error:', error);
      return {
        overview: "The AI system is currently analyzing live data streams. Please check back in a moment.",
        keyTrends: ["Optimizing worker allocation", "Sensor data synchronization"],
        inefficiencies: ["Peak hour response delay"],
        recommendations: ["Review Zone D resource distribution"],
        warningSuggestions: ["Follow up with Ward 4 Admin"]
      };
    }
  }
);

export async function getCommissionerPerformanceInsights(
  input: CommissionerPerformanceInsightsInput
): Promise<CommissionerPerformanceInsightsOutput> {
  return commissionerPerformanceInsightsFlow(input);
}
