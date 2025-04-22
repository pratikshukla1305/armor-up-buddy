import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Upload, Shield, X, Eye, Camera, Edit, AlertCircle, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { addKycVerification, getKycVerificationByUserId } from '@/data/kycVerificationsData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createWorker } from 'tesseract.js';

export interface KycVerificationProps {
  userId: string;
  onComplete?: () => void;
  formData?: {
    fullName: string;
    dob: string;
    nationality: string;
    idType: "passport" | "national_id" | "driving_license";
    idNumber: string;
    address: string;
    phone: string;
    email: string;
  };
}

const KycVerification = ({ userId, onComplete, formData }: KycVerificationProps) => {
  const [activeTab, setActiveTab] = useState("id");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<"idFront" | "idBack" | "selfie" | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [captureType, setCaptureType] = useState<"idFront" | "idBack" | "selfie" | null>(null);
  const [extractedData, setExtractedData] = useState<{
    idNumber?: string;
    name?: string;
    dob?: string;
    address?: string;
    gender?: string;
  }>({}); 
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDialogType, setEditDialogType] = useState<"idNumber" | "name" | "dob">("idNumber");
  const [editedIdNumber, setEditedIdNumber] = useState("");
  const [editedName, setEditedName] = useState("");
  const [editedDob, setEditedDob] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<any>(null);

  useEffect(() => {
    const initWorker = async () => {
      try {
        const worker = await createWorker('eng');
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/- ',
        });
        workerRef.current = worker;
        console.log("Tesseract worker initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Tesseract worker:", error);
        toast({
          title: "OCR Initialization Failed",
          description: "There was a problem setting up the text recognition system.",
          variant: "destructive"
        });
      }
    };

    initWorker();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  useEffect(() => {
    const checkExistingVerification = () => {
      const existingVerification = getKycVerificationByUserId(userId);
      if (existingVerification && existingVerification.status === 'approved') {
        setIsComplete(true);
      }
    };
    
    checkExistingVerification();
  }, [userId]);

  useEffect(() => {
    if (idFront && formData) {
      extractDataFromAadhaar(idFront);
    }
  }, [idFront, formData]);

  const extractDataFromAadhaar = async (idImage: File) => {
    if (!workerRef.current) {
      toast({
        title: "OCR Not Ready",
        description: "Please wait for the OCR system to initialize.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      toast({
        title: "Processing Aadhaar Card",
        description: "We're extracting information from your ID. This may take a moment..."
      });

      const imageUrl = URL.createObjectURL(idImage);
      
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(imageUrl);
          setIsProcessing(false);
          throw new Error("Could not get canvas context");
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const threshold = 127;
          const newValue = avg > threshold ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = newValue;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const enhancedImage = canvas.toDataURL('image/png');
        
        try {
          const result = await workerRef.current.recognize(enhancedImage);
          
          const ocrText = result.data.text;
          console.log('OCR extracted text:', ocrText);
          
          const extracted: {
            idNumber?: string;
            name?: string;
            dob?: string;
            address?: string;
            gender?: string;
          } = {};
          
          const aadhaarPatterns = [
            /\b(\d{4}\s?\d{4}\s?\d{4})\b/,
            /\b(\d{4}-\d{4}-\d{4})\b/,
            /\b(\d{12})\b/,
            /[Nn]umber\s*:?\s*(\d{4}[\s-]?\d{4}[\s-]?\d{4})/,
            /[Aa]adhaar\s*:?\s*(\d{4}[\s-]?\d{4}[\s-]?\d{4})/,
            /[Uu][Ii][Dd]\s*:?\s*(\d{4}[\s-]?\d{4}[\s-]?\d{4})/,
            /\d{4}[\s-]?\d{4}[\s-]?\d{4}/,
            /[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}/,
            /\d{4}.*\d{4}.*\d{4}/
          ];
          
          let aadhaarMatch = null;
          for (const pattern of aadhaarPatterns) {
            aadhaarMatch = ocrText.match(pattern);
            if (aadhaarMatch) {
              console.log("Found Aadhaar pattern match:", aadhaarMatch[0]);
              break;
            }
          }
          
          if (aadhaarMatch) {
            let aadhaarNumber = aadhaarMatch[0];
            if (aadhaarMatch.length > 1) {
              aadhaarNumber = aadhaarMatch[1];
            }
            
            aadhaarNumber = aadhaarNumber.replace(/[^0-9]/g, '');
            
            if (aadhaarNumber.length === 12) {
              aadhaarNumber = aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
              extracted.idNumber = aadhaarNumber;
              console.log("Extracted Aadhaar number:", aadhaarNumber);
            } else {
              console.log("Found potential Aadhaar number but length is incorrect:", aadhaarNumber.length);
            }
            
            const dobPatterns = [
              /\b(DOB|Date\s+of\s+Birth|Birth\s+Date)[\s:]+(\d{2}[/.-]\d{2}[/.-]\d{4})\b/i,
              /\b(DOB|Date\s+of\s+Birth|Birth\s+Date)[\s:]+(\d{2}[/.-]\d{2}[/.-]\d{2})\b/i,
              /\b(\d{2}[/.-]\d{2}[/.-]\d{4})\b/,
              /\b(\d{2}[/.-]\d{2}[/.-]\d{2})\b/,
              /\b(0[1-9]|[12][0-9]|3[01])[/.-](0[1-9]|1[0-2])[/.-](19|20)\d{2}\b/
            ];
            
            let dobMatch = null;
            for (const pattern of dobPatterns) {
              const matches = ocrText.match(pattern);
              if (matches) {
                dobMatch = matches.length > 2 ? matches[2] : matches[1];
                break;
              }
            }
            
            if (dobMatch) {
              extracted.dob = dobMatch;
            }
            
            const nameLabels = [
              /Name\s*[:]?\s*([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i,
              /\b([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})\b(?=.*DOB|.*Date)/i,
              /\b([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})\b(?=.*\d{4}[\s-]?\d{4}[\s-]?\d{4})/i,
              /\b([A-Z][a-z]+(?: [A-Z][a-z]+){1,2})\b/
            ];
            
            let nameMatch = null;
            for (const pattern of nameLabels) {
              const matches = ocrText.match(pattern);
              if (matches) {
                nameMatch = matches[1];
                if (nameMatch.split(/\s+/).length > 1 && !/\d/.test(nameMatch)) {
                  break;
                }
              }
            }
            
            if (nameMatch) {
              const cleanedName = nameMatch.replace(/\s+/g, ' ').trim();
              if (cleanedName === cleanedName.toUpperCase()) {
                extracted.name = cleanedName.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
              } else {
                extracted.name = cleanedName;
              }
            }
            
            if (ocrText.match(/\b(male|MALE)\b/i)) {
              extracted.gender = 'Male';
            } else if (ocrText.match(/\b(female|FEMALE)\b/i)) {
              extracted.gender = 'Female';
            }
            
            const addressMatch = ocrText.match(/Address\s*[:]?\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
            if (addressMatch) {
              extracted.address = addressMatch[1].trim();
            }
            
            setExtractedData(extracted);
            
            const needsEditing = 
              (extracted.idNumber && formData?.idNumber && extracted.idNumber !== formData.idNumber) ||
              (extracted.name && formData?.fullName && !formData.fullName.includes(extracted.name)) ||
              (extracted.dob && formData?.dob && extracted.dob !== formData.dob);
              
            if (extracted.idNumber && (!formData?.idNumber || extracted.idNumber !== formData.idNumber)) {
              setEditedIdNumber(extracted.idNumber);
              setEditDialogType("idNumber");
              setIsEditDialogOpen(true);
            } else if (extracted.name && (!formData?.fullName || !formData.fullName.includes(extracted.name))) {
              setEditedName(extracted.name);
              setEditDialogType("name");
              setIsEditDialogOpen(true);
            } else if (extracted.dob && (!formData?.dob || extracted.dob !== formData.dob)) {
              setEditedDob(extracted.dob);
              setEditDialogType("dob");
              setIsEditDialogOpen(true);
            }
            
            toast({
              title: "Data Extracted",
              description: "We've successfully extracted information from your Aadhaar card."
            });
          } else {
            console.log("No Aadhaar number found in:", ocrText);
            toast({
              title: "Extraction Issue",
              description: "We couldn't identify an Aadhaar number. Please ensure the image is clear and try again.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('OCR recognition error:', error);
          toast({
            title: "Recognition Failed",
            description: "There was a problem processing the image. Please try a clearer image.",
            variant: "destructive"
          });
        } finally {
          URL.revokeObjectURL(imageUrl);
          setIsProcessing(false);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        setIsProcessing(false);
        toast({
          title: "Image Load Error",
          description: "Failed to load the image. Please try a different file.",
          variant: "destructive"
        });
      };
      
      img.src = imageUrl;
      
    } catch (error) {
      console.error('OCR extraction error:', error);
      setIsProcessing(false);
      toast({
        title: "Extraction Failed",
        description: "We encountered an error while processing your ID. Please try again with a clearer image.",
        variant: "destructive"
      });
    }
  };

  const handleIdFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIdFront(e.target.files[0]);
    }
  };

  const handleIdBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIdBack(e.target.files[0]);
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelfie(e.target.files[0]);
    }
  };

  const handlePreview = (type: "idFront" | "idBack" | "selfie") => {
    setPreviewType(type);
    setIsPreviewOpen(true);
  };

  const handleCameraOpen = (type: "idFront" | "idBack" | "selfie") => {
    setCaptureType(type);
    setIsCameraOpen(true);
    
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const startCamera = async () => {
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: captureType === "selfie" ? "user" : "environment" } 
        });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `${captureType}-${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            if (captureType === 'idFront') setIdFront(file);
            else if (captureType === 'idBack') setIdBack(file);
            else if (captureType === 'selfie') setSelfie(file);
            
            toast({
              title: "Photo Captured",
              description: `${captureType === 'idFront' ? 'ID Front' : captureType === 'idBack' ? 'ID Back' : 'Selfie'} captured successfully.` 
            });
          }
        }, 'image/jpeg', 0.95);
      }
      
      setIsCameraOpen(false);
      stopCamera();
    }
  };

  const handleCameraClose = () => {
    setIsCameraOpen(false);
    stopCamera();
  };

  const handleSubmit = () => {
    if (!idFront || !idBack || !selfie) {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents (ID Front, ID Back, and Selfie).",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const convertFileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    };

    const submitVerification = async () => {
      try {
        const idFrontBase64 = idFront ? await convertFileToBase64(idFront) : '';
        const idBackBase64 = idBack ? await convertFileToBase64(idBack) : '';
        const selfieBase64 = selfie ? await convertFileToBase64(selfie) : '';
        
        const documents = [];
        if (Object.keys(extractedData).length > 0) {
          documents.push({
            type: 'ID Card OCR',
            url: idFrontBase64,
            extracted_data: extractedData
          });
        }
        
        if (formData) {
          const { submitKycVerification } = await import('@/services/userServices');
          
          try {
            await submitKycVerification({
              fullName: formData.fullName,
              email: formData.email,
              idFront: idFrontBase64,
              idBack: idBackBase64,
              selfie: selfieBase64,
              documents: documents
            });
            
            setIsSubmitting(false);
            setIsComplete(true);
            
            toast({
              title: "Verification Submitted",
              description: "Your identity verification has been submitted successfully.",
            });
            
            if (onComplete) {
              onComplete();
            }
          } catch (error: any) {
            console.error('Error submitting verification:', error);
            setIsSubmitting(false);
            
            if (error.message?.includes('duplicate key')) {
              toast({
                title: "Verification Already Exists",
                description: "You have already submitted a verification with this email. The existing verification has been updated.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Submission Failed",
                description: "There was an error submitting your verification: " + (error.message || "Unknown error"),
                variant: "destructive"
              });
            }
          }
        }
      } catch (error) {
        console.error('Error processing files:', error);
        setIsSubmitting(false);
        toast({
          title: "Submission Failed",
          description: "There was an error processing your files. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    submitVerification();
  };

  const handleEditData = () => {
    if (formData) {
      if (editDialogType === "idNumber") {
        toast({
          title: "ID Number Updated",
          description: `ID Number has been corrected to: ${editedIdNumber}`
        });
      } else if (editDialogType === "name") {
        toast({
          title: "Name Updated",
          description: `Name has been corrected to: ${editedName}`
        });
      } else if (editDialogType === "dob") {
        toast({
          title: "Date of Birth Updated",
          description: `Date of Birth has been corrected to: ${editedDob}`
        });
      }
    }
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (type: "idNumber" | "name" | "dob") => {
    setEditDialogType(type);
    if (type === "idNumber") {
      setEditedIdNumber(extractedData.idNumber || "");
    } else if (type === "name") {
      setEditedName(extractedData.name || "");
    } else if (type === "dob") {
      setEditedDob(extractedData.dob || "");
    }
    setIsEditDialogOpen(true);
  };
  
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Document Verification</CardTitle>
      </CardHeader>
      
      <CardContent>
        {!isComplete ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="id">ID Front</TabsTrigger>
              <TabsTrigger value="idBack">ID Back</TabsTrigger>
              <TabsTrigger value="selfie">Selfie</TabsTrigger>
            </TabsList>
            
            <TabsContent value="id" className="mt-4">
              <div className="grid gap-4">
                <Label htmlFor="id-front">Upload or Capture Front of Aadhaar Card</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="id-front"
                    className="hidden"
                    accept="image/*"
                    onChange={handleIdFrontChange}
                  />
                  <Button asChild variant="outline" className="flex-1">
                    <Label htmlFor="id-front" className="cursor-pointer">
                      {idFront ? (
                        <><Check className="mr-2 h-4 w-4" />{idFront.name}</>
                      ) : (
                        <><Upload className="mr-2 h-4 w-4" />Upload ID Front</>
                      )}
                    </Label>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleCameraOpen("idFront")}
                    className="flex-1"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capture ID Front
                  </Button>
                </div>
                {idFront && (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(idFront)}
                      alt="ID Front Preview"
                      className="mt-2 rounded-md"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2 bg-white" 
                      onClick={() => handlePreview("idFront")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                        <div className="text-center text-white">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                          <p className="mt-2">Extracting data...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {Object.keys(extractedData).length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Extracted Information
                      </h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          if (extractedData.idNumber) {
                            openEditDialog("idNumber");
                          } else if (extractedData.name) {
                            openEditDialog("name");
                          } else if (extractedData.dob) {
                            openEditDialog("dob");
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {extractedData.idNumber && (
                        <div className="flex justify-between items-center">
                          <p><span className="font-semibold">Aadhaar Number:</span> {extractedData.idNumber}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0" 
                            onClick={() => openEditDialog("idNumber")}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {extractedData.name && (
                        <div className="flex justify-between items-center">
                          <p><span className="font-semibold">Name:</span> {extractedData.name}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0" 
                            onClick={() => openEditDialog("name")}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {extractedData.dob && (
                        <div className="flex justify-between items-center">
                          <p><span className="font-semibold">Date of Birth:</span> {extractedData.dob}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0" 
                            onClick={() => openEditDialog("dob")}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {extractedData.gender && (
                        <p><span className="font-semibold">Gender:</span> {extractedData.gender}</p>
                      )}
                      {extractedData.address && (
                        <p><span className="font-semibold">Address:</span> {extractedData.address}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="idBack" className="mt-4">
              <div className="grid gap-4">
                <Label htmlFor="id-back">Upload or Capture Back of Aadhaar Card</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="id-back"
                    className="hidden"
                    accept="image/*"
                    onChange={handleIdBackChange}
                  />
                  <Button asChild variant="outline" className="flex-1">
                    <Label htmlFor="id-back" className="cursor-pointer">
                      {idBack ? (
                        <><Check className="mr-2 h-4 w-4" />{idBack.name}</>
                      ) : (
                        <><Upload className="mr-2 h-4 w-4" />Upload ID Back</>
                      )}
                    </Label>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleCameraOpen("idBack")}
                    className="flex-1"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capture ID Back
                  </Button>
                </div>
                {idBack && (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(idBack)}
                      alt="ID Back Preview"
                      className="mt-2 rounded-md"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2 bg-white" 
                      onClick={() => handlePreview("idBack")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="selfie" className="mt-4">
              <div className="grid gap-4">
                <Label htmlFor="selfie">Upload or Capture Selfie</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="selfie"
                    className="hidden"
                    accept="image/*"
                    onChange={handleSelfieChange}
                  />
                  <Button asChild variant="outline" className="flex-1">
                    <Label htmlFor="selfie" className="cursor-pointer">
                      {selfie ? (
                        <><Check className="mr-2 h-4 w-4" />{selfie.name}</>
                      ) : (
                        <><Upload className="mr-2 h-4 w-4" />Upload Selfie</>
                      )}
                    </Label>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleCameraOpen("selfie")}
                    className="flex-1"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Selfie
                  </Button>
                </div>
                {selfie && (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(selfie)}
                      alt="Selfie Preview"
                      className="mt-2 rounded-md"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2 bg-white" 
                      onClick={() => handlePreview("selfie")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold mt-4">Verification Complete!</h3>
            <p className="text-gray-500 mt-2">
              Your documents have been successfully submitted for verification.
            </p>
          </div>
        )}

        {formData && !isComplete && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Full Name</Label>
                <p className="font-medium">{formData.fullName}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Date of Birth</Label>
                <p className="font-medium">{formData.dob}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Nationality</Label>
                <p className="font-medium">{formData.nationality}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">ID Type</Label>
                <p className="font-medium">{formData.idType.replace('_', ' ')}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">ID Number</Label>
                <p className="font-medium">{formData.idNumber}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Phone</Label>
                <p className="font-medium">{formData.phone}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <p className="font-medium">{formData.email}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Address</Label>
                <p className="font-medium">{formData.address}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!isComplete ? (
          <Button onClick={handleSubmit} disabled={isSubmitting || !idFront || !idBack || !selfie}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>Submit Verification</>
            )}
          </Button>
        ) : (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Go Back
          </Button>
        )}
      </CardFooter>
      
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent className="sm:max-w-lg w-full" side="right">
          <SheetHeader>
            <SheetTitle>
              {previewType === 'idFront' ? 'ID Front' : previewType === 'idBack' ? 'ID Back' : 'Selfie'} Preview
            </SheetTitle>
            <SheetDescription>
              View your uploaded document.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {previewType === 'idFront' && idFront && (
              <img 
                src={URL.createObjectURL(idFront)} 
                alt="ID Front" 
                className="w-full rounded-md"
              />
            )}
            {previewType === 'idBack' && idBack && (
              <img 
                src={URL.createObjectURL(idBack)} 
                alt="ID Back" 
                className="w-full rounded-md"
              />
            )}
            {previewType === 'selfie' && selfie && (
              <img 
                src={URL.createObjectURL(selfie)} 
                alt="Selfie" 
                className="w-full rounded-md"
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      <Dialog open={isCameraOpen} onOpenChange={(open) => {
        if (!open) handleCameraClose();
        setIsCameraOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Capture {captureType === 'idFront' ? 'ID Front' : captureType === 'idBack' ? 'ID Back' : 'Selfie'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative mt-2 bg-black rounded-md overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full h-auto max-h-[50vh]"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button variant="secondary" onClick={handleCameraClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={capturePhoto}>
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit {editDialogType === 'idNumber' ? 'ID Number' : editDialogType === 'name' ? 'Name' : 'Date of Birth'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {editDialogType === 'idNumber' && (
              <div className="grid gap-2">
                <Label htmlFor="id-number">Aadhaar Number</Label>
                <Input 
                  id="id-number" 
                  value={editedIdNumber} 
                  onChange={(e) => setEditedIdNumber(e.target.value)} 
                  placeholder="XXXX XXXX XXXX"
                />
              </div>
            )}
            
            {editDialogType === 'name' && (
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={editedName} 
                  onChange={(e) => setEditedName(e.target.value)} 
                  placeholder="Your full name"
                />
              </div>
            )}
            
            {editDialogType === 'dob' && (
              <div className="grid gap-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input 
                  id="dob" 
                  value={editedDob} 
                  onChange={(e) => setEditedDob(e.target.value)} 
                  placeholder="DD/MM/YYYY"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditData}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default KycVerification;
