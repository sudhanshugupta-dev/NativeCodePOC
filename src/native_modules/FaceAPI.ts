// FaceAPI.ts
import { NativeModules } from 'react-native';

const { FaceRecognizer: FaceRecognizerModule } = NativeModules;

interface CompareResult {
  match: boolean;
  score: number;
}

interface RecognizeResult {
  personId: string;
  score: number;
}

class FaceAPIError extends Error {
  public code: string;
  public originalError?: any;

  constructor(code: string, message: string, originalError?: any) {
    super(message);
    this.name = 'FaceAPIError';
    this.code = code;
    this.originalError = originalError;
  }
}

export { FaceAPIError };

if (!FaceRecognizerModule) {
  console.log(FaceRecognizerModule)
  console.error("FaceRecognizer module missing!");
}

export default class FaceAPI {
  /**
   * Add a face for a given personId using Cloudinary URL
   * @param imageUrl - Cloudinary URL of the user's image
   * @param personId - Unique ID for the user
   */
  static async addFace(imageUrl: string, personId: string): Promise<void> {
    try {
      const result = await FaceRecognizerModule.addFaceFromUrl(imageUrl, personId);
      console.log(`[FaceAPI] addFace success:`, result);
    } catch (err) {
      console.error(`[FaceAPI] addFace error:`, err);
      throw err;
    }
  }

  /**
   * Recognize face from a Cloudinary image URL
   * @param imageUrl - Cloudinary URL to recognize
   * @returns RecognizeResult { personId, score }
   */
  static async recognize(imageUrl: string): Promise<RecognizeResult> {
    try {
      const res: RecognizeResult = await FaceRecognizerModule.recognizeFromUrl(imageUrl);
      console.log(`[FaceAPI] recognize result:`, res);
      return res;
    } catch (err) {
      console.error(`[FaceAPI] recognize error:`, err);
      throw err;
    }
  }

  /**
   * Validate input parameters for face comparison
   * @param storedUrl - Stored image URL
   * @param localPath - Local image path
   * @throws FaceAPIError if validation fails
   */
  private static validateCompareInputs(storedUrl: any, localPath: any): void {
    if (storedUrl === null || storedUrl === undefined) {
      throw new FaceAPIError('VALIDATION_ERROR', 'Stored image URL cannot be null or undefined');
    }
    if (localPath === null || localPath === undefined) {
      throw new FaceAPIError('VALIDATION_ERROR', 'Local image path cannot be null or undefined');
    }
    if (typeof storedUrl !== 'string' || storedUrl.trim() === '') {
      throw new FaceAPIError('VALIDATION_ERROR', 'Stored image URL must be a non-empty string');
    }
    if (typeof localPath !== 'string' || localPath.trim() === '') {
      throw new FaceAPIError('VALIDATION_ERROR', 'Local image path must be a non-empty string');
    }
  }

  /**
   * Parse and format native module errors
   * @param error - Error from native module
   * @returns FaceAPIError with proper formatting
   */
  private static parseNativeError(error: any): FaceAPIError {
    if (error && error.code && error.message) {
      // Error from native module with code and message
      return new FaceAPIError(error.code, error.message, error);
    }
    
    // Handle common error patterns
    const errorMessage = error?.message || String(error);
    
    if (errorMessage.includes('ERR_INVALID_PARAM')) {
      return new FaceAPIError('INVALID_PARAMETERS', 'Invalid input parameters provided', error);
    }
    if (errorMessage.includes('ERR_DOWNLOAD')) {
      return new FaceAPIError('DOWNLOAD_FAILED', 'Failed to download stored image from URL', error);
    }
    if (errorMessage.includes('ERR_FILE')) {
      return new FaceAPIError('FILE_READ_FAILED', 'Failed to read local image file', error);
    }
    if (errorMessage.includes('ERR_NO_FACE')) {
      return new FaceAPIError('NO_FACE_DETECTED', 'No face detected in one or both images', error);
    }
    if (errorMessage.includes('ERR_DETECT')) {
      return new FaceAPIError('FACE_DETECTION_FAILED', 'Face detection process failed', error);
    }
    if (errorMessage.includes('ERR_PROCESS')) {
      return new FaceAPIError('PROCESSING_FAILED', 'Face processing failed - this may be due to image format or model issues', error);
    }
    // Handle TensorFlow Lite specific errors
    if (errorMessage.includes('Cannot copy to a TensorFlowLite tensor') || errorMessage.includes('TensorFlowLite')) {
      return new FaceAPIError('TENSORFLOW_ERROR', 
        'TensorFlow Lite model input size mismatch. The face recognition model expects a different image size than provided. Please try with a different image or contact support.',
        error
      );
    }
    if (errorMessage.includes('IllegalArgumentException')) {
      return new FaceAPIError('INVALID_INPUT', 'Invalid input provided to face recognition model', error);
    }
    if (errorMessage.includes('OutOfMemoryError')) {
      return new FaceAPIError('MEMORY_ERROR', 'Insufficient memory for face processing. Try with a smaller image.', error);
    }
    
    // Generic error
    return new FaceAPIError('UNKNOWN_ERROR', errorMessage || 'An unknown error occurred', error);
  }

  /**
   * Compare a stored Cloudinary image with a captured local image
   * @param storedUrl - Cloudinary URL of stored face
   * @param localPath - Local device path of captured image
   * @returns CompareResult { match, score }
   * @throws FaceAPIError with detailed error information
   */
  static async compare(storedUrl: string, localPath: string): Promise<CompareResult> {
    console.log('[FaceAPI] Starting face comparison with data:', { storedUrl, localPath });
    
    try {
      // Validate inputs first
      this.validateCompareInputs(storedUrl, localPath);
      
      // Check if FaceRecognizer native module is available
      if (!FaceRecognizerModule || typeof FaceRecognizerModule.compareFaces !== 'function') {
        throw new FaceAPIError('MODULE_NOT_AVAILABLE', 'FaceRecognizer native module is not available');
      }
      
      // Call native module
      const res: CompareResult = await FaceRecognizerModule.compareFaces(storedUrl, localPath);
      
      // Validate response
      if (!res || typeof res.match !== 'boolean' || typeof res.score !== 'number') {
        throw new FaceAPIError('INVALID_RESPONSE', 'Invalid response from native module');
      }
      
      console.log('[FaceAPI] Compare result:', res);
      return res;
      
    } catch (err) {
      console.error('[FaceAPI] Compare error:', err);
      
      // If it's already a FaceAPIError, re-throw it
      if (err instanceof FaceAPIError) {
        throw err;
      }
      
      // Parse and throw formatted error
      throw this.parseNativeError(err);
    }
  }
}
