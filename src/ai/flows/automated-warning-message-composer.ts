'use server';
/**
 * @fileOverview An AI agent for composing automated warning messages for underperforming entities.
 *
 * - composeWarningMessage - A function that handles the generation of a warning message.
 * - AutomatedWarningMessageComposerInput - The input type for the composeWarningMessage function.
 * - AutomatedWarningMessageComposerOutput - The return type for the composeWarningMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedWarningMessageComposerInputSchema = z.object({
  entityRole: z.union([z.literal('Ward Admin'), z.literal('Zone Admin')]).describe('The role of the underperforming entity.'),
  entityName: z.string().describe('The name of the underperforming entity.'),
  performanceIssuesDescription: z.string().describe('A detailed description of the specific performance issues, backed by data if possible.'),
  areasForImprovement: z.string().describe('Suggested areas for improvement for the entity.'),
});
export type AutomatedWarningMessageComposerInput = z.infer<typeof AutomatedWarningMessageComposerInputSchema>;

const AutomatedWarningMessageComposerOutputSchema = z.object({
  warningMessage: z.string().describe('The generated clear, data-backed warning message.'),
});
export type AutomatedWarningMessageComposerOutput = z.infer<typeof AutomatedWarningMessageComposerOutputSchema>;

export async function composeWarningMessage(input: AutomatedWarningMessageComposerInput): Promise<AutomatedWarningMessageComposerOutput> {
  return automatedWarningMessageComposerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedWarningMessageComposerPrompt',
  input: {schema: AutomatedWarningMessageComposerInputSchema},
  output: {schema: AutomatedWarningMessageComposerOutputSchema},
  prompt: `You are an official communication agent for CleanMadurai.AI, tasked with drafting a clear, data-backed warning message for an underperforming entity.

The message should be professional, firm, and constructive, highlighting specific performance issues and suggesting areas for improvement.

Entity Role: {{{entityRole}}}
Entity Name: {{{entityName}}}

Performance Issues:
{{{performanceIssuesDescription}}}

Areas for Improvement:
{{{areasForImprovement}}}

Draft the warning message in a formal tone, addressing the entity directly. The message should clearly state the concerns and expectations for improvement.`,
});

const automatedWarningMessageComposerFlow = ai.defineFlow(
  {
    name: 'automatedWarningMessageComposerFlow',
    inputSchema: AutomatedWarningMessageComposerInputSchema,
    outputSchema: AutomatedWarningMessageComposerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate warning message.');
    }
    return output;
  }
);
