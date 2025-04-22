import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Check, FileText, Send, Shield, Download } from 'lucide-react';
import { toast } from 'sonner';
import { submitReportToOfficer } from '@/services/reportServices';
import { saveReportPdf } from '@/services/reportPdfService';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const SelfReportForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Add navigation
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isConfidential, setIsConfidential] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [phone, setPhone] = useState(''); // Add phone number field

  const generatePdfReport = async () => {
    const pdf = new jsPDF();
    const dateFormatted = new Date().toLocaleString();

    pdf.setFontSize(20);
    pdf.text('Self Report', 105, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    if (!isAnonymous) {
      pdf.text(`Name: ${name}`, 20, 40);
      pdf.text(`Age: ${age}`, 20, 50);
      pdf.text(`Gender: ${gender}`, 20, 60);
      pdf.text(`Location: ${location}`, 20, 70);
    }
    pdf.text(`Date: ${dateFormatted}`, 20, 80);
    pdf.text(`Confidential: ${isConfidential ? 'Yes' : 'No'}`, 20, 90);
    
    pdf.setFontSize(14);
    pdf.text('Description:', 20, 110);
    
    const textLines = pdf.splitTextToSize(description, 170);
    pdf.setFontSize(11);
    pdf.text(textLines, 20, 120);
    
    return pdf;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error("Please provide a description of what happened");
      return;
    }

    setIsSubmitting(true);

    try {
      const pdf = await generatePdfReport();
      const pdfBlob = pdf.output('blob');
      
      // Create a URL for local download
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);

      // Create a new report in the database - excluding age, gender since those fields don't exist in the table
      const { data: reportData, error } = await supabase
        .from('crime_reports')
        .insert([
          {
            user_id: user?.id,
            title: 'Self Report',
            description: description,
            location: isAnonymous ? null : location,
            is_anonymous: isAnonymous,
            status: 'submitted', // Change status to submitted
            officer_notes: isConfidential ? 'CONFIDENTIAL: Keep private' : '',
            phone: isAnonymous ? null : phone, // Add phone to the report
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Save PDF to storage
      await saveReportPdf(reportData.id, pdfBlob, `self_report_${new Date().getTime()}.pdf`, true);
      
      // Submit report to officer
      await submitReportToOfficer(reportData.id);

      toast.success('Your report has been submitted successfully');
      setIsSuccess(true);

      // Navigate to dashboard after successful submission
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `self_report_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Self Report</CardTitle>
          <CardDescription>
            Please sign in to submit a report
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-lg border-none">
      <CardHeader className="bg-[#0D2644]/5 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-[#0D2644]">
          <Shield className="h-5 w-5" />
          Self Report Form
        </CardTitle>
        <CardDescription>
          Describe what happened to you, even without photos or videos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting || isSuccess}
                />
              </div>
              <div>
                <label htmlFor="age" className="text-sm font-medium">Age</label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting || isSuccess}
                />
              </div>
              <div>
                <label htmlFor="gender" className="text-sm font-medium">Gender</label>
                <Input
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting || isSuccess}
                />
              </div>
              <div>
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting || isSuccess}
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting || isSuccess}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="report-description" className="text-sm font-medium">
              Please describe what happened
            </label>
            <Textarea
              id="report-description"
              placeholder="Describe in detail what happened, when, where, and any other relevant information..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[200px] resize-y"
              disabled={isSubmitting || isSuccess}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Submit Anonymously</h4>
                <p className="text-xs text-muted-foreground">
                  Your identity will not be revealed
                </p>
              </div>
              <Switch 
                checked={isAnonymous} 
                onCheckedChange={setIsAnonymous}
                disabled={isSubmitting || isSuccess}
              />
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Confidential Report</h4>
                <p className="text-xs text-muted-foreground">
                  Request that your data is kept confidential
                </p>
              </div>
              <Switch 
                checked={isConfidential} 
                onCheckedChange={setIsConfidential}
                disabled={isSubmitting || isSuccess}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1 bg-[#0D2644] hover:bg-[#0D2644]/90"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : isSuccess ? (
                <><Check className="mr-2 h-4 w-4" /> Submitted Successfully</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Submit Report</>
              )}
            </Button>
            
            {pdfUrl && (
              <Button 
                type="button"
                onClick={handleDownloadPdf}
                className="bg-[#0D2644]/10 text-[#0D2644] hover:bg-[#0D2644]/20"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SelfReportForm;
