'use server';
/**
 * @fileOverview An AI agent for verifying public waste/cleanliness reports using computer vision.
 *
 * - verifyPublicReport - A function that handles the image analysis process.
 * - VerifyPublicReportInput - The input type for the verifyPublicReport function.
 * - VerifyPublicReportOutput - The return type for the verifyPublicReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyPublicReportInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the reported issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the reported issue.'),
});
export type VerifyPublicReportInput = z.infer<typeof VerifyPublicReportInputSchema>;

const VerifyPublicReportOutputSchema = z.object({
  isValid: z.boolean().describe('Whether or not the input image contains a valid waste or cleanliness issue (e.g., garbage, leakage, overflow).'),
  issueType: z.string().optional().describe('The identified category of the issue (e.g., Overflowing Dustbin, Littering, Drainage Leakage).'),
  confidenceScore: z.number().describe('A score from 0 to 1 indicating the AI\'s confidence in the identification.'),
  reasoning: z.string().describe('A brief explanation of why the report was verified or rejected.'),
});
export type VerifyPublicReportOutput = z.infer<typeof VerifyPublicReportOutputSchema>;

export async function verifyPublicReport(input: VerifyPublicReportInput): Promise<VerifyPublicReportOutput> {
  return verifyPublicReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyPublicReportPrompt',
  input: {schema: VerifyPublicReportInputSchema},
  output: {schema: VerifyPublicReportOutputSchema},
  prompt: `You are an expert AI validator for the CleanMadurai.AI waste management system.
Your task is to analyze the provided image and description to determine if it represents a legitimate public cleanliness or waste issue that requires intervention.

Legitimate issues include:
- Overflowing dustbins or garbage heaps.
- Littering or waste dumped in public spaces.
- Drainage leakages or sewer issues.
- Public toilet cleanliness issues.

If the image is unrelated (e.g., a selfie, a clean street, a random object), set isValid to false.

Input Description: {{{description}}}
Photo: {{media url=photoDataUri}}`,
});

const verifyPublicReportFlow = ai.defineFlow(
  {
    name: 'verifyPublicReportFlow',
    inputSchema: VerifyPublicReportInputSchema,
    outputSchema: VerifyPublicReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI analysis failed.');
    }
    return output;
  }
);
