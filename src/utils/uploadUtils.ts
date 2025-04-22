
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Function to upload a criminal photo
export const uploadCriminalPhoto = async (file: File, officerId: string): Promise<string | null> => {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `criminal-profiles/${officerId}/${fileName}`;
    
    // Check if storage is available
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      throw new Error('Storage not available');
    }
    
    // Create or use the criminal-photos bucket
    const bucketName = 'criminal-photos';
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make the bucket public for easier access
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw new Error('Failed to create storage bucket');
      }
    }
    
    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadCriminalPhoto:', error);
    
    // Fallback to using a direct URL for demo purposes
    if (file.type.startsWith('image/')) {
      // Create a temporary URL using FileReader (this will only work while the app is open)
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
    
    return null;
  }
};

// Function to upload evidence files
export const uploadEvidenceFile = async (
  file: File, 
  reportId: string, 
  userId: string
): Promise<string | null> => {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `evidence/${reportId}/${fileName}`;
    
    // Check if storage is available
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      throw new Error('Storage not available');
    }
    
    // Create or use the evidence bucket
    const bucketName = 'evidence';
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false, // Evidence should not be public
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw new Error('Failed to create storage bucket');
      }
    }
    
    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }
    
    // Get URL (not public)
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days
    
    if (urlData?.signedUrl) {
      return urlData.signedUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error in uploadEvidenceFile:', error);
    return null;
  }
};
