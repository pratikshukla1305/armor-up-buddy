
import React, { useState } from 'react';
import { Camera, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
  description: z.string().min(10, 'Please provide at least 10 characters of description'),
  location: z.string().min(3, 'Please provide a valid location'),
  dateTime: z.string().min(1, 'Please select a date and time'),
  isConfident: z.boolean(),
  contactInfo: z.string().optional(),
  stayAnonymous: z.boolean(),
  urgencyLevel: z.enum(['low', 'medium', 'high']),
});

type FormValues = z.infer<typeof formSchema>;

interface CriminalReportFormProps {
  criminal: {
    id: string;
    name: string;
    photoUrl: string;
  };
}

const CriminalReportForm = ({ criminal }: CriminalReportFormProps) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      location: '',
      dateTime: new Date().toISOString().slice(0, 16),
      isConfident: false,
      contactInfo: '',
      stayAnonymous: false,
      urgencyLevel: 'medium',
    }
  });
  
  const stayAnonymous = watch('stayAnonymous');
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you might want to convert coordinates to an address using a geocoding service
          const locationString = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setCurrentLocation(locationString);
          setValue('location', locationString);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Unable to get your current location. Please enter it manually.");
          setIsGettingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser. Please enter your location manually.");
      setIsGettingLocation(false);
    }
  };
  
  const onSubmit = (data: FormValues) => {
    // Here you would normally send this to your backend
    console.log('Form data:', data);
    console.log('Photo file:', photoFile);
    
    // For demo purposes, we'll just show a success message
    toast.success("Report submitted successfully. Thank you for helping make our community safer.", {
      duration: 5000,
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-12 w-12">
          <AvatarImage src={criminal.photoUrl} alt={criminal.name} />
          <AvatarFallback>{criminal.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{criminal.name}</h3>
          <p className="text-sm text-gray-500">Please provide as much detail as possible</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="description">Description of Sighting</Label>
          <Textarea 
            id="description"
            placeholder="Describe where and how you saw this person, what they were wearing, who they were with, etc."
            className="resize-none h-24"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="flex">
              <Input 
                id="location"
                placeholder="Where did you see this person?"
                {...register('location')}
                className="rounded-r-none flex-1"
              />
              <Button 
                type="button"
                variant="outline" 
                className="rounded-l-none border-l-0 bg-gray-50"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
              >
                <MapPin className="h-4 w-4" />
                {isGettingLocation ? 'Getting...' : 'Current'}
              </Button>
            </div>
            {errors.location && (
              <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="dateTime">Date & Time of Sighting</Label>
            <Input 
              id="dateTime"
              type="datetime-local"
              {...register('dateTime')}
            />
            {errors.dateTime && (
              <p className="text-sm text-red-500 mt-1">{errors.dateTime.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <Label>Photo Evidence (optional)</Label>
          <div className="flex items-start space-x-4 mt-2">
            <div className="flex-shrink-0">
              <div className={`h-32 w-32 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 ${photoPreview ? 'border-transparent' : 'border-gray-300'}`}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover rounded-md" />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                className="mb-2"
                onChange={handlePhotoChange}
              />
              <p className="text-xs text-gray-500">Upload a clear photo if you have one. This can greatly assist law enforcement.</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="isConfident" {...register('isConfident')} />
          <Label htmlFor="isConfident" className="text-sm font-normal cursor-pointer">
            I am confident that the person I saw is the individual shown in the photo
          </Label>
        </div>
        
        <div>
          <Label>Urgency Level</Label>
          <RadioGroup defaultValue="medium" className="flex space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="urgency-low" {...register('urgencyLevel')} />
              <Label htmlFor="urgency-low" className="font-normal">Low</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="urgency-medium" {...register('urgencyLevel')} />
              <Label htmlFor="urgency-medium" className="font-normal">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="urgency-high" {...register('urgencyLevel')} />
              <Label htmlFor="urgency-high" className="font-normal">High</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="stayAnonymous" {...register('stayAnonymous')} />
          <Label htmlFor="stayAnonymous" className="text-sm font-normal cursor-pointer">
            I wish to remain anonymous
          </Label>
        </div>
        
        {!stayAnonymous && (
          <div>
            <Label htmlFor="contactInfo">Contact Information (optional)</Label>
            <Input 
              id="contactInfo"
              placeholder="Email or phone number where authorities can reach you if needed"
              {...register('contactInfo')}
            />
            <p className="text-xs text-gray-500 mt-1">
              This information will only be used by law enforcement if they need additional details.
            </p>
          </div>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <Button type="submit" className="w-full bg-shield-blue">
          Submit Report
        </Button>
        <p className="text-xs text-center text-gray-500 mt-3">
          Your report will be sent securely to the appropriate law enforcement agency.
        </p>
      </div>
    </form>
  );
};

export default CriminalReportForm;
