import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_root():
    try:
        response = requests.get(f"{BASE_URL}/")
        print("Root Check:", response.json())
        return True
    except requests.exceptions.ConnectionError:
        print("Error: Make sure the FastAPI application is running (uvicorn main:app --reload)")
        return False

def test_emotion():
    print("\n--- Testing Emotion Endpoint ---")
    data = {"text": "I feel so overwhelmed with all these deadlines, and I have no idea how I'll manage."}
    response = requests.post(f"{BASE_URL}/emotion", json=data)
    print(f"Input: {data['text']}")
    print(f"Output: {json.dumps(response.json(), indent=2)}")

def test_chat():
    print("\n--- Testing Chat Integration ---")
    data = {
        "user_message": "Everything just feels so heavy right now.",
        "history": [
            {"role": "ai", "content": "Hello. I'm Sakina. How are you feeling today?"}
        ]
    }
    response = requests.post(f"{BASE_URL}/chat", json=data)
    print(f"Input: {data['user_message']}")
    print(f"Output Response:\n{json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    if test_root():
        time.sleep(1)
        test_emotion()
        time.sleep(1)
        test_chat()
