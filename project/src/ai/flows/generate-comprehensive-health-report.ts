'use server';
/**
 * @fileOverview Generates a comprehensive markdown report summarizing the eye health analysis.
 *
 * - generateComprehensiveHealthReport - A function that generates the report.
 * - GenerateComprehensiveHealthReportInput - The input type for the generateComprehensiveHealthReport function.
 * - GenerateComprehensiveHealthReportOutput - The return type for the generateComprehensiveHealthReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComprehensiveHealthReportInputSchema = z.object({
  eyeImageAnalysis: z.string().describe('The analysis of the eye image.'),
  formattingRequests: z.string().describe('Specific formatting requests for the report.'),
});
export type GenerateComprehensiveHealthReportInput = z.infer<typeof GenerateComprehensiveHealthReportInputSchema>;

const GenerateComprehensiveHealthReportOutputSchema = z.object({
  reportMarkdown: z.string().describe('The generated markdown report.'),
});
export type GenerateComprehensiveHealthReportOutput = z.infer<typeof GenerateComprehensiveHealthReportOutputSchema>;

export async function generateComprehensiveHealthReport(
  input: GenerateComprehensiveHealthReportInput
): Promise<GenerateComprehensiveHealthReportOutput> {
  return generateComprehensiveHealthReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComprehensiveHealthReportPrompt',
  input: {schema: GenerateComprehensiveHealthReportInputSchema},
  output: {schema: GenerateComprehensiveHealthReportOutputSchema},
  prompt: `You are an AI assistant specialized in generating comprehensive health reports based on eye image analysis.

  Analyze the provided eye image analysis and generate a detailed markdown report tailored to the user's formatting requests.

  Eye Image Analysis: {{{eyeImageAnalysis}}}
  Formatting Requests: {{{formattingRequests}}}

  Ensure the report is well-structured, easy to read, and includes all relevant information from the analysis. Follow formatting requests precisely.
  Output the report in markdown format.
  `,
});

const generateComprehensiveHealthReportFlow = ai.defineFlow(
  {
    name: 'generateComprehensiveHealthReportFlow',
    inputSchema: GenerateComprehensiveHealthReportInputSchema,
    outputSchema: GenerateComprehensiveHealthReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
