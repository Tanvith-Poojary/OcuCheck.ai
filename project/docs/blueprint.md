# **App Name**: OcuCheck AI

## Core Features:

- User Authentication: Secure user registration and login with protected routes.
- Live Eye Scan: Capture eye image from user's webcam.
- Symptom Input: Collect user vitals (age, gender) and self-reported symptoms to provide a comprehensive picture of user health.
- Comprehensive Health Analysis: The app performs an AI-powered health analysis that assesses eye images correlated with self-reported symptoms; AI will ensure that an eye is present, before correlating detected biomarkers and reported symptoms, and the risk_level, urgency, possible conditions, and recommended_next_steps as structured JSON output
- Generate Full Report: AI generates a full markdown report that it tailors according to user-provided input and formatting requests; the reportMarkdown is output as a structured JSON output.
- AI Chatbot: A conversational chatbot to answer health-related questions (excluding medical advice) using the `aiChatbotConversation` flow that acts as a friendly tool with defined safety rules (programmed in the system prompt); generates a JSON output that responds to the `message`.
- Downloadable PDF Report: The generated report, displayed in a `<pre>` element, can be downloaded as a PDF.

## Style Guidelines:

- Primary color: HSL(210, 75%, 50%) - A vibrant blue (#3391FF) to convey trust and health.
- Background color: HSL(210, 20%, 98%) - Very light blue (#F2F8FF) to ensure a clean, readable interface.
- Accent color: HSL(180, 60%, 40%) - A turquoise (#33BDBD) that will draw attention to important actions or information.
- Font: 'Inter' sans-serif for body and headline text. Note: currently only Google Fonts are supported.
- Use `lucide-react` for consistent and clean icons throughout the application.
- Implement a responsive, grid-based layout, focusing on mobile-first design.
- Incorporate subtle animations for loading states and transitions to improve user experience.