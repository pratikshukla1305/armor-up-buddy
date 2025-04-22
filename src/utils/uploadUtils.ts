import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Upload files to Supabase storage
export const uploadFilesToSupabase = async (
  files: File[],
  userId: string
): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  if (!files || files.length === 0) {
    console.error('No files provided to uploadFilesToSupabase');
    return uploadedUrls;
  }

  for (const file of files) {
    try {
      console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('evidences')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        continue;
      }
      
      console.log('File uploaded successfully:', data?.path);
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('evidences')
        .getPublicUrl(filePath);
      
      if (urlData && urlData.publicUrl) {
        console.log('Public URL generated:', urlData.publicUrl);
        uploadedUrls.push(urlData.publicUrl);
      } else {
        console.error('Failed to get public URL for file:', filePath);
      }
    } catch (error) {
      console.error('Error in uploadFilesToSupabase:', error);
      toast.error('Upload failed. Please try again later.');
    }
  }
  
  console.log(`Successfully uploaded ${uploadedUrls.length} of ${files.length} files`);
  return uploadedUrls;
};

// Upload criminal photo to Supabase storage
export const uploadCriminalPhoto = async (
  file: File,
  officerId: string
): Promise<string | null> => {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `criminals/${officerId}/${fileName}`;
    
    // Upload file to Supabase storage
    const { error } = await supabase.storage
      .from('evidences')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
    
    if (error) {
      console.error('Error uploading criminal photo:', error);
      toast.error(`Failed to upload photo: ${error.message}`);
      return null;
    }
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('evidences')
      .getPublicUrl(filePath);
    
    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Error in uploadCriminalPhoto:', error);
    toast.error('Upload failed. Please try again later.');
    return null;
  }
};

// Upload voice message to Supabase storage
export const uploadVoiceMessage = async (
  audioBlob: Blob,
  userId: string,
  alertId: string
): Promise<string | null> => {
  try {
    const fileName = `${alertId}.mp3`;
    const filePath = `voice-messages/${userId}/${fileName}`;
    
    // Upload file to Supabase storage
    const { error } = await supabase.storage
      .from('evidences')
      .upload(filePath, audioBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'audio/mp3'
      });
    
    if (error) {
      console.error('Error uploading voice message:', error);
      toast.error(`Failed to upload voice message: ${error.message}`);
      return null;
    }
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('evidences')
      .getPublicUrl(filePath);
    
    // Also store the recording reference in the database
    if (urlData?.publicUrl) {
      await supabase.from('voice_recordings').insert({
        alert_id: alertId,
        recording_url: urlData.publicUrl
      });
    }
    
    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Error in uploadVoiceMessage:', error);
    toast.error('Upload failed. Please try again later.');
    return null;
  }
};

// Create a draft report
export const createDraftReport = async (
  userId: string,
  reportId: string,
  fileUrls: string[]
): Promise<boolean> => {
  try {
    if (!userId || !reportId) {
      console.error('Missing required parameters for createDraftReport', { userId, reportId });
      return false;
    }
    
    console.log('Creating draft report with:', { userId, reportId, fileCount: fileUrls.length });
    
    // Insert the report
    const { error: reportError } = await supabase
      .from('crime_reports')
      .insert({
        id: reportId,
        user_id: userId,
        status: 'draft',
        title: 'Untitled Crime Report',
      });
    
    if (reportError) {
      console.error('Error creating draft report:', reportError);
      toast.error(`Failed to create report: ${reportError.message}`);
      return false;
    }
    
    // Insert evidence items
    for (const fileUrl of fileUrls) {
      const { error } = await supabase
        .from('evidence')
        .insert({
          report_id: reportId,
          user_id: userId,
          storage_path: fileUrl,
          type: fileUrl.toLowerCase().includes('video') ? 'video' : 'image',
          title: `Evidence ${fileUrls.indexOf(fileUrl) + 1}`
        });
      
      if (error) {
        console.error('Error adding evidence:', error);
        toast.error(`Failed to add evidence: ${error.message}`);
      }
      
      // Also insert into analysis_videos if it's a video
      if (fileUrl.toLowerCase().includes('video') || 
          fileUrl.toLowerCase().endsWith('.mp4') || 
          fileUrl.toLowerCase().endsWith('.mov')) {
        await supabase
          .from('analysis_videos')
          .insert({
            report_id: reportId,
            file_name: fileUrl.split('/').pop() || 'video.mp4',
            file_url: fileUrl,
            mime_type: 'video/mp4',
            status: 'pending'
          });
      }
    }
    
    console.log('Draft report created successfully');
    return true;
  } catch (error) {
    console.error('Error in createDraftReport:', error);
    toast.error('Failed to create report. Please try again later.');
    return false;
  }
};
