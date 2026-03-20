'use server';
/**
 * @fileOverview This file implements an AI tool to automatically generate concise summaries of mandate progress and status updates.
 *
 * - aiMandateSummary - A function that handles the generation of mandate summaries.
 * - AiMandateSummaryInput - The input type for the aiMandateSummary function.
 * - AiMandateSummaryOutput - The return type for the aiMandateSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiMandateSummaryInputSchema = z.object({
  clientName: z.string().describe('The name of the client associated with the mandate.'),
  mandateTitle: z.string().describe('The title or role of the job mandate.'),
  currentStage: z.string().describe('The current workflow stage of the mandate (e.g., "Sourcing", "Interviewing", "Offer Extended").'),
  requiredHeadcount: z.number().int().positive().describe('The number of positions to be filled for this mandate.'),
  associatedFees: z.string().describe('The commercial terms or fees associated with the mandate (e.g., "15% of annual salary", "Fixed Fee $25,000").'),
  progressUpdates: z.array(z.string()).describe('A list of recent progress updates or key milestones for the mandate.'),
  summaryContext: z.enum(['client_communication', 'internal_report']).describe('The intended context for the summary, either for client communication or internal reporting.'),
});
export type AiMandateSummaryInput = z.infer<typeof AiMandateSummaryInputSchema>;

const AiMandateSummaryOutputSchema = z.string().describe('A concise summary of the mandate progress and status updates.');
export type AiMandateSummaryOutput = z.infer<typeof AiMandateSummaryOutputSchema>;

export async function aiMandateSummary(input: AiMandateSummaryInput): Promise<AiMandateSummaryOutput> {
  return aiMandateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mandateSummaryPrompt',
  input: {schema: AiMandateSummaryInputSchema},
  output: {schema: AiMandateSummaryOutputSchema},
  prompt: `Generate a concise summary for the "{{{mandateTitle}}}" mandate for client "{{{clientName}}}".

This summary is intended for: {{{summaryContext}}}. Adjust the tone and detail level accordingly. If it's for client communication, be professional and positive. If it's for an internal report, be factual and include any challenges.

Mandate Details:
- Role: {{{mandateTitle}}}
- Client: {{{clientName}}}
- Current Stage: {{{currentStage}}}
- Required Headcount: {{{requiredHeadcount}}}
- Associated Fees: {{{associatedFees}}}

Recent Progress Updates:
{{#each progressUpdates}}
- {{{this}}}
{{/each}}

Focus on key progress, status updates, and next steps. The summary should be approximately 3-5 sentences long.`,
});

const aiMandateSummaryFlow = ai.defineFlow(
  {
    name: 'aiMandateSummaryFlow',
    inputSchema: AiMandateSummaryInputSchema,
    outputSchema: AiMandateSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
