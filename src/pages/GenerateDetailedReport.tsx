import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, Check, RotateCcw, Download, Share2, 
  ArrowLeft, Send, ShieldAlert, MessageCircle, Phone,
  Mail, MapPin, Video
} from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { submitReportToOfficer } from '@/services/reportServices';
import { analyzeVideoEvidence, VideoAnalysisResult, getReportAnalysis } from '@/services/aiAnalysisServices';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { saveReportPdf, shareReportViaEmail, getReportPdfs } from '@/services/reportPdfService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

const locationFormSchema = z.object({
  location: z.string().min(5, {
    message: "Location must be at least 5 characters",
  }),
});

const emailFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters",
  }),
});

const GenerateDetailedReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState<string>('preparing');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isSharingEmail, setIsSharingEmail] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  const locationForm = useForm<z.infer<typeof locationFormSchema>>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      location: '',
    },
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
      subject: 'Crime Incident Report',
      message: 'Please find attached the crime incident report for your review.',
    },
  });
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    if (id) {
      setReportId(id);
    }
    
    const savedImages = sessionStorage.getItem('uploadedImages');
    if (savedImages) {
      const images = JSON.parse(savedImages);
      setUploadedImages(images);
      console.log("Loaded images from session storage:", images);
    }
    
    if (id) {
      fetchExistingAnalysis(id);
    }
    
    // Automatically detect location when component mounts
    detectCurrentLocation();
  }, [location.search]);
  
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error("Error getting address:", error);
      return null;
    }
  };
  
  const fetchExistingAnalysis = async (reportId: string) => {
    try {
      const result = await getReportAnalysis(reportId);
      if (result) {
        console.log("Found existing analysis:", result);
        setAnalysisResult(result);
        setIsComplete(true);
        setAnalysisProgress(100);
      }
    } catch (error) {
      console.error("Error fetching existing analysis:", error);
    }
  };
  
  const simulateProgress = () => {
    let progress = 0;
    const steps = ['preparing', 'extracting', 'analyzing', 'generating'];
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 1;
      setAnalysisProgress(Math.min(progress, 100));
      
      if (progress >= 25 && progress < 50) {
        setAnalysisStep(steps[1]);
      } else if (progress >= 50 && progress < 75) {
        setAnalysisStep(steps[2]);
      } else if (progress >= 75 && progress < 100) {
        setAnalysisStep(steps[3]);
      }
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
    
    return () => clearInterval(interval);
  };
  
  const detectCurrentLocation = () => {
    setIsDetectingLocation(true);
    console.log("Starting location detection...");
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Location detected:", position.coords);
          const { latitude, longitude } = position.coords;
          
          // Get address from coordinates
          const address = await getAddressFromCoordinates(latitude, longitude);
          const locationText = address 
            ? `${address} (${latitude}, ${longitude})`
            : `${latitude}, ${longitude}`;
            
          locationForm.setValue('location', locationText);
          toast.success("Current location detected successfully");
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not detect location. Please enter manually.");
          locationForm.setValue('location', "Unknown location - please update manually");
          setIsDetectingLocation(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.error("Geolocation not supported");
      toast.error("Location detection not supported by your browser. Please enter manually.");
      locationForm.setValue('location', "Unknown location - please update manually");
      setIsDetectingLocation(false);
    }
  };
  
  const handleGenerate = async (formData: z.infer<typeof locationFormSchema>) => {
    setIsGenerating(true);
    simulateProgress();
    
    try {
      if (uploadedImages.length > 0 && reportId) {
        console.log("Analyzing video evidence:", uploadedImages[0]);
        const videoUrl = uploadedImages[0];
        
        await supabase
          .from('crime_reports')
          .update({ detailed_location: formData.location })
          .eq('id', reportId);
        
        const result = await analyzeVideoEvidence(videoUrl, reportId, formData.location);
        
        if (result.success && result.analysis) {
          setAnalysisResult(result.analysis);
          console.log("AI analysis completed successfully:", result.analysis);
          toast.success("AI analysis completed successfully!");
        } else {
          console.error("Analysis failed:", result.error);
          toast.error(`Analysis failed: ${result.error || "Unknown error"}`);
        }
      } else {
        console.warn("No uploaded images or report ID available for analysis");
        toast.warning("No video evidence available to analyze");
      }
      
      setTimeout(() => {
        setIsGenerating(false);
        setIsComplete(true);
        setAnalysisProgress(100);
        toast.success("Report generated successfully!");
      }, 3000);
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report: " + (error.message || "Unknown error"));
      setIsGenerating(false);
    }
  };
  
  const generatePDF = async () => {
    try {
      console.log("Starting PDF generation process...");
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text("SHIELD", 105, 20, { align: "center" });
      
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("Crime Incident Report", 105, 55, { align: "center" });
      
      doc.setFontSize(11);
      doc.text(`Report ID: ${reportId || "Unknown"}`, 20, 65);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 72);
      doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 79);
      
      const userLocation = locationForm.getValues().location;
      doc.text(`Location: ${userLocation || 'Not specified'}`, 20, 86);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("AI Analysis Results", 20, 100);
      
      if (analysisResult) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Incident Type: ${analysisResult.crimeType}`, 20, 110);
        doc.text(`Detection Confidence: ${Math.round(analysisResult.confidence * 100)}%`, 20, 117);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 51, 102);
        doc.text("Incident Description:", 20, 130);
        
        const descriptionLines = doc.splitTextToSize(analysisResult.description, 170);
        let yPosition = 140;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        descriptionLines.forEach(line => {
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        
        doc.setFontSize(12);
        doc.setTextColor(0, 51, 102);
        doc.text("Evidence Submitted:", 20, yPosition + 10);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${uploadedImages.length} video/image files`, 20, yPosition + 20);
      } else {
        doc.text("No analysis data available", 20, 105);
      }
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("This report was generated by Shield - Securely report incidents with confidence", 105, 280, { align: "center" });
      
      const pdfBlob = doc.output('blob');
      
      if (!reportId) {
        console.error("Cannot save PDF: No report ID available");
        throw new Error("No report ID available");
      }
      
      const fileName = `Shield-Crime-Report-${reportId}.pdf`;
      console.log(`Generated PDF blob (${pdfBlob.size} bytes) for report ${reportId}`);
      
      console.log("Saving PDF to database for report:", reportId);
      const fileUrl = await saveReportPdf(reportId, pdfBlob, fileName, false);
      
      if (fileUrl) {
        console.log("PDF saved with URL:", fileUrl);
        setPdfUrl(fileUrl);
        
        const objectUrl = URL.createObjectURL(pdfBlob);
        
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
          document.body.removeChild(link);
        }, 100);
        
        toast.success("PDF downloaded successfully");
        return fileUrl;
      } else {
        throw new Error("Failed to save PDF to server");
      }
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF: " + (error.message || "Unknown error"));
      return null;
    }
  };
  
  const handleDownload = async () => {
    try {
      if (pdfUrl) {
        console.log("Using existing PDF URL for download:", pdfUrl);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `Shield-Crime-Report-${reportId}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
        toast.success("PDF download started");
      } else {
        console.log("No PDF URL available, generating new PDF...");
        await generatePDF();
      }
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(`Download failed: ${error.message || "Unknown error"}`);
    }
  };
  
  const handleShare = (platform: string) => {
    const reportUrl = `https://reportify.app/report/${reportId}`;
    let shareUrl = "";
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=Check%20out%20this%20incident%20report:%20${encodeURIComponent(reportUrl)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(reportUrl)}&text=Check%20out%20this%20incident%20report`;
        break;
      case 'email':
        setIsSharingEmail(true);
        return;
      default:
        shareUrl = reportUrl;
    }
    
    window.open(shareUrl, '_blank');
    toast.success(`Report shared via ${platform}`);
  };
  
  const handleEmailShare = async (formData: z.infer<typeof emailFormSchema>) => {
    let currentPdfUrl = pdfUrl;
    
    if (!currentPdfUrl) {
      toast.info("Generating PDF report first...");
      
      try {
        await generatePDF();
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentPdfUrl = pdfUrl;
        
        if (!currentPdfUrl) {
          const pdfs = await getReportPdfs(reportId!);
          if (pdfs && pdfs.length > 0) {
            currentPdfUrl = pdfs[0].file_url;
            setPdfUrl(currentPdfUrl);
            console.log("Using existing PDF URL:", currentPdfUrl);
          }
        }
      } catch (error) {
        toast.error("Failed to generate PDF. Please try again.");
        return;
      }
    }
    
    if (!reportId) {
      toast.error("Report ID not found");
      return;
    }
    
    if (!currentPdfUrl) {
      toast.error("Could not generate or find a PDF to share");
      return;
    }
    
    setIsSharingEmail(true);
    
    try {
      console.log("Sharing report via email:", {
        reportId,
        pdfUrl: currentPdfUrl,
        email: formData.email
      });
      
      const success = await shareReportViaEmail(
        reportId,
        currentPdfUrl,
        formData.email,
        formData.subject,
        formData.message
      );
      
      if (success) {
        toast.success("Report shared via email successfully");
        setIsSharingEmail(false);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sharing via email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSharingEmail(false);
    }
  };
  
  const handleSendToOfficer = async () => {
    if (!reportId) {
      toast.error("Report ID not found. Cannot send to officer.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitReportToOfficer(reportId);
      
      toast.success("Report sent to officer for further processing");
      
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      console.error("Error sending report to officer:", error);
      toast.error("Failed to send report to officer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getAnalysisStepLabel = () => {
    switch (analysisStep) {
      case 'preparing':
        return 'Preparing Video Data';
      case 'extracting':
        return 'Extracting Video Features';
      case 'analyzing':
        return 'Analyzing Crime Pattern';
      case 'generating':
        return 'Generating AI Report';
      default:
        return 'Processing';
    }
  };
  
  const renderAnalysisResult = () => {
    if (!analysisResult) return null;
    
    const confidencePercentage = Math.round(analysisResult.confidence * 100);
    const crimeTypeColor = getCrimeTypeColor(analysisResult.crimeType);
    
    return (
      <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-lg font-medium mb-2 sm:mb-0">AI Analysis Results</h3>
          <Badge className={`${crimeTypeColor} capitalize`}>
            {analysisResult.crimeType}
          </Badge>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1 text-sm">
            <span>Detection Confidence</span>
            <span className="font-medium">{confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} className="h-2" />
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description">
            <AccordionTrigger>Crime Description</AccordionTrigger>
            <AccordionContent>
              <div className="whitespace-pre-line text-sm text-gray-700 bg-white p-4 rounded border border-gray-100">
                {analysisResult.description}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-4 text-xs text-gray-500 flex items-center">
          <ShieldAlert className="h-3 w-3 mr-1" />
          Analysis completed on {new Date(analysisResult.analysisTimestamp).toLocaleString()}
        </div>
      </div>
    );
  };
  
  const getCrimeTypeColor = (crimeType: string): string => {
    switch (crimeType.toLowerCase()) {
      case 'abuse':
        return 'bg-orange-100 text-orange-800';
      case 'assault':
        return 'bg-red-100 text-red-800';
      case 'arson':
        return 'bg-amber-100 text-amber-800';
      case 'arrest':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const renderEvidencePreview = () => {
    if (!uploadedImages || uploadedImages.length === 0) {
      return (
        <div className="bg-gray-50 p-4 rounded text-gray-500 text-center">
          No evidence uploaded
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {uploadedImages.map((url, index) => (
          <div key={index} className="relative aspect-video rounded-md overflow-hidden border border-gray-200">
            {url.toLowerCase().endsWith('.mp4') || 
             url.toLowerCase().endsWith('.mov') || 
             url.toLowerCase().includes('video') ? (
              <>
                <div className="w-full h-full bg-gray-200 flex items-center justify-center cursor-pointer"
                     onClick={() => setSelectedVideo(url)} >
                  <div className="flex flex-col items-center">
                    <Video className="h-16 w-16 text-gray-500" />
                    <span className="mt-2 text-sm text-gray-600">Click to play video</span>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-tl">
                  Video {index + 1}
                </div>
              </>
            ) : (
              <img 
                src={url} 
                alt={`Evidence ${index + 1}`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Image loading error:", e);
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite error loops
                  target.src = "/placeholder.svg";
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const renderVideoModal = () => {
    if (!selectedVideo) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="bg-white rounded-lg p-4 max-w-4xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Video Evidence</h3>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedVideo(null)}
            >
              X
            </Button>
          </div>
          <div className="aspect-video w-full">
            <video 
              src={selectedVideo} 
              controls
              autoPlay
              className="w-full h-full"
              onError={(e) => {
                console.error("Modal video loading error:", e);
                const target = e.target as HTMLVideoElement;
                target.onerror = null; // Prevent infinite error loops
                target.poster = "/placeholder.svg";
              }}
            >
              <source src={selectedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              If the video doesn't play, it may be in an unsupported format or the URL may be inaccessible.
              Try downloading the video to view it locally.
            </p>
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = selectedVideo;
                  a.download = "video-evidence.mp4";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Download Video
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderEmailShareForm = () => {
    return (
      <div className="p-4">
        <h4 className="font-medium mb-3">Share via Email</h4>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(handleEmailShare)} className="space-y-3">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input placeholder="recipient@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={emailForm.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={emailForm.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSharingEmail}
                className="bg-shield-blue text-white hover:bg-blue-600"
              >
                {isSharingEmail ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {selectedVideo && renderVideoModal()}
      
      <section className="pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Link to="/continue-report" className="mr-4">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Generate Detailed Report</h1>
          </div>
          
          <div className="glass-card p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-shield-light mb-4">
                <FileText className="h-8 w-8 text-shield-blue" />
              </div>
              <h2 className="text-xl font-semibold mb-2">AI-Powered Report Generation</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our advanced AI will analyze all submitted video evidence to identify potential crimes
                and create a comprehensive, detailed report ready for official use. This process ensures accuracy 
                and thoroughness while saving you valuable time.
              </p>
            </div>
            
            <div className="bg-shield-light rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium mb-4">Report Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Report ID</p>
                  <p className="font-medium">{reportId || '#1042'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Incident Type</p>
                  <p className="font-medium">{analysisResult?.crimeType || "Under Analysis"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Evidence Items</p>
                  <p className="font-medium">{uploadedImages.length} Videos/Images, 1 Description</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Uploaded Evidence</p>
                {renderEvidencePreview()}
              </div>
            </div>
            
            {isGenerating && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-medium mb-4">AI Analysis in Progress</h3>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2 text-sm">
                    <span>{getAnalysisStepLabel()}</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
                
                <div className="text-sm text-gray-600 italic">
                  Our AI model is analyzing your video evidence for potential crime identification. 
                  This may take a few moments.
                </div>
              </div>
            )}
            
            {isComplete && analysisResult && renderAnalysisResult()}
            
            {!isComplete ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-medium mb-4">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-shield-blue" />
                    {isDetectingLocation ? 'Detecting Location...' : 'Incident Location'}
                  </div>
                </h3>
                
                <Form {...locationForm}>
                  <form onSubmit={locationForm.handleSubmit(handleGenerate)} className="space-y-4">
                    <FormField
                      control={locationForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Details</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder={isDetectingLocation ? "Detecting location..." : "Enter location manually if detection fails"}
                                {...field} 
                                className="w-full"
                                disabled={isDetectingLocation}
                              />
                              {isDetectingLocation && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <RotateCcw className="h-4 w-4 animate-spin text-gray-400" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            {isDetectingLocation ? 
                              "Detecting your current location..." : 
                              "Location detected automatically. You can modify it if needed."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={detectCurrentLocation}
                        disabled={isDetectingLocation}
                        className="text-shield-blue border-shield-blue"
                      >
                        {isDetectingLocation ? (
                          <>
                            <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <MapPin className="mr-2 h-4 w-4" />
                            Detect Location Again
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="submit"
                        className="bg-shield-blue text-white hover:bg-blue-600 transition-all"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing & Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Report with AI Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded
