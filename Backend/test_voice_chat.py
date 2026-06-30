import os
import requests

def test_voice_chat():
    url = "http://localhost:8000/voice/chat"
    payload = {
        "session_id": "test_session_123",
        "lang": "en",
        "text": "What is the mandi price for wheat?"
    }
    
    print("Sending request to /voice/chat endpoint...")
    try:
        response = requests.post(url, data=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Full response JSON:", data)
            print("Response success:", data.get("success"))
            print("Query transcribed/received:", data.get("query"))
            print("LLM Text Reply:", data.get("text_response"))
            audio_resp = data.get("audio_response")
            print("Audio Base64 type:", type(audio_resp))
            if audio_resp:
                print("Audio Base64 length:", len(audio_resp))
                print("PASSED: Audio response generated successfully.")
            else:
                print("WARNING: Audio response was empty (possibly invalid Sarvam key or speech synthesis error).")
        else:
            print("FAILED:", response.text)
    except Exception as e:
        print("FAILED to connect to backend server:", e)

if __name__ == "__main__":
    test_voice_chat()
