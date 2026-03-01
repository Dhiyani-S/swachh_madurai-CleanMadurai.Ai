'use server';
/**
 * @fileOverview This file implements a Genkit flow that acts as an AI-powered performance advisor for the Corporation Commissioner.
 * It analyzes city-wide waste management data and provides insights, trends, inefficiencies, and actionable recommendations.
 *
 * - getCommissionerPerformanceInsights - A function that triggers the AI analysis for the Corporation Commissioner.
 * - CommissionerPerformanceInsightsInput - The input type for the getCommissionerPerformanceInsights function.
 * - CommissionerPerformanceInsightsOutput - The return type for the getCommissionerPerformanceInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CommissionerPerformanceInsightsInputSchema = z.object({
  period: z
    .string()
    .optional()
    .describe(
      'The time period for which to analyze waste management data (e.g., "last month", "Q3 2023", "yesterday"). Defaults to "the recent past" if not specified.'
    ),
});
export type CommissionerPerformanceInsightsInput = z.infer<typeof CommissionerPerformanceInsightsInputSchema>;

const CommissionerPerformanceInsightsOutputSchema = z.object({
  overview: z.string().describe('A general summary of the city\'s waste management performance for the given period.'),
  keyTrends: z.array(z.string()).describe('A list of identified key trends in waste management performance.'),
  inefficiencies: z.array(z.string()).describe('A list of specific areas of inefficiency in waste management operations.'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations to improve cleanliness and operational effectiveness.'),
  warningSuggestions: z.array(z.string()).describe('Specific suggestions for warning messages that could be sent to Ward Admins if their ward\'s performance is suboptimal.'),
});
export type CommissionerPerformanceInsightsOutput = z.infer<typeof CommissionerPerformanceInsightsOutputSchema>;

const commissionerPerformancePrompt = ai.definePrompt({
  name: 'commissionerPerformancePrompt',
  input: { schema: CommissionerPerformanceInsightsInputSchema },
  output: { schema: CommissionerPerformanceInsightsOutputSchema },
  prompt: `You are an AI-powered performance advisor for the CleanMadurai.AI smart waste management system, reporting directly to the Corporation Commissioner.
Your task is to analyze overall city-wide waste management data for the period: {{{period}}}. If no period is specified, analyze the recent past.

Based on your analysis, identify key trends, pinpoint inefficiencies, and provide actionable recommendations to improve cleanliness and operational effectiveness across Madurai. Also, suggest specific warning messages that could be sent to Ward Admins if their ward\'s performance is suboptimal.

Focus on aspects such as:
- Ward and zone performance (e.g., total tasks, completed tasks, pending tasks, cleanliness ranking).
- Worker performance (e.g., task completion rates, proper disposal verification, efficiency).
- Response times to sensor alerts (e.g., dustbin overflow, water leakage, drainage leakage, toilet stock levels).
- Citizen feedback (e.g., public complaints, private service requests).

Provide your insights in a structured format as described by the output schema.
`,
});

const commissionerPerformanceInsightsFlow = ai.defineFlow(
  {
    name: 'commissionerPerformanceInsightsFlow',
    inputSchema: CommissionerPerformanceInsightsInputSchema,
    outputSchema: CommissionerPerformanceInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await commissionerPerformancePrompt(input);
    return output!;
  }
);

export async function getCommissionerPerformanceInsights(
  input: CommissionerPerformanceInsightsInput
): Promise<CommissionerPerformanceInsightsOutput> {
  return commissionerPerformanceInsightsFlow(input);
}
