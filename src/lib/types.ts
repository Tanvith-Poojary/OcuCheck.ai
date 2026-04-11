import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export type SignUpCredentials = z.infer<typeof SignUpSchema>;

export const LogInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LogInCredentials = z.infer<typeof LogInSchema>;

export const AnalysisInputSchema = z.object({
  age: z.coerce.number().min(1, "Age is required."),
  gender: z.string().min(1, "Gender is required."),
});

export type AnalysisInputData = z.infer<typeof AnalysisInputSchema>;

export type AnalysisResult = {
  is_eye_present: boolean;
  risk_level: string;
  urgency: string;
  possible_conditions: string[];
  recommended_next_steps: string;
  smart_test_recommendations: {
    test_name: string;
    reason: string;
  }[];
  specialist_recommendation: string;
  lifestyle_tips: string[];
  reportMarkdown: string;
};
