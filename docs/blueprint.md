# **App Name**: Scam Snare AI - By Tan

## Core Features:

- Scam Intent Detection: Analyze incoming messages to identify potential scam attempts using a pre-trained model. Employ pattern recognition and keyword analysis for accurate detection.
- AI Agent Activation: Automatically activate an AI agent upon detection of scam intent. The agent takes over the conversation to engage the scammer.
- Dynamic Persona Management: The AI agent maintains a believable persona, adapting its responses to mimic human-like conversation patterns. It uses a 'tool' which enables the AI to dynamically adjust its communication style based on the scammer's messages, avoiding robotic or predictable answers.
- Intelligence Extraction: Extract actionable intelligence such as bank account details, UPI IDs, phishing links, phone numbers, and suspicious keywords from the conversation.
- Structured JSON Output: Return extracted intelligence in a structured JSON format, including scam detection status, engagement metrics, and agent notes.
- API Endpoint Security: Secure the API endpoint using an API key for authentication, ensuring only authorized requests are processed.
- Final Result Callback: Upon completion of the engagement, send the final extracted intelligence to the GUVI evaluation endpoint (https://hackathon.guvi.in/api/updateHoneyPotFinalResult) in the specified JSON format.

## Style Guidelines:

- Primary color: Subtle blue (#6699CC) to convey trustworthiness and reliability.
- Background color: Light gray (#F0F0F0), creating a clean and unobtrusive backdrop.
- Accent color: Warm orange (#D98880) to highlight key information or actions.
- Body and headline font: 'Inter' (sans-serif) for clear and modern readability.
- Use minimalist icons to represent data categories in the JSON output.
- Clean and organized layout for easy interpretation of extracted intelligence. Key metrics should be prominently displayed.
- Subtle animations to indicate processing and data extraction without being intrusive.