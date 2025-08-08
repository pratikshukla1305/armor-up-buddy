
import { useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceApi = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [expectedFaceEmbedding, setExpectedFaceEmbedding] = useState<Float32Array | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Starting to load face-api models...');
        setVerificationMessage('Loading facial recognition models...');
        
        // Check if models are already loaded
        if (faceapi.nets.ssdMobilenetv1.isLoaded && 
            faceapi.nets.faceRecognitionNet.isLoaded && 
            faceapi.nets.faceLandmark68Net.isLoaded) {
          console.log('Models already loaded');
          setIsModelLoaded(true);
          setVerificationMessage('Facial recognition models loaded successfully. Please start camera.');
          return;
        }
        
        console.log('Loading models from CDN...');
        
        // Load models from CDN instead of local files
        const modelUrl = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
        
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl)
        ]);
        
        console.log('All face-api models loaded successfully from CDN');
        setIsModelLoaded(true);
        setVerificationMessage('Facial recognition models loaded successfully. Please start camera.');
        setErrorMessage(''); // Clear any previous errors
      } catch (error) {
        console.error('Error loading facial recognition models:', error);
        
        // Try fallback to local models
        try {
          console.log('CDN failed, trying local models...');
          setVerificationMessage('Trying alternative model source...');
          
          await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models')
          ]);
          
          console.log('Local models loaded successfully');
          setIsModelLoaded(true);
          setVerificationMessage('Facial recognition models loaded successfully. Please start camera.');
          setErrorMessage(''); // Clear any previous errors
        } catch (localError) {
          console.error('Both CDN and local model loading failed:', localError);
          setErrorMessage('Failed to load facial recognition models. Please check your internet connection and try again.');
          setVerificationMessage('');
        }
      }
    };
    
    loadModels();
  }, []);

  const loadExpectedFace = useCallback(async (faceUrl: string) => {
    try {
      console.log('Loading reference face from URL:', faceUrl);
      setVerificationMessage('Loading reference face...');
      
      const img = await faceapi.fetchImage(faceUrl);
      console.log('Image loaded, detecting face...');
      
      const detection = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detection) {
        console.log('Face detected in reference image, confidence:', detection.detection.score);
        setExpectedFaceEmbedding(detection.descriptor);
        setVerificationMessage('Reference face loaded successfully. Ready to verify.');
        setErrorMessage(''); // Clear any previous errors
      } else {
        console.error('No face detected in reference image');
        setErrorMessage('No face detected in the reference image. Please update your profile with a clear face image.');
      }
    } catch (error) {
      console.error('Error loading reference face:', error);
      setErrorMessage('Failed to load reference face. Please check your internet connection or try updating your profile photo.');
    }
  }, []);

  const detectFace = useCallback(async (video: HTMLVideoElement) => {
    try {
      console.log('Detecting face in video stream...');
      
      // Ensure video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        console.log('Video not ready for face detection');
        return null;
      }
      
      const detection = await faceapi.detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detection) {
        console.log('Face detected successfully with confidence:', detection.detection.score);
      } else {
        console.log('No face detected in current frame');
      }
      
      return detection;
    } catch (error) {
      console.error('Error detecting face:', error);
      return null;
    }
  }, []);

  const compareFaces = useCallback((descriptor: Float32Array) => {
    if (!expectedFaceEmbedding) {
      console.log('No expected face embedding available for comparison');
      return null;
    }
    
    const distance = faceapi.euclideanDistance(expectedFaceEmbedding, descriptor);
    const threshold = 0.6; // Slightly more lenient threshold for better recognition
    const isMatch = distance <= threshold;
    
    console.log(`Face comparison - Distance: ${distance.toFixed(3)}, Threshold: ${threshold}, Match: ${isMatch}`);
    return isMatch;
  }, [expectedFaceEmbedding]);

  return {
    isModelLoaded,
    expectedFaceEmbedding,
    errorMessage,
    verificationMessage,
    setErrorMessage,
    setVerificationMessage,
    loadExpectedFace,
    detectFace,
    compareFaces
  };
};
