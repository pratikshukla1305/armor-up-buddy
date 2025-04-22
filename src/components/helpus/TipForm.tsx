
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

const TipForm = () => {
  const location = useLocation();
  const prefilledData = location.state || {};

  // Form states
  const [submitterName, setSubmitterName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [subject, setSubject] = useState(prefilledData.individualName ? `Information about ${prefilledData.individualName}` : '');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fill the form with data if navigated from wanted individuals page
  useEffect(() => {
    if (prefilledData.individualName) {
      setSubject(`Information about ${prefilledData.individualName}`);
      if (prefilledData.caseNumber) {
        setDescription(`Case Number: ${prefilledData.caseNumber}\n\n`);
      }
    }
  }, [prefilledData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the tip data object
      const tipData = {
        submitter_name: isAnonymous ? null : submitterName,
        email: isAnonymous ? null : email,
        phone: isAnonymous ? null : phone,
        location,
        subject,
        description,
        is_anonymous: isAnonymous
      };
      
      // Submit to Supabase
      const { error } = await supabase
        .from('criminal_tips')
        .insert([tipData]);
      
      if (error) throw error;
      
      toast.success('Your tip has been submitted successfully');
      
      // Reset form
      setSubmitterName('');
      setEmail('');
      setPhone('');
      setLocation('');
      setSubject('');
      setDescription('');
      setIsAnonymous(false);
      
    } catch (error) {
      console.error('Error submitting tip:', error);
      toast.error('Failed to submit tip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Submit a Tip</CardTitle>
        <CardDescription>
          Provide information about a criminal case or suspected activity.
          You can choose to remain anonymous.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anonymous switch */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="anonymous" 
              checked={isAnonymous} 
              onCheckedChange={setIsAnonymous} 
            />
            <Label htmlFor="anonymous">Submit anonymously</Label>
          </div>
          
          {/* Contact information - hidden if anonymous */}
          {!isAnonymous && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  id="name" 
                  value={submitterName} 
                  onChange={(e) => setSubmitterName(e.target.value)} 
                  placeholder="Enter your name" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Enter your phone number" 
                  />
                </div>
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input 
              id="location" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="Where did this occur?" 
            />
          </div>
          
          <div>
            <Label htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="Brief description of your tip" 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Provide detailed information about what you know" 
              rows={5} 
              required 
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Tip'}
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            All information provided will be reviewed by law enforcement officials.
            {!isAnonymous && " We may contact you for additional information."}
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default TipForm;
