
# Crime Detection System

A deep learning-based video analysis system to detect criminal activities in video footage.

## Overview

This system analyzes video files to detect and classify potential criminal activities into four categories:
- Abuse
- Arrest 
- Arson
- Assault

## Project Structure

```
crime_detection/
├── data/               # Dataset handling code
├── models/             # Model weights and definitions
├── network/            # Neural network architecture
├── utils/              # Utility functions
├── config.py           # Configuration settings
├── predictor.py        # Prediction functionality
├── server.py           # FastAPI server
```

## Requirements

- Python 3.8+
- PyTorch
- FastAPI
- OpenCV
- torchvision

## Setup

1. Ensure you have all dependencies installed
2. Place the model weights file `final_crime_classifier.pth` in the `crime_detection/models/` directory

## Running the API

```bash
uvicorn crime_detection.server:app --reload
```

The API will be available at http://127.0.0.1:8000

## API Endpoints

- `GET /` - Welcome endpoint
- `GET /health` - Health check
- `POST /predict` - Upload a video for crime detection

## Usage

To analyze a video, send a POST request to the `/predict` endpoint with the video file:

```bash
curl -X POST "http://127.0.0.1:8000/predict" -H "accept: application/json" -H "Content-Type: multipart/form-data" -F "file=@your_video.mp4"
```

## Response Format

```json
{
  "crime_type": "Assault",
  "confidence": 0.85,
  "detailed_report": "Detailed analysis of the video...",
  "summary": "Suspected case of Assault detected in the submitted video footage.",
  "recommendation": "Further investigation is recommended by the concerned law enforcement authority."
}
```
