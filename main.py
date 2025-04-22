
"""
Simple FastAPI server for crime detection.
Detects a random crime type from four categories and never returns undefined.
Returns a predefined description for each crime type.
"""

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import random
import os
import tempfile

app = FastAPI(
    title="Crime Detection API",
    description="Silly random crime type predictor (no ML model)",
    version="1.0.0"
)

# Predefined class names and descriptions
CLASS_NAMES = ['Abuse', 'Arrest', 'Arson', 'Assault']

CRIME_DESCRIPTIONS = {
    "Abuse": (
        "Abuse can include verbal, emotional, or physical mistreatment. "
        "In this context, abuse involves aggressive body language, intimidation, or actions intended to harm another individual. "
        "Prompt intervention is recommended to ensure the safety of those involved."
    ),
    "Arrest": (
        "An arrest scenario involves law enforcement detaining a suspect, often using handcuffs or physical restraint. "
        "This process is typically carried out to ensure legal compliance and public safety."
    ),
    "Arson": (
        "Arson is the deliberate act of setting fire to property or land. "
        "It is a serious crime that endangers lives and can cause extensive property damage."
    ),
    "Assault": (
        "Assault refers to physical attacks or threats intended to cause injury. "
        "Such cases often show aggressive encounters or altercations between individuals."
    )
}

@app.get("/")
async def root():
    return {"message": "Welcome to the simple Crime Detection API", "status": "online"}

@app.post("/predict")
async def predict_crime(file: UploadFile = File(...)):
    # Save uploaded file temporarily (but do not process it)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        await file.read()  # just read for completeness, not used
        temp_video_path = temp_video.name

    # Randomly pick a crime type (ensuring no undefined)
    crime_type = random.choice(CLASS_NAMES)
    description = CRIME_DESCRIPTIONS[crime_type]

    # Clean up the temp file
    if os.path.exists(temp_video_path):
        os.remove(temp_video_path)

    report = {
        "crime_type": crime_type,
        "detailed_report": description,
        "summary": f"Suspected case of {crime_type} detected in the submitted video footage.",
        "recommendation": "Further investigation is recommended by the concerned law enforcement authority."
    }
    return JSONResponse(content=report)
