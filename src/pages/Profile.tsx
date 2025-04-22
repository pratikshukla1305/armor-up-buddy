
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, AtSign, Save, Camera, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      // Set initial values from user object
      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
      
      // Fetch profile data including phone
      fetchProfileData();
    }
  }, [user]);
  
  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setAvatarUrl(data.avatar_url || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Check if evidence bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!avatarBucketExists) {
        await supabase.storage.createBucket('avatars', {
          public: true,
        });
      }
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      
      setAvatarUrl(publicUrl);
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (updateError) throw updateError;
      
      // Also update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          email: email, // Include email as it's required
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });
        
      if (profileError) throw profileError;
      
      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      
      // Update auth metadata
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      
      // Update profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          email: email, // Include email as it's required
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString()
        });
        
      if (profileError) throw profileError;
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Shield className="h-12 w-12 text-[#0D2644] animate-pulse" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-gray-600">
              Manage your account information and preferences
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center mb-8">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-[#0D2644]/10 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-[#0D2644]" />
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 bg-[#0D2644] text-white p-1 rounded-full cursor-pointer hover:bg-[#0D2644]/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input 
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold">{fullName || 'User'}</h2>
                <p className="text-gray-600 flex items-center">
                  <AtSign className="h-4 w-4 mr-1" />
                  {email}
                </p>
                {phone && (
                  <p className="text-gray-600 flex items-center mt-1">
                    <Phone className="h-4 w-4 mr-1" />
                    {phone}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0D2644] focus:border-[#0D2644]"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                    placeholder="you@example.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0D2644] focus:border-[#0D2644]"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <div>
                <Button
                  onClick={updateProfile}
                  disabled={saving}
                  className="bg-[#0D2644] text-white hover:bg-[#0D2644]/90 transition-all"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
