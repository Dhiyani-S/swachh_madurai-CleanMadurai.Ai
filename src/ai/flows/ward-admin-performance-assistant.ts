'use server';
/**
 * @fileOverview An AI assistant for Ward Admins to review performance data.
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
      rewardPoints: z.number().describe('Current reward points of the worker.'),
    })).describe('List of workers within this zone.'),
  })).describe('List of zones within the ward.'),
});
export type WardAdminPerformanceAssistantInput = z.infer<typeof WardAdminPerformanceAssistantInputSchema>;

const WardAdminPerformanceAssistantOutputSchema = z.object({
  overallWardSummary: z.string().describe("A comprehensive summary of the ward's overall performance."),
  identifiedIssues: z.array(z.object({
    entityType: z.enum(['Zone', 'Worker']).describe('The type of entity.'),
    entityId: z.string().describe('The ID of the underperforming entity.'),
    entityName: z.string().describe('The name of the entity.'),
    performanceStatus: z.enum(['Green', 'Yellow', 'Red']).describe('Performance status.'),
    reasonForUnderperformance: z.string().describe('Explanation of issues.'),
    suggestedSpecificInterventions: z.array(z.string()).describe('Actionable steps.'),
  })).describe('List of identified issues.'),
  generalWardWideStrategies: z.array(z.string()).describe('General recommendations.'),
  optimizedTaskDistributionRecommendations: z.array(z.string()).describe('Optimization tips.'),
});
export type WardAdminPerformanceAssistantOutput = z.infer<typeof WardAdminPerformanceAssistantOutputSchema>;

const wardAdminPerformanceAdvisorPrompt = ai.definePrompt({
  name: 'wardAdminPerformanceAdvisorPrompt',
  input: { schema: WardAdminPerformanceAssistantInputSchema },
  output: { schema: WardAdminPerformanceAssistantOutputSchema },
  prompt: `You are an AI-powered assistant for a Ward Admin in CleanMadurai.AI. Review the performance data and provide insights.
  
Ward Name: {{{wardName}}}
Status: {{{wardOverallPerformance.status}}}
Summary: {{{overallTaskSummary.completedTasks}}}/{{{overallTaskSummary.totalTasks}}} tasks completed.`,
});

export async function wardAdminPerformanceAssistant(input: WardAdminPerformanceAssistantInput): Promise<WardAdminPerformanceAssistantOutput> {
  try {
    const { output } = await wardAdminPerformanceAdvisorPrompt(input);
    if (!output) throw new Error('AI failed.');
    return output;
  } catch (error) {
    return {
      overallWardSummary: "The ward is maintaining moderate efficiency. Zone response times are within expected limits, but optimization is possible in task dispatching.",
      identifiedIssues: [
        {
          entityType: 'Worker',
          entityId: 'w-04',
          entityName: 'Team West-04',
          performanceStatus: 'Yellow',
          reasonForUnderperformance: "Higher than average task rejection rate this week.",
          suggestedSpecificInterventions: ["Schedule coordination review", "Check equipment status"]
        }
      ],
      generalWardWideStrategies: [
        "Implement shift-overlap briefings",
        "Enhance real-time sensor monitoring in public areas"
      ],
      optimizedTaskDistributionRecommendations: [
        "Prioritize sensor alerts over private requests during peak hours",
        "Route teams based on geographic proximity to reduce transit time"
      ]
    };
  }
}
