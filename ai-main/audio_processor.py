import os
import google.generativeai as genai
from dotenv import load_dotenv

class AudioProcessor:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.is_ready = False

        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-flash-latest")
                self.is_ready = True
            except Exception as e:
                print(f"Warning: Failed to initialize Gemini client for audio. {str(e)}")

        if self.groq_api_key:
            self.is_ready = True

    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Converts spoken audio into text using Groq's Whisper API (fast) or Google Gemini (fallback).
        """
        if not self.is_ready:
            return "Voice transcription is unavailable. Please check your API keys in .env"

        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

        # 1. Try Groq Whisper (lightning fast transcription)
        if self.groq_api_key:
            try:
                import requests
                url = "https://api.groq.com/openai/v1/audio/transcriptions"
                headers = {
                    "Authorization": f"Bearer {self.groq_api_key}"
                }
                
                with open(audio_file_path, "rb") as f:
                    files = {
                        "file": (os.path.basename(audio_file_path), f, "audio/webm")
                    }
                    data = {
                        "model": "whisper-large-v3",
                        "response_format": "json"
                    }
                    response = requests.post(url, headers=headers, files=files, data=data, timeout=15)
                
                if response.status_code == 200:
                    result = response.json()
                    transcribed_text = result.get("text", "").strip()
                    if transcribed_text:
                        return transcribed_text
                else:
                    print(f"Groq transcription failed with status code {response.status_code}: {response.text}")
            except Exception as e:
                print(f"Groq Whisper transcription failed, trying Gemini fallback: {str(e)}")

        # 2. Fallback to Gemini Audio Understanding
        if self.api_key:
            try:
                # Upload the audio file to Gemini
                audio_file = genai.upload_file(
                    path=audio_file_path,
                    mime_type="audio/webm"
                )

                # Ask Gemini to transcribe it
                response = self.model.generate_content([
                    audio_file,
                    "Please transcribe exactly what is spoken in this audio. Return only the transcribed text, nothing else."
                ])

                # Clean up the uploaded file
                try:
                    genai.delete_file(audio_file.name)
                except Exception:
                    pass
                return response.text.strip()

            except Exception as e:
                raise Exception(f"Failed to process audio via Gemini: {str(e)}")

        raise Exception("No active speech transcription service available.")

