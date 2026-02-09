from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import json
from typing import Dict, Any
from pydub import AudioSegment
from acrcloud.recognizer import ACRCloudRecognizer

app = FastAPI(title="Music Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ACRCloud Configuration
ACRCLOUD_CONFIG = {
    'host': os.environ.get('ACRCLOUD_HOST', 'identify-eu-west-1.acrcloud.com'),
    'access_key': os.environ.get('ACRCLOUD_ACCESS_KEY', 'a03b16733f37bd3557925155a4249196'),
    'access_secret': os.environ.get('ACRCLOUD_ACCESS_SECRET', '8xXk1LY05jaUgAcrcnYS3mNA6S0QAZKSuFXxgo23'),
    'timeout': 10
}

acrcloud = ACRCloudRecognizer(ACRCLOUD_CONFIG)


@app.post("/recognize")
async def recognize_song(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Recognize songs from an uploaded audio file in 120 seconds intervals to save ACRCloud usage."""

    # Validate file type
    allowed_extensions = ['.mp3', '.wav', '.flac', '.ogg', '.m4a']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Formato non supportato. Usa: {', '.join(allowed_extensions)}"
        )
    
    tmp_file_path = None
    
    try:
        # Create a temporary file to store the uploaded audio used to read the stream uploaded by the frontend and get its duration
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Get audio duration
        audio = AudioSegment.from_file(tmp_file_path)
        audio_duration_ms = len(audio)
        audio = None
        
        # Recognize every 120 seconds
        recognized_songs = []
        step_seconds = 120
        
        # Loop through the audio 120 seconds at a time and recognize songs
        for start_sec in range(0, audio_duration_ms // 1000, step_seconds):
            try:
                # Starting at start_sec seconds, recognize for 15 seconds every 120 and load the result to a JSON
                result_str = acrcloud.recognize_by_file(tmp_file_path, start_sec, 15)
                data = json.loads(result_str)
                
                # Extract the recognized song information if available
                music = data.get('metadata', {}).get('music', [])
                if music:
                    m = music[0]
                    title = m.get('title', 'Sconosciuto')

                    # Extract the artist name, otherwise set it to "Sconosciuto"
                    artists = m.get('artists', [])
                    artist = artists[0].get('name', 'Sconosciuto') if artists else 'Sconosciuto'
                    
                    # Extract the composers from the contributors field, otherwise set it to "Sconosciuto"
                    composers_list = m.get('contributors', {}).get('composers', [])
                    composers = ', '.join(composers_list) if composers_list else 'Sconosciuto'
                    
                    # Avoid duplicates by checking if the title is already in the recognized_songs list, else add it to recognized_songs with its information
                    if not any(s['title'] == title for s in recognized_songs):
                        recognized_songs.append({
                            "index": len(recognized_songs) + 1,
                            "start_time": start_sec,
                            "title": title,
                            "artist": artist,
                            "composer": composers,
                            "score": m.get('score', 0) / 100,
                            "duration": m.get('duration_ms', 0) // 1000 if m.get('duration_ms') else None
                        })
            except Exception:
                pass
        
        # Return the recognized songs list or an error if no songs were recognized
        if recognized_songs:
            return {
                "success": True,
                "song_count": len(recognized_songs),
                "songs": recognized_songs
            }
        else:
            return {
                "success": False,
                "error": "Nessuna canzone riconosciuta"
            }
    
    # Finally delete the temporary file
    finally:
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)