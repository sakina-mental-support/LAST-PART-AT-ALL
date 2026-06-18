import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_response(user_text, emotion, exercise):
    prompt = f"""
You are a professional emotional support assistant.

User emotion: {emotion}
User message: {user_text}

Respond with empathy and understanding.

Then naturally guide the user to do this exercise:
{exercise}

Make the response:
- short, concise, and easy to read (avoid long paragraphs)
- human-like and open-ended to encourage the user to continue talking
- not robotic and not repetitive
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content