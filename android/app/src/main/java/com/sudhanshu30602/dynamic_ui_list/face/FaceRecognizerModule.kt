package com.sudhanshu30602.dynamic_ui_list.face

import android.graphics.*
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.*
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.net.HttpURLConnection
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import kotlin.concurrent.thread
import kotlin.math.*

class FaceRecognizerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MATCH_THRESHOLD = 0.8f
        const val INPUT_SIZE = 160
    }

    // ML Kit Face Detector
    private val detector by lazy {
        val options = FaceDetectorOptions.Builder()
            .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
            .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
            .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_NONE)
            .setContourMode(FaceDetectorOptions.CONTOUR_MODE_NONE)
            .build()
        FaceDetection.getClient(options)
    }

    // TensorFlow Lite Interpreter
    private val interpreter: Interpreter by lazy {
        Interpreter(loadModelFile("facenet.tflite"))
    }

    override fun getName() = "FaceNet"

    // Load TFLite model from assets
    private fun loadModelFile(fileName: String): MappedByteBuffer {
        val fd = reactContext.assets.openFd(fileName)
        val inputStream = FileInputStream(fd.fileDescriptor)
        val channel = inputStream.channel
        return channel.map(FileChannel.MapMode.READ_ONLY, fd.startOffset, fd.declaredLength)
    }

    /** --- Image Loading --- **/
    private fun loadBitmapFromUrl(urlStr: String): Bitmap? {
        return try {
            val url = java.net.URL(urlStr)
            (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 10000
                readTimeout = 10000
                doInput = true
                connect()
            }.inputStream.use { BitmapFactory.decodeStream(it) }
        } catch (e: Exception) {
            Log.e("FaceRecognizerModule", "Failed to load Cloud image: ${e.message}")
            null
        }
    }

    private fun loadBitmapFromUri(uriStr: String): Bitmap? {
        return try {
            BitmapFactory.decodeFile(Uri.parse(uriStr).path)
        } catch (e: Exception) {
            Log.e("FaceRecognizerModule", "Failed to load local image: ${e.message}")
            null
        }
    }

    /** --- Face Processing --- **/
    private fun cropFace(bitmap: Bitmap, face: Face): Bitmap {
        val rect = face.boundingBox
        val left = rect.left.coerceAtLeast(0)
        val top = rect.top.coerceAtLeast(0)
        val right = rect.right.coerceAtMost(bitmap.width)
        val bottom = rect.bottom.coerceAtMost(bitmap.height)
        return Bitmap.createBitmap(bitmap, left, top, right - left, bottom - top)
    }

    private fun preprocessBitmap(bitmap: Bitmap): FloatArray {
        val scaled = Bitmap.createScaledBitmap(bitmap, INPUT_SIZE, INPUT_SIZE, true)
        val floatValues = FloatArray(INPUT_SIZE * INPUT_SIZE * 3)
        var idx = 0
        for (y in 0 until INPUT_SIZE) {
            for (x in 0 until INPUT_SIZE) {
                val px = scaled.getPixel(x, y)
                floatValues[idx++] = ((px shr 16 and 0xFF) / 255f - 0.5f) * 2f
                floatValues[idx++] = ((px shr 8 and 0xFF) / 255f - 0.5f) * 2f
                floatValues[idx++] = ((px and 0xFF) / 255f - 0.5f) * 2f
            }
        }
        return floatValues
    }

    private fun getEmbedding(bitmap: Bitmap): FloatArray {
        val input = arrayOf(preprocessBitmap(bitmap))
        val output = Array(1) { FloatArray(128) }
        interpreter.run(input, output)
        return l2Normalize(output[0])
    }

    private fun l2Normalize(embedding: FloatArray): FloatArray {
        val norm = sqrt(embedding.sumOf { (it * it).toDouble() })
        return embedding.map { (it / norm).toFloat() }.toFloatArray()
    }


    private fun cosineSimilarity(a: FloatArray, b: FloatArray): Float {
        return a.indices.sumOf { (a[it] * b[it]).toDouble() }.toFloat()
    }

    /** --- React Method: Compare Faces --- **/
    @ReactMethod
    fun compareFaces(storedUrl: String, capturedUri: String, promise: Promise) {
        thread {
            try {
                // Load images: Cloud for stored, local for captured
                val storedBitmap = loadBitmapFromUrl(storedUrl)
                val capturedBitmap = loadBitmapFromUri(capturedUri)

                if (storedBitmap == null || capturedBitmap == null) {
                    promise.reject("ERR_LOAD", "Failed to load one or both images")
                    return@thread
                }

                val storedImage = InputImage.fromBitmap(storedBitmap, 0)
                val capturedImage = InputImage.fromBitmap(capturedBitmap, 0)

                detector.process(storedImage)
                    .addOnSuccessListener { storedFaces ->
                        if (storedFaces.isEmpty()) {
                            promise.reject("ERR_NO_FACE_STORED", "No face in stored image")
                            return@addOnSuccessListener
                        }
                        val croppedStored = cropFace(storedBitmap, storedFaces.first())

                        detector.process(capturedImage)
                            .addOnSuccessListener { capturedFaces ->
                                if (capturedFaces.isEmpty()) {
                                    promise.reject("ERR_NO_FACE_CAPTURED", "No face in captured image")
                                    return@addOnSuccessListener
                                }
                                val croppedCaptured = cropFace(capturedBitmap, capturedFaces.first())

                                // Get embeddings
                                val embStored = getEmbedding(croppedStored)
                                val embCaptured = getEmbedding(croppedCaptured)

                                val similarity = cosineSimilarity(embStored, embCaptured)
                                val isMatch = similarity >= MATCH_THRESHOLD

                                val response = Arguments.createMap().apply {
                                    putBoolean("success", isMatch)
                                    putDouble("similarity", similarity.toDouble())
                                }
                                promise.resolve(response)
                            }
                            .addOnFailureListener { e ->
                                promise.reject("ERR_CAPTURED", e.message)
                            }
                    }
                    .addOnFailureListener { e ->
                        promise.reject("ERR_STORED", e.message)
                    }

            } catch (e: Exception) {
                promise.reject("ERR_GENERAL", e.message)
            }
        }
    }
}
