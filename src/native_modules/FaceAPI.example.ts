// Example usage of FaceAPI with proper error handling

import FaceAPI, { FaceAPIError } from './FaceAPI';

/**
 * Example: Safe face comparison with comprehensive error handling
 */
export async function performFaceComparison(
  storedImageUrl: string, 
  capturedImagePath: string
): Promise<{ success: boolean; match?: boolean; score?: number; error?: string }> {
  
  try {
    // The FaceAPI.compare method now handles null/undefined validation internally
    const result = await FaceAPI.compare(storedImageUrl, capturedImagePath);
    
    return {
      success: true,
      match: result.match,
      score: result.score
    };
    
  } catch (error) {
    console.error('Face comparison failed:', error);
    
    // Handle specific FaceAPI errors
    if (error instanceof FaceAPIError) {
      switch (error.code) {
        case 'VALIDATION_ERROR':
          return { success: false, error: 'Invalid input parameters provided' };
        case 'MODULE_NOT_AVAILABLE':
          return { success: false, error: 'Face recognition service is not available' };
        case 'DOWNLOAD_FAILED':
          return { success: false, error: 'Failed to download the stored image' };
        case 'FILE_READ_FAILED':
          return { success: false, error: 'Failed to read the captured image' };
        case 'NO_FACE_DETECTED':
          return { success: false, error: 'No face detected in one or both images' };
        case 'FACE_DETECTION_FAILED':
          return { success: false, error: 'Face detection process failed' };
        case 'INVALID_RESPONSE':
          return { success: false, error: 'Invalid response from face recognition service' };
        default:
          return { success: false, error: error.message || 'Face comparison failed' };
      }
    }
    
    // Handle unexpected errors
    return { success: false, error: 'An unexpected error occurred during face comparison' };
  }
}

/**
 * Example: Usage with proper validation
 */
export async function safeFaceVerification(
  storedUrl?: string | null, 
  localPath?: string | null
): Promise<boolean> {
  
  // Pre-validation (optional, as FaceAPI.compare now handles this internally)
  if (!storedUrl || !localPath) {
    console.error('Missing required parameters for face verification');
    return false;
  }
  
  try {
    const result = await FaceAPI.compare(storedUrl, localPath);
    return result.match;
  } catch (error) {
    if (error instanceof FaceAPIError) {
      console.error(`Face verification failed with code: ${error.code}, message: ${error.message}`);
    } else {
      console.error('Unexpected error during face verification:', error);
    }
    return false;
  }
}

/**
 * Example: Batch face comparison with error handling
 */
export async function batchFaceComparison(
  storedUrl: string,
  capturedPaths: string[]
): Promise<Array<{ path: string; match: boolean; score: number; error?: string }>> {
  
  const results = [];
  
  for (const path of capturedPaths) {
    try {
      const result = await FaceAPI.compare(storedUrl, path);
      results.push({
        path,
        match: result.match,
        score: result.score
      });
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof FaceAPIError) {
        errorMessage = error.message;
      }
      
      results.push({
        path,
        match: false,
        score: 0,
        error: errorMessage
      });
    }
  }
  
  return results;
}
