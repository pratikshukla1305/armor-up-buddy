
import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceApi = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [expectedFaceEmbedding, setExpectedFaceEmbedding] = useState<Float32Array | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        setVerificationMessage('Loading facial recognition models...');
        
        if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
          await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models')
          ]);
        }
        
        setIsModelLoaded(true);
        setVerificationMessage('Facial recognition models loaded successfully. Please start camera.');
      } catch (error) {
        console.error('Error loading facial recognition models:', error);
        setErrorMessage('Failed to load facial recognition models. Please ensure you have a stable internet connection and try again.');
      }
    };
    
    loadModels();
  }, []);

  const loadExpectedFace = async (faceUrl: string) => {
    try {
      setVerificationMessage('Loading reference face...');
      
      const img = await faceapi.fetchImage(faceUrl);
      const detection = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detection) {
        setExpectedFaceEmbedding(detection.descriptor);
        setVerificationMessage('Reference face loaded successfully. Ready to verify.');
      } else {
        setErrorMessage('No face detected in the reference image. Please update your profile with a clear face image.');
        console.error('No face detected in reference image');
      }
    } catch (error) {
      console.error('Error loading reference face:', error);
      setErrorMessage('Failed to load reference face. Please check your internet connection or try updating your profile photo.');
    }
  };

  const detectFace = async (video: HTMLVideoElement) => {
    return await faceapi.detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();
  };

  const compareFaces = (descriptor: Float32Array) => {
    if (!expectedFaceEmbedding) return null;
    
    const distance = faceapi.euclideanDistance(expectedFaceEmbedding, descriptor);
    const threshold = 0.5;
    return distance <= threshold;
  };

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
