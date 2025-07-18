# AI Interview Platform

A web-based service that allows you to conduct mock interviews with an AI interviewer, powered by LangGraph and LLMs. It is designed to help users practice their interviewing skills and receive automated feedback.

## Architecture

This project consists of two main components:
- **Frontend**: A React application built with Vite and TypeScript, styled with Tailwind CSS and Shadcn UI. It provides the user interface for starting an interview, interacting with the AI, and viewing the final report.
- **Backend**: A Node.js server built with Express and TypeScript. It uses LangGraph to implement a stateful, multi-agent AI that can ask technical questions, follow-ups, and evaluate answers.

## ✨ Key Features

-   **AI-Powered Custom Interviews**: Generates personalized interview questions by analyzing submitted resumes and job descriptions.
-   **Interactive Chat Experience**: Conduct interviews by having natural conversations with the AI interviewer through a real-time chat interface.
-   **Versatile Interviewer Personas**: Choose your desired interview style (e.g., challenging, friendly) to prepare for various environments.
-   **Voice Interface Support**: (Coming Soon) Experience a more realistic interview by responding with your voice and listening to the AI's voice.

## Feature Checklist

- [ ] Recommend interview questions based on resume and job description.
- [x] Interact with the interviewer through a chat interface.
- [x] Set the interviewer's persona.
- [ ] Voice-based interview interaction.
- [ ] Proactive interaction.
- [ ] Multilingual support (English, Korean).
