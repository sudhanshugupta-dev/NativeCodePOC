# Android Assets Directory

## Missing TensorFlow Lite Model

The FaceRecognizer module requires a TensorFlow Lite model file:

**Required file:** `face_embedding.tflite`
**Location:** Place it in this directory (`android/app/src/main/assets/`)

### How to obtain the model:

1. **Download a pre-trained model** (recommended):
   - MobileFaceNet TFLite model
   - InsightFace converted to TFLite
   - FaceNet converted to TFLite

2. **Train your own model** and convert to TFLite

### Model requirements:
- Input size: 112x112 pixels (configurable in FaceRecognizerModule.kt)
- Output: 128-dimensional embedding (configurable in FaceRecognizerModule.kt)
- Format: TensorFlow Lite (.tflite)

### Without this model:
- The app will crash when trying to use face recognition features
- Face detection will work, but embedding generation will fail

### Configuration:
If you use a different model, update these constants in `FaceRecognizerModule.kt`:
```kotlin
const val MODEL_NAME = "your_model_name.tflite"
const val MODEL_INPUT_SIZE = 112 // adjust to your model
const val EMBEDDING_SIZE = 128 // adjust to your model
```
