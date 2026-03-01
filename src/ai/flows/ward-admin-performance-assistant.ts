'use server';
/**
 * @fileOverview An AI assistant for Ward Admins to review performance data, flag underperforming entities, and suggest interventions.
 *
 * - wardAdminPerformanceAssistant - A function that handles the ward performance analysis and provides suggestions.
 * - WardAdminPerformanceAssistantInput - The input type for the wardAdminPerformanceAssistant function.
 * - WardAdminPerformanceAssistantOutput - The return type for the wardAdminPerformanceAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WardAdminPerformanceAssistantInputSchema = z.object({
  wardId: z.string().describe('The ID of the ward.'),
  wardName: z.string().describe('The name of the ward.'),
  wardOverallPerformance: z.object({
    status: z.enum(['Green', 'Yellow', 'Red']).describe('Overall performance status of the ward.'),
    description: z.string().describe('A brief description of the ward\'s overall performance.'),
  }).describe('Overall performance data for the ward.'),
  overallTaskSummary: z.object({
    totalTasks: z.number().describe('Total number of tasks in the ward.'),
    completedTasks: z.number().describe('Total number of completed tasks in the ward.'),
    pendingTasks: z.number().describe('Total number of pending tasks in the ward.'),
  }).describe('Summary of all tasks within the ward.'),
  zones: z.array(z.object({
    zoneId: z.string().describe('The ID of the zone.'),
    zoneName: z.string().describe('The name of the zone.'),
    zoneAdminName: z.string().describe('The name of the Zone Admin.'),
    zonePerformance: z.object({
      status: z.enum(['Green', 'Yellow', 'Red']).describe('Performance status of the zone.'),
      description: z.string().describe('A brief description of the zone\'s performance.'),
    }).describe('Performance data for the zone.'),
    zoneTaskSummary: z.object({
      totalTasks: z.number().describe('Total tasks for this zone.'),
      completedTasks: z.number().describe('Completed tasks for this zone.'),
      pendingTasks: z.number().describe('Pending tasks for this zone.'),
    }).describe('Task summary for the zone.'),
    workers: z.array(z.object({
      workerId: z.string().describe('The ID of the worker.'),
      workerName: z.string().describe('The name of the worker.'),
      teamNumber: z.string().describe('The team number of the worker.'),
      performanceStatus: z.enum(['Green', 'Yellow', 'Red']).describe('Performance status of the worker.'),
      completedTasks: z.number().describe('Number of completed tasks by this worker.'),
      pendingTasks: z.number().describe('Number of pending tasks assigned to this worker.'),
      rejectedTasks: z.number().describe('Number of tasks rejected by this worker.'),
      unresponsiveTasks: z.number().describe('Number of tasks worker did not respond to within 30 minutes.'),
      rewardPoints: z.number().describe('Current reward points of the worker.'),
    })).describe('List of workers within this zone and their performance data.'),
  })).describe('List of zones within the ward with their performance and worker data.'),
});
export type WardAdminPerformanceAssistantInput = z.infer<typeof WardAdminPerformanceAssistantInputSchema>;

const WardAdminPerformanceAssistantOutputSchema = z.object({
  overallWardSummary: z.string().describe("A comprehensive summary of the ward's overall performance, highlighting strengths and weaknesses."),
  identifiedIssues: z.array(z.object({
    entityType: z.enum(['Zone', 'Worker']).describe('The type of entity (Zone or Worker) that is underperforming.'),
    entityId: z.string().describe('The ID of the underperforming zone or worker.'),
    entityName: z.string().describe('The name of the underperforming zone or worker.'),
    performanceStatus: z.enum(['Green', 'Yellow', 'Red']).describe('The current performance status of the entity.'),
    reasonForUnderperformance: z.string().describe('A detailed explanation of why this entity is considered underperforming.'),
    suggestedSpecificInterventions: z.array(z.string()).describe('Specific actionable steps to improve the performance of this entity.'),
  })).describe('List of identified underperforming zones or workers with reasons and specific interventions.'),
  generalWardWideStrategies: z.array(z.string()).describe('General strategies or recommendations to improve overall ward efficiency and task management.'),
  optimizedTaskDistributionRecommendations: z.array(z.string()).describe('Recommendations for optimizing task distribution across zones and workers.'),
});
export type WardAdminPerformanceAssistantOutput = z.infer<typeof WardAdminPerformanceAssistantOutputSchema>;

export async function wardAdminPerformanceAssistant(input: WardAdminPerformanceAssistantInput): Promise<WardAdminPerformanceAssistantOutput> {
  return wardAdminPerformanceAssistantFlow(input);
}

const wardAdminPerformanceAdvisorPrompt = ai.definePrompt({
  name: 'wardAdminPerformanceAdvisorPrompt',
  input: { schema: WardAdminPerformanceAssistantInputSchema },
  output: { schema: WardAdminPerformanceAssistantOutputSchema },
  prompt: `You are an AI-powered assistant for a Ward Admin in the CleanMadurai.AI smart waste management system. Your goal is to review the performance data of the ward, identify underperforming zones or workers, and suggest specific interventions or optimized task distribution strategies to enhance efficiency within the jurisdiction.

Ward ID: {{{wardId}}}
Ward Name: {{{wardName}}}
Ward Overall Performance: Status - {{{wardOverallPerformance.status}}}, Description - {{{wardOverallPerformance.description}}}
Overall Task Summary: Total - {{{overallTaskSummary.totalTasks}}}, Completed - {{{overallTaskSummary.completedTasks}}}, Pending - {{{overallTaskSummary.pendingTasks}}}

Here is the detailed data for each zone and its workers:

{{#each zones}}
--- Zone Details ---
Zone ID: {{{zoneId}}}
Zone Name: {{{zoneName}}}
Zone Admin: {{{zoneAdminName}}}
Zone Performance: Status - {{{zonePerformance.status}}}, Description - {{{zonePerformance.description}}}
Zone Task Summary: Total - {{{zoneTaskSummary.totalTasks}}}, Completed - {{{zoneTaskSummary.completedTasks}}}, Pending - {{{zoneTaskSummary.pendingTasks}}}

Workers in this Zone:
{{#each workers}}
  - Worker ID: {{{workerId}}}, Name: {{{workerName}}}, Team: {{{teamNumber}}}
    Performance Status: {{{performanceStatus}}}
    Completed Tasks: {{{completedTasks}}}
    Pending Tasks: {{{pendingTasks}}}
    Rejected Tasks: {{{rejectedTasks}}}
    Unresponsive Tasks: {{{unresponsiveTasks}}}
    Reward Points: {{{rewardPoints}}}
{{/each}}
{{/each}}

Based on the provided data, please provide:
1. An "overallWardSummary" summarizing the ward's performance.
2. A list of "identifiedIssues" where each issue details an underperforming zone or worker, includes their ID, name, current performance status, a reason for their underperformance, and specific suggested interventions for them. Consider "Yellow" and "Red" statuses as indications of underperformance.
3. "generalWardWideStrategies" for overall ward improvement.
4. "optimizedTaskDistributionRecommendations" for better task assignment.

Ensure the output is a valid JSON object matching the defined output schema.`,
});

const wardAdminPerformanceAssistantFlow = ai.defineFlow(
  {
    name: 'wardAdminPerformanceAssistantFlow',
    inputSchema: WardAdminPerformanceAssistantInputSchema,
    outputSchema: WardAdminPerformanceAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await wardAdminPerformanceAdvisorPrompt(input);
    return output!;
  }
);
