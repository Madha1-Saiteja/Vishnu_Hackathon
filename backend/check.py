import torch
import whisper

import warnings
warnings.simplefilter("ignore", UserWarning)

model = whisper.load_model("base")
audio_path = "D:/VS Code/IIIT-Hack/venv/backend/media/audio/be.wav"

audio = whisper.load_audio(audio_path)
print(audio.shape)  # This should print a valid shape (e.g., (N,))

if audio.size == 0:
    print("Error: Empty audio file!")
else:
    result = model.transcribe(audio_path)
    print(result["text"])
