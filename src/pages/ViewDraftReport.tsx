
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Edit, Download, ArrowLeft, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { getReportAnalysis, VideoAnalysisResult } from '@/services/aiAnalysisServices';

const ViewDraftReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [reportId, setReportId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    if (id) {
      setReportId(id);
      fetchAnalysisResult(id);
    }
    
    const savedImages = sessionStorage.getItem('uploadedImages');
    if (savedImages) {
      setUploadedImages(JSON.parse(savedImages));
    } else {
      // Use placeholder images if no uploads
      setUploadedImages([
        "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1576482316642-48cf1c400f14?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1594717527389-a590b56e331d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
      ]);
    }
  }, [location.search]);
  
  const fetchAnalysisResult = async (id: string) => {
    try {
      const result = await getReportAnalysis(id);
      if (result) {
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error("Error fetching analysis result:", error);
    }
  };
  
  const handleDownloadDraft = () => {
    toast.success("Draft report downloaded successfully");
  };
  
  const handleEditReport = () => {
    navigate(`/continue-report${reportId ? `?id=${reportId}` : ''}`);
  };
  
  const handleGenerateFullReport = () => {
    navigate(`/generate-detailed-report${reportId ? `?id=${reportId}` : ''}`);
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <Link to="/continue-report" className="mr-4">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold">Draft Report #{reportId || '1042'}</h1>
            </div>
            
            <div className="flex items-center">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Draft</span>
            </div>
          </div>
          
          <div className="glass-card p-8 mb-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Report Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Incident Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium">Downtown Central Square</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Report Type</p>
                  <p className="font-medium flex items-center">
                    {analysisResult ? (
                      <>
                        <Badge className={`mr-2 ${getCrimeTypeColor(analysisResult.crimeType)} capitalize`}>
                          {analysisResult.crimeType}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {Math.round(analysisResult.confidence * 100)}% confidence
                        </span>
                      </>
                    ) : (
                      "Pending Analysis"
                    )}
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-2">Incident Description</h3>
              <p className="text-gray-700 mb-6">
                {analysisResult ? (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="flex items-center mb-2">
                      <ShieldAlert className="h-4 w-4 text-shield-blue mr-2" />
                      <span className="font-medium">AI Analysis</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">
                      {analysisResult.description.split('\n').slice(0, 5).join('\n')}...
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      (Full analysis available in detailed report)
                    </p>
                  </div>
                ) : (
                  <>
                    At approximately 8:30 PM, a group of individuals were observed engaged in suspicious activity in 
                    the central square area. Multiple witnesses were present, and several photographs were taken 
                    of the incident in progress. Further analysis required to determine the exact nature of the activity.
                  </>
                )}
              </p>
              
              <h3 className="text-lg font-medium mb-2">Submitted Evidence</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {uploadedImages.map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt={`Evidence ${index + 1}`} 
                    className="aspect-square object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium mb-2">AI Analysis (Preliminary)</h3>
                {analysisResult ? (
                  <div className="text-gray-700">
                    <p className="font-medium mb-2">
                      Our AI model has identified this incident as potential{" "}
                      <span className="capitalize">{analysisResult.crimeType}</span>{" "}
                      with {Math.round(analysisResult.confidence * 100)}% confidence.
                    </p>
                    <p className="text-gray-600 text-sm italic">
                      Generate a detailed report for complete analysis and recommendations.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-700 italic">
                    Initial analysis is pending. Generate a detailed report to run a complete AI analysis on the provided evidence.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all"
                onClick={handleEditReport}
              >
                <Edit className="mr-2 h-4 w-4" /> Continue Editing
              </Button>
              
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all flex-1"
                onClick={handleDownloadDraft}
              >
                <Download className="mr-2 h-4 w-4" /> Download Draft
              </Button>
              
              <Button 
                className="w-full bg-green-600 text-white hover:bg-green-700 transition-all"
                onClick={handleGenerateFullReport}
              >
                <FileText className="mr-2 h-4 w-4" /> Generate Full Report
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ViewDraftReport;
