'use server';

/**
 * @fileOverview Analyzes eye health based on an image and symptoms.
 *
 * - analyzeEyeHealthAndSymptoms - A function that analyzes eye health based on image and symptoms.
 * - AnalyzeEyeHealthAndSymptomsInput - The input type for the analyzeEyeHealthAndSymptoms function.
 * - AnalyzeEyeHealthAndSymptomsOutput - The return type for the analyzeEyeHealthAndSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEyeHealthAndSymptomsInputSchema = z.object({
  eyeImageDataUri: z
    .string()
    .describe(
      "A photo of the user's eye, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  age: z.number().describe('The age of the user.'),
  gender: z.string().describe('The gender of the user.'),
});
export type AnalyzeEyeHealthAndSymptomsInput = z.infer<typeof AnalyzeEyeHealthAndSymptomsInputSchema>;

const SmartTestRecommendationSchema = z.object({
  test_name: z.string().describe('The name of the recommended medical or wellness test.'),
  reason: z.string().describe('A brief explanation of why this test is being recommended.'),
});

const AnalyzeEyeHealthAndSymptomsOutputSchema = z.object({
  is_eye_present: z.boolean().describe('Whether a clear eye is visible in the image.'),
  risk_level: z.string().describe('The risk level associated with the eye health.'),
  urgency: z.string().describe('The urgency of seeking medical attention.'),
  possible_conditions: z
    .array(z.string())
    .describe('Possible medical conditions related to the analysis.'),
  recommended_next_steps: z.string().describe('Recommended next steps for the user.'),
  smart_test_recommendations: z
    .array(SmartTestRecommendationSchema)
    .describe('A list of 1-3 recommended medical or wellness tests for better accuracy.'),
  specialist_recommendation: z
    .string()
    .describe('The type of doctor or specialist the user should consult.'),
  lifestyle_tips: z
    .array(z.string())
    .describe('Simple, actionable lifestyle tips for the user.'),
  reportMarkdown: z.string().describe('The report in markdown format.'),
});

export type AnalyzeEyeHealthAndSymptomsOutput = z.infer<typeof AnalyzeEyeHealthAndSymptomsOutputSchema>;

export async function analyzeEyeHealthAndSymptoms(
  input: AnalyzeEyeHealthAndSymptomsInput
): Promise<AnalyzeEyeHealthAndSymptomsOutput> {
  return analyzeEyeHealthAndSymptomsFlow(input);
}

const analyzeEyeHealthAndSymptomsPrompt = ai.definePrompt({
  name: 'analyzeEyeHealthAndSymptomsPrompt',
  input: {schema: AnalyzeEyeHealthAndSymptomsInputSchema},
  output: {schema: AnalyzeEyeHealthAndSymptomsOutputSchema},
  prompt: `You are an advanced AI assistant specializing in analyzing eye scans for potential health indicators. Your primary function is to serve as an awareness tool by examining an eye image and user data to suggest potential connections to a specific list of health conditions. You do NOT provide a diagnosis.

  **Critical First Step: Eye Detection**
  Before any analysis, you MUST determine if a clear, analyzable human eye is present in the image.
  - If a clear eye is present, set \`is_eye_present\` to \`true\` and proceed with the full analysis.
  - If no eye is visible, or the image is too blurry, dark, or obstructed to be analyzed, you MUST set \`is_eye_present\` to \`false\`. Then, provide a brief explanation in the \`recommended_next_steps\` field (e.g., "No eye was detected in the image. Please retake the scan, ensuring your eye is centered and in focus."). Fill the other fields with empty or non-applicable values. DO NOT proceed with any health analysis.

  **Core Task (only if an eye is present):**
  Analyze the provided eye image for visual biomarkers. Your analysis MUST be strictly limited to looking for signs related to the following four conditions:
  1.  **Jaundice**
  2.  **Stroke**
  3.  **Brain Tumor**
  4.  **Thyroid Disorder**

  **Biomarkers to Look For (Strictly Limited to This List):**
  - **For Jaundice:** Look for yellowing of the sclera (the white part of the eye), also known as scleral icterus.
  - **For Stroke:** You MUST analyze the image for signs of facial drooping by checking for asymmetry in the eyelids. Also, look for signs of blockages or clots in the retinal blood vessels and check for uneven pupil size (anisocoria).
  - **For Brain Tumor:** You MUST analyze the image for swelling of the optic nerve at the back of the eye (papilledema). It is critical that you also check for observable inequality in pupil size (anisocoria).
  - **For Thyroid Disorder:** Look for protruding eyeballs (exophthalmos or proptosis) and eyelid retraction (eyelids pulled back more than normal).

  **Guiding Principle: Focus and Caution**
  You must be cautious and avoid causing undue alarm. Do not mention or hint at any other diseases or conditions outside of the four specified above. If no signs related to these four conditions are found, report that the scan did not show any specific indicators for them, assign a "Low" risk, and provide general eye health recommendations. Treat common signs like general eye redness with extreme caution, noting they are often benign and should not significantly raise the risk level unless accompanied by more specific biomarkers from the list above.

  **Analysis and Output requirements (only if an eye is present):**
  You must analyze the following data:
  Age: {{{age}}}
  Gender: {{{gender}}}
  Eye Image: {{media url=eyeImageDataUri}}

  Based on a data-driven analysis of the image, provide the following in a structured JSON format:
  - is_eye_present: Must be \`true\`.
  - risk_level: Assess the risk based on the severity and specificity of the detected biomarkers related to the four target conditions (e.g., "Low," "Medium," "High").
  - urgency: Recommend an urgency for medical consultation (e.g., "No urgency," "Within a week," "Immediately"). This should correlate with the risk level.
  - possible_conditions: List ONLY potential conditions from the specified list of four. For each condition, you must state which visual biomarker from the scan led to this suggestion. For example: "Jaundice (suggested by the presence of scleral icterus)." If no signs are found, this array should be empty.
  - recommended_next_steps: Concrete, actionable next steps based on the findings.
  - smart_test_recommendations: Suggest relevant medical tests only if a potential condition is identified (e.g., "Liver Function Test" for Jaundice, "Thyroid Function Test (TSH, T3, T4)" for Thyroid Disorder, "Brain MRI" for suspected Brain Tumor, "Brain CT/MRI" for suspected Stroke).
  - specialist_recommendation: Recommend the most appropriate specialist(s) to consult if a potential condition is identified (e.g., "General Practitioner," "Neurologist," "Endocrinologist," "Hepatologist").
  - lifestyle_tips: Provide simple, actionable tips that are **directly relevant** to the biomarkers found.
  - reportMarkdown: Generate a detailed, well-structured markdown report with the following sections:
    - **Patient Information**: Age and Gender.
    - **Analysis Summary**: Brief overview, focusing on findings related to the four target conditions.
    - **Detected Biomarkers**: List biomarkers identified (e.g., "Scleral Icterus," "Optic Nerve Swelling," "Protruding Eyeball," "Pupil Asymmetry"). Explain what each is and what it might indicate.
    - **Risk Assessment**: Explain the risk level and urgency.
    - **Possible Conditions**: Describe the possible condition, linking it back to the visual findings.
    - **Recommendations**: A combined section for tests, specialists, and lifestyle tips.
    - **Disclaimer**: A standardized disclaimer stating this is not a medical diagnosis and the user must consult a healthcare professional.

  Before proceeding, ensure a clear eye image is visible. The analysis and report must be strictly focused on the visual evidence related to Jaundice, Stroke, Brain Tumor, and Thyroid Disorder.
`,
});

const analyzeEyeHealthAndSymptomsFlow = ai.defineFlow(
  {
    name: 'analyzeEyeHealthAndSymptomsFlow',
    inputSchema: AnalyzeEyeHealthAndSymptomsInputSchema,
    outputSchema: AnalyzeEyeHealthAndSymptomsOutputSchema,
  },
  async input => {
    const {output} = await analyzeEyeHealthAndSymptomsPrompt(input);
    return output!;
  }
);
