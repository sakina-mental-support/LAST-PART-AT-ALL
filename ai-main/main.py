import os
import shutil
import asyncio
import edge_tts
import base64
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables (like OPENAI_API_KEY)
load_dotenv()

# Import our AI microservices
from emotion_detector import EmotionDetector
from exercise_engine import ExerciseEngine
from chatbot import ChatbotEngine
from audio_processor import AudioProcessor

app = FastAPI(
    title="Sakina AI Engine",
    description="Microservice handling Emotion Detection, LLM Chatting, and Voice Processing",
    version="1.0.0"
)

# Allow CORS for frontend/backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Singleton Instances of Models ---
# We instantiate these once when the app starts
emotion_detector = EmotionDetector()
exercise_engine = ExerciseEngine()
chatbot_engine = ChatbotEngine()
audio_processor = AudioProcessor()

# --- Schemas ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    text: str
    user_id: Optional[str] = None
    context: Optional[dict] = {}
    history: Optional[List[ChatMessage]] = []
    
class EmotionRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    response: str
    emotion: str
    confidence: float
    exercise: dict
    context_processed: bool

class TTSRequest(BaseModel):
    text: str

# --- Endpoints ---

@app.get("/api/health")
def read_root():
    return {"message": "Sakina AI Engine is running. See /docs for API details.", "status": "healthy"}

@app.post("/api/emotion")
def analyze_emotion(request: EmotionRequest):
    """
    Analyzes the emotional state of the provided text.
    Returns the emotion label and confidence score.
    """
    result = emotion_detector.detect_emotion(request.text)
    return result

@app.post("/api/chat", response_model=ChatResponse)
def process_chat(request: ChatRequest):
    """
    Main integrated endpoint:
    1. Detects emotion of the user's message
    2. Retrieves a personalized exercise based on that emotion
    3. Prompts the LLM (OpenAI/Gemini) with the history, emotion, and exercise
    4. Returns the full integrated response.
    """
    # 1. Detect Emotion
    emotion_result = emotion_detector.detect_emotion(request.text)
    emotion_label = emotion_result.get("emotion", "neutral")
    confidence = emotion_result.get("confidence", 0.0)
    
    # 2. Get Exercise
    exercise = exercise_engine.get_exercise_for_emotion(emotion_label)
    
    # 3. Generate response with LLM
    # We extract history from context if available
    history_dicts = request.context.get("history", []) if request.context else []
    if not history_dicts and request.history:
        history_dicts = [h.model_dump() for h in request.history]

    try:
        bot_response = chatbot_engine.generate_response(
            user_message=request.text,
            emotion=emotion_label,
            exercise=exercise,
            chat_history=history_dicts,
            context=request.context
        )
    except Exception as e:
        # All AI providers failed — return 503 so the Node.js backend
        # silently falls back to its own static comfort responses
        print(f"[main.py] All AI providers exhausted, signalling fallback: {e}")
        raise HTTPException(status_code=503, detail="AI providers unavailable. Using static fallback.")

    return {
        "response": bot_response,
        "emotion": emotion_label,
        "confidence": float(confidence),
        "exercise": exercise,
        "context_processed": True
    }

@app.post("/api/tts/stream")
async def tts_stream(request: TTSRequest):
    """
    Streaming Text-to-Speech endpoint for Sakina's responses.
    """
    voice = "en-US-EmmaMultilingualNeural"
    
    async def _generate():
        communicate = edge_tts.Communicate(request.text, voice)
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]

    try:
        return StreamingResponse(_generate(), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tts")
def tts(request: TTSRequest):
    """
    Text-to-Speech endpoint for Sakina's responses.
    """
    voice = "en-US-EmmaMultilingualNeural"
    
    async def _generate():
        communicate = edge_tts.Communicate(request.text, voice)
        audio_bytes = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes += chunk["data"]
        return audio_bytes

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_content = loop.run_until_complete(_generate())
        loop.close()
        
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        return {
            'success': True,
            'audio_base64': audio_base64,
            'format': 'mp3'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice-to-text")
async def process_voice(file: UploadFile = File(...)):
    """
    Receives an audio file (e.g., .wav, .mp3, .m4a) and transcribes it using Whisper/Gemini.
    """
    if not audio_processor.is_ready:
        raise HTTPException(status_code=503, detail="Speech model is not initialized.")
        
    # Save the uploaded file temporarily
    temp_file_path = f"temp_{file.filename}"
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Transcribe
        text = audio_processor.transcribe_audio(temp_file_path)
        return {"text": text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
