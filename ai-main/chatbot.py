import os
import google.generativeai as genai
from openai import OpenAI

# Groq-compatible client (uses OpenAI SDK with different base_url)
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

class ChatbotEngine:
    def __init__(self):
        # Gemini key (primary)
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        # OpenAI key (secondary)
        self.openai_key = os.getenv("OPENAI_API_KEY")
        # GROQ key (tertiary - free & fast)
        self.groq_key = os.getenv("GROQ_API_KEY")

        self.model_type = None

        # Try to set up Gemini as primary
        if self.gemini_key and "your_" not in self.gemini_key and not self.gemini_key.startswith("sk-"):
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-flash-latest')
                self.model_type = "gemini"
            except Exception as e:
                print(f"Warning: Failed to init Gemini: {e}")

        # Try OpenAI as secondary
        if self.openai_key and "your_" not in self.openai_key and self.openai_key.startswith("sk-"):
            self.openai_client = OpenAI(api_key=self.openai_key)
            if not self.model_type:
                self.model_type = "openai"

        # Set up GROQ client (always — used as fallback even if Gemini is primary)
        if self.groq_key and "your_" not in self.groq_key:
            self.groq_client = OpenAI(api_key=self.groq_key, base_url=GROQ_BASE_URL)
            if not self.model_type:
                self.model_type = "groq"

    def _build_prompt(self, user_message, emotion, exercise, chat_history, context):
        context = context or {}
        user_name = context.get('userName', 'User')
        persona = context.get('persona', 'Your Sakina')

        system_prompt = (
            f"You are an empathetic, professional AI emotional support assistant acting in the persona of '{persona}'. "
            f"The user's name is {user_name}. "
            "You must respond to the user with warmth, understanding, and actionable, personalized advice based on your persona.\n"
            "Do NOT provide generic responses like 'I am sorry to hear that'. Instead, validate their feelings "
            "and engage them in a constructive way.\n\n"
            f"Currently, the user's detected emotional state is: {emotion.upper()}.\n"
            f"You MUST seamlessly weave the following exercise into your response as a gentle suggestion:\n"
            f"Exercise Name: {exercise['name']}\n"
            f"Exercise Instructions: {exercise['instruction']}\n\n"
        )

        history_text = ""
        if chat_history:
            history_text = "Previous conversation context:\n"
            for msg in chat_history[-4:]:
                role = "User" if msg.get("role") == "user" else "Sakina"
                history_text += f"{role}: {msg.get('content', '')}\n"

        return (
            f"{system_prompt}"
            f"{history_text}\n"
            f"User's current message: \"{user_message}\"\n\n"
            "Respond naturally, empathetically, and guide them through the exercise. Keep it under 150 words."
        )

    def generate_response(self, user_message: str, emotion: str, exercise: dict, chat_history: list = None, context: dict = None) -> str:
        if not self.model_type:
            raise RuntimeError("No AI API key configured — using Node.js fallback.")

        final_prompt = self._build_prompt(user_message, emotion, exercise, chat_history, context)
        last_error = None

        # --- 1. Try Gemini (primary) ---
        if hasattr(self, 'gemini_model'):
            try:
                response = self.gemini_model.generate_content(final_prompt)
                return response.text
            except Exception as e:
                last_error = e
                print(f"[ChatbotEngine] Gemini failed: {e}")

        # --- 2. Try GROQ (fast free fallback) ---
        if hasattr(self, 'groq_client'):
            try:
                response = self.groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": final_prompt}],
                    max_tokens=250
                )
                return response.choices[0].message.content
            except Exception as e:
                last_error = e
                print(f"[ChatbotEngine] GROQ fallback failed: {e}")

        # --- 3. Try OpenAI (last resort) ---
        if hasattr(self, 'openai_client') and self.openai_key:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": final_prompt}]
                )
                return response.choices[0].message.content
            except Exception as e:
                last_error = e
                print(f"[ChatbotEngine] OpenAI fallback failed: {e}")

        # All providers failed — raise so Node.js uses its own static fallback
        raise RuntimeError(f"All AI providers failed. Last error: {last_error}")
