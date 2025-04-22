
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, SendIcon, FileText, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const EvidenceRequestForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState<Date | undefined>(new Date());
  const [responseDeadline, setResponseDeadline] = useState<Date | undefined>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
  );
  const [firNumber, setFirNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !location || !description || !incidentDate || !responseDeadline || !firNumber) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert evidence request to database
      const { data, error } = await supabase
        .from('evidence_requests')
        .insert({
          title,
          location,
          description,
          incident_date: incidentDate.toISOString(),
          response_deadline: responseDeadline.toISOString(),
          fir_number: firNumber,
          status: 'active',
          created_by: 'officer_id' // This should be the actual officer ID in a real implementation
        });
      
      if (error) throw error;
      
      toast.success("Evidence request has been published");
      
      // Reset form
      setTitle('');
      setLocation('');
      setDescription('');
      setIncidentDate(new Date());
      setResponseDeadline(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
      setFirNumber('');
      
      // Redirect to evidence requests list
      navigate('/officer-dashboard');
      
    } catch (error: any) {
      console.error("Error submitting evidence request:", error);
      toast.error(`Failed to submit request: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-[#0D2644]/5 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-[#0D2644]">
          <FileText className="h-5 w-5" />
          Create Evidence Request
        </CardTitle>
        <CardDescription>
          Request evidence from citizens for an ongoing investigation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fir-number">FIR Number</Label>
            <Input 
              id="fir-number" 
              placeholder="e.g. FIR-2024-0512" 
              value={firNumber}
              onChange={(e) => setFirNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Request Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Evidence needed for robbery investigation" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Incident Location</Label>
            <div className="flex">
              <Input 
                id="location" 
                placeholder="e.g. Central Park, East Side" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                className="ml-2"
                onClick={() => {
                  // In a real app, this would use the browser's geolocation
                  setLocation("Current Location");
                }}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Incident Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {incidentDate ? format(incidentDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={incidentDate}
                    onSelect={setIncidentDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Response Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {responseDeadline ? format(responseDeadline, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={responseDeadline}
                    onSelect={setResponseDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Request Details</Label>
            <Textarea
              id="description"
              placeholder="Describe the incident and what type of evidence you're looking for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[150px]"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#0D2644] hover:bg-[#0D2644]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 
              "Submitting..." : 
              <><SendIcon className="mr-2 h-4 w-4" /> Publish Evidence Request</>
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EvidenceRequestForm;
