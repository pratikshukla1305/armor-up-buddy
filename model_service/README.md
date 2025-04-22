
# Crime Detection Model Service

This service provides a FastAPI interface to the trained crime detection model. It allows the main application to analyze video evidence for detecting potential crimes.

## Setup

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Add your model files to this directory
   - Place your model weights in this directory
   - Update the `load_model()` function in `main.py` to load your specific model

3. Run the service:
   ```bash
   python main.py
   ```

The service will be available at http://localhost:8000

## API Endpoints

- **POST /analyze-video**: Analyze a video for crime detection
  - Request body: `{ "video_url": "https://example.com/video.mp4", "location": "123 Main St, Anytown" }`
  - Response: `{ "crime_type": "assault", "confidence": 0.92, "description": "..." }`

- **GET /health**: Health check
  - Response: `{ "status": "healthy", "model_loaded": true }`

## Integration with Main Application

The Supabase Edge Function will automatically try to connect to this service when analyzing videos. If this service is not running, it will fall back to the built-in analysis logic.

## Testing the Service

You can test the service using cURL:

```bash
curl -X POST http://localhost:8000/analyze-video \
  -H "Content-Type: application/json" \
  -d '{"video_url": "https://example.com/video.mp4", "location": "123 Main St, Anytown"}'
```

Or using the Swagger UI by accessing http://localhost:8000/docs

## Customization

Edit the `analyze_video_with_model()` function in `main.py` to implement your specific model's inference logic. The current implementation has placeholder code that you should replace with your actual model inference code.

## Environmental Variables

- `PORT`: The port on which to run the service (default: 8000)
- `MODEL_PATH`: Path to your model weights (optional)

## Troubleshooting

- If the service fails to start, check if all dependencies are installed correctly
- Ensure port 8000 is not in use by another service
- Check the logs for any error messages
