'use server';
/**
 * @fileOverview An AI agent for verifying public waste/cleanliness reports using computer vision.
 * This acts as the Deep Learning (DL) pre-verification layer for the system.
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
  try {
    return await verifyPublicReportFlow(input);
  } catch (error: any) {
    console.error('AI Verification Error:', error);
    // Graceful fallback for the prototype if AI service is blocked or offline
    return {
      isValid: true,
      issueType: 'Manual Review Required',
      confidenceScore: 0.5,
      reasoning: 'The AI verification service is currently experiencing high load. We have accepted your report for manual verification to ensure prompt service.'
    };
  }
}

const prompt = ai.definePrompt({
  name: 'verifyPublicReportPrompt',
  input: {schema: VerifyPublicReportInputSchema},
  output: {schema: VerifyPublicReportOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are a Deep Learning Computer Vision validator for the CleanMadurai.AI system.
Your goal is to perform PRE-VERIFICATION on citizen reports. You must filter out any reports that do not show an actual cleanliness or waste issue.

STRICT VALIDATION CRITERIA:
- Set isValid to TRUE ONLY if the image clearly shows:
  1. Overflowing dustbins or garbage heaps.
  2. Littering or dumped waste in public spaces.
  3. Drainage/sewage leakages or blockages.
  4. Public toilet cleanliness failures.
- Set isValid to FALSE if the image shows:
  1. Clean streets or buildings.
  2. People's faces/selfies without context of an issue.
  3. Random objects unrelated to waste management.
  4. A blurry or dark photo where no issue can be identified.

Input Description: {{{description}}}
Photo: {{media url=photoDataUri}}

Provide a clear 'reasoning' for your decision so the citizen understands why their report was accepted or rejected.`,
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
      throw new Error('AI analysis failed to return an output.');
    }
    return output;
  }
);
