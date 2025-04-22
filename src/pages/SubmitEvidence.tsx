import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Upload, FileText, Shield, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SubmitEvidence = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestIdFromUrl = queryParams.get('requestId');
  
  const [evidenceRequests, setEvidenceRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  
  const [selectedCase, setSelectedCase] = useState(requestIdFromUrl || "");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    fetchEvidenceRequests();
  }, []);
  
  const fetchEvidenceRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const { data, error } = await supabase
        .from('evidence_requests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setEvidenceRequests(data || []);
      
      if (requestIdFromUrl && !selectedCase) {
        setSelectedCase(requestIdFromUrl);
      }
    } catch (error: any) {
      console.error("Error fetching evidence requests:", error);
      toast.error("Failed to load evidence requests");
    } finally {
      setIsLoadingRequests(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCase) {
      toast.error("Please select a case to submit evidence for");
      return;
    }
    
    if (!description) {
      toast.error("Please provide a description of your evidence");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let fileUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `evidence/${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('evidences')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          toast.error("Error uploading file: " + uploadError.message);
          setIsSubmitting(false);
          return;
        }
        
        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from('evidences')
            .getPublicUrl(filePath);
            
          fileUrl = urlData.publicUrl;
        }
      }
      
      const { error: insertError } = await supabase
        .from('evidence_responses')
        .insert({
          request_id: selectedCase,
          description,
          is_anonymous: isAnonymous,
          file_url: fileUrl,
          submitted_by: user?.id,
          status: 'new'
        });
        
      if (insertError) throw insertError;
      
      toast.success("Your evidence has been submitted successfully");
      setIsSuccess(true);
      
      setTimeout(() => {
        setSelectedCase("");
        setDescription("");
        setIsAnonymous(false);
        setSelectedFile(null);
        setIsSuccess(false);
        
        navigate('/help-us');
      }, 3000);
      
    } catch (error: any) {
      console.error("Error submitting evidence:", error);
      toast.error(`Failed to submit evidence: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto px-4 py-12 mt-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-[#0D2644]/5 shadow-sm mb-4">
            <MessageSquare className="h-4 w-4 text-[#0D2644] mr-2" />
            <span className="text-xs font-medium">Evidence Submission</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Submit Evidence to <span className="text-[#0D2644]">Law Enforcement</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Securely submit your evidence to assist with ongoing investigations. Your contributions help solve cases and bring justice to the community.
          </p>
        </div>
        
        <Card className="w-full bg-white shadow-lg border-none">
          <CardHeader className="bg-[#0D2644]/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-[#0D2644]">
              <Shield className="h-5 w-5" />
              Evidence Submission Form
            </CardTitle>
            <CardDescription>
              Submit photos, videos, or information related to a case
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {!user ? (
              <div className="text-center py-8">
                <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
                <p className="text-gray-500 mb-6">
                  You need to sign in before submitting evidence to law enforcement.
                </p>
                <Button 
                  className="bg-[#0D2644] hover:bg-[#0D2644]/90"
                  onClick={() => navigate('/signin', { state: { from: '/submit-evidence' } })}
                >
                  Sign In to Continue
                </Button>
              </div>
            ) : isLoadingRequests ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#0D2644]" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="case-select">Select Case</Label>
                  <Select 
                    value={selectedCase} 
                    onValueChange={setSelectedCase}
                    disabled={isSubmitting || isSuccess}
                  >
                    <SelectTrigger id="case-select">
                      <SelectValue placeholder="Select the case you have evidence for" />
                    </SelectTrigger>
                    <SelectContent>
                      {evidenceRequests.map(request => (
                        <SelectItem key={request.id} value={request.id}>
                          {request.fir_number} - {request.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evidence-description">Evidence Description</Label>
                  <Textarea
                    id="evidence-description"
                    placeholder="Describe your evidence and how it relates to the case..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px] resize-y"
                    disabled={isSubmitting || isSuccess}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evidence-file">Upload Evidence (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center bg-[#0D2644]/5">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button 
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          disabled={isSubmitting || isSuccess}
                          className="mt-2"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop your files here, or click to browse
                        </p>
                        <Button 
                          type="button" 
                          variant="outline"
                          disabled={isSubmitting || isSuccess}
                          className="text-[#0D2644]"
                          onClick={() => document.getElementById('evidence-file')?.click()}
                        >
                          Browse Files
                        </Button>
                      </>
                    )}
                    <input
                      id="evidence-file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isSubmitting || isSuccess}
                      accept="image/*,video/*,application/pdf"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: Images, Videos, Documents (PDF)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                    disabled={isSubmitting || isSuccess}
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Submit anonymously (your identity will not be disclosed)
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#0D2644] text-white hover:bg-[#0D2644]/90"
                  disabled={isSubmitting || isSuccess}
                >
                  {isSubmitting ? (
                    <>Processing Submission...</>
                  ) : isSuccess ? (
                    <><Check className="mr-2 h-4 w-4" /> Evidence Submitted Successfully</>
                  ) : (
                    <><FileText className="mr-2 h-4 w-4" /> Submit Evidence</>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  By submitting evidence, you confirm that the information provided is truthful to the best of your knowledge.
                  All submissions are encrypted and secure.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default SubmitEvidence;
