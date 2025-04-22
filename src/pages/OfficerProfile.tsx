import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Phone, Mail, MapPin, Calendar, Award, X, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';

const OfficerProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { officer } = useOfficerAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const defaultOfficer = {
    name: "Loading...",
    badge: "",
    avatar: "",
    department: "",
    rank: "Officer",
    phone: "",
    email: "",
    address: "",
    joinDate: "January 1, 2025",
    certifications: [""]
  };
  
  const [officerData, setOfficerData] = useState(defaultOfficer);

  useEffect(() => {
    if (officer) {
      setOfficerData({
        name: officer.full_name || "Unknown Officer",
        badge: officer.badge_number || "Unknown",
        avatar: "", // No avatar in auth data
        department: officer.department || "Police Department",
        rank: "Detective", // Default rank
        phone: officer.phone_number || "",
        email: officer.department_email || "",
        address: "Main Precinct", // Default address
        joinDate: "January 15, 2023", // Default join date
        certifications: ["Criminal Investigation", "Crisis Intervention", "Cyber Crime"] // Default certifications
      });
    }
  }, [officer]);

  const [formValues, setFormValues] = useState({...officerData});
  
  useEffect(() => {
    setFormValues({...officerData});
  }, [officerData]);

  const handleEditProfile = () => {
    if (isEditing) {
      setOfficerData({...formValues});
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } else {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setFormValues({...officerData});
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = () => {
    setIsPasswordDialogOpen(true);
  };

  const handleSubmitPasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordDialogOpen(false);
  };

  const navigateToSettings = () => {
    navigate('/officer-settings');
  };

  if (!officer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your profile</p>
          <Button onClick={() => navigate('/officer-login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OfficerNavbar />
      
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-6">Officer Profile</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <Avatar className="h-20 w-20 mr-4 border-2 border-shield-blue">
                    <AvatarImage src={officerData.avatar} alt={officerData.name} />
                    <AvatarFallback>{officer.full_name?.split(' ').map(n => n[0]).join('') || 'OF'}</AvatarFallback>
                  </Avatar>
                  <div>
                    {isEditing ? (
                      <Input 
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        className="text-xl font-bold mb-1"
                      />
                    ) : (
                      <CardTitle className="text-xl">{officerData.name}</CardTitle>
                    )}
                    <CardDescription>
                      <Badge className="mt-1">{officerData.rank}</Badge>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Shield className="h-4 w-4 mr-1" />
                        Badge: {officerData.badge}
                      </div>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleEditProfile} className="flex items-center">
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} className="flex items-center">
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleEditProfile}>Edit Profile</Button>
                      <Button variant="outline" onClick={navigateToSettings}>Settings</Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Department Information</h3>
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="mb-2">
                          <Label htmlFor="department">Department</Label>
                          <Input 
                            id="department"
                            name="department"
                            value={formValues.department}
                            onChange={handleInputChange}
                          />
                        </div>
                      ) : (
                        <p className="text-sm font-medium">{officerData.department}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="mb-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input 
                            id="phone"
                            name="phone"
                            value={formValues.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium">{officerData.phone}</p>
                          <p className="text-xs text-gray-500">Office Phone</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="mb-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email"
                            name="email"
                            value={formValues.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium">{officerData.email}</p>
                          <p className="text-xs text-gray-500">Official Email</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="mb-2">
                          <Label htmlFor="address">Address</Label>
                          <Input 
                            id="address"
                            name="address"
                            value={formValues.address}
                            onChange={handleInputChange}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium">{officerData.address}</p>
                          <p className="text-xs text-gray-500">Precinct Address</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Professional Information</h3>
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{officerData.joinDate}</p>
                      <p className="text-xs text-gray-500">Join Date</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Certifications</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {officerData.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" 
                onClick={handleChangePassword}
              >
                Change Password
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Please enter your current password and a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitPasswordChange}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficerProfile;
