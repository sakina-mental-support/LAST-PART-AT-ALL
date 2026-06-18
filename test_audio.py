import requests
import io
import sys

# Create a dummy valid wav header just to see if the server accepts it
dummy_wav = b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'

try:
    files = {'file': ('test.wav', dummy_wav, 'audio/wav')}
    response = requests.post("http://127.0.0.1:5001/api/voice-to-text", files=files)
    print("STATUS:", response.status_code)
    print("RESPONSE:", response.text)
except Exception as e:
    print("ERROR:", e)
