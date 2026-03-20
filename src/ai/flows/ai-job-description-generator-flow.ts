'use server';
/**
 * @fileOverview This file implements an AI tool for generating detailed and compelling job descriptions.
 *
 * - generateJobDescription - A function that generates a job description based on keywords or a job title.
 * - AiJobDescriptionGeneratorInput - The input type for the generateJobDescription function.
 * - AiJobDescriptionGeneratorOutput - The return type for the generateJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiJobDescriptionGeneratorInputSchema = z.object({
  keywordsOrTitle: z
    .string()
    .describe('Keywords or a job title to generate a job description for.'),
});
export type AiJobDescriptionGeneratorInput = z.infer<
  typeof AiJobDescriptionGeneratorInputSchema
>;

const AiJobDescriptionGeneratorOutputSchema = z.object({
  jobDescription: z
    .string()
    .describe('A detailed and compelling job description.'),
});
export type AiJobDescriptionGeneratorOutput = z.infer<
  typeof AiJobDescriptionGeneratorOutputSchema
>;

export async function generateJobDescription(
  input: AiJobDescriptionGeneratorInput
): Promise<AiJobDescriptionGeneratorOutput> {
  return aiJobDescriptionGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiJobDescriptionGeneratorPrompt',
  input: {schema: AiJobDescriptionGeneratorInputSchema},
  output: {schema: AiJobDescriptionGeneratorOutputSchema},
  prompt: `You are an expert HR professional and a compelling job description writer.
Your task is to create a detailed and attractive job description based on the provided keywords or job title.
The job description should include:
- Job Title
- Company Overview (generic, e.g., "A leading [industry] company...")
- Job Summary
- Key Responsibilities
- Required Qualifications
- Preferred Qualifications (optional, if you can infer them)
- Benefits (generic, e.g., "Competitive salary, health benefits, etc.")
- Call to Action

Ensure the description is engaging, clear, and professional.
Keywords or Job Title: {{{keywordsOrTitle}}}

Output your response as a JSON object with a single field 'jobDescription' containing the full job description.`,
});

const aiJobDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'aiJobDescriptionGeneratorFlow',
    inputSchema: AiJobDescriptionGeneratorInputSchema,
    outputSchema: AiJobDescriptionGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
