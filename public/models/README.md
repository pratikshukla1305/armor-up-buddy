
# Face Recognition Models

This directory contains the face-api.js models required for face recognition capabilities.

To complete setup, download the following models from face-api.js:
- ssd_mobilenetv1_model
- face_landmark_68_model
- face_recognition_model

You can download these models from the official face-api.js repo:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

## Installation Instructions

1. Download all model files from the link above
2. Place them in this `/public/models/` directory
3. Make sure to include all weight files (*.bin) and model files (*.json)

The following files are required:
- face_landmark_68_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_recognition_model-shard1
- face_recognition_model-shard2
- face_recognition_model-weights_manifest.json
- ssd_mobilenetv1_model-shard1
- ssd_mobilenetv1_model-shard2
- ssd_mobilenetv1_model-weights_manifest.json
