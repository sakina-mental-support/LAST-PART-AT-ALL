from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import os

from emotion_model import detect_emotion
from exercise_engine import generate_exercise
from response_generator import generate_response
from speech_to_text import transcribe_audio
from memory import get_history, add_message

app = FastAPI()

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    user_id = request.user_id
    user_text = request.message

    # Emotion detection
    emotion_data = detect_emotion(user_text)
    emotion = emotion_data["primary"]

    # Generate dynamic exercise
    exercise = generate_exercise(user_text, emotion)

    # Get memory
    history = get_history(user_id)

    # Generate response
    reply = generate_response(user_text, emotion, exercise, history)

    # Save conversation
    add_message(user_id, "user", user_text)
    add_message(user_id, "assistant", reply)

    return {
        "emotion": emotion,
        "exercise": exercise,
        "reply": reply
    }

@app.post("/voice")
async def voice(user_id: str, file: UploadFile = File(...)):
    path = f"temp_{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    text = transcribe_audio(path)

    return {
        "text": text
    }