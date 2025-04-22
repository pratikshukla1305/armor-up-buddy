
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
    
    // Get URL (not public) - Fix the type error by properly awaiting and accessing data
    const urlResult = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days
    
    if (urlResult.data?.signedUrl) {
      return urlResult.data.signedUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error in uploadEvidenceFile:', error);
    return null;
  }
};

// Add the missing functions that are used in UploadCard.tsx
export const uploadFilesToSupabase = async (files: File[], userId: string): Promise<string[]> => {
  try {
    const uploadedUrls: string[] = [];
    
    // Create a unique folder for this upload session
    const sessionId = uuidv4();
    const bucketName = 'crime-evidence';
    
    // Check if storage is available
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      throw new Error('Storage not available');
    }
    
    // Create or use the evidence bucket
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // For demonstration purposes
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw new Error('Failed to create storage bucket');
      }
    }
    
    // Upload each file
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `uploads/${userId}/${sessionId}/${fileName}`;
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue; // Skip this file and try the next one
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (urlData.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }
    
    return uploadedUrls;
  } catch (error) {
    console.error('Error in uploadFilesToSupabase:', error);
    return [];
  }
};

export const createDraftReport = async (
  userId: string, 
  reportId: string, 
  uploadedUrls: string[]
): Promise<boolean> => {
  try {
    // Create a draft report entry in the database
    const { error } = await supabase
      .from('crime_reports')
      .insert([
        {
          id: reportId,
          user_id: userId,
          title: 'Draft Report',
          status: 'draft',
          description: 'Automatically created draft report for uploaded evidence.',
          media_urls: uploadedUrls,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error creating draft report:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in createDraftReport:', error);
    return false;
  }
};
